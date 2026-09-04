import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

// In-memory OTP storage: mobile -> { otp, expiresAt }
const otpStore = new Map();

// Helper to sanitize 10-digit Indian mobile number
const to10Digit = (mobile) => {
    let m = String(mobile).replace(/\D/g, '');
    if (m.startsWith('91') && m.length === 12) m = m.slice(2);
    return m;
};

/**
 * Generate a random 6-digit numeric OTP
 */
const generateOtpCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP via Fast2SMS API
 * @param {string} mobile 10-digit Indian mobile number
 */
export const sendFast2SMSOtp = async (mobile) => {
    const cleanMobile = to10Digit(mobile);
    if (!cleanMobile || cleanMobile.length !== 10) {
        throw new Error('Please provide a valid 10-digit mobile number');
    }

    const otp = generateOtpCode();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity

    // Save OTP to in-memory store
    otpStore.set(cleanMobile, { otp, expiresAt });

    const apiKey = process.env.FAST2SMS_API_KEY;

    console.log(`[Fast2SMS] Generated OTP ${otp} for mobile ${cleanMobile}.`);

    // Development / Fallback mode: if API key is not configured or placeholder
    if (!apiKey || apiKey === 'YOUR_FAST2SMS_API_KEY_HERE' || apiKey.trim() === '') {
        console.warn(`[Fast2SMS] FAST2SMS_API_KEY is not configured in server/.env.`);
        console.warn(`[Fast2SMS DEV MODE] Use OTP: ${otp} for mobile +91 ${cleanMobile}`);
        return { success: true, message: 'OTP sent (Dev mode - check server console)', devOtp: otp };
    }

    try {
        const response = await axios.post(
            'https://www.fast2sms.com/dev/bulkV2',
            {
                route: 'otp',
                variables_values: otp,
                numbers: cleanMobile
            },
            {
                headers: {
                    'authorization': apiKey,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            }
        );

        console.log('[Fast2SMS] API response:', JSON.stringify(response.data));

        if (response.data && (response.data.return === true || response.data.status_code === 200)) {
            return { success: true, message: 'OTP sent successfully' };
        } else {
            console.warn('[Fast2SMS] API warning response:', response.data);
            console.warn(`[Fast2SMS DEV FALLBACK] OTP: ${otp} for mobile +91 ${cleanMobile}`);
            return { 
                success: true, 
                message: response.data?.message?.[0] || 'OTP request processed',
                devOtp: process.env.NODE_ENV === 'development' ? otp : undefined
            };
        }
    } catch (err) {
        const errMsg = err.response?.data?.message || err.message;
        console.error('[Fast2SMS] Error sending SMS:', errMsg);
        console.warn(`[Fast2SMS DEV FALLBACK] OTP: ${otp} for mobile +91 ${cleanMobile}`);
        if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
            return { success: true, message: 'OTP logged to server console (Fast2SMS API failed)', devOtp: otp };
        }
        throw new Error(errMsg || 'Failed to send OTP via Fast2SMS');
    }
};

/**
 * Verify OTP for a given mobile number
 * @param {string} mobile 10-digit mobile number
 * @param {string} otp 6-digit OTP code entered by user
 */
export const verifyFast2SMSOtp = async (mobile, otp) => {
    const cleanMobile = to10Digit(mobile);
    if (!cleanMobile || cleanMobile.length !== 10) {
        throw new Error('Please provide a valid 10-digit mobile number');
    }

    if (!otp || String(otp).trim() === '') {
        throw new Error('OTP is required');
    }

    const storedData = otpStore.get(cleanMobile);

    if (!storedData) {
        throw new Error('No OTP sent for this mobile number or OTP has expired');
    }

    if (Date.now() > storedData.expiresAt) {
        otpStore.delete(cleanMobile);
        throw new Error('OTP has expired. Please request a new OTP');
    }

    if (String(storedData.otp).trim() !== String(otp).trim()) {
        throw new Error('Invalid OTP. Please try again');
    }

    // OTP is valid - clear it from store to prevent reuse
    otpStore.delete(cleanMobile);
    return { success: true, mobile: cleanMobile };
};
