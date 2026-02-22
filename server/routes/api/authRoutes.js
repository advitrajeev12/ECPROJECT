import express from 'express';
import User from '../../models/User.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Register User (JSON API)
router.post('/register', async (req, res) => {
    const { name, email, mobile, password } = req.body;
    console.log('API Register payload:', { name, email, mobile, password }); // Debug log

    try {
        const existingUser = await User.findOne({ email }).lean();
        if (existingUser) {
            console.log('API Register failed: User already exists');
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            name,
            email,
            password: hashedPassword,
            mobile
        });

        const savedUser = await user.save();
        console.log('API Register success, saved user:', savedUser);

        // Return success response
        res.status(201).json({
            message: 'User registered successfully',
            token: 'mock-jwt-token-replace-with-real-one',
            user: { id: user._id, name: user.name, email: user.email }
        });
    } catch (error) {
        console.error('API Register error:', error);
        res.status(500).json({ message: 'Server error during registration', error: error.message });
    }
});

// Login User (Password) (JSON API)
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log('API Login attempt:', email);
    try {
        const user = await User.findOne({ email }).lean();

        if (user && (await bcrypt.compare(password, user.password))) {
            // In a real app, generate a JWT token here
            console.log('API Login success:', email);
            res.json({
                message: 'Login successful',
                token: 'mock-jwt-token-replace-with-real-one',
                user: { id: user._id, name: user.name, email: user.email }
            });
        } else {
            console.log('API Login failed: Invalid credentials');
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('API Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// Send OTP (Stub)
router.post('/send-otp', async (req, res) => {
    const { mobile } = req.body;
    console.log(`API Sending OTP to ${mobile}`);
    // Simulate check if user exists with this mobile
    // const user = await User.findOne({ mobile });
    // if (!user) return res.status(404).json({ message: 'User not found' });

    // Simulate sending OTP
    res.json({ message: 'OTP sent successfully' });
});

// Verify OTP (Stub)
router.post('/verify-otp', async (req, res) => {
    const { mobile, otp } = req.body;
    console.log(`API Verifying OTP ${otp} for ${mobile}`);
    if (otp === '123456') { // Mock OTP
        // Find user by mobile and generate token
        // const user = await User.findOne({ mobile });
        res.json({
            message: 'OTP verified',
            token: 'mock-jwt-token-replace-with-real-one',
            // user: { id: user._id, name: user.name } 
        });
    } else {
        res.status(400).json({ message: 'Invalid OTP' });
    }
});

export default router;
