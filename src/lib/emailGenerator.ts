export interface UserProfile {
    name: string;
    role: string;
    experience: string;
    skills: string[];
    bio: string;
}

export interface Recruiter {
    email: string;
    name: string;
}

export interface GenerateRequest {
    companyName: string;
    recruiters: Recruiter[];
    jobTitle: string;
    jobDescription?: string;
}

export interface EmailResult {
    email: string;
    name: string;
    subject: string;
    body: string;
}

export function greeting(recruiter: Recruiter): string {
    return recruiter.name?.trim() ? recruiter.name.trim() : "there";
}

export function buildTemplateEmail(
    profile: UserProfile,
    company: GenerateRequest,
    recruiter: Recruiter
): { subject: string; body: string } {
    const skillsList = profile.skills.slice(0, 3).join(", ");
    const expText = profile.experience && profile.experience !== "0"
        ? `${profile.experience} year${profile.experience === "1" ? "" : "s"} of experience`
        : "a fresher eager to prove myself";

    const jobHook = company.jobDescription
        ? `I came across the ${company.jobTitle} role at ${company.companyName} and the focus on ${company.jobDescription.split(" ").slice(0, 8).join(" ")}... immediately caught my attention.`
        : `I came across the ${company.jobTitle} role at ${company.companyName} and couldn’t help but reach out directly.`;

    const subject = `${profile.name} — ${skillsList || profile.role} — ${company.jobTitle} at ${company.companyName}`;

    const body = [
        `Hi ${greeting(recruiter)},`,
        "",
        jobHook,
        "",
        `I bring ${expText} in ${skillsList || profile.role || "my field"}.${profile.bio ? " " + profile.bio : ""}`,
        "",
        `I’d love a quick 15-minute chat to show you how I can contribute. I’ve attached my resume for reference.`,
        "",
        "Looking forward to connecting,",
        profile.name,
    ].join("\n");

    return { subject, body };
}

export async function buildAIEmail(
    openai: import("openai").default,
    profile: UserProfile,
    company: GenerateRequest,
    recruiter: Recruiter
): Promise<{ subject: string; body: string }> {
    const recruiterGreeting = greeting(recruiter);
    const jobDescSnippet = company.jobDescription ? company.jobDescription.slice(0, 800) : "";

    const prompt = `You are an expert cold email writer helping job seekers stand out. Write a concise, personalized cold outreach email for a job application.

APPLICANT
- Name: ${profile.name}
- Target Role: ${profile.role}
- Experience: ${profile.experience || "entry level / fresher"}
- Top Skills: ${profile.skills.join(", ") || "(not specified)"}
- About: ${profile.bio || "(no bio provided)"}

TARGET
- Company: ${company.companyName}
- Position applied for: ${company.jobTitle}
- Recruiter: ${recruiterGreeting}
${jobDescSnippet ? `- Job Description Snippet:\n${jobDescSnippet}` : ""}

RULES (follow strictly):
1. Email body must be under 180 words.
2. NEVER start with "I hope this finds you well" or "I am writing to express my interest" — use a punchy, specific opener instead.
3. The body MUST reference at least one specific thing from the job description or company (if provided). Do not be generic.
4. Subject line must be specific and compelling — include the applicant's name and one differentiating fact (a skill, a specific stack, a project type). NEVER use generic subjects like "Job Application" or "Regarding the position".
5. Address the recruiter by first name: "${recruiterGreeting}".
6. End with a clear, confident call to action.
7. Do NOT add the subject line inside the email body.
8. Tone: confident, human, direct — NOT robotic or overly formal.
9. If the applicant's skills include React, Node.js, MongoDB, or Express, treat this as a full-stack MERN developer — emphasise end-to-end product ownership: "I can take a feature from database schema to polished React UI independently." Tailor this naturally to the role.

Return ONLY valid JSON in this exact format:
{"subject": "...", "body": "..."}`;

    const completion = await openai.chat.completions.create({
        model: process.env.AI_MODEL ?? "openai/gpt-4o-mini",
        messages: [
            {
                role: "system",
                content: "You write highly personalized, effective cold outreach emails. Return only valid JSON with keys \"subject\" and \"body\".",
            },
            { role: "user", content: prompt },
        ],
        temperature: 0.75,
        max_tokens: 600,
    });

    const content = completion.choices[0]?.message?.content?.trim() || "";
    try {
        const parsed = JSON.parse(content);
        return { subject: parsed.subject, body: parsed.body };
    } catch {
        return buildTemplateEmail(profile, company, recruiter);
    }
}
