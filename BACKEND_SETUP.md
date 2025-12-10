# Backend Services Setup Guide

This guide will help you configure all the real backend services for the Vita AI app.

## Prerequisites

- Node.js 18+ installed
- Google account (for Firebase)
- Stripe account (for payments)

---

## 1. Firebase Setup (Authentication & Database)

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `vita-ai` (or your choice)
4. Disable Google Analytics (optional)
5. Click "Create project"

### Step 2: Enable Authentication

1. In Firebase Console, go to **Build > Authentication**
2. Click "Get started"
3. Enable **Email/Password** sign-in method
4. Enable **Google** sign-in method (optional but recommended)

### Step 3: Create Firestore Database

1. Go to **Build > Firestore Database**
2. Click "Create database"
3. Choose **Start in production mode** (we'll set rules later)
4. Select your preferred location (e.g., `us-central1`)
5. Click "Enable"

### Step 4: Set Firestore Security Rules

Go to the "Rules" tab and paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Daily progress subcollection
      match /daily_progress/{progressId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

Click "Publish"

### Step 5: Get Firebase Config

1. Go to **Project Settings** (gear icon)
2. Scroll to "Your apps" section
3. Click the **Web** icon (`</>`)
4. Register app with nickname: `vita-web`
5. Copy the `firebaseConfig` object

### Step 6: Add Config to Your App

1. Open `.env.local` in your project root
2. Add your Firebase credentials:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=vita-ai.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=vita-ai
VITE_FIREBASE_STORAGE_BUCKET=vita-ai.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

---

## 2. Stripe Setup (Payment Processing)

### Step 1: Create Stripe Account

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/register)
2. Sign up for a free account
3. Complete business verification (can skip for testing)

### Step 2: Get API Keys

1. In Stripe Dashboard, go to **Developers > API keys**
2. Copy your **Publishable key** (starts with `pk_test_`)
3. Add to `.env.local`:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51...
```

### Step 3: Create Subscription Products

1. Go to **Products** in Stripe Dashboard
2. Click "Add product"
3. Create **Annual Plan**:
   - Name: `Vita+ Annual`
   - Price: `$59.88` per year
   - Copy the Price ID (starts with `price_`)
4. Create **Monthly Plan** (optional):
   - Name: `Vita+ Monthly`
   - Price: `$4.99` per month
   - Copy the Price ID

### Step 4: Update Price IDs in Code

Open `services/payment.ts` and update:

```typescript
export const STRIPE_PRICES = {
  ANNUAL: 'price_YOUR_ANNUAL_PRICE_ID',
  MONTHLY: 'price_YOUR_MONTHLY_PRICE_ID'
};
```

### Step 5: Set Up Webhooks (Optional - for production)

1. Go to **Developers > Webhooks**
2. Click "Add endpoint"
3. Endpoint URL: `https://your-backend.com/webhooks/stripe`
4. Select events: `checkout.session.completed`, `customer.subscription.deleted`

---

## 3. Health Data Integration (Optional)

### For iOS (HealthKit)

The app is ready for HealthKit integration. To enable:

1. Open the iOS project in Xcode:
   ```bash
   npx cap open ios
   ```

2. In Xcode, go to **Signing & Capabilities**
3. Click **+ Capability** and add **HealthKit**
4. In `Info.plist`, add:
   ```xml
   <key>NSHealthShareUsageDescription</key>
   <string>We need access to your health data to track your fitness progress</string>
   <key>NSHealthUpdateUsageDescription</key>
   <string>We need to update your health data with nutrition information</string>
   ```

### For Android (Google Fit)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable **Fitness API**
3. Create OAuth 2.0 credentials
4. Add to `android/app/src/main/AndroidManifest.xml`:
   ```xml
   <uses-permission android:name="android.permission.ACTIVITY_RECOGNITION" />
   ```

---

## 4. Testing Your Setup

### Test Firebase

1. Run the app: `npm run dev`
2. Try to sign up with email/password
3. Check Firebase Console > Authentication to see the new user
4. Check Firestore to see user profile data

### Test Stripe

1. Use test card: `4242 4242 4242 4242`
2. Expiry: Any future date
3. CVC: Any 3 digits
4. ZIP: Any 5 digits

---

## 5. Environment Variables Summary

Your `.env.local` should look like:

```env
# Google Gemini AI
API_KEY=your_gemini_api_key

# Firebase
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=vita-ai.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=vita-ai
VITE_FIREBASE_STORAGE_BUCKET=vita-ai.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51...
```

---

## 6. Deployment Checklist

Before deploying to production:

- [ ] Switch Stripe from test mode to live mode
- [ ] Update Firestore security rules for production
- [ ] Set up proper error logging (Sentry, etc.)
- [ ] Configure Firebase App Check (bot protection)
- [ ] Set up Stripe webhooks for subscription management
- [ ] Enable Firebase Analytics
- [ ] Add rate limiting to prevent API abuse

---

## Troubleshooting

### Firebase Connection Issues
- Verify API key is correct
- Check browser console for CORS errors
- Ensure Firestore rules allow authenticated access

### Stripe Not Working
- Verify publishable key starts with `pk_test_` or `pk_live_`
- Check Stripe Dashboard logs for errors
- Ensure test mode is enabled during development

### Health Data Not Syncing
- Verify permissions are granted in device settings
- Check native logs in Xcode/Android Studio
- Ensure HealthKit capability is added (iOS)

---

## Next Steps

Once all services are configured:

1. Build the app: `npm run build`
2. Sync to native: `npx cap sync`
3. Test on real devices
4. Deploy to App Store / Play Store

For questions, check the [Firebase Docs](https://firebase.google.com/docs) or [Stripe Docs](https://stripe.com/docs).
