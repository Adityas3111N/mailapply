import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import EmailModel from "@/models/Email";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { to, subject, message, companyName, jobTitle, outreachId } = body;

        if (!to || !subject || !message || !companyName || !jobTitle) {
            return NextResponse.json(
                { error: "All fields are required (to, subject, message, companyName, jobTitle)" },
                { status: 400 }
            );
        }

        await dbConnect();
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Attempt to send email via Nodemailer (Gmail OAuth2)
        let emailSent = false;
        const gmailUser = process.env.GMAIL_USER;
        const gmailClientId = process.env.GMAIL_CLIENT_ID;
        const gmailClientSecret = process.env.GMAIL_CLIENT_SECRET;
        const gmailRefreshToken = process.env.GMAIL_REFRESH_TOKEN;

        if (gmailUser && gmailClientId && gmailClientSecret && gmailRefreshToken) {
            try {
                const transporter = nodemailer.createTransport({
                    service: "gmail",
                    auth: {
                        type: "OAuth2",
                        user: gmailUser,
                        clientId: gmailClientId,
                        clientSecret: gmailClientSecret,
                        refreshToken: gmailRefreshToken,
                    },
                });

                const mailOptions: nodemailer.SendMailOptions = {
                    from: `${user.name} <${gmailUser}>`,
                    to,
                    subject,
                    text: message,
                };

                // Attach resume if available
                if (user.resumeUrl) {
                    mailOptions.attachments = [
                        {
                            filename: `${user.name.replace(/\s+/g, "_")}_Resume.pdf`,
                            path: user.resumeUrl,
                        },
                    ];
                }

                await transporter.sendMail(mailOptions);
                emailSent = true;
            } catch (emailError) {
                console.error("Email sending failed:", emailError);
                // Continue — save the record as "failed"
            }
        }

        // Save email record to DB
        const emailRecord = await EmailModel.create({
            userId: user._id,
            outreachId: outreachId || undefined,
            companyName: companyName.trim(),
            recruiterEmail: to.toLowerCase().trim(),
            jobTitle: jobTitle.trim(),
            subject,
            message,
            status: emailSent ? "sent" : "failed",
            sentAt: emailSent ? new Date() : undefined,
        });

        return NextResponse.json({
            success: emailSent,
            message: emailSent
                ? "Email sent successfully!"
                : "Email saved but sending failed. Check your Gmail OAuth2 config.",
            email: emailRecord,
        });
    } catch (error) {
        console.error("Send email error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
