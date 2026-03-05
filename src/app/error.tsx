"use client";

import { useEffect } from "react";
import Button from "@/components/ui/Button";
import Link from "next/link";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("Critical Application Error:", error);
    }, [error]);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center">
                <div className="w-20 h-20 rounded-full bg-danger-100 text-danger-600 flex items-center justify-center text-3xl mx-auto mb-6">
                    ⚠️
                </div>
                <h2 className="text-2xl font-bold font-heading text-slate-900 mb-3">
                    Something went wrong
                </h2>
                <p className="text-slate-500 mb-8 leading-relaxed">
                    The application encountered an unexpected error. This might be a temporary issue.
                </p>

                <div className="flex flex-col gap-3">
                    <Button
                        onClick={() => reset()}
                        variant="primary"
                        className="w-full"
                    >
                        Try Again
                    </Button>
                    <Link href="/">
                        <Button variant="outline" className="w-full">
                            Return Home
                        </Button>
                    </Link>
                </div>

                {error.digest && (
                    <p className="mt-8 text-[10px] text-slate-300 font-mono uppercase tracking-widest">
                        Error ID: {error.digest}
                    </p>
                )}
            </div>
        </div>
    );
}
