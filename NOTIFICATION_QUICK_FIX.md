# 🚀 Quick Fix Summary - Push Notifications

## ✅ What I Fixed

1. **Added `expo-notifications` plugin** to `app.json`

   - Configured notification icon, color, and sound
   - Set mode to "production"

2. **Created Android Notification Channels** in `AlertContext.jsx`

   - `default` channel for regular alerts
   - `critical-alerts` channel for high-priority alerts
   - Both configured with MAX importance to ensure visibility

3. **Fixed Expo Push Token** generation

   - Added explicit `projectId` parameter
   - Improved error logging

4. **Enhanced Notification Settings**

   - Changed priority from HIGH to MAX
   - Added proper channel assignment
   - Configured vibration patterns
   - Added badge support

5. **Added All Required Android Permissions**

   - POST_NOTIFICATIONS (Android 13+)
   - VIBRATE
   - WAKE_LOCK
   - RECEIVE_BOOT_COMPLETED

6. **Created notification-icon.png** from existing icon

---

## ⚠️ CRITICAL: You MUST Rebuild Your APK

The changes won't work until you rebuild:

```bash
# Option 1: Using EAS Build (Recommended)
eas build --platform android --profile preview

# Option 2: Local Build
npx expo prebuild --clean
npx expo run:android --variant release
```

**Why?** The `expo-notifications` plugin modifies native Android code, which only happens during the build process.

---

## 🧪 How to Test After Rebuilding

### 1. Install New APK

```bash
adb install path/to/new/app.apk
```

### 2. Grant Permissions

- Open app
- Allow notification permission when prompted
- Go to Settings > Apps > Airavata > Notifications
- Ensure all channels are enabled

### 3. Check Notification Channels

Settings > Apps > Airavata > Notifications should show:

- ✅ Elephant Alerts
- ✅ Critical Elephant Alerts

### 4. Test Notification

Trigger an elephant detection event from your backend/hardware

### 5. Check Logs

```bash
adb logcat | grep -i "notification\|push token"
```

You should see:

- "Push token: ExponentPushToken[...]"
- "Token registered with backend successfully"
- "Local notification sent: Elephant Detected!"

---

## 🔍 If Still Not Working

### Check These:

1. **Notification Permission**

   - Settings > Apps > Airavata > Permissions > Notifications = ✅

2. **Battery Optimization**

   - Settings > Battery > Battery Optimization
   - Find Airavata > Select "Don't optimize"

3. **Do Not Disturb**

   - Ensure DND is off, or
   - Add Airavata to DND exceptions

4. **Manufacturer-Specific Settings** (Xiaomi, Samsung, etc.)

   - Xiaomi: Settings > Apps > Manage apps > Airavata > Autostart = ON
   - Samsung: Settings > Apps > Airavata > Battery > Allow background activity
   - Huawei: Settings > Battery > App launch > Airavata > Manual = ON

5. **WebSocket Connection**

   - Check if WebSocket is connected: Look for connection logs
   - Verify backend is sending events

6. **Backend Token Registration**
   - Check if push token was registered with backend
   - Verify backend API endpoint is working

---

## 📱 Device-Specific Issues

### Xiaomi/MIUI

- Enable "Autostart"
- Disable "Battery Saver" for app
- Allow "Display pop-up windows while running in background"

### Samsung/One UI

- Settings > Apps > Airavata > Battery > "Allow background activity"
- Settings > Device care > Battery > App power management > Add Airavata to "Never sleeping apps"

### Huawei/EMUI

- Settings > Battery > App launch > Airavata > Manual management
- Enable all three options (Auto-launch, Secondary launch, Run in background)

### OnePlus/OxygenOS

- Settings > Apps > Airavata > Battery > Battery optimization > Don't optimize

---

## 📋 Build Checklist

Before building:

- [x] expo-notifications plugin added to app.json
- [x] Notification channels configured in code
- [x] All Android permissions added
- [x] notification-icon.png created
- [x] alarm.mp3 exists

After building:

- [ ] New APK installed on device
- [ ] Notification permission granted
- [ ] Notification channels visible in settings
- [ ] Battery optimization disabled
- [ ] Test notification received
- [ ] WebSocket connected
- [ ] Push token registered with backend

---

## 🆘 Still Having Issues?

Check the detailed guide: `NOTIFICATION_TROUBLESHOOTING.md`

Or enable debug logging:

```javascript
// Add to AlertContext.jsx
console.log("=== NOTIFICATION DEBUG ===");
console.log("User:", user);
console.log("Token:", token);
console.log("WebSocket connected:", websocketService.isConnected());
```
