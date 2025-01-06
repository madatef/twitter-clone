// common core modules
import express from "express";
import dotenv from "dotenv"
import cookieParser from "cookie-parser";

// Custom modules
import {v2 as cloudinary} from "cloudinary";

// routers
import authRoutes from "./routes/authRoutes.js"
import userRoutes from "./routes/userRoutes.js";

// utils 
import connectDB from "./db/connectMongoDB.js";

dotenv.config();
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
})

const app = express();
// parse req.body as json
app.use(express.json());
// parse form and url encoded data
app.use(express.urlencoded({ extended: true }));
// parse cookies to athenticate and authorize users
app.use(cookieParser())

// authentication and authorizatin routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
















const PORT = process.env.PORT || 3500;
app.listen(PORT, () => {
    console.log(`server is running and listening on port ${PORT}...`);
    connectDB();
})
