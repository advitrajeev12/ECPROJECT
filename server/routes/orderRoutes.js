import express from 'express';
import Order from '../models/Order.js';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { sendOrderReceiptEmail } from '../utils/emailService.js';
const router = express.Router();

import { protect } from '../middleware/authMiddleware.js';

// ─── Razorpay Instance (lazy — env vars not available at import time) ──────────
let _razorpay = null;
function getRazorpay() {
    if (!_razorpay) {
        _razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
    }
    return _razorpay;
}

// @desc    Create new order (COD)
// @route   POST /api/orders
// @access  Private
router.post('/', protect, async (req, res) => {
    const {
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
    } = req.body;

    if (orderItems && orderItems.length === 0) {
        return res.status(400).json({ success: false, message: 'No order items' });
    }

    try {
        const order = new Order({
            user: req.user._id,
            orderItems,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
        });

        const createdOrder = await order.save();
        res.status(201).json({ success: true, order: createdOrder });
    } catch (error) {
        console.error('Create Order Error:', error);
        res.status(500).json({ success: false, message: 'Server error creating order' });
    }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
router.get('/myorders', protect, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json({ success: true, orders });
    } catch (error) {
        console.error('Fetch Orders Error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching orders' });
    }
});

// @desc    Create Razorpay order and save pending DB order
// @route   POST /api/orders/razorpay/create-order
// @access  Private
router.post('/razorpay/create-order', protect, async (req, res) => {
    const { orderItems, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body;

    if (orderItems && orderItems.length === 0) {
        return res.status(400).json({ success: false, message: 'No order items' });
    }

    try {
        // 1. Persist an un-paid order to DB first
        const order = new Order({
            user: req.user._id,
            orderItems,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            isPaid: false,
        });
        const savedOrder = await order.save();

        // 2. Create a Razorpay order (amount in paise)
        const razorpayOrder = await getRazorpay().orders.create({
            amount: Math.round(totalPrice * 100), // paise
            currency: 'INR',
            receipt: savedOrder._id.toString(),
            notes: {
                dbOrderId: savedOrder._id.toString(),
                userId: req.user._id.toString(),
            },
        });

        console.log('[Razorpay] Order created:', razorpayOrder.id);

        return res.status(201).json({
            success: true,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            keyId: process.env.RAZORPAY_KEY_ID,
            dbOrderId: savedOrder._id.toString(),
        });

    } catch (error) {
        console.error('[Razorpay] Create Order Error:', error?.error || error.message);
        res.status(500).json({ success: false, message: error.message || 'Server error creating Razorpay order' });
    }
});

// @desc    Verify Razorpay payment signature and mark order as paid
// @route   POST /api/orders/razorpay/verify-payment
// @access  Private
router.post('/razorpay/verify-payment', protect, async (req, res) => {
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        dbOrderId,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !dbOrderId) {
        return res.status(400).json({ success: false, message: 'Missing payment verification fields' });
    }

    try {
        // Verify HMAC-SHA256 signature
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            console.warn('[Razorpay] Signature mismatch — payment verification failed');
            return res.status(400).json({ success: false, message: 'Payment verification failed — invalid signature' });
        }

        // Signature is valid — mark order as paid
        const order = await Order.findById(dbOrderId).populate('user', 'name email');
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        if (!order.isPaid) {
            order.isPaid = true;
            order.paidAt = Date.now();
            order.paymentResult = {
                id: razorpay_payment_id,
                status: 'PAYMENT_SUCCESS',
                update_time: Date.now().toString(),
                razorpay_order_id,
            };
            await order.save();

            // Fire-and-forget email receipt
            if (order.user && order.user.email) {
                sendOrderReceiptEmail(order.user.email, order.user.name, order)
                    .catch(err => console.error('[Email] Receipt error:', err));
            }
        }

        console.log('[Razorpay] Payment verified for order:', dbOrderId);
        return res.json({ success: true, orderId: order._id });

    } catch (error) {
        console.error('[Razorpay] Verify Payment Error:', error.message);
        res.status(500).json({ success: false, message: 'Server error verifying payment' });
    }
});

export default router;
