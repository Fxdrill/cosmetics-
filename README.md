# 🌿 LuxeGreen Cosmetics — Setup & Deployment Guide

## Project Structure
```
luxegreen/
├── index.html          ← Homepage
├── shop.html           ← Shop / Products page
├── services.html       ← Services page
├── admin.html          ← Admin panel (login protected)
├── vercel.json         ← Vercel deployment config
├── css/
│   └── style.css       ← All styles
└── js/
    └── firebase.js     ← Firebase, Cloudinary & shared utilities
```

---

## 🔧 STEP 1 — Firebase Setup

### 1. Replace the Firebase config in `js/firebase.js`
Open `js/firebase.js` and replace the `firebaseConfig` object with your real values:
```js
const firebaseConfig = {
  apiKey: "YOUR_REAL_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 2. Enable Firestore Database
- Go to Firebase Console → Firestore Database → Create Database
- Start in **production mode**
- Add these Firestore security rules:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{doc} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /categories/{doc} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 3. Enable Firebase Authentication
- Go to Firebase Console → Authentication → Sign-in method
- Enable **Email/Password**
- Go to Users → Add User → Create your admin account (e.g. admin@luxegreen.com)

### 4. Create Firestore Indexes (if needed)
If you get index errors, Firebase will give you a link to auto-create them. Click it.

---

## ☁️ STEP 2 — Cloudinary Setup

### 1. Your cloud name is already set: `ursnauufn`

### 2. Create an Upload Preset
- Go to [cloudinary.com](https://cloudinary.com) → Settings → Upload → Upload Presets
- Click **Add upload preset**
- Set **Preset name** to: `luxegreen_unsigned`
- Set **Signing Mode** to: `Unsigned`
- (Optional) Set folder to: `luxegreen`
- Save the preset

That's it! Image uploads will now work from the admin panel.

---

## 🚀 STEP 3 — Deploy to Vercel

### Option A: Drag & Drop (Easiest)
1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click **"Add New Project"**
3. Click **"Deploy from your computer"** or drag the entire `luxegreen` folder
4. Click Deploy — you're live! 🎉

### Option B: GitHub + Vercel (Recommended)
1. Create a GitHub repo and push the `luxegreen` folder contents
2. Go to Vercel → Import Git Repository
3. Select your repo → Deploy
4. Every push to main will auto-deploy

### Option C: Vercel CLI
```bash
npm install -g vercel
cd luxegreen
vercel
```

---

## 🛒 STEP 4 — WhatsApp Number

The WhatsApp number is set in `js/firebase.js`:
```js
export const WHATSAPP_NUMBER = "2348012345678";
```
Replace with your real number (no `+`, no spaces).

---

## 💳 STEP 5 — Card Payment Gateway (Optional)

To enable real card payments, integrate **Paystack** or **Flutterwave**:

### Paystack Integration
1. Sign up at [paystack.com](https://paystack.com)
2. Get your **Public Key**
3. In `index.html` and `shop.html`, replace the `processCardPayment()` function:

```js
window.processCardPayment = () => {
  const handler = PaystackPop.setup({
    key: 'pk_live_YOUR_PAYSTACK_PUBLIC_KEY',
    email: 'customer@email.com', // collect from form
    amount: getCartTotal() * 100, // Paystack uses kobo
    currency: 'NGN',
    callback: (response) => {
      showToast('Payment successful! Ref: ' + response.reference, 'success');
      // Clear cart, show confirmation
    },
    onClose: () => {}
  });
  handler.openIframe();
};
```

Also add this script to your HTML `<head>`:
```html
<script src="https://js.paystack.co/v1/inline.js"></script>
```

---

## 👨‍💼 Admin Panel Usage

1. Go to `/admin.html`
2. Login with your Firebase Admin email & password
3. **Add Product**: Fill in name, category, price, description, upload 1-2 images
4. **Edit Product**: Click ✏️ Edit on any product row
5. **Delete Product**: Click 🗑️ Delete (with confirmation)
6. **Categories**: Add custom categories with emojis, delete unused ones

---

## 🎨 Customization

### Change Colors
Edit these CSS variables in `css/style.css`:
```css
:root {
  --green-deep: #1a3a2a;   /* Main dark green */
  --green-mid: #2d5a3d;    /* Medium green */
  --green-light: #4a8c5c;  /* Light green */
  --gold: #c9a96e;         /* Gold accent */
  --cream: #faf6f0;        /* Cream background */
}
```

### Change Logo Name
Search for `LuxeGreen` in all HTML files and replace with your brand name.

### Change Hero Images
In `index.html`, replace the Unsplash URLs in the hero slides with your own images (hosted on Cloudinary):
```html
<div class="hero-slide-bg" style="background-image: url('YOUR_IMAGE_URL')"></div>
```

---

## 📱 Features Summary

| Feature | Status |
|---------|--------|
| Homepage with 3-slide hero | ✅ |
| Best sellers carousel | ✅ |
| Services preview section | ✅ |
| Why choose us section | ✅ |
| Testimonials carousel | ✅ |
| Promo banner | ✅ |
| Newsletter form | ✅ |
| Shop with category sidebar | ✅ |
| Price range filter | ✅ |
| Category carousels (L↔R) | ✅ |
| Product popup modals | ✅ |
| 2-image slider in modal | ✅ |
| Related products in modal | ✅ |
| Services page with booking | ✅ |
| Booking via WhatsApp | ✅ |
| Shopping cart sidebar | ✅ |
| WhatsApp checkout | ✅ |
| Card payment (ready to wire) | ✅ |
| Admin login (Firebase Auth) | ✅ |
| Add/Edit/Delete products | ✅ |
| Dual image upload (Cloudinary) | ✅ |
| Add/Delete categories | ✅ |
| Mobile responsive | ✅ |
| SEO optimised | ✅ |
| Vercel ready | ✅ |

---

## 🆘 Troubleshooting

**"Firebase: Error (auth/invalid-api-key)"**
→ Your Firebase config in `js/firebase.js` has wrong/placeholder values. Replace with real config.

**Images not uploading**
→ Create the `luxegreen_unsigned` preset in Cloudinary dashboard (unsigned mode).

**Products not loading on shop page**
→ Check Firestore rules allow public reads. Check browser console for errors.

**Admin login not working**
→ Make sure Email/Password auth is enabled in Firebase and you created an admin user.

---

© 2025 LuxeGreen Cosmetics
