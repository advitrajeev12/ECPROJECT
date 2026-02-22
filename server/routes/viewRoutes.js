import express from 'express';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Middleware to protect user routes
const protect = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/user/login');
    }
};

// Login Page
router.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/user/dashboard');
    }
    res.render('user/login', { error: null });
});

// Login Action
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email }).lean();
        if (user && (await bcrypt.compare(password, user.password))) {
            req.session.user = user;
            const protocol = req.headers['x-forwarded-proto'] || req.protocol;
            let host = req.headers['x-forwarded-host'] || req.get('host');
            // Ensure we redirect to the Next.js frontend on port 3000
            if (host.includes('5001')) {
                host = host.replace('5001', '3000');
            } else if (!host.includes(':')) {
                host = host + ':3000';
            }
            res.redirect(`${protocol}://${host}/`);
        } else {
            res.render('user/login', { error: 'Invalid credentials' });
        }
    } catch (error) {
        res.render('user/login', { error: 'An error occurred' });
    }
});

// Signup Page
router.get('/signup', (req, res) => {
    if (req.session.user) {
        return res.redirect('/user/dashboard');
    }
    res.render('user/signup', { error: null });
});

// Signup Action
router.post('/signup', async (req, res) => {
    const { name, email, password, mobile } = req.body;
    console.log('Signup Attempt:', { name, email, mobile }); // Debug log

    try {
        if (!name || !email || !password || !mobile) {
            return res.render('user/signup', { error: 'All fields are required' });
        }

        const existingUser = await User.findOne({ email }).lean();
        if (existingUser) {
            console.log('Signup failed: Email already exists', email);
            return res.render('user/signup', { error: 'Email already exists' });
        }

        const existingMobile = await User.findOne({ mobile }).lean();
        if (existingMobile) {
            return res.render('user/signup', { error: 'Mobile number already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            name,
            email,
            password: hashedPassword,
            mobile,
            role: 'user'
        });
        await user.save();
        console.log('Signup Success:', email);
        res.redirect('/user/login');
    } catch (error) {
        console.error('Signup Error:', error);
        res.render('user/signup', { error: error.message || 'An error occurred during signup' });
    }
});

// Dashboard
router.get('/dashboard', protect, (req, res) => {
    res.render('user/dashboard', { user: req.session.user });
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        const protocol = req.headers['x-forwarded-proto'] || req.protocol;
        const host = req.headers['x-forwarded-host'] || req.get('host');
        res.redirect(`${protocol}://${host}/`);
    });
});

export default router;
