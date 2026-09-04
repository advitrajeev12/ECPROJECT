import express from 'express';
import User from '../../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendFast2SMSOtp, verifyFast2SMSOtp } from '../../utils/fast2smsService.js';

const router = express.Router();

const generateToken = (res, userId) => {
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
};

// Register User
router.post('/register', async (req, res) => {
    const { name, email, mobile, password } = req.body;
    try {
        const existingUser = await User.findOne({ email }).lean();
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hashedPassword, mobile });

        await user.save();
        generateToken(res, user._id);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: { _id: user._id, name: user.name, email: user.email }
        });
    } catch (error) {
        console.error('API Register error:', error);
        res.status(500).json({ success: false, message: 'Server error during registration' });
    }
});

// Login User (Password)
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email }).lean();

        if (user && (await bcrypt.compare(password, user.password))) {
            generateToken(res, user._id);
            res.json({
                success: true,
                message: 'Login successful',
                user: { _id: user._id, name: user.name, email: user.email }
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('API Login error:', error);
        res.status(500).json({ success: false, message: 'Server error during login' });
    }
});

// Send OTP
router.post('/send-otp', async (req, res) => {
    const { mobile } = req.body;
    if (!mobile) {
        return res.status(400).json({ success: false, message: 'Mobile number is required' });
    }

    try {
        const result = await sendFast2SMSOtp(mobile);
        res.json(result);
    } catch (error) {
        console.error('API Send OTP error:', error);
        res.status(400).json({ success: false, message: error.message });
    }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
        return res.status(400).json({ success: false, message: 'Mobile number and OTP are required' });
    }

    try {
        const { mobile: cleanMobile } = await verifyFast2SMSOtp(mobile, otp);

        const user = await User.findOne({ mobile: cleanMobile }).lean();
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found. Please sign up first.' });
        }

        generateToken(res, user._id);
        res.json({
            success: true,
            message: 'OTP verified successfully',
            user: { _id: user._id, name: user.name, email: user.email }
        });
    } catch (error) {
        console.error('OTP verification error in authRoutes:', error);
        res.status(400).json({ success: false, message: error.message || 'OTP verification failed' });
    }
});

export default router;
