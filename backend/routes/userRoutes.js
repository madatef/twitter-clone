import express from 'express';
import { protectRoute } from '../middleware/protectRoute.js';
import { followUserSwitch, getSuggestions, getUserProfile, updateProfile } from '../controllers/usersController.js';


const router = express.Router();

router.get("/profile/:username", protectRoute, getUserProfile);
router.get("/suggestions", protectRoute, getSuggestions);
router.post("/follow/:id", protectRoute, followUserSwitch);
router.post("/update", protectRoute, updateProfile);

export default router;