import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import Email from "@/models/Email";

// GET /api/emails — List user's email history
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");
        const search = searchParams.get("search");

        const filter: Record<string, unknown> = { userId: user._id };
        if (status && status !== "all") filter.status = status;
        if (search) {
            filter.$or = [
                { companyName: { $regex: search, $options: "i" } },
                { recruiterEmail: { $regex: search, $options: "i" } },
                { jobTitle: { $regex: search, $options: "i" } },
            ];
        }

        const emails = await Email.find(filter).sort({ createdAt: -1 }).lean();

        return NextResponse.json({ emails });
    } catch (error) {
        console.error("Get emails error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// PATCH /api/emails — Update email status
export async function PATCH(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { emailId, status } = body;

        if (!emailId || !status) {
            return NextResponse.json({ error: "emailId and status are required" }, { status: 400 });
        }

        const validStatuses = ["pending", "sent", "replied", "interview", "failed"];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        await dbConnect();
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const updateData: Record<string, unknown> = { status };
        if (status === "replied") updateData.repliedAt = new Date();

        const email = await Email.findOneAndUpdate(
            { _id: emailId, userId: user._id },
            { $set: updateData },
            { new: true }
        );

        if (!email) {
            return NextResponse.json({ error: "Email not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Status updated", email });
    } catch (error) {
        console.error("Update email error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
