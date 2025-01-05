import dotenv from "dotenv";
import mongoose from "mongoose";


dotenv.config();

const connectDB = async () => {
    try {
        const connect = await mongoose.connect(process.env.MONGO_URI);
        console.log(`connected to databast: ${connect.connection.host}`);
    } catch(error) {
        console.error(`Couldn't connecting to database: ${error.message}`);
        process.exit(1);
    }
}

export default connectDB;