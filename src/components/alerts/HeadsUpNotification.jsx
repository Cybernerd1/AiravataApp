import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Vibration,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { COLORS } from '../../constants/colors';

const { width } = Dimensions.get('window');

export default function HeadsUpNotification({ 
  visible, 
  onDismiss, 
  onViewLocation, 
  alertData 
}) {
  const slideAnim = useRef(new Animated.Value(-300)).current;
  const sound = useRef(null);

  useEffect(() => {
    if (visible) {
      // Slide down animation
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();

      // Start continuous vibration
      if (Platform.OS === 'android') {
        Vibration.vibrate([0, 500, 200, 500, 200, 500], true); // Repeat vibration
      } else {
        Vibration.vibrate([0, 500, 200, 500, 200, 500]);
      }

      // Play alert sound
      playAlertSound();

      // Auto-dismiss after 15 seconds if not interacted with
      const timeout = setTimeout(() => {
        handleDismiss();
      }, 15000);

      return () => {
        clearTimeout(timeout);
        Vibration.cancel();
        stopAlertSound();
      };
    } else {
      // Slide up animation
      Animated.timing(slideAnim, {
        toValue: -300,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const playAlertSound = async () => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        interruptionModeIOS: 1,
        interruptionModeAndroid: 1,
      });

      // Try to load custom alarm sound
      try {
        const { sound: alertSound } = await Audio.Sound.createAsync(
          require('../../../assets/alarm.WAV'),
          { shouldPlay: true, isLooping: true, volume: 1.0 }
        );
        sound.current = alertSound;
      } catch (error) {
        console.log('Custom alarm not found, using vibration only');
      }
    } catch (error) {
      console.log('Alert sound error:', error);
    }
  };

  const stopAlertSound = async () => {
    try {
      if (sound.current) {
        await sound.current.stopAsync();
        await sound.current.unloadAsync();
        sound.current = null;
      }
    } catch (error) {
      console.log('Error stopping sound:', error);
    }
  };

  const handleDismiss = () => {
    Vibration.cancel();
    stopAlertSound();
    onDismiss();
  };

  const handleView = () => {
    Vibration.cancel();
    stopAlertSound();
    onViewLocation();
  };

  if (!alertData) return null;

  const isElephantAlert = alertData.type === 'elephant_detection';

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.notificationWrapper}>
        {/* Main Notification Card */}
        <View style={styles.notificationCard}>
          {/* Left Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconEmoji}>🐘</Text>
            </View>
          </View>

          {/* Content */}
          <View style={styles.contentContainer}>
            {/* Header */}
            <View style={styles.headerRow}>
              <Text style={styles.appName}>Airavata Alert</Text>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.timeText}>now</Text>
            </View>

            {/* Title */}
            <Text style={styles.titleText} numberOfLines={1}>
              Elephant Detected!
            </Text>

            {/* Message */}
            <Text style={styles.messageText} numberOfLines={2}>
              {alertData.message || `An elephant has been detected by ${alertData.source_device || 'DEVICE-001'}`}
            </Text>

            {/* Location */}
            {alertData.latitude && alertData.longitude && (
              <View style={styles.locationRow}>
                <Ionicons name="location-sharp" size={14} color="#888" />
                <Text style={styles.locationText}>
                  Latitude {alertData.latitude.toFixed(3)}, Longitude {alertData.longitude.toFixed(3)}
                </Text>
              </View>
            )}
          </View>

          {/* Close Button */}
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={handleDismiss}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={22} color="#888" />
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.viewBtn]}
            onPress={handleView}
            activeOpacity={0.7}
          >
            <Ionicons name="eye-outline" size={18} color="#10b981" />
            <Text style={styles.viewBtnText}>VIEW</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity 
            style={[styles.actionBtn, styles.dismissBtn]}
            onPress={handleDismiss}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={18} color="#888" />
            <Text style={styles.dismissBtnText}>DISMISS</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 999,
    paddingTop: Platform.OS === 'ios' ? 50 : 10,
  },
  notificationWrapper: {
    marginHorizontal: 12,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#2a2a2a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  notificationCard: {
    backgroundColor: '#2a2a2a',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    marginRight: 12,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 28,
  },
  contentContainer: {
    flex: 1,
    paddingRight: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  appName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  bullet: {
    fontSize: 13,
    color: '#888',
    marginHorizontal: 6,
  },
  timeText: {
    fontSize: 13,
    color: '#888',
  },
  titleText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: '#bbb',
    lineHeight: 20,
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#888',
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    backgroundColor: '#3a3a3a',
    borderTopWidth: 1,
    borderTopColor: '#444',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  viewBtn: {
    backgroundColor: 'transparent',
  },
  viewBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10b981',
    letterSpacing: 0.5,
  },
  dismissBtn: {
    backgroundColor: 'transparent',
  },
  dismissBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
    letterSpacing: 0.5,
  },
  divider: {
    width: 1,
    backgroundColor: '#444',
  },
});
