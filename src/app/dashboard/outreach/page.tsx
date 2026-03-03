"use client";

import { useState, FormEvent } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Input";

export default function OutreachPage() {
    // Form state
    const [companyName, setCompanyName] = useState("");
    const [recruiterEmail, setRecruiterEmail] = useState("");
    const [jobTitle, setJobTitle] = useState("");
    const [jobLink, setJobLink] = useState("");
    const [notes, setNotes] = useState("");

    // Email state
    const [emailSubject, setEmailSubject] = useState("");
    const [emailBody, setEmailBody] = useState("");
    const [outreachId, setOutreachId] = useState("");

    // UI state
    const [step, setStep] = useState<"form" | "preview">("form");
    const [generating, setGenerating] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleGenerate = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setGenerating(true);

        try {
            // 1. Save outreach target
            const outreachRes = await fetch("/api/outreach", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ companyName, recruiterEmail, jobTitle, jobLink, notes }),
            });

            if (!outreachRes.ok) {
                const data = await outreachRes.json();
                setError(data.error || "Failed to save outreach target");
                return;
            }

            const outreachData = await outreachRes.json();
            setOutreachId(outreachData.outreach._id);

            // 2. Generate email
            const emailRes = await fetch("/api/generate-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ companyName, recruiterEmail, jobTitle }),
            });

            if (!emailRes.ok) {
                setError("Failed to generate email. Please try again.");
                return;
            }

            const emailData = await emailRes.json();
            setEmailSubject(emailData.subject);
            setEmailBody(emailData.body);
            setStep("preview");
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setGenerating(false);
        }
    };

    const handleSend = async () => {
        setSending(true);
        setError("");

        try {
            const res = await fetch("/api/send-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    to: recruiterEmail,
                    subject: emailSubject,
                    message: emailBody,
                    companyName,
                    jobTitle,
                    outreachId,
                }),
            });

            const data = await res.json();

            if (data.success) {
                setSuccess("🎉 Email sent successfully!");
            } else {
                setSuccess("📋 Email saved! " + (data.message || "Configure Gmail OAuth2 to enable sending."));
            }

            // Reset form
            setTimeout(() => {
                setStep("form");
                setCompanyName("");
                setRecruiterEmail("");
                setJobTitle("");
                setJobLink("");
                setNotes("");
                setEmailSubject("");
                setEmailBody("");
                setOutreachId("");
                setSuccess("");
            }, 4000);
        } catch {
            setError("Failed to send email. Please try again.");
        } finally {
            setSending(false);
        }
    };

    const handleBack = () => {
        setStep("form");
        setError("");
    };

    return (
        <div className="max-w-2xl animate-fade-in">
            <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900">
                    {step === "form" ? "New Outreach" : "Email Preview"}
                </h1>
                <p className="text-slate-500 mt-1">
                    {step === "form"
                        ? "Add company details and generate a personalized email."
                        : "Review, edit, and send your personalized email."}
                </p>
            </div>

            {error && (
                <div className="mb-6 p-3 rounded-xl bg-danger-100 text-danger-700 text-sm font-medium animate-fade-in">
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-6 p-4 rounded-xl bg-success-100 text-success-700 text-sm font-medium animate-fade-in">
                    {success}
                </div>
            )}

            {step === "form" ? (
                /* ═══════ STEP 1: Company Form ═══════ */
                <form onSubmit={handleGenerate} className="space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
                        <h2 className="text-lg font-semibold text-slate-900">
                            Company Details
                        </h2>

                        <Input
                            label="Company Name"
                            placeholder="e.g. Google, Stripe, Razorpay"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            required
                        />

                        <Input
                            label="Recruiter / HR Email"
                            type="email"
                            placeholder="recruiter@company.com"
                            value={recruiterEmail}
                            onChange={(e) => setRecruiterEmail(e.target.value)}
                            required
                        />

                        <Input
                            label="Job Title"
                            placeholder="e.g. Frontend Developer, Data Analyst"
                            value={jobTitle}
                            onChange={(e) => setJobTitle(e.target.value)}
                            required
                        />

                        <Input
                            label="Job Link (optional)"
                            placeholder="https://company.com/careers/job-id"
                            value={jobLink}
                            onChange={(e) => setJobLink(e.target.value)}
                        />

                        <Textarea
                            label="Notes (optional)"
                            placeholder="Any additional context for the email generation…"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={2}
                        />
                    </div>

                    <Button
                        type="submit"
                        variant="cta"
                        size="lg"
                        className="w-full"
                        isLoading={generating}
                    >
                        ✨ Generate Email
                    </Button>
                </form>
            ) : (
                /* ═══════ STEP 2: Email Preview ═══════ */
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-slate-900">
                                Generated Email
                            </h2>
                            <span className="text-xs font-medium text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
                                To: {recruiterEmail}
                            </span>
                        </div>

                        <Input
                            label="Subject Line"
                            value={emailSubject}
                            onChange={(e) => setEmailSubject(e.target.value)}
                        />

                        <Textarea
                            label="Email Body"
                            value={emailBody}
                            onChange={(e) => setEmailBody(e.target.value)}
                            rows={12}
                        />

                        <p className="text-xs text-slate-400">
                            ✏️ You can edit the subject and body before sending.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <Button variant="secondary" size="lg" onClick={handleBack}>
                            ← Back
                        </Button>
                        <Button
                            variant="cta"
                            size="lg"
                            className="flex-1"
                            onClick={handleSend}
                            isLoading={sending}
                        >
                            🚀 Send Email
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
