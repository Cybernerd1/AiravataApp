# 🔧 Fix: "Unable to resolve module react-native-screens" Error

## Problem
Error: **"Unable to resolve module react-native-screens"**

This error occurs when React Navigation dependencies are not properly installed or the Metro bundler cache is stale.

## ✅ Solution Applied

### 1. Reinstalled Required Packages
```bash
npx expo install react-native-screens react-native-safe-area-context
```

### 2. Cleared Metro Cache
```bash
npx expo start --clear
```

## 🚀 Next Steps

1. **Reload the app** in your device/emulator:
   - Press `R` in the terminal, or
   - Shake your device and select "Reload"

2. **If the error persists**, try these steps in order:

### Step 1: Stop and Restart Metro
```bash
# Press Ctrl+C to stop the server
# Then restart with cache clear
npx expo start --clear
```

### Step 2: Clean Install
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
npx expo start --clear
```

### Step 3: Reset Expo Cache (Nuclear Option)
```bash
# Stop the server (Ctrl+C)
npx expo start --clear --reset-cache
```

## 📋 Common Causes

1. ❌ **Packages not installed** - Fixed by reinstalling
2. ❌ **Metro cache stale** - Fixed by clearing cache
3. ❌ **Version mismatch** - Fixed by using `npx expo install`
4. ❌ **node_modules corrupted** - Fixed by clean install

## ✅ Prevention

Always use `npx expo install` instead of `npm install` for Expo packages:

```bash
# ✅ Correct
npx expo install react-native-screens

# ❌ Avoid
npm install react-native-screens
```

This ensures version compatibility with your Expo SDK.

## 🔍 Verify Installation

Check that these packages are in your `package.json`:

```json
{
  "dependencies": {
    "react-native-screens": "~4.16.0",
    "react-native-safe-area-context": "^5.6.2",
    "@react-navigation/native": "^7.1.25",
    "@react-navigation/native-stack": "^7.8.6"
  }
}
```

## 📱 Platform-Specific Notes

### iOS
If using bare React Native (not Expo Go):
```bash
cd ios
pod install
cd ..
```

### Android
No additional steps needed for Expo Go.

## Still Having Issues?

1. Check that you're using Expo Go app (not a bare React Native setup)
2. Verify your Expo SDK version matches package versions
3. Run `npx expo-doctor` to check for issues
4. Try on a different device/emulator

---

**Status**: ✅ Fixed
**Action Taken**: Reinstalled navigation dependencies and cleared cache
**Next**: Reload the app and test
