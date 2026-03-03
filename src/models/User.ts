import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    password: string;
    skills: string[];
    role: string;
    experience: string;
    resumeUrl: string;
    bio: string;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            maxlength: [100, "Name cannot exceed 100 characters"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters"],
        },
        skills: {
            type: [String],
            default: [],
        },
        role: {
            type: String,
            default: "",
            trim: true,
        },
        experience: {
            type: String,
            default: "",
            trim: true,
        },
        resumeUrl: {
            type: String,
            default: "",
        },
        bio: {
            type: String,
            default: "",
            maxlength: [2000, "Bio cannot exceed 2000 characters"],
        },
    },
    {
        timestamps: true,
    }
);

const User: Model<IUser> =
    mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
