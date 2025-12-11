import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { deviceAPI } from '../services/api';
import { COLORS } from '../constants/colors';

export default function DeviceMapScreen({ navigation }) {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [region, setRegion] = useState({
    latitude: 21.34,
    longitude: 82.75,
    latitudeDelta: 10,
    longitudeDelta: 10,
  });

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      setLoading(true);
      const response = await deviceAPI.getAll();
      const devicesData = response.data;
      setDevices(devicesData);

      // Center map on first device if available
      if (devicesData.length > 0 && devicesData[0].latitude && devicesData[0].longitude) {
        setRegion({
          latitude: parseFloat(devicesData[0].latitude),
          longitude: parseFloat(devicesData[0].longitude),
          latitudeDelta: 5,
          longitudeDelta: 5,
        });
      }
    } catch (error) {
      console.error('Error loading devices:', error);
      if (error.response?.status !== 401) {
        Alert.alert('Error', 'Failed to load devices');
      }
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDevices();
    setRefreshing(false);
  };

  const handleMarkerPress = (device) => {
    setSelectedDevice(device);
  };

  const getMarkerColor = (status) => {
    return status === 'online' ? '#10b981' : '#6b7280';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Device Locations</Text>
        <TouchableOpacity onPress={onRefresh}>
          <Ionicons name="refresh" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <View style={[styles.statusDot, { backgroundColor: COLORS.primary }]} />
          <Text style={styles.statText}>Total: {devices.length}</Text>
        </View>
        <View style={styles.statItem}>
          <View style={[styles.statusDot, { backgroundColor: COLORS.success }]} />
          <Text style={styles.statText}>
            Online: {devices.filter(d => d.status === 'online').length}
          </Text>
        </View>
        <View style={styles.statItem}>
          <View style={[styles.statusDot, { backgroundColor: COLORS.textLight }]} />
          <Text style={styles.statText}>
            Offline: {devices.filter(d => d.status !== 'online').length}
          </Text>
        </View>
      </View>

      {/* Map - Using default provider (OpenStreetMap) */}
      <MapView
        style={styles.map}
        initialRegion={region}
        region={region}
        onRegionChangeComplete={setRegion}
      >
        {devices.map((device) => {
          if (device.latitude && device.longitude) {
            return (
              <Marker
                key={device.id}
                coordinate={{
                  latitude: parseFloat(device.latitude),
                  longitude: parseFloat(device.longitude),
                }}
                pinColor={getMarkerColor(device.status)}
                onPress={() => handleMarkerPress(device)}
                title={device.device_id}
                description={device.description || 'No description'}
              >
                <View style={styles.markerContainer}>
                  <View style={[
                    styles.marker,
                    { backgroundColor: getMarkerColor(device.status) }
                  ]}>
                    <Ionicons name="hardware-chip" size={20} color={COLORS.white} />
                  </View>
                </View>
              </Marker>
            );
          }
          return null;
        })}
      </MapView>

      {/* Selected Device Info */}
      {selectedDevice && (
        <View style={styles.deviceInfo}>
          <View style={styles.deviceInfoHeader}>
            <View>
              <Text style={styles.deviceId}>{selectedDevice.device_id}</Text>
              <Text style={styles.deviceDescription}>
                {selectedDevice.description || 'No description'}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setSelectedDevice(null)}>
              <Ionicons name="close-circle" size={24} color={COLORS.textLight} />
            </TouchableOpacity>
          </View>

          <View style={styles.deviceDetails}>
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={16} color={COLORS.textLight} />
              <Text style={styles.detailText}>
                {selectedDevice.latitude.toFixed(6)}, {selectedDevice.longitude.toFixed(6)}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons
                name="radio-button-on"
                size={16}
                color={selectedDevice.status === 'online' ? COLORS.success : COLORS.textLight}
              />
              <Text style={styles.detailText}>
                Status: {selectedDevice.status === 'online' ? 'Online' : 'Offline'}
              </Text>
            </View>

            {selectedDevice.battery_percentage !== null && (
              <View style={styles.detailRow}>
                <Ionicons
                  name="battery-half-outline"
                  size={16}
                  color={selectedDevice.battery_percentage < 20 ? COLORS.danger : COLORS.textLight}
                />
                <Text style={styles.detailText}>
                  Battery: {selectedDevice.battery_percentage}%
                </Text>
              </View>
            )}

            {selectedDevice.last_seen && (
              <View style={styles.detailRow}>
                <Ionicons name="time-outline" size={16} color={COLORS.textLight} />
                <Text style={styles.detailText}>
                  Last seen: {new Date(selectedDevice.last_seen).toLocaleString()}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
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
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statText: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '500',
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: 'center',
  },
  marker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  deviceInfo: {
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
  deviceInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  deviceId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  deviceDescription: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 2,
  },
  deviceDetails: {
    gap: 10,
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
});
