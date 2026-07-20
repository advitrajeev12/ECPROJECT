# OTP via Fast2SMS + DLT — Setup Guide

This app sends login/signup OTPs over SMS through **Fast2SMS** using the **DLT
route** (the TRAI-mandated compliant path for transactional SMS in India).

Fast2SMS only *delivers* the SMS — our server generates the 6-digit code, stores
a hashed copy (`Otp` collection, auto-expiring), and verifies it. You do **not**
need a separate OTP-verification product.

> While you're still setting up DLT, keep `DEV_MOCK_OTP=true` in `server/.env`.
> In mock mode no SMS is sent and the code **`123456`** (`DEV_OTP_CODE`) works
> for every number, so you can build/test the full flow for free.

---

## 0. What you'll end up putting in `server/.env`

```
DEV_MOCK_OTP=false
FAST2SMS_API_KEY=xxxxxxxxxxxxxxxxxxxx
FAST2SMS_SENDER_ID=BALJYT              # your approved 6-char header
FAST2SMS_ENTITY_ID=11020xxxxxxxxxxxxx  # DLT Principal Entity (PE) ID
FAST2SMS_DLT_TEMPLATE_ID_EN=1707xxxxxxxxxxxxx   # English template id
FAST2SMS_DLT_TEMPLATE_ID_HI=1707xxxxxxxxxxxxx   # Hindi template id
OTP_LANG=en
```

---

## 1. The OTP templates (copy these EXACTLY into DLT)

The variable placeholder for DLT is `{#var#}` — it becomes the 6-digit OTP.
These must match the strings in `server/utils/otpTemplates.js` character-for-character.

### English (default)
```
{#var#} is your OTP for Bal Jyoti Design. Valid for 10 minutes. Do not share it with anyone.
```

### Hindi
```
{#var#} आपका Bal Jyoti Design का OTP है। यह 10 मिनट के लिए मान्य है। इसे किसी के साथ साझा न करें।
```

- Template **type**: `OTP`
- Template **category**: `Service Implicit` (or `Transactional`) — OTP is service-implicit.
- Keep the brand name **Bal Jyoti Design** in the text (DLT checks brand match).
- "10 minutes" in the text must match `OTP_TTL_MINUTES` in `.env`.

> To add more languages later: add a key to `OTP_TEMPLATES`/`DLT_TEMPLATE_TEXT`
> in `otpTemplates.js`, register that template on DLT, and add
> `FAST2SMS_DLT_TEMPLATE_ID_<LANG>` to `.env`.

---

## 2. DLT registration (one-time)

DLT = *Distributed Ledger Technology* registration, run by the telecom operators.
Pick **one** portal (they sync with each other):

- Jio — https://trueconnect.jio.com
- Airtel — https://www.airtel.in/business/commercial-communication/home
- Vodafone Idea (VILPower) — https://www.vilpower.in
- BSNL — https://www.ucc-bsnl.co.in

### Step 2a — Register as Principal Entity (PE)
Sign up with your business details:
- Business/GST or PAN, address, authorised signatory
- You'll receive a **Principal Entity ID (PE ID)** — a ~19-digit number.
  → this is `FAST2SMS_ENTITY_ID`.

### Step 2b — Register a Header (Sender ID)
- Type: **Transactional / Service**
- 6 characters, alphanumeric, e.g. `BALJYT`
- Once approved → this is `FAST2SMS_SENDER_ID`.

### Step 2c — Register the Content Templates
For **each** language, create a content template:
- Paste the exact text from section 1 (with `{#var#}`)
- Template type: **OTP**, category: **Service Implicit**
- Link it to your header `BALJYT`
- On approval you get a **Template ID** (a ~19-digit number).
  → English one = `FAST2SMS_DLT_TEMPLATE_ID_EN`, Hindi one = `FAST2SMS_DLT_TEMPLATE_ID_HI`.

Approvals usually take a few hours to ~2 days.

---

## 3. Fast2SMS account

1. Sign up at https://www.fast2sms.com and complete KYC.
2. Add wallet balance (DLT SMS is roughly ₹0.20–0.30 per SMS).
3. **Dashboard → DLT SMS**: add your PE ID, Header (`BALJYT`) and the approved
   templates so Fast2SMS can map them. (Fast2SMS can auto-import from your DLT
   operator using your PE ID.)
4. **Dashboard → Dev API**: copy your **API Key** → `FAST2SMS_API_KEY`.

---

## 4. Flip it on

1. In `server/.env`, set `DEV_MOCK_OTP=false` and fill all `FAST2SMS_*` values.
2. Restart the server.
3. Test: request an OTP from the login screen — you should get a real SMS. The
   server logs `[Fast2SMS] OTP sent to <number> (req <id>)`.

To go back to free local testing at any time, set `DEV_MOCK_OTP=true`.

---

## 5. How the code uses it

- `POST /api/users/send-otp`   `{ mobile, lang? }` → generates + stores + sends.
- `POST /api/users/verify-otp` `{ mobile, otp }`   → login.
- `POST /api/users/signup`     `{ name, email, password, mobile, otp }` → verifies then creates the account.

Under the hood: `server/utils/fast2smsService.js` (delivery + mock),
`server/utils/otpTemplates.js` (template text), `server/models/Otp.js` (hashed,
TTL-expiring store).

### Fast2SMS DLT request we send
```
GET https://www.fast2sms.com/dev/bulkV2
  ?authorization=<FAST2SMS_API_KEY>
  &route=dlt
  &sender_id=<FAST2SMS_SENDER_ID>
  &message=<FAST2SMS_DLT_TEMPLATE_ID_*>
  &variables_values=<the 6-digit OTP>
  &entity_id=<FAST2SMS_ENTITY_ID>
  &numbers=<10-digit mobile>
  &flash=0
```
