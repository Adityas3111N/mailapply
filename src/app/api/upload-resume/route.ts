import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Validate file type
        if (file.type !== "application/pdf") {
            return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 });
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: "File must be less than 5MB" }, { status: 400 });
        }

        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(process.cwd(), "public", "uploads", "resumes");
        await mkdir(uploadsDir, { recursive: true });

        // Generate unique filename
        const sanitizedEmail = session.user.email.replace(/[@.]/g, "_");
        const filename = `resume_${sanitizedEmail}_${Date.now()}.pdf`;
        const filePath = path.join(uploadsDir, filename);

        // Convert file to buffer and write
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        await writeFile(filePath, buffer);

        // URL that Next.js serves from /public
        const resumeUrl = `/uploads/resumes/${filename}`;

        // Save the resume URL to the user's profile
        await dbConnect();
        await User.findOneAndUpdate(
            { email: session.user.email },
            { $set: { resumeUrl } }
        );

        return NextResponse.json({
            url: resumeUrl,
            message: "Resume uploaded successfully",
        });
    } catch (error) {
        console.error("Resume upload error:", error);
        return NextResponse.json(
            { error: "Failed to upload resume" },
            { status: 500 }
        );
    }
}
