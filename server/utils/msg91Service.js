import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

// ── Mobile helpers ────────────────────────────────────────────────────────────
const to10Digit = (mobile) => {
    let m = String(mobile).replace(/\D/g, '');
    if (m.startsWith('91') && m.length === 12) m = m.slice(2);
    return m;
};

// ─────────────────────────────────────────────────────────────────────────────
// VERIFY WIDGET ACCESS TOKEN
// ─────────────────────────────────────────────────────────────────────────────
export const verifyMsg91Token = async (accessToken) => {
    const authKey = process.env.MSG91_AUTH_KEY;

    if (!authKey || authKey === 'your_msg91_authkey_here') {
        throw new Error('Please configure MSG91_AUTH_KEY in server/.env');
    }

    if (!accessToken) {
        throw new Error('Access token is required for verification');
    }

    try {
        console.log(`[MSG91] Verifying widget access token: ${accessToken.substring(0, 10)}...`);

        // POST request to MSG91 Widget Token Verification API
        const response = await axios.post(
            'https://control.msg91.com/api/v5/widget/verifyAccessToken',
            {
                authkey: authKey,
                'access-token': accessToken
            },
            {
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 10000 // 10 seconds
            }
        );

        const data = response.data;
        console.log('[MSG91] Widget verification response:', JSON.stringify(data));

        const isSuccess = data.type === 'success' || data.status === 'success' || data.mobile;
        if (!isSuccess) {
            throw new Error(data.message || 'Token verification failed');
        }

        const rawMobile = data.mobile || data.data?.mobile || data.phone;
        const mobile = to10Digit(rawMobile);

        if (!mobile || mobile.length !== 10) {
            throw new Error(`Unexpected mobile number format received: ${rawMobile}`);
        }

        return { success: true, mobile };
    } catch (err) {
        const errMsg = err.response?.data?.message || err.message;
        console.error('[MSG91] Widget verification error:', errMsg);
        throw new Error(errMsg);
    }
};
