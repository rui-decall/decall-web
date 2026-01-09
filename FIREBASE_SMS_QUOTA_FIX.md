# Fixing Firebase SMS Error Code 39

## Error Description

```json
{
  "error": {
    "code": 503,
    "message": "Error code: 39",
    "errors": [
      {
        "message": "Error code: 39",
        "domain": "global",
        "reason": "backendError"
      }
    ]
  }
}
```

**This means:** Firebase SMS quota exceeded or phone authentication not properly configured.

---

## Quick Solutions

### ✅ **Solution 1: Use Test Phone Numbers (Immediate - No Cost)**

**Best for:** Development and testing

**Steps:**

1. Open Firebase Console: https://console.firebase.google.com/project/angpao-app/authentication/providers

2. Click on **Phone** in the Sign-in providers list

3. Scroll down to **Phone numbers for testing**

4. Click **Add phone number**

5. Add test numbers:

   | Phone Number | Verification Code |
   |--------------|-------------------|
   | +1 650 555 1234 | 123456 |
   | +1 650 555 1235 | 654321 |
   | +1 650 555 1236 | 111111 |

6. Click **Save**

**Usage:**
- Use `+16505551234` in your app
- Enter `123456` when prompted for verification code
- **No real SMS is sent** - bypasses SMS quota entirely
- Works immediately without billing

---

### ✅ **Solution 2: Enable Firebase Blaze Plan (Production)**

**Best for:** Production use with real phone numbers

**Steps:**

1. Go to: https://console.firebase.google.com/project/angpao-app/usage

2. Look for **Upgrade** button in bottom-left corner

3. Click **Upgrade to Blaze plan**

4. Enter billing information (credit card required)

5. Set budget alerts (optional but recommended):
   - Go to **Usage and billing** → **Budget alerts**
   - Set alert at $5 or $10 to avoid surprises

**Pricing:**
- ✅ **First 10,000 verifications/month: FREE**
- After 10k: $0.06 per verification
- Most apps stay well within the free tier

**Benefits:**
- ✅ Works with all real phone numbers
- ✅ No test number restrictions
- ✅ Production-ready
- ✅ Scales automatically

---

## Detailed Troubleshooting

### Check Current Usage

1. Go to: https://console.firebase.google.com/project/angpao-app/authentication/usage

2. Look at **Phone sign-in** metrics

3. Check if you've hit daily/monthly limits

### Verify Configuration

Check these settings in Firebase Console:

#### ✅ **Phone Authentication Enabled**
- Authentication → Sign-in method → Phone → **Enabled**

#### ✅ **Authorized Domains**
- Authentication → Settings → Authorized domains
- Should include:
  - `localhost` (for development)
  - Your production domain (e.g., `your-app.pages.dev`)

#### ✅ **Test Phone Numbers** (for development)
- Authentication → Sign-in method → Phone → Phone numbers for testing
- Add at least one test number

---

## Alternative: Temporary Backend Bypass (Development Only)

If you want to test other features without Firebase SMS:

### Option A: Mock Auth Endpoint

Create a mock endpoint that returns a fake JWT for development:

```javascript
// In your backend (for development only)
app.post('/auth/mock', async (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ error: 'Mock auth only available in development' });
  }

  const { phone_number } = req.body;

  // Generate mock JWT
  const accessToken = generateJWT({
    phone_number,
    mock: true
  });

  return res.json({ access_token: accessToken });
});
```

### Option B: Environment-Based Bypass

Update your `.env` for local development:

```bash
# .env
PUBLIC_USE_MOCK_AUTH=true  # Set to false for production
PUBLIC_API_URL=http://localhost:3000
```

---

## Recommended Approach

### For Development:
1. ✅ Use **test phone numbers** (Solution 1)
2. Add 2-3 test numbers in Firebase Console
3. Use these in your development/staging environment
4. No cost, works immediately

### For Production:
1. ✅ Enable **Blaze plan** (Solution 2)
2. Set up billing
3. Configure budget alerts
4. Monitor usage in Firebase Console

---

## Cost Analysis

### Free Tier (Spark Plan)
- ❌ Very limited SMS quota
- ❌ Not suitable for production
- ✅ OK for initial testing with test numbers

### Blaze Plan (Pay-as-you-go)
- ✅ 10,000 free verifications/month
- ✅ $0.06 per verification after that
- ✅ Production-ready

**Example costs:**
- 100 users/day × 30 days = 3,000 verifications/month = **$0** (within free tier)
- 500 users/day × 30 days = 15,000 verifications/month = **$0.30** (5k over free tier)
- 1,000 users/day × 30 days = 30,000 verifications/month = **$1.20** (20k over free tier)

**Note:** Most apps with moderate traffic stay within the free 10k limit.

---

## Testing Your Fix

### Test with Test Phone Number:

1. Add test number `+16505551234` with code `123456` in Firebase Console

2. In your app, enter phone: `+1 650 555 1234`

3. Firebase will show verification screen

4. Enter code: `123456`

5. Should succeed without sending SMS

### Test with Real Phone Number (Requires Blaze Plan):

1. Make sure Blaze plan is enabled

2. Enter your real phone number

3. Check your phone for SMS

4. Enter the received code

5. Should succeed with real SMS sent

---

## Common Issues

### "CAPTCHA verification failed"
**Solution:** Add your domain to Firebase authorized domains
- Authentication → Settings → Authorized domains → Add domain

### "Invalid phone number"
**Solution:** Ensure phone is in E.164 format (e.g., +14155551234)

### "Too many requests"
**Solution:**
- You've hit rate limit
- Wait 24 hours or use different phone number
- Or set up test phone numbers

---

## Firebase Console Quick Links

- **Phone Authentication Settings:** https://console.firebase.google.com/project/angpao-app/authentication/providers
- **Usage & Billing:** https://console.firebase.google.com/project/angpao-app/usage
- **Upgrade to Blaze:** https://console.firebase.google.com/project/angpao-app/usage/details

---

## Summary

**Fastest Fix:** Add test phone numbers (5 minutes, no billing required)

**Production Fix:** Enable Blaze plan ($0 for first 10k/month)

Both solutions are now documented and the app will show helpful error messages to guide you.
