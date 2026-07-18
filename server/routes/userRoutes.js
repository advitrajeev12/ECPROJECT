import express from 'express';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { protect } from '../middleware/authMiddleware.js';
import { verifyMsg91Token } from '../utils/msg91Service.js';
import { generateEmailOtp, sendEmailOtp } from '../utils/emailService.js';

const router = express.Router();

// ── JWT cookie helper ──────────────────────────────────────────────────────────
const generateToken = (res, userId) => {
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
};

// ─────────────────────────────────────────────────────────────────────────────
// AUTH ROUTES
// ─────────────────────────────────────────────────────────────────────────────

// Check Auth Status
router.get('/check-auth', protect, (req, res) => {
    res.status(200).json({ user: req.user, isAuthenticated: true });
});

// DEBUG: List all users
router.get('/', async (req, res) => {
    try {
        const users = await User.find({}).lean();
        res.json({ success: true, count: users.length, users });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// VERIFY WIDGET OTP + LOGIN
// POST /api/users/verify-msg91-otp
// Body: { accessToken }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/verify-msg91-otp', async (req, res) => {
    const { accessToken } = req.body;

    if (!accessToken) {
        return res.status(400).json({
            success: false,
            message: 'MSG91 Access Token is required'
        });
    }

    try {
        // Verify Access Token with MSG91
        const { mobile } = await verifyMsg91Token(accessToken);

        // Find user in DB
        const user = await User.findOne({ mobile }).lean();
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No account found for this number. Please sign up first.'
            });
        }

        generateToken(res, user._id);
        const userResponse = { ...user };
        delete userResponse.password;

        console.log(`OTP login success for mobile: ${mobile}`);
        res.json({ success: true, user: userResponse, message: 'Login successful' });

    } catch (error) {
        console.error('OTP login error:', error.message);
        res.status(400).json({ success: false, message: error.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// PASSWORD LOGIN
// POST /api/users/login
// Body: { email, password }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    console.log('Password login attempt:', email);
    try {
        const user = await User.findOne({
            $or: [{ email }, { mobile: email }]
        }).lean();

        if (user && (await bcrypt.compare(password, user.password))) {
            generateToken(res, user._id);
            const userResponse = { ...user };
            delete userResponse.password;
            res.status(200).json({ success: true, user: userResponse, message: 'Login successful' });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'An error occurred during login' });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// SIGNUP — with OTP verification
// POST /api/users/signup
// Body: { name, email, password, mobile, otp }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/signup', async (req, res) => {
    console.log('>>> API HIT: /api/users/signup');
    const { name, email, password, mobile, role, msg91AccessToken } = req.body;

    if (!msg91AccessToken) {
        return res.status(400).json({
            success: false,
            message: 'OTP verification is required.'
        });
    }

    try {
        // 1. Verify Access Token with MSG91 Widget API
        const verification = await verifyMsg91Token(msg91AccessToken);
        const finalMobile = verification.mobile;

        // 2. Check for duplicates
        const existingEmail = await User.findOne({ email }).lean();
        if (existingEmail) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }

        const existingMobile = await User.findOne({ mobile: finalMobile }).lean();
        if (existingMobile) {
            return res.status(400).json({ success: false, message: 'Mobile number already registered' });
        }

        // 3. Create user
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            name,
            email,
            password: hashedPassword,
            mobile: finalMobile,
            role: role || 'user',
            isMobileVerified: true
        });
        await user.save();

        console.log('Signup success:', email);
        const userObj = user.toObject();
        delete userObj.password;

        res.status(201).json({
            success: true,
            user: userObj,
            message: 'Account created successfully! Please login.'
        });
    } catch (error) {
        console.error('Signup error:', error.message);
        res.status(400).json({ success: false, message: error.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// LOGOUT
// ─────────────────────────────────────────────────────────────────────────────
router.get('/logout', (req, res) => {
    res.cookie('jwt', '', { httpOnly: true, expires: new Date(0) });
    res.status(200).json({ success: true, message: 'Logged out successfully' });
});

// ─────────────────────────────────────────────────────────────────────────────
// USER PROFILE & ADDRESSES
// ─────────────────────────────────────────────────────────────────────────────

// Update Profile
router.put('/profile', protect, async (req, res) => {
    const { name, mobile, email } = req.body;

    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        if (name)   user.name   = name;
        if (mobile) user.mobile = mobile;

        if (email && email.toLowerCase() !== user.email.toLowerCase()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ success: false, message: 'Invalid email address format' });
            }
            const existing = await User.findOne({ email: email.toLowerCase(), _id: { $ne: user._id } }).lean();
            if (existing) {
                return res.status(409).json({ success: false, message: 'Email already in use' });
            }
            user.email = email.toLowerCase();
            user.isEmailVerified = false;
            user.emailVerificationToken = null;
            user.emailVerificationExpires = null;
        }

        await user.save();
        res.json({ success: true, message: 'Profile updated successfully', user });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ success: false, message: 'Failed to update profile' });
    }
});

// Add Address
router.post('/addresses', protect, async (req, res) => {
    const { street, city, state, zipCode, country, isDefault } = req.body;

    if (!street || !city || !state || !zipCode || !country) {
        return res.status(400).json({ success: false, message: 'All address fields are required' });
    }

    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const isFirst = user.addresses.length === 0;
        const newAddress = { street, city, state, zipCode, country, isDefault: isFirst || isDefault };

        if (newAddress.isDefault && !isFirst) {
            user.addresses.forEach(addr => addr.isDefault = false);
        }

        user.addresses.push(newAddress);
        await user.save();
        res.status(201).json({ success: true, message: 'Address added successfully', user });
    } catch (error) {
        console.error('Add address error:', error);
        res.status(500).json({ success: false, message: 'Failed to add address' });
    }
});

// Delete Address
router.delete('/addresses/:id', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        user.addresses = user.addresses.filter(addr => addr._id.toString() !== req.params.id);

        if (user.addresses.length > 0 && !user.addresses.some(a => a.isDefault)) {
            user.addresses[0].isDefault = true;
        }

        await user.save();
        res.json({ success: true, message: 'Address removed successfully', user });
    } catch (error) {
        console.error('Delete address error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete address' });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL OTP VERIFICATION (for verifying email after signup)
// ─────────────────────────────────────────────────────────────────────────────

// Send Email OTP
router.post('/send-email-otp', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        if (user.isEmailVerified) {
            return res.status(400).json({ success: false, message: 'Email is already verified' });
        }

        if (
            user.emailVerificationToken &&
            user.emailVerificationExpires &&
            user.emailVerificationExpires > new Date(Date.now() + 9.5 * 60 * 1000)
        ) {
            return res.status(429).json({
                success: false,
                message: 'OTP already sent. Please check your inbox or wait 30 seconds.'
            });
        }

        const otp = await generateEmailOtp(user);
        const sent = await sendEmailOtp(user.email, user.name, otp);

        if (!sent) {
            return res.status(503).json({
                success: false,
                message: 'Email service not configured. Add EMAIL_USER and EMAIL_PASS to .env'
            });
        }

        await user.save();
        res.json({ success: true, message: `OTP sent to ${user.email}` });
    } catch (error) {
        console.error('Send email OTP error:', error);
        res.status(500).json({ success: false, message: 'Failed to send OTP' });
    }
});

// Verify Email OTP
router.post('/verify-email-otp', protect, async (req, res) => {
    const { otp } = req.body;
    if (!otp) return res.status(400).json({ success: false, message: 'OTP is required' });

    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        if (user.isEmailVerified) {
            return res.status(400).json({ success: false, message: 'Email is already verified' });
        }

        if (
            !user.emailVerificationToken ||
            !user.emailVerificationExpires ||
            user.emailVerificationExpires < new Date()
        ) {
            return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
        }

        const isMatch = await bcrypt.compare(otp.toString().trim(), user.emailVerificationToken);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid OTP. Please try again.' });
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = null;
        user.emailVerificationExpires = null;
        await user.save();

        res.json({ success: true, message: 'Email verified successfully!', user });
    } catch (error) {
        console.error('Verify email OTP error:', error);
        res.status(500).json({ success: false, message: 'Verification failed' });
    }
});

export default router;
