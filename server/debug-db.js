import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const testDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        const testEmail = 'testuser_' + Date.now() + '@example.com';
        const newUser = new User({
            name: 'Test User',
            email: testEmail,
            password: 'password123',
            mobile: '1234567890',
            role: 'user'
        });

        await newUser.save();
        console.log('User created successfully:', testEmail);

        const foundUser = await User.findOne({ email: testEmail });
        if (foundUser) {
            console.log('User found in DB:', foundUser.email);
        } else {
            console.error('User NOT found in DB after save!');
        }

        mongoose.connection.close();
    } catch (error) {
        console.error('DB Test Failed:', error);
        process.exit(1);
    }
};

testDB();
