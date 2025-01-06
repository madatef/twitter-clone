import express from "express";
import { login, logout, signup, getMe } from "../controllers/authController.js";
import { protectRoute } from "../middleware/protectRoute.js";


const router = express.Router();

// getMe returns the logged in user data and
// protectRoute is a middleware function to protect this route
router.get("/me", protectRoute, getMe);

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);




export default router;