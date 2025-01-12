// common core modules
import express from "express";
import dotenv from "dotenv"
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

// Custom modules
import {v2 as cloudinary} from "cloudinary";

// routers
import authRoutes from "./routes/authRoutes.js"
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import notifyRoutes from "./routes/notifyRoutes.js";

// utils 
import connectDB from "./db/connectMongoDB.js";

dotenv.config();
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

const __dirname = path.resolve();

const app = express();
// parse req.body as json
app.use(express.json({ limit: '5mb' }));
// allow cross origin requests
app.use(cors({
    origin: 'http://localhost:3000', // Allow only this origin
    methods: ['GET', 'POST', 'DELETE', 'UPDATE'], // Allow only specific HTTP methods
    credentials: true, // Allow cookies
}));
// parse form and url encoded data
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
// parse cookies to athenticate and authorize users
app.use(cookieParser())

// authentication and authorizatin routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);

// interaction routes
app.use("/posts", postRoutes);
app.use("/notify", notifyRoutes);


if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '/frontend/dist')));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'frontend', 'dist', 'index.html'));
    })
}













const PORT = process.env.PORT || 3500;
app.listen(PORT, () => {
    console.log(`server is running and listening on port ${PORT}...`);
    connectDB();
})
