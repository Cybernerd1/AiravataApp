# 🧪 Testing Real-Time Alerts

## ✅ What Works in Expo Go:

- ✅ **WebSocket Alerts** - Alert modal shows immediately
- ✅ **Vibration** - Phone vibrates
- ✅ **Navigation** - View Location button works
- ❌ **Push Notifications** - Only work in built APK (not Expo Go)

---

## 🚀 How to Test Alerts:

### **Method 1: Trigger from Backend API (Recommended)**

Use Postman, Thunder Client, or curl to send a test event:

#### **Test Elephant Detection:**

```bash
POST https://sih-saksham.onrender.com/api/events/receive
Content-Type: application/json

{
  "device_id": "TEST-DEVICE-001",
  "latitude": 21.34,
  "longitude": 82.75,
  "confidence": 0.95,
  "battery_percentage": 85
}
```

**What happens:**
1. Backend receives event
2. WebSocket broadcasts to all connected clients
3. **Alert modal appears on ALL devices**
4. Phone vibrates
5. User can view location or dismiss

---

#### **Test Admin Notification:**

```bash
POST https://sih-saksham.onrender.com/api/notifications/send-all
Content-Type: application/json
Authorization: Bearer YOUR_ADMIN_TOKEN

{
  "title": "Test Alert",
  "body": "This is a test notification from admin"
}
```

**What happens:**
1. Backend broadcasts notification
2. WebSocket sends to all clients
3. **Alert modal appears**
4. Phone vibrates

---

### **Method 2: Use Postman**

1. **Open Postman**
2. **Create new POST request**
3. **URL:** `https://sih-saksham.onrender.com/api/events/receive`
4. **Headers:** `Content-Type: application/json`
5. **Body (raw JSON):**
```json
{
  "device_id": "POSTMAN-TEST",
  "latitude": 21.34,
  "longitude": 82.75,
  "confidence": 0.95
}
```
6. **Click Send**
7. **Watch your phone** - Alert should appear!

---

### **Method 3: Use curl (Command Line)**

```bash
curl -X POST https://sih-saksham.onrender.com/api/events/receive \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "CURL-TEST",
    "latitude": 21.34,
    "longitude": 82.75,
    "confidence": 0.95
  }'
```

---

## 📱 What You Should See:

### **On Mobile App:**

1. ✅ Alert modal appears (full screen)
2. ✅ Phone vibrates (repeating pattern)
3. ✅ Shows elephant emoji 🐘
4. ✅ Shows location, confidence, device
5. ✅ Two buttons: "View Location" & "Dismiss"

### **In Console:**

```
✅ WebSocket connected
🐘 Elephant detected! {device_id: "TEST-DEVICE-001", ...}
```

---

## 🔍 Troubleshooting:

### **Alert Not Showing?**

**Check Console Logs:**
```
LOG  ✅ WebSocket connected  ← Should see this
LOG  🐘 Elephant detected!   ← Should see this when event triggered
```

**If WebSocket not connected:**
- Make sure you're logged in
- Check internet connection
- Backend must be running

**If Event not received:**
- Check backend is running
- Verify WebSocket URL in `.env`
- Try triggering event again

---

### **Push Notifications Not Working?**

**This is NORMAL in Expo Go!**

Push notifications only work in:
- ✅ Built APK
- ✅ Development build
- ❌ Expo Go (limitation)

**But WebSocket alerts work perfectly!**

---

## 🎯 Quick Test Steps:

1. **Open app on phone** (Expo Go)
2. **Login**
3. **Check console:** Should see "✅ WebSocket connected"
4. **Open Postman** (or use curl)
5. **Send POST request** to `/api/events/receive`
6. **Watch phone** - Alert appears!
7. **Tap "View Location"** - Map opens!
8. **Tap "Dismiss"** - Alert closes!

---

## 📊 Expected Behavior:

### **Single Device:**
- Send event → Alert appears → Vibrates

### **Multiple Devices:**
- Send event → **ALL devices get alert simultaneously**
- All phones vibrate
- All show same elephant location

---

## 🔔 About Push Notifications:

**In Expo Go:**
- ❌ Remote push notifications don't work
- ✅ Local notifications work (when app is open)
- ✅ WebSocket alerts work perfectly

**In Built APK:**
- ✅ Remote push notifications work
- ✅ Local notifications work
- ✅ WebSocket alerts work
- ✅ Notifications even when app is closed

---

## 🚀 Test Now!

**Easiest way:**

1. Open Postman
2. POST to: `https://sih-saksham.onrender.com/api/events/receive`
3. Body:
```json
{
  "device_id": "TEST",
  "latitude": 21.34,
  "longitude": 82.75,
  "confidence": 0.95
}
```
4. Send!
5. Watch your phone! 📱

---

## ✅ What's Working:

- ✅ WebSocket real-time connection
- ✅ Alert modal with vibration
- ✅ View location on map
- ✅ Distance calculation
- ✅ Danger zones
- ✅ Works on multiple devices simultaneously

## ❌ What Doesn't Work in Expo Go:

- ❌ Push notifications (FCM)
- ❌ Background notifications

**Solution:** Build APK for full functionality!

---

**Your real-time alert system is working!** 🎉

Just trigger an event from the backend and watch the magic happen! ✨
