# 🚀 Quick APK Build - Airavata

## ⚡ Fastest Way to Build APK

### **Option 1: EAS Build (Recommended - Cloud Build)**

```bash
# Step 1: Install EAS CLI globally
npm install -g eas-cli

# Step 2: Login to Expo (create account if needed at expo.dev)
eas login

# Step 3: Build APK
eas build -p android --profile preview
```

**What happens:**
- ✅ Build runs in the cloud (no Android Studio needed!)
- ✅ Takes 10-20 minutes
- ✅ You get a download link
- ✅ Download APK and install on phone

---

### **Option 2: Local Build (Requires Android Studio)**

```bash
# Step 1: Make sure Android Studio is installed
# Download from: https://developer.android.com/studio

# Step 2: Build release APK
npx expo run:android --variant release

# Step 3: Find APK at:
# android/app/build/outputs/apk/release/app-release.apk
```

---

## 📱 **Install APK on Phone**

### **Method 1: Direct Install**
1. Transfer APK to phone (USB/Email/Drive)
2. Open APK file
3. Allow "Install from Unknown Sources"
4. Install!

### **Method 2: ADB Install**
```bash
# Connect phone via USB
adb devices

# Install
adb install app-release.apk
```

---

## 🗺️ **Important: Google Maps API Key**

For maps to work, you need to add a Google Maps API key:

1. Go to https://console.cloud.google.com/
2. Create project → Enable "Maps SDK for Android"
3. Create API Key
4. Add to `app.json`:

```json
"android": {
  "config": {
    "googleMaps": {
      "apiKey": "YOUR_ACTUAL_API_KEY_HERE"
    }
  }
}
```

---

## ✅ **Pre-Build Checklist**

- [ ] Run `npm install` to install all dependencies
- [ ] App runs without errors (`npm start`)
- [ ] `.env` file exists with API URL
- [ ] Google Maps API key added (for maps to work)
- [ ] Test on emulator/device first

---

## 🎯 **Recommended Steps**

**For first-time build:**

```bash
# 1. Install dependencies
npm install

# 2. Test the app
npm start
# Press 'a' for Android or scan QR code

# 3. If everything works, build APK
npm install -g eas-cli
eas login
eas build -p android --profile preview

# 4. Wait for build link, download APK
# 5. Install on phone and test!
```

---

## 🐛 **Common Issues**

### **"eas: command not found"**
```bash
npm install -g eas-cli
```

### **"Not logged in"**
```bash
eas login
```

### **"Build failed"**
- Check all dependencies installed: `npm install`
- Check app runs: `npm start`
- Check `app.json` is valid JSON

### **Maps not showing**
- Add Google Maps API key to `app.json`
- Enable "Maps SDK for Android" in Google Cloud Console

---

## 📦 **Build Profiles**

### **Preview (APK) - For Testing**
```bash
eas build -p android --profile preview
```
- Builds APK file
- Can install directly on phone
- Good for testing

### **Production (AAB) - For Play Store**
```bash
eas build -p android --profile production
```
- Builds AAB file
- For Google Play Store submission
- Optimized and smaller

---

## 🎉 **That's It!**

**Simplest method:**
```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```

**Wait 10-20 minutes → Download APK → Install on phone!**

---

## 📚 **More Details**

See `BUILD_APK_GUIDE.md` for:
- Detailed instructions
- Troubleshooting
- Local build setup
- Play Store submission
- Size optimization

---

## 🚀 **Start Building Now!**

```bash
eas build -p android --profile preview
```

Good luck! 🎊
