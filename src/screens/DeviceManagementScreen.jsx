import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { deviceAPI } from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { COLORS } from '../constants/colors';

export default function DeviceManagementScreen({ navigation }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  
  const [deviceForm, setDeviceForm] = useState({
    device_id: '',
    description: '',
    latitude: '',
    longitude: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      Alert.alert('Access Denied', 'Only admins can access device management');
      navigation.goBack();
      return;
    }
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      setLoading(true);
      const response = await deviceAPI.getAll();
      setDevices(response.data);
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

  const handleAddDevice = async () => {
    if (!deviceForm.device_id || !deviceForm.latitude || !deviceForm.longitude) {
      Alert.alert('Error', 'Device ID, Latitude, and Longitude are required');
      return;
    }

    const lat = parseFloat(deviceForm.latitude);
    const lng = parseFloat(deviceForm.longitude);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      Alert.alert('Error', 'Latitude must be between -90 and 90');
      return;
    }

    if (isNaN(lng) || lng < -180 || lng > 180) {
      Alert.alert('Error', 'Longitude must be between -180 and 180');
      return;
    }

    try {
      setSubmitting(true);
      await deviceAPI.create({
        device_id: deviceForm.device_id,
        description: deviceForm.description || null,
        latitude: lat,
        longitude: lng,
      });
      
      Alert.alert('Success', 'Device added successfully!');
      setDeviceForm({ device_id: '', description: '', latitude: '', longitude: '' });
      setShowAddModal(false);
      loadDevices();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to add device';
      Alert.alert('Error', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDevice = (deviceId, deviceName) => {
    Alert.alert(
      'Delete Device',
      `Are you sure you want to delete ${deviceName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deviceAPI.delete(deviceId);
              Alert.alert('Success', 'Device deleted successfully');
              loadDevices();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete device');
            }
          },
        },
      ]
    );
  };

  const renderDevice = ({ item }) => (
    <View style={styles.deviceCard}>
      <View style={styles.deviceHeader}>
        <View style={[
          styles.statusIndicator,
          { backgroundColor: item.status === 'online' ? COLORS.success : COLORS.textLight }
        ]} />
        <View style={styles.deviceInfo}>
          <Text style={styles.deviceId}>{item.device_id}</Text>
          {item.description && (
            <Text style={styles.deviceDescription}>{item.description}</Text>
          )}
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: item.status === 'online' ? COLORS.success : COLORS.textLight }
        ]}>
          <Text style={styles.statusText}>
            {item.status === 'online' ? 'Online' : 'Offline'}
          </Text>
        </View>
      </View>

      <View style={styles.deviceDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color={COLORS.textLight} />
          <Text style={styles.detailText}>
            {item.latitude.toFixed(6)}, {item.longitude.toFixed(6)}
          </Text>
        </View>

        {item.battery_percentage !== null && (
          <View style={styles.detailRow}>
            <Ionicons 
              name="battery-half-outline" 
              size={16} 
              color={item.battery_percentage < 20 ? COLORS.danger : COLORS.textLight} 
            />
            <Text style={styles.detailText}>
              Battery: {item.battery_percentage}%
            </Text>
          </View>
        )}

        {item.last_seen && (
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={16} color={COLORS.textLight} />
            <Text style={styles.detailText}>
              Last seen: {new Date(item.last_seen).toLocaleString()}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteDevice(item.id, item.device_id)}
        >
          <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Device Management</Text>
        <TouchableOpacity onPress={() => setShowAddModal(true)}>
          <Ionicons name="add-circle" size={28} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{devices.length}</Text>
          <Text style={styles.statLabel}>Total Devices</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: COLORS.success }]}>
            {devices.filter(d => d.status === 'online').length}
          </Text>
          <Text style={styles.statLabel}>Online</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: COLORS.textLight }]}>
            {devices.filter(d => d.status !== 'online').length}
          </Text>
          <Text style={styles.statLabel}>Offline</Text>
        </View>
      </View>

      <FlatList
        data={devices}
        renderItem={renderDevice}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="hardware-chip-outline" size={64} color={COLORS.textLight} />
            <Text style={styles.emptyText}>No devices found</Text>
            <Text style={styles.emptySubtext}>
              Tap the + button to add your first device
            </Text>
          </View>
        }
      />

      {/* Add Device Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Device</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <Input
              label="Device ID *"
              value={deviceForm.device_id}
              onChangeText={(text) => setDeviceForm({ ...deviceForm, device_id: text })}
              placeholder="e.g., DEV-001"
              leftIcon="hardware-chip-outline"
            />

            <Input
              label="Description"
              value={deviceForm.description}
              onChangeText={(text) => setDeviceForm({ ...deviceForm, description: text })}
              placeholder="Device description (optional)"
              leftIcon="document-text-outline"
            />

            <Input
              label="Latitude *"
              value={deviceForm.latitude}
              onChangeText={(text) => setDeviceForm({ ...deviceForm, latitude: text })}
              placeholder="e.g., 21.34"
              leftIcon="location-outline"
              keyboardType="decimal-pad"
            />

            <Input
              label="Longitude *"
              value={deviceForm.longitude}
              onChangeText={(text) => setDeviceForm({ ...deviceForm, longitude: text })}
              placeholder="e.g., 82.75"
              leftIcon="location-outline"
              keyboardType="decimal-pad"
            />

            <Button
              title={submitting ? "Adding..." : "Add Device"}
              onPress={handleAddDevice}
              loading={submitting}
              style={styles.submitButton}
            />
          </View>
        </View>
      </Modal>
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
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  listContent: {
    padding: 16,
  },
  deviceCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  deviceHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
    marginTop: 4,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceId: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  deviceDescription: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: COLORS.white,
    fontWeight: '600',
  },
  deviceDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: COLORS.danger + '10',
    gap: 4,
  },
  deleteText: {
    fontSize: 14,
    color: COLORS.danger,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textLight,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 8,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  submitButton: {
    marginTop: 8,
  },
});
