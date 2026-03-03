import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";

interface UserProfile {
    name: string;
    role: string;
    experience: string;
    skills: string[];
    bio: string;
}

interface GenerateRequest {
    companyName: string;
    recruiterEmail: string;
    jobTitle: string;
    jobDescription?: string;
}

// Smart template-based email generation (works without OpenAI key)
function generateTemplateEmail(
    profile: UserProfile,
    company: GenerateRequest
): { subject: string; body: string } {
    const firstName = profile.name.split(" ")[0];
    const skillsList = profile.skills.slice(0, 5).join(", ");
    const recruiterName = company.recruiterEmail.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

    const subject = `Application for ${company.jobTitle} at ${company.companyName} — ${profile.name}`;

    const body = `Hi ${recruiterName},

I hope this message finds you well. I came across the ${company.jobTitle} opportunity at ${company.companyName} and I'm writing to express my strong interest.

${profile.experience ? `With ${profile.experience} of experience` : "As a motivated professional"} specializing in ${skillsList || profile.role || "my field"}, I believe I would be a great fit for this role.${profile.bio ? `\n\n${profile.bio}` : ""}

I'd love the opportunity to discuss how my skills can contribute to ${company.companyName}'s goals. I've attached my resume for your review.

Looking forward to hearing from you.

Best regards,
${profile.name}`;

    return { subject, body };
}

// OpenAI-powered email generation
async function generateAIEmail(
    profile: UserProfile,
    company: GenerateRequest
): Promise<{ subject: string; body: string }> {
    const OpenAI = (await import("openai")).default;
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `Generate a professional job application email with the following details:

Applicant:
- Name: ${profile.name}
- Role: ${profile.role}
- Experience: ${profile.experience}
- Skills: ${profile.skills.join(", ")}
- Bio: ${profile.bio}

Target:
- Company: ${company.companyName}
- Position: ${company.jobTitle}
${company.jobDescription ? `- Job Description: ${company.jobDescription}` : ""}

Requirements:
- Write a concise, professional email (under 200 words)
- Personalized greeting
- Mention relevant skills for the role
- Mention experience level
- End with a call to action
- Professional but warm tone
- Do NOT include subject line in the body

Return your response in this exact JSON format:
{"subject": "...", "body": "..."}`;

    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: "You are a professional email writer for job applications. Return only valid JSON." },
            { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 500,
    });

    const content = completion.choices[0]?.message?.content?.trim() || "";

    try {
        const parsed = JSON.parse(content);
        return { subject: parsed.subject, body: parsed.body };
    } catch {
        // Fallback if JSON parsing fails
        return generateTemplateEmail(profile, company);
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body: GenerateRequest = await req.json();
        const { companyName, jobTitle } = body;

        if (!companyName || !jobTitle) {
            return NextResponse.json(
                { error: "Company name and job title are required" },
                { status: 400 }
            );
        }

        await dbConnect();
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const profile: UserProfile = {
            name: user.name,
            role: user.role,
            experience: user.experience,
            skills: user.skills,
            bio: user.bio,
        };

        let result: { subject: string; body: string };

        // Use OpenAI if API key is configured, otherwise use template
        if (process.env.OPENAI_API_KEY) {
            try {
                result = await generateAIEmail(profile, body);
            } catch (error) {
                console.error("OpenAI error, falling back to template:", error);
                result = generateTemplateEmail(profile, body);
            }
        } else {
            result = generateTemplateEmail(profile, body);
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error("Generate email error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
