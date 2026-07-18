import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';

// ─── Singleton Transporter ───────────────────────────────────────────────────
// Reused across calls to avoid recreating the SMTP connection every time.

let _transporter = null;

const getTransporter = () => {
    if (_transporter) return _transporter;

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error('EMAIL_USER and EMAIL_PASS must be set in environment variables.');
    }

    _transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        connectionTimeout: 10000, // 10 seconds — prevents hanging
        greetingTimeout: 10000,
    });

    return _transporter;
};

// ─── Helper: safe last-N chars of an ID ─────────────────────────────────────

const shortId = (id, n = 8) => {
    const str = id ? id.toString() : 'UNKNOWN';
    return str.substring(Math.max(0, str.length - n));
};

// ─── Order Receipt ───────────────────────────────────────────────────────────

export const sendOrderReceiptEmail = async (userEmail, userName, order) => {
    try {
        // Guard: missing env vars
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.log('Skipping email receipt: EMAIL_USER and EMAIL_PASS not configured in .env');
            return false;
        }

        // Guard: malformed order
        if (!order || !order._id || !Array.isArray(order.orderItems)) {
            console.error('sendOrderReceiptEmail: invalid order object');
            return false;
        }

        const transporter = getTransporter();
        const totalAmount = order.totalPrice ?? 0;
        const orderId = shortId(order._id);

        const itemRows = order.orderItems.map(item => `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #efefef;">
                    <strong>${item.name ?? 'Unnamed item'}</strong><br />
                    <span style="color: #888; font-size: 12px;">Qty: ${item.qty ?? 1}</span>
                </td>
                <td style="padding: 10px; border-bottom: 1px solid #efefef; text-align: right;">
                    ₹${((item.price ?? 0) * (item.qty ?? 1)).toFixed(2)}
                </td>
            </tr>
        `).join('');

        const shippingAddress = order.shippingAddress || {};

        const mailOptions = {
            from: `"Bal Jyoti" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: `Order Confirmation - #${orderId}`,
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <div style="text-align: center; padding: 20px 0;">
                    <h1 style="color: #1a5b3a; margin: 0;">Bal Jyoti</h1>
                    <p style="color: #666; margin-top: 5px;">Your order has been received and is being processed!</p>
                </div>
                <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <h3 style="margin-top: 0; color: #1a5b3a;">Order Summary</h3>
                    <p style="margin: 5px 0;"><strong>Order ID:</strong> #${orderId}</p>
                    <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(order.createdAt ?? Date.now()).toLocaleDateString()}</p>
                    <h4 style="margin-bottom: 5px; margin-top: 15px;">Shipping Address:</h4>
                    <p style="margin: 0; color: #555;">
                        ${shippingAddress.street ?? ''},<br />
                        ${shippingAddress.city ?? ''}, ${shippingAddress.state ?? ''} ${shippingAddress.zipCode ?? ''}<br />
                        ${shippingAddress.country ?? ''}
                    </p>
                </div>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <thead>
                        <tr style="background-color: #1a5b3a; color: white;">
                            <th style="padding: 10px; text-align: left; border-radius: 4px 0 0 0;">Item</th>
                            <th style="padding: 10px; text-align: right; border-radius: 0 4px 0 0;">Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemRows}
                        <tr>
                            <td style="padding: 15px 10px 10px; text-align: right; border-top: 2px solid #ddd;"><strong>Total Amount:</strong></td>
                            <td style="padding: 15px 10px 10px; text-align: right; border-top: 2px solid #ddd;">
                                <strong style="font-size: 18px; color: #1a5b3a;">₹${totalAmount.toFixed(2)}</strong>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div style="text-align: center; padding: 20px; color: #888; font-size: 12px;">
                    <p style="margin: 0;">Thank you for shopping with us!</p>
                    <p style="margin: 5px 0;">Bal Jyoti Design | Empowering Artisans</p>
                    <p style="margin: 0;">If you have any questions, reply to this email.</p>
                </div>
            </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Order receipt email sent: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending order receipt email:', error);
        return false;
    }
};

// ─── Email OTP Verification ──────────────────────────────────────────────────

/**
 * Generates a 6-digit OTP and stores it on the user doc.
 * Caller MUST call user.save() after this.
 * OTP expires in 10 minutes.
 *
 * ⚠️  Production note: store a bcrypt hash of the OTP instead of plain text.
 */
export const generateEmailOtp = async (user) => {
    if (!user) throw new Error('generateEmailOtp: user must not be null/undefined');

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Security: store a bcrypt hash of the OTP instead of plain text.
    const salt = await bcrypt.genSalt(10);
    user.emailVerificationToken = await bcrypt.hash(otp, salt);
    
    user.emailVerificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    return otp;
};

/**
 * Sends a styled OTP email to the user.
 */
export const sendEmailOtp = async (userEmail, userName, otp) => {
    try {
        // Guard: missing env vars
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.log('Skipping OTP email: EMAIL_USER and EMAIL_PASS not configured in .env');
            return false;
        }

        // Guard: bad arguments
        if (!userEmail || !otp) {
            console.error('sendEmailOtp: userEmail and otp are required');
            return false;
        }

        const transporter = getTransporter();

        const mailOptions = {
            from: `"Bal Jyoti" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: `${otp} is your Bal Jyoti email verification code`,
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; color: #333;">
                <div style="text-align: center; padding: 30px 0 20px;">
                    <h1 style="color: #1a5b3a; margin: 0; font-size: 28px;">Bal Jyoti</h1>
                    <p style="color: #888; margin-top: 6px; font-size: 14px;">Empowering Artisans</p>
                </div>

                <div style="background: #f9f9f9; border-radius: 16px; padding: 36px 32px; text-align: center; margin-bottom: 24px;">
                    <p style="font-size: 16px; color: #555; margin: 0 0 8px;">Hi ${userName ?? 'there'},</p>
                    <p style="font-size: 15px; color: #555; margin: 0 0 28px; line-height: 1.6;">
                        Use the code below to verify your email address.<br/>
                        This code expires in <strong>10 minutes</strong>.
                    </p>

                    <div style="display: inline-block; background: #fff; border: 2px dashed #1a5b3a;
                                border-radius: 12px; padding: 20px 40px; margin: 0 auto;">
                        <span style="font-size: 42px; font-weight: 900; letter-spacing: 14px; color: #1a5b3a;
                                     font-family: 'Courier New', monospace;">${otp}</span>
                    </div>

                    <p style="font-size: 12px; color: #aaa; margin-top: 24px; margin-bottom: 0;">
                        If you didn't request this, you can safely ignore this email.
                    </p>
                </div>

                <div style="text-align: center; color: #bbb; font-size: 12px; padding-bottom: 20px;">
                    <p style="margin: 0;">Bal Jyoti Design | Empowering Artisans</p>
                </div>
            </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('OTP email sent: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending OTP email:', error);
        return false;
    }
};