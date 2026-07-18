import express from 'express';
import Admin from '../models/Admin.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { protect } from '../middleware/adminAuth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Multer Config
const storage = multer.memoryStorage();

function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Images only!');
    }
}

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

// Root Admin Redirect
router.get('/', (req, res) => {
    res.redirect('/admin/login');
});

// Login Page
router.get('/login', async (req, res) => {
    if (req.session.admin) {
        return res.redirect('/admin/dashboard');
    }
    const adminExists = await Admin.findOne({}).lean();
    res.render('admin/login', { error: null, adminExists: !!adminExists, title: 'Login' });
});

// OTP Store for Admins (in-memory mapping: email -> { otp, expiresAt })
const adminOtpStore = new Map();

// Generate Random OTP Function
function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Login Action (Step 1 -> Sends OTP)
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const admin = await Admin.findOne({ email }).lean();
        if (admin && (await bcrypt.compare(password, admin.password))) {
            const otp = generateOtp();
            const expiresAt = Date.now() + 5 * 60 * 1000;
            adminOtpStore.set(email, { otp, expiresAt });

            req.session.pendingAdminLogin = { email }; // Save pending status
            req.session.save((err) => {
                if (err) console.error('Session error storing pending login:', err);
                res.redirect('/admin/verify-login-otp');
            });
        } else {
            const adminExists = await Admin.findOne({}).lean();
            res.render('admin/login', { error: 'Invalid credentials', adminExists: !!adminExists, title: 'Login' });
        }
    } catch (error) {
        console.error('Admin login error:', error);
        const adminExists = await Admin.findOne({}).lean();
        res.render('admin/login', { error: 'An error occurred', adminExists: !!adminExists });
    }
});

// Verify Login OTP Form (Step 2)
router.get('/verify-login-otp', (req, res) => {
    if (!req.session.pendingAdminLogin) {
        return res.redirect('/admin/login');
    }
    const email = req.session.pendingAdminLogin.email;
    const storedData = adminOtpStore.get(email);
    res.render('admin/verify_otp', {
        error: null,
        email,
        actionUrl: '/admin/verify-login-otp',
        dev_otp: storedData ? storedData.otp : null
    });
});

// Verify Login OTP Action (Step 2)
router.post('/verify-login-otp', async (req, res) => {
    if (!req.session.pendingAdminLogin) return res.redirect('/admin/login');

    const email = req.session.pendingAdminLogin.email;
    const { otp } = req.body;
    const storedData = adminOtpStore.get(email);

    if (!storedData || Date.now() > storedData.expiresAt || storedData.otp !== otp) {
        return res.render('admin/verify_otp', {
            error: 'Invalid or expired OTP',
            email,
            actionUrl: '/admin/verify-login-otp',
            dev_otp: storedData ? storedData.otp : null
        });
    }

    try {
        const admin = await Admin.findOne({ email }).lean();
        adminOtpStore.delete(email); // Clear OTP

        req.session.admin = admin; // Promote to active admin
        delete req.session.pendingAdminLogin; // Clear pending status

        req.session.save((err) => {
            if (err) console.error('Session save error:', err);
            res.redirect('/admin/dashboard');
        });
    } catch (error) {
        res.render('admin/verify_otp', { error: 'Error during verification', email, actionUrl: '/admin/verify-login-otp', dev_otp: null });
    }
});


// Signup Page
router.get('/signup', async (req, res) => {
    if (req.session.admin) {
        return res.redirect('/admin/dashboard');
    }
    const adminExists = await Admin.findOne({}).lean();
    if (adminExists) {
        return res.redirect('/admin/login');
    }
    res.render('admin/signup', { error: null });
});

// Signup Action (Step 1 -> Sends OTP)
router.post('/signup', async (req, res) => {
    const { email, password } = req.body;
    try {
        const existingAnyAdmin = await Admin.findOne({}).lean();
        if (existingAnyAdmin) {
            return res.redirect('/admin/login'); // Enforce single admin only
        }

        const existingAdmin = await Admin.findOne({ email }).lean();
        if (existingAdmin) {
            return res.render('admin/signup', { error: 'Email already exists' });
        }

        const otp = generateOtp();
        const expiresAt = Date.now() + 5 * 60 * 1000;
        adminOtpStore.set(email, { otp, expiresAt });

        req.session.pendingAdminSignup = { email, password };
        req.session.save((err) => {
            if (err) console.error('Session error storing pending signup:', err);
            res.redirect('/admin/verify-signup-otp');
        });
    } catch (error) {
        res.render('admin/signup', { error: 'An error occurred during signup' });
    }
});

// Verify Signup OTP Form (Step 2)
router.get('/verify-signup-otp', (req, res) => {
    if (!req.session.pendingAdminSignup) {
        return res.redirect('/admin/signup');
    }
    const email = req.session.pendingAdminSignup.email;
    const storedData = adminOtpStore.get(email);
    res.render('admin/verify_otp', {
        error: null,
        email,
        actionUrl: '/admin/verify-signup-otp',
        dev_otp: storedData ? storedData.otp : null
    });
});

// Verify Signup OTP Action (Step 2)
router.post('/verify-signup-otp', async (req, res) => {
    if (!req.session.pendingAdminSignup) return res.redirect('/admin/signup');

    const { email, password } = req.session.pendingAdminSignup;
    const { otp } = req.body;
    const storedData = adminOtpStore.get(email);

    if (!storedData || Date.now() > storedData.expiresAt || storedData.otp !== otp) {
        return res.render('admin/verify_otp', {
            error: 'Invalid or expired OTP',
            email,
            actionUrl: '/admin/verify-signup-otp',
            dev_otp: storedData ? storedData.otp : null
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const admin = new Admin({ email, password: hashedPassword });
        await admin.save();

        adminOtpStore.delete(email);
        delete req.session.pendingAdminSignup;

        req.session.save((err) => {
            if (err) console.error('Session error clearing pending signup:', err);
            res.redirect('/admin/login');
        });
    } catch (error) {
        res.render('admin/verify_otp', { error: 'Error making account', email, actionUrl: '/admin/verify-signup-otp', dev_otp: null });
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        // Redirect back to the frontend's home page
        const protocol = req.headers['x-forwarded-proto'] || req.protocol;
        const host = req.headers['x-forwarded-host'] || req.get('host');
        res.redirect(`${protocol}://${host}/`);
    });
});

// Dashboard
router.get('/dashboard', protect, async (req, res) => {
    try {
        const productCount = await Product.countDocuments();
        const userCount = await User.countDocuments();
        const orders = await Order.find({});
        const orderCount = orders.length;
        const totalSales = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

        res.render('admin/dashboard', {
            admin: req.session.admin,
            productCount,
            userCount,
            orderCount,
            totalSales,
            path: '/dashboard',
            title: 'Dashboard'
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.render('admin/dashboard', {
            admin: req.session.admin,
            productCount: 0, userCount: 0, orderCount: 0, totalSales: 0,
            path: '/dashboard',
            title: 'Dashboard'
        });
    }
});

// List Products
router.get('/products', protect, async (req, res) => {
    try {
        const products = await Product.find({}).lean();
        res.render('admin/products', { products, path: '/products', admin: req.session.admin, title: 'Manage Products' });
    } catch (error) {
        res.status(500).send('Server Error');
    }
});

// Add Product Form
router.get('/products/add', protect, (req, res) => {
    res.render('admin/add_product', {
        path: '/products',
        admin: req.session.admin,
        success: req.query.success === 'true',
        title: 'Add Product'
    });
});

// Add Product Action
router.post('/products/add', protect, upload.array('images', 10), async (req, res) => {
const { name, price, originalPrice, discount, description, category, subCategory, countInStock,
            material, dimensions, components, ecoFeatures, countryOfOrigin } = req.body;
    let finalImages = [];

    // Handle artisan image URL
    let artisanImage = req.body.artisanImageUrl ? req.body.artisanImageUrl.trim() : '';

    if (req.body.imageUrls) {
        const urls = req.body.imageUrls.split('\n').map(u => u.trim()).filter(Boolean);
        for (let url of urls) {
            const driveFileRegex = /(?:https?:\/\/)?(?:www\.)?drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
            const driveUcRegex = /(?:https?:\/\/)?(?:www\.)?drive\.google\.com\/uc\?(?:.*&)?id=([a-zA-Z0-9_-]+)/;
            
            let match = url.match(driveFileRegex);
            if (!match) {
                match = url.match(driveUcRegex);
            }
            if (match && match[1]) {
                finalImages.push(`https://lh3.googleusercontent.com/d/${match[1]}`);
            } else {
                finalImages.push(url);
            }
        }
    }

    if (req.files && req.files.length > 0) {
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        for (let file of req.files) {
            const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
            const filename = `image-${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
            const uploadPath = path.join(uploadDir, filename);
            fs.writeFileSync(uploadPath, file.buffer);
            finalImages.push(`/uploads/${filename}`);
        }
    }

    let image = finalImages.length > 0 ? finalImages[0] : '';

    try {
        const product = new Product({
            name, price, 
            originalPrice: originalPrice || 0,
            discount: discount || '',
            description, image,
            images: finalImages,
            category, subCategory, countInStock,
            material: material || '',
            dimensions: dimensions || '',
            components: components || '',
            ecoFeatures: ecoFeatures || '',
            countryOfOrigin: countryOfOrigin || 'India',
            artisanImage: artisanImage || '',
        });
        await product.save();
        res.redirect('/admin/products/add?success=true');
    } catch (error) {
        console.error("Product Add Error:", error);
        res.status(500).send(`Error creating product: ${error.message}`);
    }
});

// Edit Product Form
router.get('/products/edit/:id', protect, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).lean();
        if (product) {
            res.render('admin/edit_product', { product, path: '/products', admin: req.session.admin, title: 'Edit Product' });
        } else {
            res.redirect('/admin/products');
        }
    } catch (error) {
        res.redirect('/admin/products');
    }
});

// Edit Product Action
router.post('/products/edit/:id', protect, upload.array('images', 10), async (req, res) => {
    const { name, description, price, originalPrice, discount, category, subCategory, countInStock, clearGallery,
            material, dimensions, components, ecoFeatures, countryOfOrigin } = req.body;
    
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).send('Product not found');
        }

        let finalImages = clearGallery === 'true' ? [] : [...product.images];

        if (req.body.imageUrls) {
            const urls = req.body.imageUrls.split('\n').map(u => u.trim()).filter(Boolean);
            for (let url of urls) {
                const driveFileRegex = /(?:https?:\/\/)?(?:www\.)?drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
                const driveUcRegex = /(?:https?:\/\/)?(?:www\.)?drive\.google\.com\/uc\?(?:.*&)?id=([a-zA-Z0-9_-]+)/;
                
                let match = url.match(driveFileRegex);
                if (!match) {
                    match = url.match(driveUcRegex);
                }
                if (match && match[1]) {
                    finalImages.push(`https://lh3.googleusercontent.com/d/${match[1]}`);
                } else {
                    finalImages.push(url);
                }
            }
        }

        if (req.files && req.files.length > 0) {
            const uploadDir = path.join(process.cwd(), 'public', 'uploads');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            for (let file of req.files) {
                const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
                const filename = `image-${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
                const uploadPath = path.join(uploadDir, filename);
                fs.writeFileSync(uploadPath, file.buffer);
                finalImages.push(`/uploads/${filename}`);
            }
        }

        product.name = name;
        product.description = description;
        product.price = price;
        product.originalPrice = originalPrice || 0;
        product.discount = discount || '';
        product.category = category;
        product.subCategory = subCategory;
        product.countInStock = countInStock;
        product.material = material || '';
        product.dimensions = dimensions || '';
        product.components = components || '';
        product.ecoFeatures = ecoFeatures || '';
        product.countryOfOrigin = countryOfOrigin || 'India';
        if (req.body.artisanImageUrl && req.body.artisanImageUrl.trim()) {
            product.artisanImage = req.body.artisanImageUrl.trim();
        }

        if (finalImages.length > 0) {
            product.image = finalImages[0];
            product.images = finalImages;
        }

        await product.save();
        res.redirect('/admin/products');
    } catch (error) {
        console.error("Product Edit Error:", error);
        res.status(500).send(`Error updating product: ${error.message}`);
    }
});

// Delete Product
router.get('/products/delete/:id', protect, async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.redirect('/admin/products');
    } catch (error) {
        res.status(500).send('Error deleting product');
    }
});

router.get('/orders', protect, async (req, res) => {
    try {
        const orders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 }).lean();
        res.render('admin/orders', { path: '/orders', admin: req.session.admin, orders, title: 'Manage Orders' });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).send('Server Error');
    }
});

// Update Order Status
router.post('/orders/:id/status', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (order) {
            order.status = req.body.status;
            if (req.body.status === 'Delivered' && !order.isDelivered) {
                order.isDelivered = true;
                order.deliveredAt = Date.now();
            }
            await order.save();
            res.redirect('/admin/orders');
        } else {
            res.status(404).send('Order not found');
        }
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).send('Error updating order');
    }
});

// Users Route
router.get('/users', protect, async (req, res) => {
    try {
        const users = await User.find({}).sort({ createdAt: -1 }).lean();
        res.render('admin/users', { path: '/users', admin: req.session.admin, users, title: 'Manage Users' });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).send('Server Error');
    }
});

export default router;
