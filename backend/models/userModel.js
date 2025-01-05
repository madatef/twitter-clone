import mongoose, { Schema } from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    fullname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minLength: 6,
    },
    followers: [
        {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: [],
        }
    ],
    following: [
        {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: [],
        }
    ], 
    profilePicture: {
        type: String,
        default: "",
    },
    coverPicture: {
        type: String,
        default: "",
    },
    bio: {
        type: String,
        default: "",
    },
    location: {
        type: String,
        default: "",
    },
    website: {
        type: String,
        default: "",
    },
},{timestamps: true});

const User = mongoose.model("User", userSchema);
export default User;