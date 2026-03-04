import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import Email from "@/models/Email";
import { findReplies } from "@/lib/gmailReader";

const THROTTLE_MS = 30 * 60 * 1000; // only sync once per 30 minutes per user

type ReplyCategory = "interview" | "assignment" | "rejected" | "replied";

async function classifyReply(body: string): Promise<ReplyCategory> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return "replied"; // fallback without AI

    try {
        const OpenAI = (await import("openai")).default;
        const openai = new OpenAI({
            apiKey,
            baseURL: "https://openrouter.ai/api/v1",
            defaultHeaders: {
                "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001",
                "X-Title": "MailApply",
            },
        });

        const completion = await openai.chat.completions.create({
            model: process.env.AI_MODEL ?? "openai/gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content:
                        'You are a classifier for recruiter email replies. Classify the reply into exactly one of: "interview", "assignment", "rejected", "replied". ' +
                        '"interview" = they want to schedule a call/interview. ' +
                        '"assignment" = they sent a coding test or assignment. ' +
                        '"rejected" = they said no or are not moving forward. ' +
                        '"replied" = any other positive or neutral response. ' +
                        "Return ONLY the single word, nothing else.",
                },
                {
                    role: "user",
                    content: `Email reply text (first 300 words):\n\n${body.split(" ").slice(0, 300).join(" ")}`,
                },
            ],
            temperature: 0,
            max_tokens: 10,
        });

        const result = completion.choices[0]?.message?.content?.trim().toLowerCase() ?? "replied";
        if (["interview", "assignment", "rejected", "replied"].includes(result)) {
            return result as ReplyCategory;
        }
        return "replied";
    } catch {
        return "replied";
    }
}

// GET /api/sync-replies
// Throttled: skips if last sync was <30 mins ago
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const user = await User.findOne({ email: session.user.email });
        if (!user || !user.gmailRefreshToken) {
            return NextResponse.json({ skipped: true, reason: "No Gmail connected" });
        }

        // Throttle check
        const lastSync = user.lastSyncedAt ? new Date(user.lastSyncedAt).getTime() : 0;
        if (Date.now() - lastSync < THROTTLE_MS) {
            return NextResponse.json({ skipped: true, reason: "Too soon" });
        }

        // Get a fresh access token
        const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                client_id: process.env.GMAIL_CLIENT_ID!,
                client_secret: process.env.GMAIL_CLIENT_SECRET!,
                refresh_token: user.gmailRefreshToken,
                grant_type: "refresh_token",
            }),
        });
        if (!tokenRes.ok) {
            return NextResponse.json({ skipped: true, reason: "Token refresh failed" });
        }
        const { access_token } = await tokenRes.json();

        // Get all sent emails with a messageId and status=sent
        const sentEmails = await Email.find({
            userId: user._id,
            status: "sent",
            messageId: { $ne: "" },
        }).lean();

        if (sentEmails.length === 0) {
            await User.updateOne({ _id: user._id }, { $set: { lastSyncedAt: new Date() } });
            return NextResponse.json({ synced: 0 });
        }

        const messageIds = sentEmails.map((e) => e.messageId).filter(Boolean) as string[];
        const replies = await findReplies(access_token, messageIds);

        let synced = 0;
        for (const email of sentEmails) {
            const reply = replies.get(email.messageId ?? "");
            if (!reply) continue;

            const category = await classifyReply(reply.body);
            await Email.updateOne(
                { _id: email._id },
                {
                    $set: {
                        status: category,
                        replySnippet: reply.snippet.slice(0, 200),
                        repliedAt: reply.receivedAt,
                    },
                }
            );
            synced++;
        }

        // Update lastSyncedAt
        await User.updateOne({ _id: user._id }, { $set: { lastSyncedAt: new Date() } });

        return NextResponse.json({ synced });
    } catch (error) {
        console.error("sync-replies error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
