import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import AuthProvider from "@/components/providers/AuthProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://mailapply.in'),
  title: {
    default: "MailApply – Smart AI Job Application & Cold Email Platform",
    template: "%s | MailApply"
  },
  description:
    "Generate personalized job application emails using AI, send them directly to recruiters, and track your cold email outreach effortlessly — all in one dashboard.",
  keywords: [
    "AI job application generator",
    "cold email recruiters template",
    "auto apply to jobs software",
    "track job applications online",
    "job search",
    "recruiter email",
    "MailApply",
  ],
  authors: [{ name: "Aditya Singh" }],
  creator: "MailApply",
  openGraph: {
    title: "MailApply – Smart AI Job Email Outreach Platform",
    description:
      "Generate personalized job application emails, send them directly to recruiters, and track your outreach seamlessly.",
    type: "website",
    url: "https://mailapply.in",
    siteName: "MailApply",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "MailApply – Land your dream job with AI cold emails.",
    description: "Automate your job search. Generate and send highly personalized outreach emails to recruiters instantly.",
    creator: "@mailapply",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable} antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
