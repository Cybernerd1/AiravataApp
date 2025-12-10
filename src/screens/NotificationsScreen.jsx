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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { notificationAPI } from '../services/api';
import { Button } from '../components/ui/Button';
import { COLORS } from '../constants/colors';

export default function NotificationsScreen() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showSendForm, setShowSendForm] = useState(false);
  const [notifTitle, setNotifTitle] = useState('');
  const [notifBody, setNotifBody] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationAPI.getMy();
      setNotifications(response.data);
    } catch (error) {
      console.error('Error loading notifications:', error);
      // Don't show alert for 401 errors (user not authenticated yet)
      if (error.response?.status !== 401) {
        Alert.alert('Error', 'Failed to load notifications');
      }
      // Set empty array for 401 errors
      if (error.response?.status === 401) {
        setNotifications([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const markAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleSendNotification = async () => {
    if (!notifTitle.trim() || !notifBody.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setSending(true);
      await notificationAPI.sendToAll(notifTitle, notifBody);
      Alert.alert('Success', 'Notification sent to all users');
      setNotifTitle('');
      setNotifBody('');
      setShowSendForm(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      style={[styles.notifCard, !item.read && styles.unreadCard]}
      onPress={() => !item.read && markAsRead(item.id)}
    >
      <View style={styles.notifHeader}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={item.read ? 'mail-open-outline' : 'mail-unread-outline'}
            size={24}
            color={item.read ? COLORS.textLight : COLORS.primary}
          />
        </View>
        <View style={styles.notifContent}>
          <Text style={[styles.notifTitle, !item.read && styles.unreadTitle]}>
            {item.title}
          </Text>
          <Text style={styles.notifBody}>{item.body}</Text>
          <Text style={styles.notifTime}>
            {new Date(item.created_at).toLocaleString()}
          </Text>
        </View>
        {!item.read && <View style={styles.unreadDot} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        {isAdmin && (
          <TouchableOpacity
            style={styles.sendButton}
            onPress={() => setShowSendForm(!showSendForm)}
          >
            <Ionicons
              name={showSendForm ? 'close-circle' : 'send'}
              size={28}
              color={COLORS.primary}
            />
          </TouchableOpacity>
        )}
      </View>

      {isAdmin && showSendForm && (
        <View style={styles.sendForm}>
          <Text style={styles.formTitle}>Send Global Notification</Text>
          <TextInput
            style={styles.input}
            placeholder="Notification Title"
            value={notifTitle}
            onChangeText={setNotifTitle}
            placeholderTextColor={COLORS.textLight}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Notification Message"
            value={notifBody}
            onChangeText={setNotifBody}
            multiline
            numberOfLines={4}
            placeholderTextColor={COLORS.textLight}
          />
          <Button
            title="Send to All Users"
            onPress={handleSendNotification}
            loading={sending}
          />
        </View>
      )}

      <FlatList
        data={notifications}
        renderItem={renderNotification}
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
            <Ionicons name="notifications-outline" size={64} color={COLORS.textLight} />
            <Text style={styles.emptyText}>No notifications yet</Text>
            <Text style={styles.emptySubtext}>
              You'll see notifications here when you receive them
            </Text>
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
  sendButton: {
    padding: 4,
  },
  sendForm: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 12,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  listContent: {
    padding: 16,
  },
  notifCard: {
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
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  notifHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    marginRight: 12,
  },
  notifContent: {
    flex: 1,
  },
  notifTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  unreadTitle: {
    color: COLORS.primary,
  },
  notifBody: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 8,
    lineHeight: 20,
  },
  notifTime: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    marginLeft: 8,
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
