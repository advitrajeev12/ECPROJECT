import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        console.log("Attempting to connect to MongoDB...", process.env.MONGODB_URI?.split('@')[1] || "Local/Unknown"); // Log non-sensitive part
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        // process.exit(1); 
    }
};

export default connectDB;
