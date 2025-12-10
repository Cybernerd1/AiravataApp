# 📦 Build APK Guide - Airavata App

## 🎯 How to Build APK

There are **3 methods** to build an APK for your Airavata app:

---

## ✅ **Method 1: EAS Build (Recommended)**

This is the easiest and most reliable method using Expo's cloud build service.

### **Step 1: Install EAS CLI**
```bash
npm install -g eas-cli
```

### **Step 2: Login to Expo**
```bash
eas login
```
*If you don't have an account, create one at https://expo.dev*

### **Step 3: Configure EAS**
```bash
eas build:configure
```
*This will create an `eas.json` file*

### **Step 4: Build APK**
```bash
eas build -p android --profile preview
```

**Options:**
- `--profile preview` - Builds APK (installable file)
- `--profile production` - Builds AAB (for Play Store)

### **Step 5: Download APK**
- Build will take 10-20 minutes
- You'll get a download link when done
- Download the APK and install on your Android device

---

## 🔧 **Method 2: Local Build with Expo**

Build APK locally without cloud service.

### **Step 1: Install Android Studio**
Download from: https://developer.android.com/studio

### **Step 2: Set up Android SDK**
- Open Android Studio
- Go to Settings → Android SDK
- Install SDK Platform 33 (Android 13)
- Install SDK Build-Tools

### **Step 3: Set Environment Variables**
```bash
# Windows (PowerShell)
$env:ANDROID_HOME = "C:\Users\YourName\AppData\Local\Android\Sdk"
$env:PATH += ";$env:ANDROID_HOME\platform-tools"
$env:PATH += ";$env:ANDROID_HOME\tools"

# Add to System Environment Variables permanently
```

### **Step 4: Build APK**
```bash
npx expo run:android --variant release
```

### **Step 5: Find APK**
APK will be at:
```
android\app\build\outputs\apk\release\app-release.apk
```

---

## 🚀 **Method 3: Expo Build (Classic)**

Using Expo's classic build service.

### **Step 1: Build APK**
```bash
expo build:android -t apk
```

### **Step 2: Wait for Build**
- Build takes 10-20 minutes
- You'll get a download link

### **Step 3: Download**
Download the APK from the provided link

---

## ⚙️ **Configuration Files**

### **1. Create `eas.json`** (for Method 1)

Create this file in your project root:

```json
{
  "cli": {
    "version": ">= 5.9.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "aab"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

### **2. Update `.gitignore`**

Add these lines:
```
# EAS
.eas/

# Android
android/
*.apk
*.aab
```

---

## 🗺️ **Google Maps API Key**

For maps to work in the APK, you need a Google Maps API key:

### **Step 1: Get API Key**
1. Go to https://console.cloud.google.com/
2. Create a new project
3. Enable "Maps SDK for Android"
4. Create credentials → API Key
5. Restrict the key to Android apps

### **Step 2: Add to app.json**

Replace `YOUR_GOOGLE_MAPS_API_KEY` in `app.json`:
```json
"android": {
  "config": {
    "googleMaps": {
      "apiKey": "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
    }
  }
}
```

---

## 📋 **Pre-Build Checklist**

Before building, make sure:

- ✅ All dependencies installed (`npm install`)
- ✅ App runs without errors (`npm start`)
- ✅ `.env` file configured
- ✅ Google Maps API key added (for maps)
- ✅ App name is correct in `app.json`
- ✅ Package name is unique (`com.airavata.app`)
- ✅ Version number updated

---

## 🎨 **App Icons & Splash Screen**

Make sure you have these files:

```
assets/
├── icon.png (1024x1024)
├── adaptive-icon.png (1024x1024)
└── splash-icon.png (1284x2778)
```

**If you don't have custom icons:**
```bash
# Generate default icons
npx expo install expo-splash-screen
```

---

## 🔨 **Build Commands Quick Reference**

### **EAS Build (Recommended)**
```bash
# APK for testing
eas build -p android --profile preview

# AAB for Play Store
eas build -p android --profile production

# Check build status
eas build:list
```

### **Local Build**
```bash
# Development build
npx expo run:android

# Release APK
npx expo run:android --variant release
```

### **Classic Expo Build**
```bash
# APK
expo build:android -t apk

# AAB
expo build:android -t app-bundle
```

---

## 📱 **Install APK on Device**

### **Method 1: Direct Install**
1. Transfer APK to phone via USB/Email/Drive
2. Open APK file on phone
3. Allow "Install from Unknown Sources"
4. Install the app

### **Method 2: ADB Install**
```bash
# Connect phone via USB
adb devices

# Install APK
adb install path/to/app.apk
```

---

## 🐛 **Troubleshooting**

### **Build Fails**

**Error: "Gradle build failed"**
```bash
# Clear cache
cd android
./gradlew clean
cd ..
```

**Error: "SDK not found"**
- Install Android Studio
- Set ANDROID_HOME environment variable

**Error: "Out of memory"**
```bash
# Increase memory in gradle.properties
echo "org.gradle.jvmargs=-Xmx4096m" >> android/gradle.properties
```

### **Maps Not Working**

- Check Google Maps API key
- Enable "Maps SDK for Android"
- Restrict key to your package name

### **App Crashes on Startup**

- Check logs: `adb logcat`
- Verify all dependencies installed
- Check `.env` file exists

---

## 📊 **Build Size Optimization**

To reduce APK size:

### **1. Enable ProGuard**
In `app.json`:
```json
"android": {
  "enableProguardInReleaseBuilds": true
}
```

### **2. Enable Hermes**
Already enabled in your `app.json`:
```json
"jsEngine": "hermes"
```

### **3. Remove Unused Dependencies**
```bash
npm prune
```

---

## 🚀 **Recommended: EAS Build Steps**

**Complete workflow:**

```bash
# 1. Install EAS CLI
npm install -g eas-cli

# 2. Login
eas login

# 3. Configure
eas build:configure

# 4. Build APK
eas build -p android --profile preview

# 5. Wait for build (10-20 mins)
# You'll get a download link

# 6. Download and install APK
```

**That's it!** ✅

---

## 📦 **Build Profiles**

### **Development**
- For testing with Expo Go
- Fastest build
```bash
eas build -p android --profile development
```

### **Preview (APK)**
- For testing on devices
- Installable APK
```bash
eas build -p android --profile preview
```

### **Production (AAB)**
- For Google Play Store
- Optimized bundle
```bash
eas build -p android --profile production
```

---

## 🎯 **Quick Start (Easiest Method)**

**Just run these 4 commands:**

```bash
# 1. Install EAS
npm install -g eas-cli

# 2. Login to Expo
eas login

# 3. Configure
eas build:configure

# 4. Build APK
eas build -p android --profile preview
```

**Wait 10-20 minutes, download APK, install on phone!** 🎉

---

## 📝 **Build Information**

**Your App Details:**
- Name: Airavata
- Package: com.airavata.app
- Version: 1.0.0
- Version Code: 1
- Min SDK: 21 (Android 5.0)
- Target SDK: 33 (Android 13)

**Features:**
- Location services
- Push notifications
- Maps integration
- Background services

---

## ✅ **Final Checklist**

Before submitting to Play Store:

- [ ] Test APK on multiple devices
- [ ] All features working
- [ ] Maps displaying correctly
- [ ] Notifications working
- [ ] Login/logout working
- [ ] No crashes
- [ ] Good performance
- [ ] Privacy policy added
- [ ] App icons look good
- [ ] Splash screen displays

---

## 🎉 **You're Ready!**

Choose your method:
1. **EAS Build** - Easiest, recommended
2. **Local Build** - More control
3. **Classic Expo** - Simple, cloud-based

**Start with EAS Build for best results!**

```bash
eas build -p android --profile preview
```

Good luck! 🚀
