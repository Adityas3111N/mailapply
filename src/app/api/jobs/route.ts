import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import Job, { IJob } from "@/models/Job";
import Email from "@/models/Email";

// Score a job against a user's skills (0–100)
function scoreJob(job: IJob, skills: string[]): number {
    if (!skills.length) return 0;
    const descLower = (job.title + " " + job.description).toLowerCase();
    const matched = skills.filter((s) => descLower.includes(s.toLowerCase()));
    let score = (matched.length / skills.length) * 90;

    // Bonus: role keyword in title
    if (job.title.toLowerCase().includes(job.role.toLowerCase().split(" ")[0])) {
        score += 10;
    }

    return Math.min(Math.round(score), 100);
}

// GET /api/jobs — returns top 5 matched jobs for the current user
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (!user.role?.trim()) {
            return NextResponse.json({
                jobs: [],
                message: "Please set your target role in your profile to see matched jobs.",
            });
        }

        // Find companies already emailed by this user so we don't recommend them again
        const sentEmails = await Email.find({ userId: user._id }).select("company").lean();
        const alreadyAppliedTo = new Set(
            sentEmails.map((e) => (e as { company?: string }).company?.toLowerCase() ?? "")
        );

        // Fetch jobs matching the user's role bucket (case-insensitive partial match)
        const jobs = await Job.find({
            role: { $regex: new RegExp(user.role.split(" ")[0], "i") },
            fetchedAt: { $gte: new Date(Date.now() - 48 * 60 * 60 * 1000) }, // last 48h
        }).limit(50).lean();

        // Score, filter out already-applied companies, and take top 5
        const scored = jobs
            .filter((j) => !alreadyAppliedTo.has(j.company.toLowerCase()))
            .map((j) => ({
                ...j,
                matchScore: scoreJob(j as IJob, user.skills ?? []),
                matchedSkills: (user.skills ?? []).filter((s: string) =>
                    (j.title + " " + j.description).toLowerCase().includes(s.toLowerCase())
                ),
            }))
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, 5);

        return NextResponse.json({ jobs: scored });
    } catch (error) {
        console.error("Jobs fetch error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
