import express from 'express';
import { protectRoute } from '../middleware/protectRoute.js';
import { addComment, createPost, deletePost, getFollowingPosts, getLikedPosts, getPosts, getUserPosts, likePostSwitch, retweetPost } from '../controllers/postController.js';

const router = express.Router();

router.get('/all', protectRoute, getPosts);
router.get("/likes/:id", protectRoute, getLikedPosts);
router.get('/following', protectRoute, getFollowingPosts);
router.get('/user/:username', protectRoute, getUserPosts)
router.post('/create', protectRoute, createPost);
router.post('/like/:id', protectRoute, likePostSwitch);
router.post('/comment/:id', protectRoute, addComment);
router.post('/retweet/:id', protectRoute, retweetPost);
router.delete('/:id', protectRoute, deletePost);

export default router;