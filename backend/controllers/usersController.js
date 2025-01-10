import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import {v2 as cloudinary} from "cloudinary";
import Notification from "../models/notifyModel.js";


export const getUserProfile = async (req, res) => {
    try {
        const { username } = req.params;
        console.log(username);
        const user = await User.findOne({ username }).select("-password");
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json({ user });
    }
    catch (error) {
        console.error(`error in getUserProfile: ${error}`);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const followUserSwitch = async (req, res) => {
    try {
        const { id } = req.params;
        if (id === req.user._id.toString()) {
            return res.status(400).json({ error: "You can't follow yourself" });
        }
        const currUser = await User.findById(req.user._id); 
        const followUser = await User.findById(id).select("-password");

        if (!followUser || !currUser) {
            return res.status(404).json({ error: "User not found" });
        }
        const isFollowing = currUser.following.includes(id);
        if (isFollowing) {
            currUser.following = currUser.following.pull(id);
            followUser.followers = followUser.followers.pull(req.user._id);
            res.status(200).json({message: `You unfollowed ${followUser.username}`});
        }
        else {
            currUser.following.push(id);
            followUser.followers.push(req.user._id);

            // send notification to the user being followed
            const notification = new Notification({
                sender: req.user._id,
                receiver: id,
                type: "follow"
            });
            await notification.save();

            res.status(200).json({ currUser });
        }
        await currUser.save();
        await followUser.save();
    }
    catch (error) {
        console.error(`error in followUserSwitch: ${error}`);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const getSuggestions = async (req, res) => {
    try {

        // get the ids of users the logged in user is following
        const followingIds = req.user.following;
        
        const suggestions = await User.find({
            _id: { $nin: [...followingIds, req.user._id] },
          })
          .select("-password")
          .limit(5);
        res.status(200).json(suggestions);
    }
    catch (error) {
        console.error(`error in getSuggestions: ${error}`);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const updateProfile = async (req, res) => {
    try {
        const { username, bio, fullname, email, website, location, currentPassword, newPassword} = req.body;
        let { profilePicture, coverPicture } = req.body;  
        const user = await User.findById(req.user._id);
        user.username = username || user.username;
        user.bio = bio || user.bio;
        user.fullname = fullname || user.fullname;
        user.email = email || user.email;
        user.website = website || user.website;
        user.location = location || user.location;
        if (currentPassword && newPassword) {
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ error: "current password is incorrect" });
            }
            if (currentPassword === newPassword) {
                return res.status(400).json({ error: "New password can't be the same as the current password" });
            }
            if (newPassword.length < 6) {
                return res.status(400).json({ error: "Password must be at least 6 characters long" });
            }
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        } else if (currentPassword || newPassword) {
            return res.status(400).json({ error: "Please provide both current and new password" });
        }
        if (profilePicture) {
            if (user.profilePicture) {
                const publicId = user.profilePicture.match(/upload\/v\d+\/(.+)\./)[1];
                await cloudinary.uploader.destroy(publicId);
            }
            const uploadedResponse = await cloudinary.uploader.upload(profilePicture, {
                upload_preset: "social_media"
            });
            user.profilePicture = uploadedResponse.secure_url;
        }
        if (coverPicture) {
            if (user.coverPicture) {
                const publicId = user.coverPicture.match(/upload\/v\d+\/(.+)\./)[1];
                await cloudinary.uploader.destroy(publicId);
            }
            const uploadedResponse = await cloudinary.uploader.upload(coverPicture, {
                upload_preset: "social_media"
            });
            user.coverPicture = uploadedResponse.secure_url;
        }

        await user.save();
        user.password = null; // remove the password from the data sent to the client to avoide XSS attacks    
        res.status(200).json({ user });
    }
    catch (error) {
        console.log(`error in updateProfile: ${error.message}`);
        res.status(500).json({ error: "Internal server error" });
    }
}