# Push Notification Troubleshooting Guide

## Issues Fixed

### 1. ✅ Added expo-notifications Plugin
**Problem**: The `app.json` was missing the `expo-notifications` plugin configuration.
**Solution**: Added plugin with proper Android settings including notification icon, color, and custom sound.

### 2. ✅ Added Android Notification Channels
**Problem**: Android 8.0+ requires notification channels to be created before notifications can be displayed.
**Solution**: Created two notification channels:
- `default`: For regular elephant alerts
- `critical-alerts`: For high-priority alerts with maximum importance

### 3. ✅ Fixed Expo Push Token Configuration
**Problem**: Missing project ID when requesting push token.
**Solution**: Added explicit `projectId` parameter to `getExpoPushTokenAsync()`.

### 4. ✅ Enhanced Notification Priority
**Problem**: Notifications using generic settings that may not show in background.
**Solution**: Set `AndroidNotificationPriority.MAX` and proper channel configuration.

---

## Additional Steps Required

### Step 1: Create Notification Icon (Required)
You need a notification icon for Android. Create a simple white icon on transparent background:

**Option A - Use existing icon:**
```bash
# Copy your app icon as notification icon
cp ./assets/icon.png ./assets/notification-icon.png
```

**Option B - Create proper notification icon:**
- Size: 96x96 pixels
- Format: PNG with transparency
- Color: White icon on transparent background
- Save as: `./assets/notification-icon.png`

### Step 2: Verify alarm.mp3 Exists
Make sure you have the alarm sound file:
```
./assets/alarm.mp3
```

If missing, you'll need to add an alarm sound file or remove the sound configuration from `app.json`.

### Step 3: Add Required Android Permissions
Update your `app.json` to include all notification-related permissions:

```json
"android": {
  "permissions": [
    "ACCESS_COARSE_LOCATION",
    "ACCESS_FINE_LOCATION",
    "NOTIFICATIONS",
    "POST_NOTIFICATIONS",
    "VIBRATE",
    "RECEIVE_BOOT_COMPLETED",
    "WAKE_LOCK",
    "android.permission.ACCESS_COARSE_LOCATION",
    "android.permission.ACCESS_FINE_LOCATION",
    "android.permission.POST_NOTIFICATIONS",
    "android.permission.VIBRATE",
    "android.permission.RECEIVE_BOOT_COMPLETED",
    "android.permission.WAKE_LOCK"
  ]
}
```

### Step 4: Rebuild Your APK
After making these changes, you MUST rebuild your APK:

```bash
# Clear cache
npx expo start -c

# Build new APK
eas build --platform android --profile preview
```

Or if using local build:
```bash
npx expo prebuild --clean
npx expo run:android --variant release
```

### Step 5: Test Notifications

#### Test 1: Check Permissions
After installing the new APK, check if notification permissions are granted:
- Go to: Settings > Apps > Airavata > Notifications
- Ensure "All Airavata notifications" is ON
- Ensure "Elephant Alerts" and "Critical Elephant Alerts" channels are enabled

#### Test 2: Test Local Notifications
Add this test function to your app (temporarily):

```javascript
import * as Notifications from 'expo-notifications';

const testNotification = async () => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Test Notification 🐘",
      body: 'If you see this, notifications are working!',
      sound: 'alarm.mp3',
      priority: Notifications.AndroidNotificationPriority.MAX,
      channelId: 'critical-alerts',
    },
    trigger: null,
  });
};
```

#### Test 3: Check Logs
Use `adb logcat` to see notification-related logs:
```bash
adb logcat | grep -i "notification\|expo"
```

---

## Common Issues & Solutions

### Issue: "Notifications still not showing"
**Solutions:**
1. Check if notification permission is granted in Android settings
2. Verify the notification channel is enabled
3. Check if battery optimization is blocking notifications:
   - Settings > Battery > Battery Optimization > Airavata > Don't optimize
4. Ensure "Do Not Disturb" mode is off

### Issue: "No sound playing"
**Solutions:**
1. Verify `alarm.mp3` exists in `./assets/` folder
2. Check notification channel settings in Android
3. Ensure device volume is up and not in silent mode
4. Try using a different audio format (e.g., .wav instead of .mp3)

### Issue: "Notifications work in Expo Go but not in APK"
**Solutions:**
1. This is expected! Expo Go uses different notification system
2. You MUST rebuild the APK after adding the plugin
3. Use `eas build` or `expo prebuild` + local build

### Issue: "Push token not generating"
**Solutions:**
1. Ensure you have internet connection
2. Check if projectId in `app.json` matches the one in code
3. Verify EAS project is properly configured
4. Try: `npx expo install expo-notifications --fix`

### Issue: "Notifications only work when app is open"
**Solutions:**
1. Ensure notification channels are created (already done in code)
2. Check battery optimization settings
3. Verify `UIBackgroundModes` for iOS (already configured)
4. For Android, ensure the app has "Autostart" permission (varies by manufacturer)

---

## Testing Checklist

- [ ] Notification icon created (`./assets/notification-icon.png`)
- [ ] Alarm sound exists (`./assets/alarm.mp3`)
- [ ] Android permissions updated in `app.json`
- [ ] APK rebuilt with new configuration
- [ ] App installed on device
- [ ] Notification permission granted in Android settings
- [ ] Notification channels visible in Android settings
- [ ] Battery optimization disabled for app
- [ ] Test notification sent successfully
- [ ] WebSocket connection working
- [ ] Backend sending events properly

---

## Debugging Commands

```bash
# Check if notification channels are created
adb shell dumpsys notification | grep -A 5 "com.airavata.app"

# View all app permissions
adb shell dumpsys package com.airavata.app | grep permission

# Monitor notifications in real-time
adb logcat | grep NotificationManager

# Check if app is in battery optimization whitelist
adb shell dumpsys deviceidle whitelist | grep airavata
```

---

## Next Steps

1. **Create notification icon** (see Step 1 above)
2. **Update permissions** in `app.json` (see Step 3 above)
3. **Rebuild APK** (see Step 4 above)
4. **Test thoroughly** using the checklist above

If notifications still don't work after following all steps, check:
- Backend is sending notifications correctly
- WebSocket connection is established
- Device-specific notification restrictions (Samsung, Xiaomi, etc. have aggressive battery savers)
