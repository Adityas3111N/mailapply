"use client";

import { useState, useEffect } from "react";
import Badge from "@/components/ui/Badge";

interface EmailRecord {
    _id: string;
    companyName: string;
    recruiterEmail: string;
    jobTitle: string;
    subject: string;
    status: "pending" | "sent" | "replied" | "interview" | "failed";
    sentAt: string;
    createdAt: string;
}

const statusConfig = {
    pending: { label: "Pending", variant: "warning" as const },
    sent: { label: "Sent", variant: "info" as const },
    replied: { label: "Replied", variant: "success" as const },
    interview: { label: "Interview 🎉", variant: "success" as const },
    failed: { label: "Failed", variant: "danger" as const },
};

const statusOptions = ["all", "pending", "sent", "replied", "interview", "failed"];

export default function HistoryPage() {
    const [emails, setEmails] = useState<EmailRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("all");
    const [search, setSearch] = useState("");

    const fetchEmails = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (statusFilter !== "all") params.set("status", statusFilter);
            if (search) params.set("search", search);

            const res = await fetch(`/api/emails?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setEmails(data.emails);
            }
        } catch {
            // Handle error silently
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmails();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchEmails();
    };

    const handleStatusUpdate = async (emailId: string, newStatus: string) => {
        try {
            const res = await fetch("/api/emails", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ emailId, status: newStatus }),
            });

            if (res.ok) {
                setEmails((prev) =>
                    prev.map((e) =>
                        e._id === emailId ? { ...e, status: newStatus as EmailRecord["status"] } : e
                    )
                );
            }
        } catch {
            // Handle error silently
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    return (
        <div className="animate-fade-in">
            <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900">
                    Email History
                </h1>
                <p className="text-slate-500 mt-1">
                    Track and manage all your outreach emails.
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                {/* Search */}
                <form onSubmit={handleSearch} className="flex-1">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by company, email, or job title…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
                        />
                        <svg className="absolute left-3 top-3 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                    </div>
                </form>

                {/* Status Filter */}
                <div className="flex gap-2 flex-wrap">
                    {statusOptions.map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-all cursor-pointer ${statusFilter === s
                                    ? "bg-primary-600 text-white"
                                    : "bg-white text-slate-600 border border-slate-200 hover:border-primary-300"
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <div className="w-8 h-8 border-3 border-slate-200 border-t-primary-600 rounded-full animate-spin" />
                </div>
            ) : emails.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
                    <div className="text-4xl mb-4">📭</div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                        No emails yet
                    </h3>
                    <p className="text-sm text-slate-500">
                        Send your first outreach email to see it here.
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">
                                        Company
                                    </th>
                                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">
                                        Recruiter
                                    </th>
                                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">
                                        Position
                                    </th>
                                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">
                                        Status
                                    </th>
                                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">
                                        Date
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {emails.map((email) => (
                                    <tr
                                        key={email._id}
                                        className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium text-slate-900">
                                                {email.companyName}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-slate-600">
                                                {email.recruiterEmail}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-slate-600">{email.jobTitle}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={email.status}
                                                onChange={(e) => handleStatusUpdate(email._id, e.target.value)}
                                                className="text-xs font-medium rounded-lg px-2 py-1 border border-slate-200 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                                            >
                                                {Object.entries(statusConfig).map(([value, config]) => (
                                                    <option key={value} value={value}>
                                                        {config.label}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="mt-1">
                                                <Badge variant={statusConfig[email.status].variant}>
                                                    {statusConfig[email.status].label}
                                                </Badge>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-slate-500">
                                                {formatDate(email.sentAt || email.createdAt)}
                                            </p>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
