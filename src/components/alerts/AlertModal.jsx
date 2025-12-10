import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Vibration,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// import { Audio } from 'expo-av'; // Commented out - install expo-av if you want sound
import { COLORS } from '../../constants/colors';

export default function AlertModal({ visible, onDismiss, onViewLocation, alertData }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const sound = useRef(null);

  useEffect(() => {
    if (visible) {
      // Start pulsing animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Vibrate
      if (Platform.OS === 'android') {
        Vibration.vibrate([0, 500, 200, 500], true); // Repeat vibration
      } else {
        Vibration.vibrate([0, 500, 200, 500]);
      }

      // Play alert sound
      playAlertSound();
    } else {
      // Stop animations and sound
      pulseAnim.stopAnimation();
      Vibration.cancel();
      stopAlertSound();
    }

    return () => {
      Vibration.cancel();
      stopAlertSound();
    };
  }, [visible]);

  const playAlertSound = async () => {
    try {
      // Optional: Add alert.mp3 to assets folder for custom sound
      // For now, using vibration only
      // Uncomment below when you add assets/alert.mp3:
      /*
      const { sound: alertSound } = await Audio.Sound.createAsync(
        require('../../../assets/alert.mp3'),
        { shouldPlay: true, isLooping: true }
      );
      sound.current = alertSound;
      */
    } catch (error) {
      console.log('Alert sound not available:', error);
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

  const handleViewLocation = () => {
    Vibration.cancel();
    stopAlertSound();
    onViewLocation();
  };

  if (!alertData) return null;

  const isElephantAlert = alertData.type === 'elephant_detection';
  const isProximityAlert = alertData.type === 'proximity_alert';

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleDismiss}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.alertContainer,
            { transform: [{ scale: pulseAnim }] }
          ]}
        >
          {/* Alert Icon */}
          <View style={[
            styles.iconContainer,
            { backgroundColor: isProximityAlert ? COLORS.danger : '#f59e0b' }
          ]}>
            <Ionicons
              name={isElephantAlert ? "warning" : "notifications"}
              size={60}
              color={COLORS.white}
            />
          </View>

          {/* Alert Title */}
          <Text style={styles.alertTitle}>
            {isElephantAlert ? '🐘 ELEPHANT DETECTED!' : 
             isProximityAlert ? '⚠️ PROXIMITY ALERT!' : 
             '🔔 NEW NOTIFICATION'}
          </Text>

          {/* Alert Message */}
          <Text style={styles.alertMessage}>
            {alertData.title || alertData.message}
          </Text>

          {/* Location Info */}
          {alertData.latitude && alertData.longitude && (
            <View style={styles.locationInfo}>
              <Ionicons name="location" size={16} color={COLORS.textLight} />
              <Text style={styles.locationText}>
                {alertData.latitude.toFixed(6)}, {alertData.longitude.toFixed(6)}
              </Text>
            </View>
          )}

          {/* Additional Info */}
          {alertData.confidence && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Confidence:</Text>
              <Text style={styles.infoValue}>
                {(alertData.confidence * 100).toFixed(0)}%
              </Text>
            </View>
          )}

          {alertData.source_device && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Device:</Text>
              <Text style={styles.infoValue}>{alertData.source_device}</Text>
            </View>
          )}

          {alertData.detected_at && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Time:</Text>
              <Text style={styles.infoValue}>
                {new Date(alertData.detected_at).toLocaleTimeString()}
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            {/* View Location Button */}
            {alertData.latitude && alertData.longitude && (
              <TouchableOpacity
                style={styles.viewButton}
                onPress={handleViewLocation}
              >
                <Ionicons name="map" size={20} color={COLORS.white} />
                <Text style={styles.viewButtonText}>View Location</Text>
              </TouchableOpacity>
            )}

            {/* Dismiss Button */}
            <TouchableOpacity
              style={styles.dismissButton}
              onPress={handleDismiss}
            >
              <Ionicons name="close-circle" size={20} color={COLORS.white} />
              <Text style={styles.dismissButtonText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  alertTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  alertMessage: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  locationText: {
    fontSize: 13,
    color: COLORS.text,
    fontFamily: 'monospace',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    width: '100%',
  },
  viewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    elevation: 3,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  viewButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  dismissButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.textLight,
    paddingVertical: 14,
    borderRadius: 12,
  },
  dismissButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
