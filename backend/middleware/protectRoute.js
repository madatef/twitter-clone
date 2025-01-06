import user from "../models/userModel.js";
import jwt from "jsonwebtoken";


// protect the /me route 
export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ error: "Not authorized, no token" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(401).json({ error: "Not authorized, invalid token" });
        }
        user = await user.findById(decoded.id).select("-password"); // remove the password from the data sent to the client to avoide XSS attacks
        if (!user) {
            return res.status(401).json({ error: "Not authorized, no user found" });
        }
        req.user = user;
        next();
    } catch (error) {
        console.error(error);
        res.status(401).json({ error: "Not authorized, token failed" });
    }

};