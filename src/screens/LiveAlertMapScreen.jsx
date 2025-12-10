import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Circle, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { COLORS } from '../constants/colors';

export default function LiveAlertMapScreen({ route, navigation }) {
  const { alertData } = route.params || {};
  const [userLocation, setUserLocation] = useState(null);
  const [distance, setDistance] = useState(null);

  useEffect(() => {
    getUserLocation();
  }, []);

  useEffect(() => {
    if (userLocation && alertData?.latitude && alertData?.longitude) {
      calculateDistance();
    }
  }, [userLocation, alertData]);

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const calculateDistance = () => {
    if (!userLocation || !alertData?.latitude) return;

    const R = 6371; // Earth's radius in km
    const dLat = toRad(alertData.latitude - userLocation.latitude);
    const dLon = toRad(alertData.longitude - userLocation.longitude);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(userLocation.latitude)) *
      Math.cos(toRad(alertData.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const dist = R * c;

    setDistance(dist);
  };

  const toRad = (value) => {
    return (value * Math.PI) / 180;
  };

  const getRegion = () => {
    if (!alertData?.latitude || !alertData?.longitude) {
      return {
        latitude: 21.34,
        longitude: 82.75,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };
    }

    if (userLocation) {
      // Center between user and elephant
      const centerLat = (userLocation.latitude + alertData.latitude) / 2;
      const centerLng = (userLocation.longitude + alertData.longitude) / 2;
      
      const latDelta = Math.abs(userLocation.latitude - alertData.latitude) * 2;
      const lngDelta = Math.abs(userLocation.longitude - alertData.longitude) * 2;

      return {
        latitude: centerLat,
        longitude: centerLng,
        latitudeDelta: Math.max(latDelta, 0.05),
        longitudeDelta: Math.max(lngDelta, 0.05),
      };
    }

    return {
      latitude: alertData.latitude,
      longitude: alertData.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
  };

  const getAlertColor = () => {
    if (!distance) return '#ef4444';
    if (distance < 1) return '#ef4444'; // Red - Very close
    if (distance < 5) return '#f59e0b'; // Orange - Close
    return '#fbbf24'; // Yellow - Far
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Live Alert Map</Text>
        <TouchableOpacity onPress={getUserLocation}>
          <Ionicons name="refresh" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Distance Info */}
      {distance !== null && (
        <View style={[styles.distanceCard, { backgroundColor: getAlertColor() + '20' }]}>
          <View style={styles.distanceInfo}>
            <Ionicons name="warning" size={24} color={getAlertColor()} />
            <View style={styles.distanceText}>
              <Text style={styles.distanceLabel}>Distance from Elephant</Text>
              <Text style={[styles.distanceValue, { color: getAlertColor() }]}>
                {distance < 1 
                  ? `${(distance * 1000).toFixed(0)} meters` 
                  : `${distance.toFixed(2)} km`}
              </Text>
            </View>
          </View>
          {distance < 5 && (
            <Text style={styles.warningText}>
              {distance < 1 ? '⚠️ VERY CLOSE! Stay alert!' : '⚠️ Elephant nearby'}
            </Text>
          )}
        </View>
      )}

      {/* Map */}
      <MapView
        style={styles.map}
        initialRegion={getRegion()}
        region={getRegion()}
        provider={PROVIDER_GOOGLE}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {/* Elephant Marker */}
        {alertData?.latitude && alertData?.longitude && (
          <>
            <Marker
              coordinate={{
                latitude: alertData.latitude,
                longitude: alertData.longitude,
              }}
              title="Elephant Location"
              description={`Detected at ${new Date(alertData.detected_at).toLocaleTimeString()}`}
            >
              <View style={styles.elephantMarker}>
                <Text style={styles.elephantEmoji}>🐘</Text>
              </View>
            </Marker>

            {/* Danger Zone Circle */}
            <Circle
              center={{
                latitude: alertData.latitude,
                longitude: alertData.longitude,
              }}
              radius={1000} // 1km danger zone
              fillColor="rgba(239, 68, 68, 0.1)"
              strokeColor="rgba(239, 68, 68, 0.5)"
              strokeWidth={2}
            />

            {/* Warning Zone Circle */}
            <Circle
              center={{
                latitude: alertData.latitude,
                longitude: alertData.longitude,
              }}
              radius={5000} // 5km warning zone
              fillColor="rgba(245, 158, 11, 0.05)"
              strokeColor="rgba(245, 158, 11, 0.3)"
              strokeWidth={1}
            />
          </>
        )}

        {/* User Marker */}
        {userLocation && (
          <Marker
            coordinate={userLocation}
            title="Your Location"
            pinColor={COLORS.primary}
          >
            <View style={styles.userMarker}>
              <Ionicons name="person" size={24} color={COLORS.white} />
            </View>
          </Marker>
        )}

        {/* Line between user and elephant */}
        {userLocation && alertData?.latitude && alertData?.longitude && (
          <Polyline
            coordinates={[
              userLocation,
              { latitude: alertData.latitude, longitude: alertData.longitude },
            ]}
            strokeColor={getAlertColor()}
            strokeWidth={3}
            lineDashPattern={[10, 5]}
          />
        )}
      </MapView>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Safety Zones</Text>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
          <Text style={styles.legendText}>Danger Zone (1km)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#f59e0b' }]} />
          <Text style={styles.legendText}>Warning Zone (5km)</Text>
        </View>
      </View>

      {/* Alert Info */}
      <View style={styles.alertInfo}>
        <View style={styles.alertHeader}>
          <Text style={styles.alertTitle}>🐘 Elephant Alert</Text>
          {alertData?.confidence && (
            <View style={styles.confidenceBadge}>
              <Text style={styles.confidenceText}>
                {(alertData.confidence * 100).toFixed(0)}% Confidence
              </Text>
            </View>
          )}
        </View>

        <View style={styles.alertDetails}>
          {alertData?.source_device && (
            <View style={styles.detailRow}>
              <Ionicons name="hardware-chip" size={16} color={COLORS.textLight} />
              <Text style={styles.detailText}>Device: {alertData.source_device}</Text>
            </View>
          )}
          {alertData?.detected_at && (
            <View style={styles.detailRow}>
              <Ionicons name="time" size={16} color={COLORS.textLight} />
              <Text style={styles.detailText}>
                {new Date(alertData.detected_at).toLocaleString()}
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.safetyButton}
          onPress={() => {/* TODO: Add safety tips */}}
        >
          <Ionicons name="shield-checkmark" size={20} color={COLORS.white} />
          <Text style={styles.safetyButtonText}>Safety Guidelines</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  distanceCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  distanceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  distanceText: {
    flex: 1,
  },
  distanceLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  distanceValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  warningText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  map: {
    flex: 1,
  },
  elephantMarker: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: COLORS.white,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  elephantEmoji: {
    fontSize: 32,
  },
  userMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
    elevation: 3,
  },
  legend: {
    position: 'absolute',
    top: 80,
    right: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 11,
    color: COLORS.text,
  },
  alertInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  confidenceBadge: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  confidenceText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  alertDetails: {
    gap: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: COLORS.text,
  },
  safetyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    elevation: 3,
  },
  safetyButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
