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

// @desc    Initiate PhonePe Payment (Live)
// @route   POST /api/orders/phonepe/pay
// @access  Private
router.post('/phonepe/pay', protect, async (req, res) => {
    const { orderItems, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body;

    if (orderItems && orderItems.length === 0) {
        return res.status(400).json({ success: false, message: 'No order items' });
    }

    try {
        // Create actual un-paid order in DB
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

        const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID;
        const SALT_KEY = process.env.PHONEPE_SALT_KEY;
        const SALT_INDEX = process.env.PHONEPE_SALT_INDEX || '1';

        // Check if credentials are configured
        const hasCredentials = MERCHANT_ID && SALT_KEY &&
            MERCHANT_ID !== 'YOUR_PHONEPE_MERCHANT_ID' &&
            SALT_KEY !== 'YOUR_PHONEPE_SALT_KEY';

        // In development without credentials, use simulation mode
        if (!hasCredentials) {
            console.log('[PhonePe] No credentials configured — using simulation mode');
            return res.json({
                success: true,
                url: `/user/payment/status?transactionId=${createdOrder._id.toString()}&sim=1`,
                simulated: true,
            });
        }

        // Client URL (for user redirect after payment)
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
        // Backend URL (for PhonePe webhook — must be publicly reachable in production)
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:5001';

        const data = {
            merchantId: MERCHANT_ID,
            merchantTransactionId: createdOrder._id.toString(),
            merchantUserId: req.user._id.toString(),
            amount: Math.round(totalPrice * 100), // convert to paise
            redirectUrl: `${clientUrl}/user/payment/status?transactionId=${createdOrder._id.toString()}`,
            redirectMode: 'REDIRECT',
            // Webhook hits the backend server directly (not the Next.js proxy)
            callbackUrl: `${backendUrl}/api/orders/phonepe/webhook/${createdOrder._id.toString()}`,
            paymentInstrument: {
                type: 'PAY_PAGE',
            },
        };

        const payloadMain = Buffer.from(JSON.stringify(data)).toString('base64');
        const stringToHash = payloadMain + '/pg/v1/pay' + SALT_KEY;
        const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
        const checksum = sha256 + '###' + SALT_INDEX;

        console.log('[PhonePe] Initiating payment for transaction:', createdOrder._id);

        const phonePeRes = await axios.post(
            'https://api.phonepe.com/apis/hermes/pg/v1/pay',
            { request: payloadMain },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-VERIFY': checksum,
                    accept: 'application/json',
                },
            }
        );

        if (phonePeRes.data && phonePeRes.data.success) {
            return res.json({
                success: true,
                url: phonePeRes.data.data.instrumentResponse.redirectInfo.url,
            });
        } else {
            return res.status(400).json({ success: false, message: 'PhonePe Gateway Error' });
        }

    } catch (error) {
        console.error('PhonePe Pay Error:', error?.response?.data || error.message);
        res.status(500).json({ success: false, message: error.message || 'Server error initiating payment' });
    }
});

// ─── Helper: verify payment with PhonePe and update order ─────────────────────
async function verifyAndUpdateOrder(transactionId) {
    const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID;
    const SALT_KEY = process.env.PHONEPE_SALT_KEY;
    const SALT_INDEX = process.env.PHONEPE_SALT_INDEX || '1';

    const stringToHash = `/pg/v1/status/${MERCHANT_ID}/${transactionId}` + SALT_KEY;
    const checksum = crypto.createHash('sha256').update(stringToHash).digest('hex') + '###' + SALT_INDEX;

    const response = await axios.get(
        `https://api.phonepe.com/apis/hermes/pg/v1/status/${MERCHANT_ID}/${transactionId}`,
        {
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                'X-VERIFY': checksum,
                'X-MERCHANT-ID': MERCHANT_ID,
            },
        }
    );

    if (response.data.code === 'PAYMENT_SUCCESS') {
        const order = await Order.findById(transactionId).populate('user', 'name email');
        if (order && !order.isPaid) {
            order.isPaid = true;
            order.paidAt = Date.now();
            order.paymentResult = {
                id: response.data.data?.transactionId,
                status: response.data.code,
                update_time: Date.now().toString(),
            };
            await order.save();

            // Fire-and-forget email receipt
            if (order.user && order.user.email) {
                sendOrderReceiptEmail(order.user.email, order.user.name, order)
                    .catch(err => console.error('[Email] Receipt error:', err));
            }
        }
        return { success: true, status: 'SUCCESS' };
    }

    return { success: false, status: response.data.code || 'FAILED' };
}

// @desc    Frontend polls this to check payment status after redirect
// @route   GET /api/orders/phonepe/status/:transactionId
// @access  Private
router.get('/phonepe/status/:transactionId', protect, async (req, res) => {
    const { transactionId } = req.params;

    try {
        // Simulation mode — mark as paid without hitting PhonePe
        if (req.query.sim === '1') {
            const order = await Order.findById(transactionId);
            if (order && !order.isPaid) {
                order.isPaid = true;
                order.paidAt = Date.now();
                order.paymentResult = { id: transactionId, status: 'SIMULATED_SUCCESS', update_time: Date.now().toString() };
                await order.save();
            }
            return res.json({ success: true, status: 'SUCCESS' });
        }

        const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID;
        const SALT_KEY = process.env.PHONEPE_SALT_KEY;

        const hasCredentials = MERCHANT_ID && SALT_KEY &&
            MERCHANT_ID !== 'YOUR_PHONEPE_MERCHANT_ID' &&
            SALT_KEY !== 'YOUR_PHONEPE_SALT_KEY';

        if (!hasCredentials) {
            return res.status(400).json({ success: false, message: 'PhonePe credentials not configured' });
        }

        const result = await verifyAndUpdateOrder(transactionId);
        return res.json(result);

    } catch (error) {
        console.error('[PhonePe] Status check error:', error?.response?.data || error.message);
        res.status(500).json({ success: false, message: 'Failed to verify payment' });
    }
});

// @desc    PhonePe server-to-server webhook (callback from PhonePe)
// @route   POST /api/orders/phonepe/webhook/:transactionId
// @access  Public (PhonePe servers)
router.post('/phonepe/webhook/:transactionId', async (req, res) => {
    const { transactionId } = req.params;

    try {
        console.log('[PhonePe Webhook] Received for transaction:', transactionId);

        const SALT_KEY = process.env.PHONEPE_SALT_KEY;
        const SALT_INDEX = process.env.PHONEPE_SALT_INDEX || '1';

        // Verify webhook signature from PhonePe
        const xVerify = req.headers['x-verify'];
        const responseBody = req.body?.response;

        if (xVerify && responseBody) {
            const expectedHash = crypto.createHash('sha256')
                .update(responseBody + SALT_KEY)
                .digest('hex') + '###' + SALT_INDEX;

            if (xVerify !== expectedHash) {
                console.warn('[PhonePe Webhook] Signature mismatch — ignoring');
                return res.status(200).json({ success: false }); // Always return 200 to PhonePe
            }

            // Decode and parse the response
            const decoded = JSON.parse(Buffer.from(responseBody, 'base64').toString('utf-8'));
            if (decoded.code === 'PAYMENT_SUCCESS') {
                const order = await Order.findById(transactionId).populate('user', 'name email');
                if (order && !order.isPaid) {
                    order.isPaid = true;
                    order.paidAt = Date.now();
                    order.paymentResult = {
                        id: decoded.data?.transactionId,
                        status: decoded.code,
                        update_time: Date.now().toString(),
                    };
                    await order.save();

                    if (order.user && order.user.email) {
                        sendOrderReceiptEmail(order.user.email, order.user.name, order)
                            .catch(err => console.error('[Email] Receipt error:', err));
                    }
                }
            }
        } else {
            // Fallback: verify with PhonePe status API
            await verifyAndUpdateOrder(transactionId).catch(console.error);
        }

        // PhonePe requires HTTP 200 acknowledgement
        return res.status(200).json({ success: true });

    } catch (error) {
        console.error('[PhonePe Webhook] Error:', error?.response?.data || error.message);
        return res.status(200).json({ success: false }); // Always 200 to avoid PhonePe retries
    }
});

export default router;
