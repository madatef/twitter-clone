import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		text: {
			type: String,
		},
		image: {
			type: String,
		},
		likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                default: [],
            }
		],
		retweets: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                default: [],
            }
		],
		retweetStatus: {
			isRetweet: {
				type: Boolean,
				default: false,
			},
			op: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "Post",
				default: null,
			},
			retweeter:{
					type: mongoose.Schema.Types.ObjectId,
					ref: "User",
					default: null,
				},
		},
		comments: [
			{
				text: {
					type: String,
					required: true,
				},
				user: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "User",
					required: true,
				},
			},
		],
	},
	{ timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

export default Post;