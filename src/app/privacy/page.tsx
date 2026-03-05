import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata = {
    title: "Privacy Policy | MailApply Security",
    description: "Learn how MailApply protects your professional data and respects your privacy.",
};

export default function PrivacyPolicy() {
    return (
        <div className="bg-white min-h-screen flex flex-col">
            <Navbar />

            {/* Professional Header */}
            <div className="pt-32 pb-16 bg-slate-50 border-b border-slate-100">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="flex items-center gap-2 text-primary-600 font-bold text-sm uppercase tracking-widest mb-4">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                        Legal & Compliance
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black font-heading text-slate-900 tracking-tight mb-4">
                        Privacy Policy
                    </h1>
                    <p className="text-slate-500 font-medium">
                        Last Revised: March 5, 2026 • Version 1.2
                    </p>
                </div>
            </div>

            <main className="flex-grow py-16 md:py-24">
                <div className="max-w-4xl mx-auto px-6">
                    {/* Summary Card */}
                    <div className="bg-primary-50 border border-primary-100 rounded-3xl p-8 mb-16">
                        <h3 className="text-primary-900 font-bold text-xl mb-4 flex items-center gap-2">
                            <span className="text-2xl">🛡️</span> Quick Summary
                        </h3>
                        <p className="text-primary-800 leading-relaxed m-0">
                            We value your trust. MailApply only accesses data absolutely necessary to help you land a job. We <strong>never</strong> sell your data, we <strong>never</strong> store your Gmail passwords, and you can <strong>delete</strong> everything at any time.
                        </p>
                    </div>

                    <article className="prose prose-slate prose-lg max-w-none prose-headings:font-heading prose-headings:font-black prose-headings:tracking-tight prose-a:text-primary-600 prose-strong:text-slate-900">
                        <section>
                            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-sm">01</span>
                                Information We Collect
                            </h2>
                            <p>
                                To provide our job application automation services, MailApply collects specific information through direct input and third-party integrations:
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
                                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                                    <h4 className="mt-0 mb-2">Account Data</h4>
                                    <p className="m-0 text-sm text-slate-500">Name, email, and authentication tokens via Google OAuth2.</p>
                                </div>
                                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                                    <h4 className="mt-0 mb-2">Profile Assets</h4>
                                    <p className="m-0 text-sm text-slate-500">Skills, experience history, and PDF resumes uploaded to our servers.</p>
                                </div>
                                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                                    <h4 className="mt-0 mb-2">Outreach Metadata</h4>
                                    <p className="m-0 text-sm text-slate-500">Hiring manager emails, company names, and job descriptions.</p>
                                </div>
                                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                                    <h4 className="mt-0 mb-2">Reply Tracking</h4>
                                    <p className="m-0 text-sm text-slate-500">Metadata from your inbox (timestamps, subjects) to identify recruiter replies.</p>
                                </div>
                            </div>
                        </section>

                        <section className="mt-16">
                            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-sm">02</span>
                                Use of Google User Data
                            </h2>
                            <p>
                                MailApply's use and transfer to any other app of information received from Google APIs will adhere to the{' '}
                                <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer">
                                    Google API Service User Data Policy
                                </a>, including the Limited Use requirements.
                            </p>
                            <div className="p-6 bg-slate-900 rounded-3xl text-slate-300 my-8">
                                <h4 className="text-white mt-0 mb-3">Restricted Scopes Statement</h4>
                                <ul className="text-sm space-y-2 mb-0">
                                    <li>We only request <code>gmail.send</code> to deliver your application drafts.</li>
                                    <li>Incoming email data is processed only to extract replies from recruiters you have contacted.</li>
                                    <li>We do not use your email data for advertising or profile building.</li>
                                </ul>
                            </div>
                        </section>

                        <section className="mt-16">
                            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-sm">03</span>
                                AI Data Processing
                            </h2>
                            <p>
                                We use Large Language Models (LLMs) to generate personalized content.
                            </p>
                            <ul>
                                <li><strong>Isolation:</strong> Your data is sent to AI models via encrypted APIs.</li>
                                <li><strong>No Training:</strong> We have opted out of third-party AI model training. Your personal career history is never used to train public AI models.</li>
                            </ul>
                        </section>

                        <section className="mt-16">
                            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-sm">04</span>
                                Data Retension & Deletion
                            </h2>
                            <p>
                                You own your data. We retain your information as long as your account is active. If you choose to delete your account:
                            </p>
                            <ol>
                                <li>All profile data and uploaded resumes are permanently purged from our storage.</li>
                                <li>Google OAuth tokens are immediately invalidated.</li>
                                <li>Outreach logs are anonymized for internal system analytics.</li>
                            </ol>
                        </section>

                        <div className="mt-24 p-8 bg-slate-50 rounded-3xl border border-slate-100 text-center">
                            <h4 className="mt-0">Questions regarding your privacy?</h4>
                            <p className="text-slate-500 mb-6">Our compliance team is here to help you understand how we protect your search.</p>
                            <a href="mailto:privacy@mailapply.in" className="inline-flex h-12 items-center justify-center rounded-xl bg-slate-900 px-8 text-sm font-bold text-white hover:bg-slate-800 transition-colors">
                                Contact Privacy Team
                            </a>
                        </div>
                    </article>
                </div>
            </main>

            <Footer />
        </div>
    );
}
