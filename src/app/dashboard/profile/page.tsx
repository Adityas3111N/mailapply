"use client";

import { useState, useEffect, FormEvent } from "react";
import { useSession } from "next-auth/react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Input";
import TagInput from "@/components/ui/TagInput";

interface ProfileData {
    name: string;
    email: string;
    role: string;
    experience: string;
    bio: string;
    skills: string[];
    resumeUrl: string;
}

export default function ProfilePage() {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [profile, setProfile] = useState<ProfileData>({
        name: "",
        email: "",
        role: "",
        experience: "",
        bio: "",
        skills: [],
        resumeUrl: "",
    });

    // Load profile
    useEffect(() => {
        async function loadProfile() {
            try {
                const res = await fetch("/api/user");
                if (res.ok) {
                    const data = await res.json();
                    setProfile(data.user);
                }
            } catch {
                // Defaults will be used
            } finally {
                setLoading(false);
            }
        }
        if (session) loadProfile();
    }, [session]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");

        try {
            const res = await fetch("/api/user", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: profile.name,
                    role: profile.role,
                    experience: profile.experience,
                    bio: profile.bio,
                    skills: profile.skills,
                }),
            });

            if (res.ok) {
                setSuccess("Profile updated successfully!");
                setTimeout(() => setSuccess(""), 3000);
            } else {
                const data = await res.json();
                setError(data.error || "Failed to update profile");
            }
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== "application/pdf") {
            setError("Please upload a PDF file");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("File size must be less than 5MB");
            return;
        }

        // Upload to Cloudinary via API
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/upload-resume", {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                setProfile((prev) => ({ ...prev, resumeUrl: data.url }));
                setSuccess("Resume uploaded successfully!");
                setTimeout(() => setSuccess(""), 3000);
            } else {
                setError("Failed to upload resume. Check your Cloudinary config.");
            }
        } catch {
            setError("Resume upload failed. Please try again.");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-3 border-slate-200 border-t-primary-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl animate-fade-in">
            <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900">
                    Profile Setup
                </h1>
                <p className="text-slate-500 mt-1">
                    Complete your profile once — it powers every email you generate.
                </p>
            </div>

            {success && (
                <div className="mb-6 p-3 rounded-xl bg-success-100 text-success-700 text-sm font-medium animate-fade-in">
                    {success}
                </div>
            )}

            {error && (
                <div className="mb-6 p-3 rounded-xl bg-danger-100 text-danger-700 text-sm font-medium animate-fade-in">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
                    <h2 className="text-lg font-semibold text-slate-900">Basic Info</h2>

                    <Input
                        label="Full Name"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        required
                    />

                    <Input
                        label="Email"
                        type="email"
                        value={profile.email}
                        disabled
                        helperText="Email cannot be changed"
                    />

                    <Input
                        label="Target Role"
                        placeholder="e.g. Frontend Developer, Data Analyst"
                        value={profile.role}
                        onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                    />

                    <Input
                        label="Experience"
                        placeholder="e.g. 2 years, Fresher, 5+ years"
                        value={profile.experience}
                        onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
                    />

                    <Textarea
                        label="Professional Bio"
                        placeholder="Write a brief professional summary (2-3 sentences)…"
                        value={profile.bio}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        rows={3}
                    />
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
                    <h2 className="text-lg font-semibold text-slate-900">Skills</h2>
                    <TagInput
                        label="Your Skills"
                        tags={profile.skills}
                        onChange={(skills) => setProfile({ ...profile, skills })}
                        placeholder="Type a skill and press Enter…"
                    />
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
                    <h2 className="text-lg font-semibold text-slate-900">Resume</h2>

                    {profile.resumeUrl && (
                        <div className="flex items-center gap-3 p-3 bg-success-100 rounded-xl">
                            <span className="text-success-700 text-sm font-medium">
                                ✅ Resume uploaded
                            </span>
                            <a
                                href={profile.resumeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                            >
                                View PDF →
                            </a>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Upload Resume (PDF, max 5MB)
                        </label>
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={handleResumeUpload}
                            className="
                w-full text-sm text-slate-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-xl file:border-0
                file:text-sm file:font-semibold
                file:bg-primary-50 file:text-primary-700
                hover:file:bg-primary-100
                file:cursor-pointer cursor-pointer
              "
                        />
                    </div>
                </div>

                <Button type="submit" variant="primary" size="lg" isLoading={saving} className="w-full sm:w-auto">
                    Save Profile
                </Button>
            </form>
        </div>
    );
}
