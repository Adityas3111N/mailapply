import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";

export default function NotFound() {
    return (
        <div className="bg-white min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow flex items-center justify-center pt-32 pb-24">
                <div className="max-w-xl mx-auto px-6 text-center">
                    <div className="mb-8 relative inline-block">
                        <h1 className="text-9xl font-black text-slate-100 select-none">404</h1>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-4xl">🔎</span>
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold font-heading text-slate-900 mb-4">
                        Page Not Found
                    </h2>
                    <p className="text-slate-600 mb-10 text-lg">
                        Oops! The page you're looking for was either moved, deleted, or never existed in the first place.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/">
                            <Button variant="primary">
                                Return Home
                            </Button>
                        </Link>
                        <Link href="/docs">
                            <Button variant="outline">
                                Read Documentation
                            </Button>
                        </Link>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
