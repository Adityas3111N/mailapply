"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";

// Move metadata to a separate layout or handle it differently if needed, 
// for now let's just make the page interactive.
// Note: Next.js Metadata Export only works in Server Components. 
// I will move it to a layout.tsx for docs later if needed, but for the task let's just add state.

const navGroups = [
    {
        title: "Introduction",
        items: [
            { name: "Getting Started", id: "welcome" },
            { name: "How MailApply Works", id: "how-it-works" },
            { name: "System Requirements", id: "requirements" },
        ],
    },
    {
        title: "Configuration",
        items: [
            { name: "Connecting Gmail", id: "gmail-setup" },
            { name: "Profile Optimization", id: "profile-config" },
            { name: "Uploading Resumes", id: "resume-assets" },
        ],
    },
    {
        title: "Automation & AI",
        items: [
            { name: "Crafting AI Prompts", id: "ai-engine" },
            { name: "Customizing Tone", id: "email-personalization" },
            { name: "Managing Templates", id: "templates" },
        ],
    },
    {
        title: "Growth & Analytics",
        items: [
            { name: "Tracking Replies", id: "tracking-system" },
            { name: "Outreach Efficiency", id: "analytics" },
            { name: "Job CRM Overview", id: "job-crm" },
        ],
    },
    {
        title: "Safety & Privacy",
        items: [
            { name: "Data Security", id: "security" },
            { name: "Google API Usage", id: "google-api" },
            { name: "Revoking Permissions", id: "privacy-safety" },
        ],
    },
];

export default function Documentation() {
    const [feedback, setFeedback] = useState<null | 'yes' | 'no'>(null);
    return (
        <div className="bg-white min-h-screen flex flex-col">
            <Navbar />

            {/* Documentation Hero Header */}
            <div className="pt-32 pb-16 bg-slate-50 border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 text-primary-600 font-bold text-sm uppercase tracking-widest mb-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                                Knowledge Base
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black font-heading text-slate-900 tracking-tight">
                                Documentation
                            </h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative group flex-grow md:w-80">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                                </span>
                                <input
                                    type="text"
                                    placeholder="Search documentation..."
                                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all shadow-sm"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <main className="flex-grow py-12 md:py-20">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-16">

                        {/* ══════════ SIDEBAR ══════════ */}
                        <aside className="hidden lg:block space-y-10 sticky top-32 h-fit">
                            {navGroups.map((group) => (
                                <div key={group.title}>
                                    <h5 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        {group.title}
                                        <span className="flex-grow h-px bg-slate-100" />
                                    </h5>
                                    <ul className="space-y-3">
                                        {group.items.map((item) => (
                                            <li key={item.id}>
                                                <a
                                                    href={`#${item.id}`}
                                                    className="text-[15px] font-medium text-slate-500 hover:text-primary-600 hover:translate-x-1 transition-all inline-flex items-center gap-2 group"
                                                >
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-primary-400 opacity-0 group-hover:opacity-100 transition-all" />
                                                    {item.name}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </aside>

                        {/* ══════════ CONTENT ══════════ */}
                        <div className="lg:col-span-3">
                            <div className="prose prose-slate prose-lg max-w-none prose-headings:font-heading prose-headings:font-black prose-headings:tracking-tight prose-a:text-primary-600 prose-strong:text-slate-900">

                                <section id="welcome" className="scroll-mt-32">
                                    <h2 className="text-3xl font-black mb-6">Getting Started with MailApply</h2>
                                    <p className="text-slate-600 text-xl leading-relaxed">
                                        MailApply is the world's most advanced AI-powered job outreach platform. We've designed this documentation to help you move from "Searching" to "Hired" by automating the most tedious parts of the job hunt.
                                    </p>
                                    <div className="p-6 bg-primary-50 border border-primary-100 rounded-3xl my-10">
                                        <div className="flex gap-4">
                                            <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                                                💡
                                            </div>
                                            <div>
                                                <h4 className="text-primary-900 font-bold m-0 mb-1">Quick Start Tip</h4>
                                                <p className="text-primary-700 m-0 text-base leading-relaxed">
                                                    90% of our successful candidates connect their Gmail account in the first 5 minutes. This unlocks the direct-sending and tracking features.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section id="how-it-works" className="scroll-mt-32 mt-20">
                                    <h2>How MailApply Works</h2>
                                    <p>Our engine sits at the intersection of Generative AI and CRM technology. Specifically:</p>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
                                        <div className="p-6 rounded-3xl border border-slate-100 bg-slate-50/50">
                                            <div className="text-2xl mb-3">🧠</div>
                                            <h4 className="m-0 mb-2">AI Engine</h4>
                                            <p className="m-0 text-sm text-slate-500 leading-relaxed">Analyzes your CV and job descriptions to find the "Perfect Hook".</p>
                                        </div>
                                        <div className="p-6 rounded-3xl border border-slate-100 bg-slate-50/50">
                                            <div className="text-2xl mb-3">📬</div>
                                            <h4 className="m-0 mb-2">Direct Outreach</h4>
                                            <p className="m-0 text-sm text-slate-500 leading-relaxed">Sends emails via your actual Gmail inbox to ensure 100% deliverability.</p>
                                        </div>
                                        <div className="p-6 rounded-3xl border border-slate-100 bg-slate-50/50">
                                            <div className="text-2xl mb-3">📈</div>
                                            <h4 className="m-0 mb-2">Smart CRM</h4>
                                            <p className="m-0 text-sm text-slate-500 leading-relaxed">Tracks opens, clicks, and replies automatically in your tracker.</p>
                                        </div>
                                    </div>
                                </section>

                                <section id="gmail-setup" className="scroll-mt-32 mt-20">
                                    <h2 className="flex items-center gap-3">
                                        <span className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center text-lg">1</span>
                                        Connecting Your Gmail Account
                                    </h2>
                                    <p>Connecting your inbox is the core of the MailApply experience. We use **OAuth2**, the industry standard for secure authorization. We never see, store, or touch your Google password.</p>

                                    <div className="bg-slate-900 rounded-3xl p-8 my-8 overflow-hidden relative">
                                        <div className="relative z-10">
                                            <h4 className="text-white m-0 mb-4">Steps to Authorize:</h4>
                                            <ol className="text-slate-300 space-y-2 m-0">
                                                <li>Navigate to your <strong>Profile Settings</strong>.</li>
                                                <li>Click the <strong>"Connect Gmail"</strong> button.</li>
                                                <li>Select your preferred Google account.</li>
                                                <li>Grant the <code>mail.send</code> and <code>gmail.readonly</code> metadata permissions.</li>
                                                <li>You're live!</li>
                                            </ol>
                                        </div>
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 blur-3xl -translate-y-1/2 translate-x-1/2" />
                                    </div>
                                </section>

                                <section id="ai-engine" className="scroll-mt-32 mt-20">
                                    <h2 className="flex items-center gap-3">
                                        <span className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center text-lg">2</span>
                                        Mastering the AI Outreach Engine
                                    </h2>
                                    <p>MailApply doesn't just "write" emails—it builds arguments for why you should be hired. It uses your uploaded Resume and the Job Description as its primary data sources.</p>

                                    <div className="p-8 rounded-3xl border border-slate-200 my-8">
                                        <h4 className="m-0 mb-4 font-bold text-slate-900 italic">Example of a MailApply AI Generated Hook:</h4>
                                        <div className="font-mono text-sm bg-slate-50 p-6 rounded-2xl border border-slate-100 text-slate-600">
                                            "Hi Sarah, I noticed [Company] is scaling their MERN stack team. My experience at [Past Role] scaling MongoDB clusters to 1M+ write/sec aligns perfectly with your current roadmap..."
                                        </div>
                                    </div>
                                </section>

                                <section id="security" className="scroll-mt-32 mt-20">
                                    <h2 className="flex items-center gap-3 text-emerald-600">
                                        <span className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-lg">🛡️</span>
                                        Advanced Security Protocols
                                    </h2>
                                    <p>We take your professional privacy seriously. MailApply is built on a "Privacy-First" architecture:</p>
                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none p-0">
                                        <li className="flex gap-3 items-start p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                            <div className="text-emerald-500 mt-1">✓</div>
                                            <div className="text-sm"><strong>Zero-Pass Retention:</strong> We do not store Google passwords. Access is token-based.</div>
                                        </li>
                                        <li className="flex gap-3 items-start p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                            <div className="text-emerald-500 mt-1">✓</div>
                                            <div className="text-sm"><strong>Encryption at Rest:</strong> All profile data is encrypted using AES-256.</div>
                                        </li>
                                        <li className="flex gap-3 items-start p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                            <div className="text-emerald-500 mt-1">✓</div>
                                            <div className="text-sm"><strong>Restricted Scope:</strong> We only ask for the minimum permissions needed to send emails.</div>
                                        </li>
                                        <li className="flex gap-3 items-start p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                            <div className="text-emerald-500 mt-1">✓</div>
                                            <div className="text-sm"><strong>Verified OAuth:</strong> Our Google Integration follows strict Tier 2 security standards.</div>
                                        </li>
                                    </ul>
                                </section>

                                {/* Footer of content */}
                                <div className="mt-32 pt-12 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8">
                                    <div className="text-center md:text-left">
                                        <h4 className="m-0 text-slate-900 font-bold">
                                            {feedback ? "Thank you for the feedback!" : "Was this helpful?"}
                                        </h4>
                                        <p className="m-0 text-sm text-slate-500">
                                            {feedback ? "We'll use your input to refine our guides." : "Help us improve by giving feedback."}
                                        </p>
                                    </div>
                                    {!feedback && (
                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => setFeedback('yes')}
                                                className="px-6 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-sm font-bold flex items-center gap-2"
                                            >
                                                👍 Yes
                                            </button>
                                            <button
                                                onClick={() => setFeedback('no')}
                                                className="px-6 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-sm font-bold flex items-center gap-2"
                                            >
                                                👎 No
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
