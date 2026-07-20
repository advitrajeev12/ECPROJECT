import express from 'express';
import Order from '../models/Order.js';
import crypto from 'crypto';
import axios from 'axios';
import { sendOrderReceiptEmail } from '../utils/emailService.js';
const router = express.Router();

import { protect } from '../middleware/authMiddleware.js';

// @desc    Create new order
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
        res.status(500).json({ success: false, message: 'Server error tracking order' });
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

// ─── Razorpay helpers ─────────────────────────────────────────────────────────

const getRazorpayCreds = () => ({
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
});

// True only when real (non-placeholder) test/live keys are present. Otherwise
// the gateway runs in SIMULATION mode so the app works with the fake .env.
const hasRazorpayCreds = () => {
    const { keyId, keySecret } = getRazorpayCreds();
    return (
        keyId && keySecret &&
        keyId !== 'rzp_test_xxxxxxxxxxxxxx' &&
        keySecret !== 'your_razorpay_key_secret_here'
    );
};

// Mark an order paid + fire the receipt email (idempotent).
const markOrderPaid = async (transactionId, paymentResult) => {
    const order = await Order.findById(transactionId).populate('user', 'name email');
    if (order && !order.isPaid) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = paymentResult;
        await order.save();

        if (order.user && order.user.email) {
            sendOrderReceiptEmail(order.user.email, order.user.name, order)
                .catch(err => console.error('[Email] Receipt error:', err));
        }
    }
    return order;
};

// @desc    Initiate Razorpay Payment
// @route   POST /api/orders/razorpay/pay
// @access  Private
router.post('/razorpay/pay', protect, async (req, res) => {
    const { orderItems, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body;

    if (orderItems && orderItems.length === 0) {
        return res.status(400).json({ success: false, message: 'No order items' });
    }

    try {
        // Create the un-paid order in our DB first — its _id is the receipt id.
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

        const createdOrder = await order.save();
        const amountPaise = Math.round(totalPrice * 100);

        // Simulation mode — no real gateway. Reuse the sim status redirect.
        if (!hasRazorpayCreds()) {
            console.log('[Razorpay] No credentials configured — using simulation mode');
            return res.json({
                success: true,
                simulated: true,
                orderId: createdOrder._id.toString(),
                amount: amountPaise,
                currency: 'INR',
                url: `/user/payment/status?transactionId=${createdOrder._id.toString()}&sim=1`,
            });
        }

        const { keyId, keySecret } = getRazorpayCreds();

        // Create a Razorpay order via the REST API (Basic auth = key_id:key_secret).
        const rpRes = await axios.post(
            'https://api.razorpay.com/v1/orders',
            {
                amount: amountPaise,
                currency: 'INR',
                receipt: createdOrder._id.toString(),
                notes: { userId: req.user._id.toString() },
            },
            {
                auth: { username: keyId, password: keySecret },
                headers: { 'Content-Type': 'application/json' },
            }
        );

        console.log('[Razorpay] Order created:', rpRes.data?.id, 'for', createdOrder._id.toString());

        // These feed the Razorpay Checkout modal opened on the client.
        return res.json({
            success: true,
            simulated: false,
            orderId: createdOrder._id.toString(),      // our order id (receipt)
            razorpayOrderId: rpRes.data.id,            // razorpay order id
            amount: rpRes.data.amount,
            currency: rpRes.data.currency,
            keyId,                                     // public key for the modal
        });

    } catch (error) {
        console.error('Razorpay Pay Error:', error?.response?.data || error.message);
        res.status(500).json({ success: false, message: error.message || 'Server error initiating payment' });
    }
});

// @desc    Verify Razorpay payment signature after the modal succeeds
// @route   POST /api/orders/razorpay/verify
// @access  Private
router.post('/razorpay/verify', protect, async (req, res) => {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ success: false, message: 'Missing payment verification fields' });
    }

    try {
        const { keySecret } = getRazorpayCreds();

        // Signature = HMAC_SHA256(razorpay_order_id + "|" + razorpay_payment_id, key_secret)
        const expectedSignature = crypto
            .createHmac('sha256', keySecret)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            console.warn('[Razorpay] Signature mismatch for order:', orderId);
            return res.status(400).json({ success: false, message: 'Payment signature verification failed' });
        }

        await markOrderPaid(orderId, {
            id: razorpay_payment_id,
            status: 'PAYMENT_SUCCESS',
            update_time: Date.now().toString(),
        });

        return res.json({ success: true, status: 'SUCCESS' });

    } catch (error) {
        console.error('[Razorpay] Verify error:', error?.response?.data || error.message);
        res.status(500).json({ success: false, message: 'Failed to verify payment' });
    }
});

// @desc    Frontend polls this on the payment-status page
// @route   GET /api/orders/razorpay/status/:transactionId
// @access  Private
router.get('/razorpay/status/:transactionId', protect, async (req, res) => {
    const { transactionId } = req.params;

    try {
        // Simulation mode — mark as paid without hitting Razorpay.
        if (req.query.sim === '1') {
            await markOrderPaid(transactionId, {
                id: transactionId,
                status: 'SIMULATED_SUCCESS',
                update_time: Date.now().toString(),
            });
            return res.json({ success: true, status: 'SUCCESS' });
        }

        // Real mode — the /verify step already marked the order paid, so we just
        // report the persisted state.
        const order = await Order.findById(transactionId).lean();
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        return res.json({
            success: order.isPaid === true,
            status: order.isPaid ? 'SUCCESS' : 'PENDING',
        });

    } catch (error) {
        console.error('[Razorpay] Status check error:', error?.response?.data || error.message);
        res.status(500).json({ success: false, message: 'Failed to verify payment' });
    }
});

// @desc    Razorpay server-to-server webhook (optional, for real deployments)
// @route   POST /api/orders/razorpay/webhook
// @access  Public (Razorpay servers)
router.post('/razorpay/webhook', async (req, res) => {
    try {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
        const signature = req.headers['x-razorpay-signature'];

        // Verify webhook authenticity when a secret is configured.
        if (webhookSecret && signature) {
            const expected = crypto
                .createHmac('sha256', webhookSecret)
                .update(JSON.stringify(req.body))
                .digest('hex');
            if (expected !== signature) {
                console.warn('[Razorpay Webhook] Signature mismatch — ignoring');
                return res.status(200).json({ success: false });
            }
        }

        const event = req.body?.event;
        if (event === 'payment.captured' || event === 'order.paid') {
            const payment = req.body?.payload?.payment?.entity;
            // `receipt` on the razorpay order maps back to our order _id.
            const receipt = req.body?.payload?.order?.entity?.receipt || payment?.notes?.receipt;
            if (receipt) {
                await markOrderPaid(receipt, {
                    id: payment?.id,
                    status: 'PAYMENT_SUCCESS',
                    update_time: Date.now().toString(),
                });
            }
        }

        return res.status(200).json({ success: true });

    } catch (error) {
        console.error('[Razorpay Webhook] Error:', error?.response?.data || error.message);
        return res.status(200).json({ success: false });
    }
});

export default router;
