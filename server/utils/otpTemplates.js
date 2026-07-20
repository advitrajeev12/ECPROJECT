// ─────────────────────────────────────────────────────────────────────────────
// OTP SMS TEMPLATES (single source of truth)
//
// IMPORTANT: With the Fast2SMS "DLT" route, the actual text delivered is the
// one you registered on the DLT portal and referenced by its Template ID — you
// only pass the OTP value as a variable. So these strings must match your
// DLT-approved templates EXACTLY (see server/docs/OTP_FAST2SMS_DLT.md).
//
// They are used here for: mock-mode logging, and as the canonical text to copy
// into DLT registration. To add a language later, add a key below + register a
// DLT template + add its Template ID to the env (FAST2SMS_DLT_TEMPLATE_ID_<LANG>).
//
// The `{#var#}` placeholder is what the DLT portal expects for a variable.
// ─────────────────────────────────────────────────────────────────────────────

export const DEFAULT_OTP_LANG = process.env.OTP_LANG || 'en';

// Human-readable text, with the OTP substituted in (used for logs / docs).
export const OTP_TEMPLATES = {
    en: (otp) =>
        `${otp} is your OTP for Bal Jyoti Design. Valid for 10 minutes. Do not share it with anyone.`,
    hi: (otp) =>
        `${otp} आपका Bal Jyoti Design का OTP है। यह 10 मिनट के लिए मान्य है। इसे किसी के साथ साझा न करें।`,
};

// The exact strings to register on the DLT portal (variable = {#var#}).
export const DLT_TEMPLATE_TEXT = {
    en: '{#var#} is your OTP for Bal Jyoti Design. Valid for 10 minutes. Do not share it with anyone.',
    hi: '{#var#} आपका Bal Jyoti Design का OTP है। यह 10 मिनट के लिए मान्य है। इसे किसी के साथ साझा न करें।',
};

export const getOtpMessage = (otp, lang = DEFAULT_OTP_LANG) =>
    (OTP_TEMPLATES[lang] || OTP_TEMPLATES.en)(otp);

export const isSupportedLang = (lang) => Object.keys(OTP_TEMPLATES).includes(lang);
