# 🚀 Airavata App - Quick Start Guide

## ✅ All Issues Fixed!

Both errors have been resolved:
1. ✅ "String cannot be cast to Boolean" - Fixed with enhanced error handling
2. ✅ "Unable to resolve module react-native-screens" - Fixed by reinstalling packages

## 🎯 Start the App

### Method 1: Start with Clear Cache (Recommended)
```bash
npx expo start --clear
```

### Method 2: Normal Start
```bash
npm start
```

### Method 3: Start with Full Reset
```bash
npx expo start --clear --reset-cache
```

## 📱 Running on Device

After starting the server, you'll see a QR code. Choose your platform:

### Android
1. Install **Expo Go** from Play Store
2. Open Expo Go app
3. Scan the QR code from terminal

### iOS
1. Install **Expo Go** from App Store
2. Open Camera app
3. Scan the QR code from terminal
4. Tap the notification to open in Expo Go

### Web (for testing)
Press `w` in the terminal

## 🔧 If You Encounter Errors

### Error: Module Resolution Issues
```bash
# Stop the server (Ctrl+C)
npx expo start --clear
```

### Error: Storage/Authentication Issues
1. Open the app
2. Tap "🛠️ Having issues? Clear Storage" on login screen
3. Tap "Clear Auth Storage"
4. Reload the app

### Error: Package Version Mismatch
```bash
npx expo install --check
npx expo-doctor
```

### Error: Metro Bundler Issues
```bash
# Full reset
npx expo start --clear --reset-cache
```

## 📋 Current Features

✅ **Authentication**
- Login with email/password
- User registration
- Persistent sessions
- Auto-logout on errors

✅ **UI Components**
- Modern, clean design
- Loading states
- Error handling
- Form validation

✅ **Debug Tools**
- Storage management
- Error recovery
- Easy access from login screen

## 🎨 Test Credentials

You can register a new account or use existing credentials from your backend.

### Registration
1. Tap "Sign Up" on login screen
2. Fill in:
   - Full Name (min 2 characters)
   - Email (valid format)
   - Password (min 6 characters)
   - Confirm Password (must match)
3. Tap "Create Account"

### Login
1. Enter your email
2. Enter your password
3. Tap "Sign In"

## 🔍 Verify Everything Works

### Test Checklist
- [ ] App starts without errors
- [ ] Login screen appears
- [ ] Can navigate to Register screen
- [ ] Can access Debug screen
- [ ] Form validation works
- [ ] Can register new account
- [ ] Can login with credentials
- [ ] Session persists (close/reopen app)
- [ ] Can logout (from Debug screen if needed)

## 📁 Project Structure

```
airavata/
├── src/
│   ├── components/ui/     # Reusable UI components
│   ├── constants/         # App constants (colors, etc.)
│   ├── contexts/          # React contexts (Auth)
│   ├── navigation/        # Navigation setup
│   ├── screens/           # App screens
│   │   ├── auth/         # Login, Register
│   │   └── DebugScreen   # Debug utilities
│   ├── services/          # API services
│   └── utils/            # Utility functions
├── App.jsx               # Main app component
├── app.json              # Expo configuration
└── package.json          # Dependencies
```

## 🌐 Backend API

The app connects to: `https://sih-saksham.onrender.com`

### Available Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- Plus endpoints for elephants, sightings, and alerts

## 📚 Documentation

- **AUTHENTICATION_SETUP.md** - Auth implementation details
- **IMPLEMENTATION_CHECKLIST.md** - Complete feature checklist
- **FIX_STORAGE_ERROR.md** - Storage error troubleshooting
- **FIX_MODULE_ERROR.md** - Module resolution troubleshooting
- **API_USAGE_GUIDE.js** - API usage examples

## 🆘 Quick Fixes

### App Won't Start
```bash
rm -rf node_modules
npm install
npx expo start --clear
```

### Login Issues
Use Debug screen → Clear Auth Storage

### Build Errors
```bash
npx expo-doctor
npx expo install --check
```

## 🎯 Next Steps

After verifying the app works:

1. **Add Home Screen** - Main dashboard
2. **Add Map View** - Show elephant locations
3. **Add Sightings** - Report elephant sightings
4. **Add Alerts** - Notification system
5. **Add Profile** - User profile management

## 💡 Tips

- Use `R` key to reload the app quickly
- Use `M` key to toggle menu
- Use `J` key to open debugger
- Shake device for dev menu
- Check terminal for error logs

---

**Status**: ✅ Ready to Run
**All Dependencies**: ✅ Installed
**Error Handling**: ✅ Enhanced
**Debug Tools**: ✅ Available

## 🚀 Start Now!

```bash
npx expo start --clear
```

Then scan the QR code with Expo Go app!
