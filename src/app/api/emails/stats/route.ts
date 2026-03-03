import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import Email from "@/models/Email";

// GET /api/emails/stats — Dashboard statistics
export async function GET() {
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

        const [totalSent, pending, replied, interviews] = await Promise.all([
            Email.countDocuments({ userId: user._id, status: "sent" }),
            Email.countDocuments({ userId: user._id, status: "pending" }),
            Email.countDocuments({ userId: user._id, status: "replied" }),
            Email.countDocuments({ userId: user._id, status: "interview" }),
        ]);

        return NextResponse.json({
            totalSent,
            pending,
            replied,
            interviews,
        });
    } catch (error) {
        console.error("Get stats error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
