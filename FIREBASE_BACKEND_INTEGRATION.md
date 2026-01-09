# Firebase Phone Authentication - Backend Integration Guide

## Overview

The frontend has been updated to use Firebase Phone Authentication instead of custom OTP endpoints. This document outlines the required backend changes.

## Frontend Changes (Completed)

✅ Firebase SDK installed and configured
✅ Phone number verification now uses `signInWithPhoneNumber()`
✅ OTP verification now uses Firebase `confirmationResult.confirm()`
✅ Frontend exchanges Firebase ID token for backend JWT

## Required Backend Changes

### 1. Install Firebase Admin SDK

```bash
# For Node.js backend
npm install firebase-admin

# For Python backend
pip install firebase-admin
```

### 2. Initialize Firebase Admin SDK

You'll need to download the Firebase service account key from Firebase Console:
1. Go to Firebase Console > Project Settings > Service Accounts
2. Click "Generate New Private Key"
3. Save the JSON file securely (DO NOT commit to git)

**Node.js Example:**
```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./path/to/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
```

**Python Example:**
```python
import firebase_admin
from firebase_admin import credentials, auth

cred = credentials.Certificate('path/to/serviceAccountKey.json')
firebase_admin.initialize_app(cred)
```

### 3. Create New Endpoint: `POST /auth/firebase`

This endpoint should:
1. Accept Firebase ID token from frontend
2. Verify the token using Firebase Admin SDK
3. Extract phone number from verified token
4. Create or retrieve user from database
5. Generate and return application JWT

**Request Format:**
```json
POST /auth/firebase
Content-Type: application/json

{
  "firebase_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6...",
  "phone_number": "+14197806507"
}
```

**Response Format:**
```json
{
  "access_token": "your-jwt-token-here"
}
```

### 4. Implementation Example (Node.js)

```javascript
app.post('/auth/firebase', async (req, res) => {
  try {
    const { firebase_token, phone_number } = req.body;

    // Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(firebase_token);

    // Verify phone number matches
    const firebasePhone = decodedToken.phone_number;
    if (firebasePhone !== phone_number) {
      return res.status(400).json({
        error: 'Phone number mismatch'
      });
    }

    // Get or create user in your database
    let user = await getUserByPhone(phone_number);

    if (!user) {
      // Create new user
      user = await createUser({
        phone_number: phone_number,
        firebase_uid: decodedToken.uid,
        // ... other user fields
      });
    }

    // Generate your application's JWT token
    const accessToken = generateJWT({
      user_id: user.id,
      phone_number: user.phone_number,
      // ... other claims
    });

    return res.json({
      access_token: accessToken
    });

  } catch (error) {
    console.error('Firebase auth error:', error);

    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        error: 'Token expired'
      });
    }

    if (error.code === 'auth/argument-error') {
      return res.status(400).json({
        error: 'Invalid token'
      });
    }

    return res.status(500).json({
      error: 'Authentication failed'
    });
  }
});
```

### 5. Implementation Example (Python/FastAPI)

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from firebase_admin import auth

app = FastAPI()

class FirebaseAuthRequest(BaseModel):
    firebase_token: str
    phone_number: str

@app.post("/auth/firebase")
async def firebase_auth(request: FirebaseAuthRequest):
    try:
        # Verify Firebase ID token
        decoded_token = auth.verify_id_token(request.firebase_token)

        # Verify phone number matches
        firebase_phone = decoded_token.get('phone_number')
        if firebase_phone != request.phone_number:
            raise HTTPException(
                status_code=400,
                detail="Phone number mismatch"
            )

        # Get or create user in your database
        user = get_user_by_phone(request.phone_number)

        if not user:
            # Create new user
            user = create_user(
                phone_number=request.phone_number,
                firebase_uid=decoded_token['uid']
            )

        # Generate your application's JWT token
        access_token = generate_jwt({
            "user_id": user.id,
            "phone_number": user.phone_number
        })

        return {
            "access_token": access_token
        }

    except auth.InvalidIdTokenError:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )
    except auth.ExpiredIdTokenError:
        raise HTTPException(
            status_code=401,
            detail="Token expired"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Authentication failed"
        )
```

### 6. Security Considerations

✅ **Always verify the Firebase token server-side** - Never trust client-provided tokens
✅ **Validate phone number matches** - Ensure the phone number in the request matches the token
✅ **Use HTTPS only** - Firebase tokens should only be transmitted over secure connections
✅ **Set token expiration** - Your application JWT should have reasonable expiration time
✅ **Store Firebase UID** - Save the Firebase UID in your database for audit purposes
✅ **Rate limiting** - Implement rate limiting on the auth endpoint to prevent abuse

### 7. Optional: Deprecate Old OTP Endpoints

Once Firebase authentication is working, you can deprecate or remove:
- `POST /otp/generate`
- `POST /otp/verify`

**Migration Strategy:**
1. Keep both endpoints active initially
2. Monitor Firebase auth usage via analytics
3. Once majority of users are on Firebase, deprecate old endpoints
4. After grace period, remove old endpoints completely

### 8. Testing the Integration

**Test with cURL:**
```bash
curl -X POST http://localhost:3000/auth/firebase \
  -H "Content-Type: application/json" \
  -d '{
    "firebase_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6...",
    "phone_number": "+14197806507"
  }'
```

**Expected Response:**
```json
{
  "access_token": "your-jwt-token-here"
}
```

### 9. Environment Variables

Add these to your backend `.env` file:

```bash
# Path to Firebase service account key
FIREBASE_SERVICE_ACCOUNT_PATH=/path/to/serviceAccountKey.json

# Or use environment variable for service account JSON
FIREBASE_SERVICE_ACCOUNT_JSON='{"type": "service_account", ...}'
```

### 10. Error Codes Reference

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| `auth/id-token-expired` | 401 | Firebase token has expired |
| `auth/argument-error` | 400 | Invalid token format |
| `auth/invalid-id-token` | 401 | Token is invalid or tampered |
| `auth/user-not-found` | 404 | User doesn't exist in Firebase |

## Firebase Console Configuration

The Firebase project is already configured with:
- **Project ID:** angpao-app
- **Auth Domain:** angpao-app.firebaseapp.com
- **API Key:** AIzaSyCISHqvqHdYnnvDuGACjOnk8Dr896Ur6Ig

Make sure Phone Authentication is enabled in Firebase Console:
1. Go to Authentication > Sign-in method
2. Enable "Phone" provider
3. Configure reCAPTCHA settings if needed

## Next Steps

1. ✅ Install Firebase Admin SDK on backend
2. ✅ Download service account key from Firebase Console
3. ✅ Create `/auth/firebase` endpoint
4. ✅ Test the authentication flow end-to-end
5. ✅ Deploy backend changes
6. ✅ Monitor for errors in production
7. ✅ Deprecate old OTP endpoints after successful rollout

## Support

If you encounter issues:
- Check Firebase Console logs for authentication errors
- Verify service account permissions
- Ensure phone numbers are in E.164 format (+14197806507)
- Check that reCAPTCHA is properly configured for your domain
