export interface ScoreBreakdown {
    name: number;
    role: number;
    skills: number;
    experience: number;
    bio: number;
    resume: number;
    gmail: number;
}

export interface ProfileScoreResult {
    total: number;          // 0–100
    breakdown: ScoreBreakdown;
    isReady: boolean;       // true if total >= 70
    missingItems: string[]; // human-readable list of what's missing
}

interface UserLike {
    name?: string;
    role?: string;
    skills?: string[];
    experience?: string;
    bio?: string;
    resumeUrl?: string;
    gmailRefreshToken?: string | boolean; // string in DB, boolean from API
}

const WEIGHTS: ScoreBreakdown = {
    name: 10,
    role: 15,
    skills: 15,
    experience: 10,
    bio: 20,
    resume: 20,
    gmail: 10,
};

export function calcProfileScore(user: UserLike): ProfileScoreResult {
    const breakdown: ScoreBreakdown = {
        name: user.name?.trim() ? WEIGHTS.name : 0,
        role: user.role?.trim() ? WEIGHTS.role : 0,
        skills: (user.skills?.length ?? 0) >= 1 ? WEIGHTS.skills : 0,
        experience: user.experience != null && user.experience !== "" ? WEIGHTS.experience : 0,
        bio: user.bio?.trim() ? WEIGHTS.bio : 0,
        resume: user.resumeUrl?.trim() ? WEIGHTS.resume : 0,
        gmail: user.gmailRefreshToken ? WEIGHTS.gmail : 0,
    };

    const total = Object.values(breakdown).reduce((sum, v) => sum + v, 0);

    const missingItems: string[] = [];
    if (!breakdown.name) missingItems.push("Full name");
    if (!breakdown.role) missingItems.push("Target role");
    if (!breakdown.skills) missingItems.push("At least 1 skill");
    if (!breakdown.experience) missingItems.push("Years of experience");
    if (!breakdown.bio) missingItems.push("Professional bio");
    if (!breakdown.resume) missingItems.push("Resume upload");
    if (!breakdown.gmail) missingItems.push("Gmail connected");

    return {
        total,
        breakdown,
        isReady: total >= 70,
        missingItems,
    };
}
