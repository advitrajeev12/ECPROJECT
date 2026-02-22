import mongoose from 'mongoose';

const LOCAL_URI = "mongodb://localhost:27017/ecommerce";

console.log("Testing LOCAL MongoDB Connection...");

mongoose.connect(LOCAL_URI, { serverSelectionTimeoutMS: 2000 })
    .then(() => {
        console.log("✅ LOCAL MongoDB is Running!");
        process.exit(0);
    })
    .catch((err) => {
        console.log("❌ Local MongoDB NOT reachable.");
        process.exit(1);
    });
