"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Button from "@/components/ui/Button";

interface DashboardStats {
    totalSent: number;
    pending: number;
    replied: number;
    interviews: number;
}

export default function DashboardOverview() {
    const { data: session } = useSession();
    const [stats, setStats] = useState<DashboardStats>({
        totalSent: 0,
        pending: 0,
        replied: 0,
        interviews: 0,
    });

    useEffect(() => {
        // Fetch stats from API (will be implemented in Part 7)
        async function fetchStats() {
            try {
                const res = await fetch("/api/emails/stats");
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch {
                // Stats API not yet implemented — use defaults
            }
        }
        fetchStats();
    }, []);

    const statCards = [
        {
            label: "Emails Sent",
            value: stats.totalSent,
            icon: "📧",
            color: "bg-primary-100 text-primary-700",
        },
        {
            label: "Pending",
            value: stats.pending,
            icon: "⏳",
            color: "bg-orange-100 text-orange-700",
        },
        {
            label: "Replied",
            value: stats.replied,
            icon: "✅",
            color: "bg-success-100 text-success-700",
        },
        {
            label: "Interviews",
            value: stats.interviews,
            icon: "🎯",
            color: "bg-primary-100 text-primary-700",
        },
    ];

    return (
        <div className="animate-fade-in">
            {/* Welcome */}
            <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900">
                    Welcome back, {session?.user?.name?.split(" ")[0] || "there"} 👋
                </h1>
                <p className="text-slate-500 mt-1">
                    Here&apos;s a quick overview of your job outreach activity.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {statCards.map((stat) => (
                    <div
                        key={stat.label}
                        className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-soft transition-all duration-300"
                    >
                        <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center text-lg mb-3`}>
                            {stat.icon}
                        </div>
                        <p className="text-2xl font-bold font-heading text-slate-900">
                            {stat.value}
                        </p>
                        <p className="text-sm text-slate-500">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">
                    Quick Actions
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Link href="/dashboard/profile">
                        <div className="p-4 rounded-xl border border-slate-100 hover:border-primary-200 hover:bg-primary-50/30 transition-all duration-200 cursor-pointer">
                            <div className="text-2xl mb-2">👤</div>
                            <h3 className="text-sm font-semibold text-slate-900">
                                Update Profile
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">
                                Add skills, experience, and resume
                            </p>
                        </div>
                    </Link>
                    <Link href="/dashboard/outreach">
                        <div className="p-4 rounded-xl border border-slate-100 hover:border-primary-200 hover:bg-primary-50/30 transition-all duration-200 cursor-pointer">
                            <div className="text-2xl mb-2">✉️</div>
                            <h3 className="text-sm font-semibold text-slate-900">
                                New Outreach
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">
                                Generate and send a personalized email
                            </p>
                        </div>
                    </Link>
                    <Link href="/dashboard/history">
                        <div className="p-4 rounded-xl border border-slate-100 hover:border-primary-200 hover:bg-primary-50/30 transition-all duration-200 cursor-pointer">
                            <div className="text-2xl mb-2">📊</div>
                            <h3 className="text-sm font-semibold text-slate-900">
                                View History
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">
                                Track all your sent emails and status
                            </p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
