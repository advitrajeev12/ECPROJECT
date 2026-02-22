import express from 'express';
import Admin from '../models/Admin.js';
import bcrypt from 'bcryptjs';
import { protect } from '../middleware/adminAuth.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Multer Config
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename(req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    },
});

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

// Login Page
router.get('/login', (req, res) => {
    if (req.session.admin) {
        return res.redirect('/admin/dashboard');
    }
    res.render('admin/login', { error: null });
});

// Login Action
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const admin = await Admin.findOne({ email }).lean();
        if (admin && (await bcrypt.compare(password, admin.password))) {
            req.session.admin = admin;
            res.redirect('/admin/dashboard');
        } else {
            console.log('Admin login failed: Invalid credentials for', email);
            res.render('admin/login', { error: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Admin login error:', error);
        res.render('admin/login', { error: 'An error occurred' });
    }
});

// Signup Page
router.get('/signup', (req, res) => {
    if (req.session.admin) {
        return res.redirect('/admin/dashboard');
    }
    res.render('admin/signup', { error: null });
});

// Signup Action
router.post('/signup', async (req, res) => {
    const { email, password } = req.body;
    try {
        const existingAdmin = await Admin.findOne({ email }).lean();
        if (existingAdmin) {
            return res.render('admin/signup', { error: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const admin = new Admin({
            email,
            password: hashedPassword
        });
        await admin.save();
        res.redirect('/admin/login');
    } catch (error) {
        res.render('admin/signup', { error: 'An error occurred during signup' });
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
        // Dynamically import User if it wasn't at top level to avoid import order issues, or just use it. Actually, top level is better.
        // Let's just require it or import it. Since this is type: module, dynamic import works well inside the route if it's not at top level.
        const UserModule = await import('../models/User.js');
        const User = UserModule.default || UserModule;
        const userCount = await User.countDocuments();

        const OrderModule = await import('../models/Order.js');
        const OrderModel = OrderModule.default || OrderModule;

        const orders = await OrderModel.find({});
        const orderCount = orders.length;
        const totalSales = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

        res.render('admin/dashboard', {
            admin: req.session.admin,
            productCount,
            userCount,
            orderCount,
            totalSales
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.render('admin/dashboard', {
            admin: req.session.admin,
            productCount: 0, userCount: 0, orderCount: 0, totalSales: 0
        });
    }
});

// Product Routes
import Product from '../models/Product.js';

// List Products
router.get('/products', protect, async (req, res) => {
    try {
        const products = await Product.find({}).lean();
        res.render('admin/products', { products, path: '/products', admin: req.session.admin });
    } catch (error) {
        res.status(500).send('Server Error');
    }
});

// Add Product Form
router.get('/products/add', protect, (req, res) => {
    res.render('admin/add_product', {
        path: '/products',
        admin: req.session.admin,
        success: req.query.success === 'true'
    });
});

// Add Product Action
router.post('/products/add', protect, upload.single('image'), async (req, res) => {
    const { name, price, description, category, countInStock } = req.body;
    let image = req.body.image; // Fallback if url provided manually

    if (req.file) {
        image = `/uploads/${req.file.filename}`;
    }

    try {
        const product = new Product({
            name,
            price,
            description,
            image,
            images: [image],
            category,
            countInStock
        });
        await product.save();
        res.redirect('/admin/products/add?success=true');
    } catch (error) {
        res.status(500).send('Error creating product');
    }
});

// Edit Product Form
router.get('/products/edit/:id', protect, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).lean();
        if (product) {
            res.render('admin/edit_product', { product, path: '/products', admin: req.session.admin });
        } else {
            res.redirect('/admin/products');
        }
    } catch (error) {
        res.redirect('/admin/products');
    }
});

// Edit Product Action
router.post('/products/edit/:id', protect, upload.single('image'), async (req, res) => {
    const { name, description, price, category, countInStock } = req.body;
    let image = req.body.image; // Fallback if url provided manually

    if (req.file) {
        image = `/uploads/${req.file.filename}`;
    }

    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            product.name = name;
            product.description = description;
            product.price = price;
            product.category = category;
            if (image) {
                product.image = image;
                if (!product.images.includes(image)) {
                    product.images.push(image);
                }
            }
            product.countInStock = countInStock;
            await product.save();
            res.redirect('/admin/products');
        } else {
            res.status(404).send('Product not found');
        }
    } catch (error) {
        res.status(500).send('Error updating product');
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

// Delete Product
router.get('/products/delete/:id', protect, async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.redirect('/admin/products');
    } catch (error) {
        res.status(500).send('Error deleting product');
    }
});

// Orders Route
import Order from '../models/Order.js';

router.get('/orders', protect, async (req, res) => {
    try {
        const orders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 }).lean();
        res.render('admin/orders', { path: '/orders', admin: req.session.admin, orders });
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

// Users Route (Placeholder)
router.get('/users', protect, (req, res) => {
    res.render('admin/users', { path: '/users', admin: req.session.admin });
});

export default router;
