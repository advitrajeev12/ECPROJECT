import mongoose from 'mongoose';

// Short-lived store for mobile OTPs. Fast2SMS only delivers the SMS — it does
// NOT verify codes for us — so we generate the code, store a bcrypt hash here,
// and validate it on /verify-otp. A TTL index auto-purges expired docs.
const otpSchema = new mongoose.Schema({
    mobile: {
        type: String,
        required: true,
        unique: true,          // one active OTP per number (re-send overwrites)
        index: true,
    },
    codeHash: {
        type: String,
        required: true,
    },
    attempts: {
        type: Number,
        default: 0,            // wrong-guess counter (lock after a few)
    },
    lang: {
        type: String,
        default: 'en',
    },
    expiresAt: {
        type: Date,
        required: true,
    },
}, { timestamps: true });

// TTL index — MongoDB removes the doc once `expiresAt` passes.
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Otp = mongoose.models.Otp || mongoose.model('Otp', otpSchema);
export default Otp;
