import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { hotspotAPI } from '../services/api';
import { Button } from '../components/ui/Button';
import { COLORS } from '../constants/colors';

export default function HotspotsScreen({ navigation }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isOfficer = user?.role === 'officer';
  const canManage = isAdmin || isOfficer;

  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadHotspots();
  }, []);

  const loadHotspots = async () => {
    try {
      setLoading(true);
      const response = await hotspotAPI.getAll();
      setHotspots(response.data);
    } catch (error) {
      console.error('Error loading hotspots:', error);
      // Don't show alert for 401 errors
      if (error.response?.status !== 401) {
        Alert.alert('Error', 'Failed to load hotspots');
      }
      if (error.response?.status === 401) {
        setHotspots([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHotspots();
    setRefreshing(false);
  };

  const handleDelete = async (id, name) => {
    if (!isAdmin) {
      Alert.alert('Access Denied', 'Only admins can delete hotspots');
      return;
    }

    Alert.alert(
      'Delete Hotspot',
      `Are you sure you want to delete "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await hotspotAPI.delete(id);
              Alert.alert('Success', 'Hotspot deleted successfully');
              loadHotspots();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete hotspot');
            }
          },
        },
      ]
    );
  };

  const renderHotspot = ({ item }) => (
    <View style={styles.hotspotCard}>
      <View style={styles.hotspotHeader}>
        <View style={styles.hotspotInfo}>
          <Text style={styles.hotspotName}>{item.name}</Text>
          <View style={styles.typeContainer}>
            <Text style={styles.typeText}>{item.type}</Text>
          </View>
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: item.is_active ? COLORS.success : COLORS.textLight }
        ]}>
          <Text style={styles.statusText}>
            {item.is_active ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>

      {item.description && (
        <Text style={styles.description}>{item.description}</Text>
      )}

      <View style={styles.locationRow}>
        <Ionicons name="location-outline" size={16} color={COLORS.textLight} />
        <Text style={styles.coordinates}>
          {item.latitude.toFixed(6)}, {item.longitude.toFixed(6)}
        </Text>
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.metaText}>Created by: {item.created_by_name || 'Unknown'}</Text>
        <Text style={styles.metaText}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>

      {canManage && (
        <View style={styles.actions}>
          {(isAdmin || isOfficer) && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {/* TODO: Navigate to edit screen */}}
            >
              <Ionicons name="create-outline" size={20} color={COLORS.primary} />
              <Text style={styles.actionText}>Edit</Text>
            </TouchableOpacity>
          )}
          {isAdmin && (
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDelete(item.id, item.name)}
            >
              <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
              <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Hotspots</Text>
        {canManage && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {/* TODO: Navigate to create screen */}}
          >
            <Ionicons name="add-circle" size={28} color={COLORS.primary} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={hotspots}
        renderItem={renderHotspot}
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
            <Ionicons name="location-outline" size={64} color={COLORS.textLight} />
            <Text style={styles.emptyText}>No hotspots found</Text>
            {canManage && (
              <Text style={styles.emptySubtext}>
                Tap the + button to create your first hotspot
              </Text>
            )}
          </View>
        }
      />
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
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  addButton: {
    padding: 4,
  },
  listContent: {
    padding: 16,
  },
  hotspotCard: {
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
  hotspotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  hotspotInfo: {
    flex: 1,
  },
  hotspotName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  typeContainer: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  typeText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
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
  description: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 8,
    lineHeight: 20,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  coordinates: {
    fontSize: 13,
    color: COLORS.textLight,
    marginLeft: 4,
    fontFamily: 'monospace',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: COLORS.primary + '10',
    gap: 4,
  },
  deleteButton: {
    backgroundColor: COLORS.danger + '10',
  },
  actionText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  deleteText: {
    color: COLORS.danger,
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
});
