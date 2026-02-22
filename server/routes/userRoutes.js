import express from 'express';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Middleware to protect user routes (if needed later)
// const protect = (req, res, next) => {
//     if (req.session.user) {
//         next();
//     } else {
//         res.redirect('/user/login');
//     }
// };

// Check Auth Status
router.get('/check-auth', (req, res) => {
    if (req.session.user) {
        res.status(200).json({ user: req.session.user, isAuthenticated: true });
    } else {
        res.status(401).json({ isAuthenticated: false, user: null });
    }
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

// Login Action (Password)
router.post('/login', async (req, res) => {
    const { email, password } = req.body; // 'email' key here might contain mobile if sent from AuthContext that way, but better to genericize
    // Actually, let's assume the client sends 'identifier' or we treat 'email' as identifier
    const identifier = email;

    console.log('User Login attempt:', identifier);
    try {
        const user = await User.findOne({
            $or: [{ email: identifier }, { mobile: identifier }]
        }).lean();

        if (user && (await bcrypt.compare(password, user.password))) {
            req.session.user = user;
            console.log('User login success:', identifier);
            res.status(200).json({ success: true, user: user, message: 'Login successful' });
        } else {
            console.log('User login failed: Invalid credentials');
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('User login error:', error);
        res.status(500).json({ success: false, message: 'An error occurred during login' });
    }
});

// Send OTP
router.post('/send-otp', async (req, res) => {
    const { mobile } = req.body;
    console.log('Sending OTP to:', mobile);
    // Logic to generate and send OTP would go here
    // For now, checks if user exists? Or allows new users?
    // Let's assume for Login (not register), user must exist.
    try {
        const user = await User.findOne({ mobile }).lean();
        if (!user) {
            // For privacy, maybe don't reveal? But for now:
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        // Send OTP stub
        res.status(200).json({ success: true, message: 'OTP sent successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error sending OTP' });
    }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
    const { mobile, otp } = req.body;
    console.log('Verifying OTP for:', mobile);

    if (otp === '123456') { // Mock OTP
        try {
            const user = await User.findOne({ mobile }).lean();
            if (user) {
                req.session.user = user;
                return res.status(200).json({ success: true, user: user, message: 'OTP Verified' });
            }
            return res.status(404).json({ success: false, message: 'User not found' });
        } catch (error) {
            return res.status(500).json({ success: false, message: 'Error verifying OTP' });
        }
    }
    res.status(400).json({ success: false, message: 'Invalid OTP' });
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.status(200).json({ success: true, message: 'Logged out successfully' });
    });
});

// Signup Action
router.post('/signup', async (req, res) => {
    console.log('>>> API HIT: /api/users/signup'); // Debug log
    console.log('Headers:', JSON.stringify(req.headers));
    const { name, email, password, mobile, role } = req.body;
    console.log('User Signup attempt:', email, 'Role:', role);
    console.log('Signup Payload:', JSON.stringify(req.body, null, 2));

    try {
        const existingUser = await User.findOne({ email }).lean();
        if (existingUser) {
            console.log('User signup failed: Email exists', email);
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }

        const existingMobile = await User.findOne({ mobile }).lean();
        if (existingMobile) {
            console.log('User signup failed: Mobile exists', mobile);
            return res.status(400).json({ success: false, message: 'Mobile number already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            name,
            email,
            password: hashedPassword,
            mobile,
            role: role || 'user' // Allow setting role (admin or user)
        });
        await user.save();

        console.log('User signup success:', email);
        res.status(201).json({ success: true, user: user, message: 'Signup successful. Please login.' });
    } catch (error) {
        console.error('User signup error:', error);
        res.status(500).json({ success: false, message: `Signup Error: ${error.message}` });
    }
});

// --- User Dashboard Functionality ---

// Update Profile
router.put('/profile', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const { name, mobile } = req.body;

    try {
        const user = await User.findById(req.session.user._id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        if (name) user.name = name;
        if (mobile) user.mobile = mobile;

        await user.save();
        // Update session
        req.session.user = user.toObject();
        res.json({ success: true, message: 'Profile updated successfully', user: req.session.user });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ success: false, message: 'Failed to update profile' });
    }
});

// Add Address
router.post('/addresses', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const { street, city, state, zipCode, country, isDefault } = req.body;

    // Validate
    if (!street || !city || !state || !zipCode || !country) {
        return res.status(400).json({ success: false, message: 'All address fields are required' });
    }

    try {
        const user = await User.findById(req.session.user._id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        // If it's the first address, automatically make it default
        const isFirst = user.addresses.length === 0;
        const newAddress = { street, city, state, zipCode, country, isDefault: isFirst || isDefault };

        // If set as default, remove default from others
        if (newAddress.isDefault && !isFirst) {
            user.addresses.forEach(addr => addr.isDefault = false);
        }

        user.addresses.push(newAddress);
        await user.save();

        // Update session
        req.session.user = user.toObject();
        res.status(201).json({ success: true, message: 'Address added successfully', user: req.session.user });
    } catch (error) {
        console.error('Add address error:', error);
        res.status(500).json({ success: false, message: 'Failed to add address' });
    }
});

// Delete Address
router.delete('/addresses/:id', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    try {
        const user = await User.findById(req.session.user._id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        user.addresses = user.addresses.filter(addr => addr._id.toString() !== req.params.id);

        // Ensure at least one default remains if possible
        if (user.addresses.length > 0 && !user.addresses.some(a => a.isDefault)) {
            user.addresses[0].isDefault = true;
        }

        await user.save();

        req.session.user = user.toObject();
        res.json({ success: true, message: 'Address removed successfully', user: req.session.user });
    } catch (error) {
        console.error('Delete address error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete address' });
    }
});

export default router;
