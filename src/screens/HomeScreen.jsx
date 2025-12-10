import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { userAPI, deviceAPI, hotspotAPI, eventAPI } from '../services/api';
import { COLORS } from '../constants/colors';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDevices: 0,
    totalHotspots: 0,
    recentEvents: 0,
    onlineDevices: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      if (isAdmin) {
        // Admin gets full statistics
        const [usersRes, devicesRes, hotspotsRes, eventsRes] = await Promise.all([
          userAPI.getAll().catch(() => ({ data: [] })),
          deviceAPI.getAll().catch(() => ({ data: [] })),
          hotspotAPI.getAll().catch(() => ({ data: [] })),
          eventAPI.getAll().catch(() => ({ data: [] })),
        ]);

        const onlineDevices = devicesRes.data.filter(d => d.status === 'online').length;

        setStats({
          totalUsers: usersRes.data.length,
          totalDevices: devicesRes.data.length,
          totalHotspots: hotspotsRes.data.length,
          recentEvents: eventsRes.data.slice(0, 10).length,
          onlineDevices,
        });
      } else {
        // Regular users get limited stats
        const hotspotsRes = await hotspotAPI.getAll().catch(() => ({ data: [] }));
        setStats({
          totalHotspots: hotspotsRes.data.length,
        });
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const StatCard = ({ icon, title, value, color, onPress }) => (
    <TouchableOpacity
      style={[styles.statCard, { borderLeftColor: color }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.name} 🐘</Text>
        </View>
        <View style={styles.roleContainer}>
          <Text style={styles.roleText}>{user?.role?.toUpperCase()}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Statistics Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isAdmin ? 'Dashboard Overview' : 'Quick Stats'}
          </Text>

          <View style={styles.statsGrid}>
            {isAdmin && (
              <>
                <StatCard
                  icon="people"
                  title="Total Users"
                  value={stats.totalUsers}
                  color={COLORS.primary}
                />
                <StatCard
                  icon="hardware-chip"
                  title="Total Devices"
                  value={stats.totalDevices}
                  color="#3b82f6"
                />
                <StatCard
                  icon="checkmark-circle"
                  title="Online Devices"
                  value={stats.onlineDevices}
                  color={COLORS.success}
                />
              </>
            )}
            <StatCard
              icon="location"
              title="Active Hotspots"
              value={stats.totalHotspots}
              color="#f59e0b"
            />
            {isAdmin && (
              <StatCard
                icon="pulse"
                title="Recent Events"
                value={stats.recentEvents}
                color="#ef4444"
              />
            )}
          </View>
        </View>

        {/* Admin Features */}
        {isAdmin && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Admin Tools</Text>
            <View style={styles.toolsGrid}>
              <TouchableOpacity 
                style={styles.toolCard}
                onPress={() => navigation.navigate('UserManagement')}
              >
                <Ionicons name="people-outline" size={32} color={COLORS.primary} />
                <Text style={styles.toolTitle}>User Management</Text>
                <Text style={styles.toolSubtitle}>Manage all users</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.toolCard}
                onPress={() => navigation.navigate('DeviceManagement')}
              >
                <Ionicons name="hardware-chip-outline" size={32} color="#3b82f6" />
                <Text style={styles.toolTitle}>Device Management</Text>
                <Text style={styles.toolSubtitle}>Monitor devices</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.toolCard}>
                <Ionicons name="bar-chart-outline" size={32} color="#8b5cf6" />
                <Text style={styles.toolTitle}>Analytics</Text>
                <Text style={styles.toolSubtitle}>View statistics</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.toolCard}>
                <Ionicons name="settings-outline" size={32} color="#6b7280" />
                <Text style={styles.toolTitle}>Settings</Text>
                <Text style={styles.toolSubtitle}>System config</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Hotspots')}
          >
            <View style={styles.actionContent}>
              <Ionicons name="location" size={24} color={COLORS.primary} />
              <View style={styles.actionText}>
                <Text style={styles.actionTitle}>View Hotspots</Text>
                <Text style={styles.actionSubtitle}>
                  {isAdmin ? 'Manage elephant hotspots' : 'View active hotspots'}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color={COLORS.textLight} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Notifications')}
          >
            <View style={styles.actionContent}>
              <Ionicons name="notifications" size={24} color={COLORS.primary} />
              <View style={styles.actionText}>
                <Text style={styles.actionTitle}>Notifications</Text>
                <Text style={styles.actionSubtitle}>
                  {isAdmin ? 'Send & view notifications' : 'View your notifications'}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color={COLORS.textLight} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('DeviceMap')}
          >
            <View style={styles.actionContent}>
              <Ionicons name="map" size={24} color="#3b82f6" />
              <View style={styles.actionText}>
                <Text style={styles.actionTitle}>Device Locations</Text>
                <Text style={styles.actionSubtitle}>
                  View all devices on map
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color={COLORS.textLight} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('EventsMap')}
          >
            <View style={styles.actionContent}>
              <Ionicons name="pulse" size={24} color="#ef4444" />
              <View style={styles.actionText}>
                <Text style={styles.actionTitle}>Elephant Detections</Text>
                <Text style={styles.actionSubtitle}>
                  View detection events on map
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color={COLORS.textLight} />
          </TouchableOpacity>
        </View>

        
      </ScrollView>
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
  greeting: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  roleContainer: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  roleText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statTitle: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  toolCard: {
    flex: 1,
    minWidth: '47%',
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
  toolTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 8,
    textAlign: 'center',
  },
  toolSubtitle: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
    textAlign: 'center',
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionText: {
    marginLeft: 12,
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  actionSubtitle: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 2,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary + '10',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.text,
    marginTop: 4,
    lineHeight: 20,
  },
});
