import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Documentation | MailApply Guide",
    description: "Master your job search with MailApply. Comprehensive guides on AI outreach, Gmail integration, and career automation.",
};

export default function DocsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
