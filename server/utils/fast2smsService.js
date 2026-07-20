import axios from 'axios';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Otp from '../models/Otp.js';
import { getOtpMessage, DEFAULT_OTP_LANG, isSupportedLang } from './otpTemplates.js';
dotenv.config();

// ─────────────────────────────────────────────────────────────────────────────
// OTP via Fast2SMS (https://docs.fast2sms.com) — DLT route.
//
// Fast2SMS is a delivery-only gateway: it sends the SMS but does NOT generate or
// verify the code. So we:
//   1. generate a 6-digit code,
//   2. store its bcrypt hash in the Otp collection (TTL-expiring),
//   3. deliver it via the Fast2SMS DLT route (uses your DLT-approved template),
//   4. verify the user's input against the stored hash on /verify-otp.
//
// We call the REST endpoint with axios — no extra npm dependency.
// ─────────────────────────────────────────────────────────────────────────────

const FAST2SMS_URL = 'https://www.fast2sms.com/dev/bulkV2';
const OTP_TTL_MIN = parseInt(process.env.OTP_TTL_MINUTES || '10', 10);
const MAX_ATTEMPTS = parseInt(process.env.OTP_MAX_ATTEMPTS || '5', 10);

// ── Mobile helper — Fast2SMS wants a bare 10-digit Indian number ──────────────
export const to10Digit = (mobile) => {
    let m = String(mobile).replace(/\D/g, '');
    if (m.length > 10) m = m.slice(-10);   // strip country code / leading zeros
    return m;
};

// ── Config / mode helpers ─────────────────────────────────────────────────────
const isPlaceholder = (v) => !v || v.startsWith('your_') || v.includes('xxxx');

// Mock mode: no real SMS, DEV_OTP_CODE is accepted. On when DEV_MOCK_OTP=true or
// the Fast2SMS API key is still a placeholder (so the fake .env just works).
export const isMockOtpEnabled = () =>
    process.env.DEV_MOCK_OTP === 'true' || isPlaceholder(process.env.FAST2SMS_API_KEY);

const DEV_OTP_CODE = () => process.env.DEV_OTP_CODE || '123456';

const generateCode = () => String(crypto.randomInt(100000, 1000000)); // 6 digits

const resolveLang = (lang) => {
    const l = lang || process.env.OTP_LANG || DEFAULT_OTP_LANG;
    return isSupportedLang(l) ? l : 'en';
};

// ─────────────────────────────────────────────────────────────────────────────
// SEND OTP
// ─────────────────────────────────────────────────────────────────────────────
export const sendOtp = async (mobile, langInput) => {
    const number = to10Digit(mobile);
    const lang = resolveLang(langInput);
    const code = generateCode();

    if (isMockOtpEnabled()) {
        console.log(`[OTP:MOCK] (${lang}) "${getOtpMessage(DEV_OTP_CODE(), lang)}" -> ${number}. Use: ${DEV_OTP_CODE()}`);
        return { success: true, mock: true };
    }

    // Persist a hash of the code (upsert so a re-send replaces the previous one).
    const codeHash = await bcrypt.hash(code, 10);
    await Otp.findOneAndUpdate(
        { mobile: number },
        { mobile: number, codeHash, lang, attempts: 0, expiresAt: new Date(Date.now() + OTP_TTL_MIN * 60 * 1000) },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const apiKey = process.env.FAST2SMS_API_KEY;
    const senderId = process.env.FAST2SMS_SENDER_ID;                 // e.g. BALJYT
    const templateId = lang === 'hi'
        ? process.env.FAST2SMS_DLT_TEMPLATE_ID_HI
        : process.env.FAST2SMS_DLT_TEMPLATE_ID_EN;

    if (!senderId || !templateId) {
        throw new Error('Fast2SMS sender_id / DLT template id not configured');
    }

    try {
        const params = {
            authorization: apiKey,
            route: 'dlt',
            sender_id: senderId,
            message: templateId,          // DLT-approved Template ID
            variables_values: code,       // fills the {#var#} placeholder
            numbers: number,
            flash: 0,
        };
        if (process.env.FAST2SMS_ENTITY_ID) params.entity_id = process.env.FAST2SMS_ENTITY_ID;

        const res = await axios.get(FAST2SMS_URL, { params, timeout: 15000 });

        if (res.data && res.data.return === true) {
            console.log(`[Fast2SMS] OTP sent to ${number} (req ${res.data.request_id})`);
            return { success: true, mock: false };
        }
        throw new Error(res.data?.message || 'Fast2SMS reported a send failure');
    } catch (err) {
        const msg = err.response?.data?.message || err.message;
        console.error('[Fast2SMS] Send OTP error:', Array.isArray(msg) ? msg.join(', ') : msg);
        throw new Error('Failed to send OTP. Please try again.');
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// CHECK OTP — returns { success, mobile } (10-digit) or throws.
// ─────────────────────────────────────────────────────────────────────────────
export const checkOtp = async (mobile, code) => {
    if (!mobile || !code) {
        throw new Error('Mobile number and OTP are required');
    }

    const number = to10Digit(mobile);

    if (isMockOtpEnabled()) {
        if (String(code).trim() !== DEV_OTP_CODE()) {
            throw new Error('Invalid OTP. Please try again.');
        }
        console.log(`[OTP:MOCK] Accepted code for ${number}`);
        return { success: true, mobile: number };
    }

    const record = await Otp.findOne({ mobile: number });
    if (!record) {
        throw new Error('No OTP found for this number. Please request a new one.');
    }

    if (record.expiresAt < new Date()) {
        await Otp.deleteOne({ _id: record._id });
        throw new Error('OTP has expired. Please request a new one.');
    }

    if (record.attempts >= MAX_ATTEMPTS) {
        await Otp.deleteOne({ _id: record._id });
        throw new Error('Too many incorrect attempts. Please request a new OTP.');
    }

    const isMatch = await bcrypt.compare(String(code).trim(), record.codeHash);
    if (!isMatch) {
        record.attempts += 1;
        await record.save();
        throw new Error('Invalid OTP. Please try again.');
    }

    // One-time use — consume it.
    await Otp.deleteOne({ _id: record._id });
    return { success: true, mobile: number };
};
