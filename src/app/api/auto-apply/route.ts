import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import Job from "@/models/Job";

const FREE_LIMIT = 5;
const PREMIUM_LIMIT = 50;
const PACE_MS = 5 * 60 * 1000; // 5 minutes between sends

function isSameDay(d1: Date, d2: Date) {
    return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
    );
}

// POST /api/auto-apply
// Body: { jobId: string }
// Returns: { subject, body, recruiterEmail } — the caller reviews and then calls /api/send-email
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { jobId } = await req.json();
        if (!jobId) {
            return NextResponse.json({ error: "jobId is required" }, { status: 400 });
        }

        await dbConnect();

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (!user.gmailRefreshToken) {
            return NextResponse.json(
                { error: "Please connect your Gmail account first to use Auto Apply." },
                { status: 400 }
            );
        }

        const isPremium = false; // TODO: replace with real premium check when billing is added
        const dailyLimit = isPremium ? PREMIUM_LIMIT : FREE_LIMIT;

        // Reset count if last apply was on a previous day
        const today = new Date();
        const lastDate = user.lastAppliedDate ? new Date(user.lastAppliedDate) : null;
        const currentCount = lastDate && isSameDay(lastDate, today)
            ? (user.dailyAutoAppliesCount ?? 0)
            : 0;

        if (currentCount >= dailyLimit) {
            return NextResponse.json(
                {
                    error: `You've used all ${dailyLimit} auto-apply${isPremium ? "" : " (free tier)"} slots for today. Resets at midnight.`,
                    quotaExhausted: true,
                    used: currentCount,
                    limit: dailyLimit,
                },
                { status: 429 }
            );
        }

        // Pacing check
        if (user.lastAutoSentAt) {
            const elapsed = Date.now() - new Date(user.lastAutoSentAt).getTime();
            if (elapsed < PACE_MS) {
                const waitSecs = Math.ceil((PACE_MS - elapsed) / 1000);
                return NextResponse.json(
                    { error: `Please wait ${waitSecs}s before sending another auto-apply (spam protection).` },
                    { status: 429 }
                );
            }
        }

        // Fetch the job
        const job = await Job.findById(jobId);
        if (!job) {
            return NextResponse.json({ error: "Job not found" }, { status: 404 });
        }

        // Generate email logic locally to avoid internal fetch deadlock/ECONNREFUSED
        const profile = {
            name: user.name,
            role: user.role,
            experience: user.experience,
            skills: user.skills,
            bio: user.bio,
        };
        const companyData = {
            companyName: job.company,
            recruiters: [{ email: "", name: "" }],
            jobTitle: job.title,
            jobDescription: job.description,
        };

        const useAI = Boolean(process.env.OPENROUTER_API_KEY);
        let result: { subject: string; body: string };
        let generated: { subject: string; body: string } | undefined;

        if (useAI) {
            try {
                const OpenAI = (await import("openai")).default;
                const openaiClient = new OpenAI({
                    apiKey: process.env.OPENROUTER_API_KEY,
                    baseURL: "https://openrouter.ai/api/v1",
                    defaultHeaders: {
                        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
                        "X-Title": "MailApply",
                    },
                });
                const { buildAIEmail, buildTemplateEmail } = await import("@/lib/emailGenerator");
                result = await buildAIEmail(openaiClient, profile, companyData, companyData.recruiters[0]);
            } catch (error) {
                console.error("AI Email error in auto-apply:", error);
                const { buildTemplateEmail } = await import("@/lib/emailGenerator");
                result = buildTemplateEmail(profile, companyData, companyData.recruiters[0]);
            }
        } else {
            const { buildTemplateEmail } = await import("@/lib/emailGenerator");
            result = buildTemplateEmail(profile, companyData, companyData.recruiters[0]);
        }

        generated = result;
        if (!generated || !generated.subject) {
            return NextResponse.json({ error: "No email generated" }, { status: 500 });
        }

        // Return preview data — the frontend shows the modal, user confirms, then calls /api/send-email
        return NextResponse.json({
            preview: {
                subject: generated.subject,
                body: generated.body,
                company: job.company,
                jobTitle: job.title,
                applyUrl: job.applyUrl,
                jobId: job._id,
            },
            quota: {
                used: currentCount,
                limit: dailyLimit,
                remaining: dailyLimit - currentCount,
            },
        });
    } catch (error) {
        console.error("Auto-apply error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// PATCH /api/auto-apply — called after the user confirms sending in the preview modal
// Increments the daily quota counter
export async function PATCH(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await User.findOne({ email: session.user.email });
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const today = new Date();
        const lastDate = user.lastAppliedDate ? new Date(user.lastAppliedDate) : null;
        const currentCount = lastDate && isSameDay(lastDate, today)
            ? (user.dailyAutoAppliesCount ?? 0)
            : 0;

        await User.updateOne(
            { email: session.user.email },
            {
                $set: {
                    dailyAutoAppliesCount: currentCount + 1,
                    lastAppliedDate: today,
                    lastAutoSentAt: today,
                },
            }
        );

        return NextResponse.json({ ok: true, newCount: currentCount + 1 });
    } catch {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
