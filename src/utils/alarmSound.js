// Alarm sound utility for elephant detection alerts
// This file provides a fallback alarm sound using expo-av

import { Audio } from 'expo-av';

let alarmSound = null;

export const playAlarmSound = async () => {
  try {
    // Configure audio mode for alerts
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
      interruptionModeIOS: 1,
      interruptionModeAndroid: 1,
    });

 
    
    const { sound } = await Audio.Sound.createAsync(
      require('../../assets/alarm.WAV'), 
      { 
        shouldPlay: true, 
        isLooping: true,
        volume: 1.0 
      }
    );
    
    alarmSound = sound;
    return sound;
  } catch (error) {
    console.log('Alarm sound error:', error);
    // Fallback: no sound, rely on vibration
    return null;
  }
};

export const stopAlarmSound = async () => {
  try {
    if (alarmSound) {
      await alarmSound.stopAsync();
      await alarmSound.unloadAsync();
      alarmSound = null;
    }
  } catch (error) {
    console.log('Error stopping alarm sound:', error);
  }
};
