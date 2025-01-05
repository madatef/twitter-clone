import express from "express";
import authRoutes from "./routes/authRoutes.js"
import dotenv from "dotenv"
import connectDB from "./db/connectMongoDB.js";


dotenv.config();

const app = express();
app.use("/api/auth", authRoutes);
















const PORT = process.env.PORT || 3500;
app.listen(PORT, () => {
    console.log(`server is running and listening on port ${PORT}...`);
    connectDB();
})
