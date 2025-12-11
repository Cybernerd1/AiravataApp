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
import { Audio } from 'expo-av';
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
      // Configure audio mode for alerts
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        interruptionModeIOS: 1,
        interruptionModeAndroid: 1,
      });

      // Using system notification sound as fallback
      // To use custom alarm sound, add alarm.mp3 to assets folder and uncomment:
      const { sound: alertSound } = await Audio.Sound.createAsync(
        require('../../../assets/alarm.WAV'),
        { shouldPlay: true, isLooping: true, volume: 1.0 }
      );
      
      // For now, we'll rely on the notification sound from expo-notifications
      // and vibration for the alarm effect
      console.log('Alarm triggered - using vibration');
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
          {/* Alert Header with Icon */}
          <View style={[
            styles.alertHeader,
            { backgroundColor: isProximityAlert ? COLORS.danger : '#ef4444' }
          ]}>
            <Ionicons
              name={isElephantAlert ? "warning" : "notifications"}
              size={48}
              color={COLORS.white}
            />
            <Text style={styles.headerTitle}>
              {isElephantAlert ? 'ELEPHANT ALERT!' : 
               isProximityAlert ? 'PROXIMITY ALERT!' : 
               'NOTIFICATION'}
            </Text>
          </View>

          {/* Alert Body */}
          <View style={styles.alertBody}>
            {/* Alert Message */}
            <Text style={styles.alertTitle}>
              {isElephantAlert ? 'Elephant Detected Nearby!' : 
               isProximityAlert ? 'You are near a danger zone!' : 
               'New Alert'}
            </Text>

            <Text style={styles.alertMessage}>
              {alertData.title || alertData.message}
            </Text>

            {/* Location Info */}
            {alertData.latitude && alertData.longitude && (
              <View style={styles.locationInfo}>
                <Ionicons name="location" size={18} color={COLORS.danger} />
                <Text style={styles.locationText}>
                  {alertData.latitude.toFixed(6)}, {alertData.longitude.toFixed(6)}
                </Text>
              </View>
            )}

            {/* Additional Info */}
            <View style={styles.infoContainer}>
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
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            {/* View Button */}
            {alertData.latitude && alertData.longitude && (
              <TouchableOpacity
                style={styles.viewButton}
                onPress={handleViewLocation}
              >
                <Ionicons name="map" size={20} color={COLORS.white} />
                <Text style={styles.viewButtonText}>View</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  alertHeader: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: 1,
  },
  alertBody: {
    padding: 20,
    backgroundColor: '#ffffff',
  },
  alertTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  alertMessage: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  locationText: {
    fontSize: 13,
    color: '#991b1b',
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  infoContainer: {
    gap: 8,
    marginTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 6,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    paddingTop: 0,
    backgroundColor: '#ffffff',
  },
  viewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 10,
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
    backgroundColor: '#e5e7eb',
    paddingVertical: 14,
    borderRadius: 10,
    elevation: 2,
  },
  dismissButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
