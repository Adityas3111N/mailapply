import mongoose, { Schema, Document, Model } from "mongoose";

export type EmailStatus = "pending" | "sent" | "replied" | "interview" | "failed";

export interface IEmail extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    outreachId: mongoose.Types.ObjectId;
    companyName: string;
    recruiterEmail: string;
    jobTitle: string;
    subject: string;
    message: string;
    status: EmailStatus;
    sentAt: Date;
    repliedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const EmailSchema = new Schema<IEmail>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        outreachId: {
            type: Schema.Types.ObjectId,
            ref: "Outreach",
        },
        companyName: {
            type: String,
            required: true,
            trim: true,
        },
        recruiterEmail: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        jobTitle: {
            type: String,
            required: true,
            trim: true,
        },
        subject: {
            type: String,
            required: true,
            trim: true,
        },
        message: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "sent", "replied", "interview", "failed"],
            default: "pending",
        },
        sentAt: {
            type: Date,
        },
        repliedAt: {
            type: Date,
        },
    },
    { timestamps: true }
);

const Email: Model<IEmail> =
    mongoose.models.Email || mongoose.model<IEmail>("Email", EmailSchema);

export default Email;
