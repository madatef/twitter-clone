import User from "../models/userModel.js";
import {v2 as cloudinary} from "cloudinary";
import Post from "../models/postModel.js";
import Notification from "../models/notifyModel.js";


export const getPosts = async (req, res) => {
    try {
        const posts = await Post.find().sort({createdAt: -1}).populate({path: "user", select: "-password"}).populate({path: "comments.user", select: "-password"});
        if (!posts) {
            return res.status(200).json([]);
        }
        res.status(200).json(posts);
    } catch (error) {
        console.log(`error in getPosts: ${error}`);
        res.status(500).json({error: "Internal server error"});
    }
}

export const getFollowingPosts = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = req.user;
        if (!user) {
            res.status(400).json({error: "User not found"});
        }
        if (!user.following.length) {
            return res.status(200).json([]);
        }
        const followingPosts = await Post.find({user: {$in: user.following}})
        .sort({createdAt: -1})
        .populate({path: "user", select: "-password"})
        .populate({path: "comments.user", select: "-password"});
        res.status(200).json(followingPosts);
    } catch (error) {
        console.log(`error in getFollowingPosts: ${error}`);
        res.status(500).json({error: "Internal server error"});
    }
}

export const getUserPosts = async (req, res) => {
    try {
        const {username} = req.params;
        const user = await User.findOne({username});
        if (!user) {
            return res.status(404).json({error: "User not found"});
        }
        const posts = await Post.find({user: user._id})
        .sort({createdAt: -1})
        .populate({
            path: "user",
            select: "-password"
        })
        .populate({
            path: "comments.user",
            select: "-password"
        });
        
        if (!posts) {
            return res.status(200).josn([]);
        }
        res.status(200).json(posts);

    } catch (error) {
        console.log(`error in getUsrePosts: ${error.message}`)
        res.status(500).json({error: "Internal server error"});
    }
}

export const getLikedPosts = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);
        if(!user) {
            return res.status(400).json({error: "User not found"});
        }
        const likedPosts = await Post.find({_id: {$in: user.likedPosts}}).populate({path: "user", select: "-password"}).populate({path: "comments.user", select: "-password"});
        res.status(200).json(likedPosts);
    } catch (error) {
        console.log(`error in getLikes: ${error}`);
        res.status(500).json({error: "Internal server error"});
    }
}

export const createPost = async (req, res) => {
    try {
        console.log(req.user);
        const { text } = req.body;
        let { image } = req.body;
        const userId = req.user._id;

        const postCreator = await User.findById(userId);
        if(!postCreator) {
            return res.status(400).json({message: "User not found"});
        }
        if (!text && !image) {
            return res.status(400).json({message: "Text or image is required"});
        }
        if (image) {
            const uploadedImage = await cloudinary.uploader.upload(image, {
                upload_preset: "social_media"
            });
            image = uploadedImage.secure_url;
            console.log(image);
        }

        const newPost = {
            user: userId,
            text,
            image
        }

        const post = await Post.create(newPost);
        res.status(201).json(post);
    } catch (error) {
        res.status(500).json({error: "Internal server error"});
    }
}

export const likePostSwitch = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user._id;

        let post = await Post.findById(postId);
        if(!post) {
            return res.status(404).json({message: "Post not found"});
        }

        const isLiked = post.likes.includes(userId);
        if(isLiked) {
            await Post.updateOne({_id: postId}, {$pull: {likes: userId}});
            post = await Post.findById(postId);
            await User.updateOne({_id: userId}, {$pull: {likedPosts: postId}});
            const updatedLikes = post.likes.filter((id) => id.toString() !== userId.toString());
			res.status(200).json(updatedLikes);
        } else {
            await Post.updateOne({_id: postId}, {$push: {likes: userId}});
            post = await Post.findById(postId);
            await User.updateOne({_id: userId}, {$push: {likedPosts: postId}});
            // send notification to the post creator
            if (post.user._id.toString() !== userId.toString()) {
                const notification = new Notification({
                    sender: userId,
                    receiver: post.user,
                    type: "like"
                });
                await Notification.create(notification);
            }
            const updatedLikes = post.likes;
			res.status(200).json(updatedLikes);
        }

    } catch (error) {
        console.log(`error in likePostSwitch: ${error.message}`)
        res.status(500).json({error: "Internal server error"});
    }
}

export const addComment = async (req, res) => {
    try {
        const { text } = req.body;
        const postId = req.params.id;
        const userId = req.user._id;

        const post = await Post.findById(postId);
        if(!post) {
            return res.status(400).json({message: "Post not found"});
        }
        if(!text) {
            return res.status(400).json({message: "Text field is required"});
        }

        const newComment = {
            user: userId,
            text
        }

        post.comments.push(newComment);
        await post.save();
        res.status(200).json(post);

        // send notification to the post creator
        if (post.user._id.toString() !== userId.toString()) {
            const notification = new Notification({
                sender: userId,
                receiver: post.user,
                type: "comment"
            });
            await Notification.create(notification);
        }

    } catch (error) {
        console.log(`error in addComment: ${error}`);
        res.status(500).json({error: "Internal server error"});
    }
}

export const deletePost = async (req, res) => {
    try {
        const postId  = req.params.id;
        const userId = req.user._id;

        const post = await Post.findById(postId);
        if(!post) {
            return res.status(400).json({message: "Post not found"});
        }

        if(post.user.toString() !== userId.toString()) {
            return res.status(401).json({message: "Unauthorized"});
        }
        if (post.image) {
            const publicId = post.image.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(publicId);
        }

        await Post.deleteOne({_id: postId});
        res.status(200).json({message: "Post deleted"});
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Internal server error"});
    }
}

