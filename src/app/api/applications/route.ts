import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import Email from "@/models/Email";

// GET /api/applications — returns all the user's sent emails grouped by status
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const user = await User.findOne({ email: session.user.email });
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const emails = await Email.find({ userId: user._id })
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ applications: emails });
    } catch (error) {
        console.error("Applications GET error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// PATCH /api/applications — update the status of a single email (for manual Kanban drag)
export async function PATCH(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { emailId, status } = await req.json();
        if (!emailId || !status) {
            return NextResponse.json({ error: "emailId and status are required" }, { status: 400 });
        }

        const validStatuses = ["pending", "sent", "replied", "interview", "assignment", "rejected", "offer", "failed"];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        await dbConnect();
        const user = await User.findOne({ email: session.user.email });
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const updated = await Email.findOneAndUpdate(
            { _id: emailId, userId: user._id }, // ensure ownership
            { $set: { status } },
            { new: true }
        );

        if (!updated) return NextResponse.json({ error: "Email not found" }, { status: 404 });

        return NextResponse.json({ ok: true, email: updated });
    } catch (error) {
        console.error("Applications PATCH error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
