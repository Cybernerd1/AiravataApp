import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Circle } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { eventAPI, hotspotAPI } from '../services/api';
import { COLORS } from '../constants/colors';

export default function EventsMapScreen({ navigation }) {
  const [events, setEvents] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showHotspots, setShowHotspots] = useState(true);
  const [region, setRegion] = useState({
    latitude: 21.34,
    longitude: 82.75,
    latitudeDelta: 10,
    longitudeDelta: 10,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [eventsRes, hotspotsRes] = await Promise.all([
        eventAPI.getAll().catch(() => ({ data: [] })),
        hotspotAPI.getAll().catch(() => ({ data: [] })),
      ]);

      const eventsData = eventsRes.data;
      const hotspotsData = hotspotsRes.data;

      setEvents(eventsData);
      setHotspots(hotspotsData);

      // Center map on first event if available
      if (eventsData.length > 0 && eventsData[0].latitude && eventsData[0].longitude) {
        setRegion({
          latitude: parseFloat(eventsData[0].latitude),
          longitude: parseFloat(eventsData[0].longitude),
          latitudeDelta: 5,
          longitudeDelta: 5,
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
      if (error.response?.status !== 401) {
        Alert.alert('Error', 'Failed to load events');
      }
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleEventPress = (event) => {
    setSelectedEvent(event);
  };

  const getEventColor = (confidence) => {
    if (confidence >= 0.8) return '#ef4444'; // High confidence - Red
    if (confidence >= 0.5) return '#f59e0b'; // Medium confidence - Orange
    return '#fbbf24'; // Low confidence - Yellow
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const eventTime = new Date(timestamp);
    const diffMs = now - eventTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Elephant Detections</Text>
        <TouchableOpacity onPress={onRefresh}>
          <Ionicons name="refresh" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Ionicons name="pulse" size={16} color={COLORS.danger} />
          <Text style={styles.statText}>Events: {events.length}</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="location" size={16} color={COLORS.primary} />
          <Text style={styles.statText}>Hotspots: {hotspots.length}</Text>
        </View>
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setShowHotspots(!showHotspots)}
        >
          <Ionicons 
            name={showHotspots ? "eye" : "eye-off"} 
            size={16} 
            color={COLORS.primary} 
          />
          <Text style={styles.toggleText}>
            {showHotspots ? 'Hide' : 'Show'} Hotspots
          </Text>
        </TouchableOpacity>
      </View>

      {/* Map - Using OpenStreetMap */}
      <MapView
        style={styles.map}
        initialRegion={region}
        region={region}
        onRegionChangeComplete={setRegion}
      >
        {/* Elephant Detection Events */}
        {events.map((event) => {
          if (event.latitude && event.longitude) {
            const confidence = event.confidence || 0.5;
            return (
              <Marker
                key={event.id}
                coordinate={{
                  latitude: parseFloat(event.latitude),
                  longitude: parseFloat(event.longitude),
                }}
                onPress={() => handleEventPress(event)}
              >
                <View style={styles.markerContainer}>
                  <View style={[
                    styles.eventMarker,
                    { backgroundColor: getEventColor(confidence) }
                  ]}>
                    <Text style={styles.elephantEmoji}>🐘</Text>
                  </View>
                  <View style={[
                    styles.markerPulse,
                    { borderColor: getEventColor(confidence) }
                  ]} />
                </View>
              </Marker>
            );
          }
          return null;
        })}

        {/* Hotspots with Circles */}
        {showHotspots && hotspots.map((hotspot) => {
          if (hotspot.latitude && hotspot.longitude && hotspot.is_active) {
            return (
              <React.Fragment key={hotspot.id}>
                <Circle
                  center={{
                    latitude: parseFloat(hotspot.latitude),
                    longitude: parseFloat(hotspot.longitude),
                  }}
                  radius={500} // 500 meters radius
                  fillColor="rgba(16, 185, 129, 0.1)"
                  strokeColor="rgba(16, 185, 129, 0.5)"
                  strokeWidth={2}
                />
                <Marker
                  coordinate={{
                    latitude: parseFloat(hotspot.latitude),
                    longitude: parseFloat(hotspot.longitude),
                  }}
                  pinColor={COLORS.primary}
                  title={hotspot.name}
                  description={hotspot.type}
                >
                  <View style={styles.hotspotMarker}>
                    <Ionicons name="location" size={24} color={COLORS.primary} />
                  </View>
                </Marker>
              </React.Fragment>
            );
          }
          return null;
        })}
      </MapView>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Legend</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
            <Text style={styles.legendText}>High Alert</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#f59e0b' }]} />
            <Text style={styles.legendText}>Medium</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#fbbf24' }]} />
            <Text style={styles.legendText}>Low</Text>
          </View>
          <View style={styles.legendItem}>
            <Ionicons name="location" size={16} color={COLORS.primary} />
            <Text style={styles.legendText}>Hotspot</Text>
          </View>
        </View>
      </View>

      {/* Selected Event Info */}
      {selectedEvent && (
        <View style={styles.eventInfo}>
          <View style={styles.eventInfoHeader}>
            <View style={styles.eventHeaderLeft}>
              <Text style={styles.elephantEmojiLarge}>🐘</Text>
              <View>
                <Text style={styles.eventTitle}>Elephant Detected</Text>
                <Text style={styles.eventTime}>
                  {getTimeAgo(selectedEvent.detected_at)}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setSelectedEvent(null)}>
              <Ionicons name="close-circle" size={24} color={COLORS.textLight} />
            </TouchableOpacity>
          </View>

          <View style={styles.eventDetails}>
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={16} color={COLORS.textLight} />
              <Text style={styles.detailText}>
                {selectedEvent.latitude.toFixed(6)}, {selectedEvent.longitude.toFixed(6)}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="hardware-chip-outline" size={16} color={COLORS.textLight} />
              <Text style={styles.detailText}>
                Device: {selectedEvent.source_device}
              </Text>
            </View>

            {selectedEvent.confidence !== null && (
              <View style={styles.detailRow}>
                <Ionicons name="analytics-outline" size={16} color={COLORS.textLight} />
                <Text style={styles.detailText}>
                  Confidence: {(selectedEvent.confidence * 100).toFixed(0)}%
                </Text>
              </View>
            )}

            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={16} color={COLORS.textLight} />
              <Text style={styles.detailText}>
                {new Date(selectedEvent.detected_at).toLocaleString()}
              </Text>
            </View>
          </View>

          <View style={[
            styles.alertBadge,
            { backgroundColor: getEventColor(selectedEvent.confidence || 0.5) + '20' }
          ]}>
            <Text style={[
              styles.alertText,
              { color: getEventColor(selectedEvent.confidence || 0.5) }
            ]}>
              {selectedEvent.confidence >= 0.8 ? 'HIGH ALERT' : 
               selectedEvent.confidence >= 0.5 ? 'MEDIUM ALERT' : 'LOW ALERT'}
            </Text>
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
    alignItems: 'center',
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
  statText: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '500',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: COLORS.primary + '10',
  },
  toggleText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventMarker: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
  elephantEmoji: {
    fontSize: 24,
  },
  markerPulse: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    opacity: 0.3,
  },
  hotspotMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
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
  legendItems: {
    gap: 6,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
  eventInfo: {
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
  eventInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  eventHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  elephantEmojiLarge: {
    fontSize: 32,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  eventTime: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 2,
  },
  eventDetails: {
    gap: 10,
    marginBottom: 12,
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
  alertBadge: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  alertText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
