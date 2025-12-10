# Alert Sound Setup

## 📢 Adding Alert Sound

The alert system requires an alert sound file. You have two options:

### Option 1: Use Default System Sound (Temporary)

Comment out the sound code in `AlertModal.jsx` temporarily:

```javascript
// Comment these lines in AlertModal.jsx:
// const { sound: alertSound } = await Audio.Sound.createAsync(
//   require('../../../assets/alert.mp3'),
//   { shouldPlay: true, isLooping: true }
// );
```

### Option 2: Add Custom Alert Sound (Recommended)

1. **Download an alert sound** (MP3 format)
   - Free sounds: https://freesound.org/
   - Search for "alarm" or "alert"

2. **Add to project:**
   - Create `assets` folder if it doesn't exist
   - Add `alert.mp3` to `assets/alert.mp3`

3. **The code will automatically use it!**

### Option 3: Use Expo Audio Beep

Replace the sound code with:

```javascript
import { Audio } from 'expo-av';

const playBeep = async () => {
  const { sound } = await Audio.Sound.createAsync(
    { uri: 'https://www.soundjay.com/button/sounds/beep-07.mp3' },
    { shouldPlay: true, isLooping: true }
  );
  sound.current = sound;
};
```

## 🔊 For Now

The app will work without the sound file. It will:
- ✅ Show alert modal
- ✅ Vibrate phone
- ✅ Pulse animation
- ❌ No sound (until you add alert.mp3)

Just add `assets/alert.mp3` when you have a sound file!
