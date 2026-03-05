export default function Loading() {
    return (
        <div className="fixed inset-0 z-[100] bg-white flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    {/* Outer pulse */}
                    <div className="w-16 h-16 rounded-2xl bg-primary-100 animate-ping absolute inset-0 opacity-20" />

                    {/* Brand icon container */}
                    <div className="w-16 h-16 rounded-2xl bg-primary-600 flex items-center justify-center shadow-xl shadow-primary-200 relative z-10 animate-bounce">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                            <polyline points="22,6 12,13 2,6" />
                        </svg>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 tracking-wider uppercase">Loading</span>
                    <div className="flex gap-1">
                        <div className="w-1 h-1 rounded-full bg-primary-600 animate-bounce" style={{ animationDelay: '0s' }} />
                        <div className="w-1 h-1 rounded-full bg-primary-600 animate-bounce" style={{ animationDelay: '0.2s' }} />
                        <div className="w-1 h-1 rounded-full bg-primary-600 animate-bounce" style={{ animationDelay: '0.4s' }} />
                    </div>
                </div>
            </div>
        </div>
    );
}
