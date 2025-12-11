import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

/**
 * Test Notification Component
 * 
 * Add this to your HomeScreen or any screen to test notifications
 * 
 * Usage:
 * import TestNotificationButton from './components/TestNotificationButton';
 * 
 * Then in your render:
 * <TestNotificationButton />
 */

export default function TestNotificationButton() {
    const testLocalNotification = async () => {
        try {
            // Check permissions first
            const { status } = await Notifications.getPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert(
                    'Permission Required',
                    'Notification permission is not granted. Please enable it in settings.',
                    [{ text: 'OK' }]
                );
                return;
            }

            // Send test notification
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: "🐘 Test Notification",
                    body: 'If you see this, notifications are working!',
                    sound: 'alarm.mp3',
                    priority: Notifications.AndroidNotificationPriority.MAX,
                    vibrate: [0, 250, 250, 250],
                    badge: 1,
                    data: { test: true },
                    channelId: 'critical-alerts',
                },
                trigger: null, // Show immediately
            });

            Alert.alert(
                'Success!',
                'Test notification sent. Check your notification tray.',
                [{ text: 'OK' }]
            );

            console.log('✅ Test notification sent successfully');
        } catch (error) {
            console.error('❌ Test notification error:', error);
            Alert.alert(
                'Error',
                `Failed to send notification: ${error.message}`,
                [{ text: 'OK' }]
            );
        }
    };

    const checkNotificationStatus = async () => {
        try {
            const { status } = await Notifications.getPermissionsAsync();

            let message = `Permission Status: ${status}\n\n`;

            if (status === 'granted') {
                try {
                    const token = await Notifications.getExpoPushTokenAsync({
                        projectId: '6a598bb0-9f63-46b8-848e-df8cc1ab822b'
                    });
                    message += `Push Token: ${token.data.substring(0, 30)}...\n\n`;
                } catch (e) {
                    message += `Push Token Error: ${e.message}\n\n`;
                }
            }

            // Check notification channels (Android only)
            if (Platform.OS === 'android') {
                const channels = await Notifications.getNotificationChannelsAsync();
                message += `Channels: ${channels.length} found\n`;
                channels.forEach(channel => {
                    message += `- ${channel.name} (${channel.id})\n`;
                });
            }

            Alert.alert('Notification Status', message, [{ text: 'OK' }]);
            console.log('Notification Status:', message);
        } catch (error) {
            Alert.alert('Error', error.message, [{ text: 'OK' }]);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🧪 Notification Testing</Text>

            <TouchableOpacity
                style={styles.button}
                onPress={testLocalNotification}
            >
                <Text style={styles.buttonText}>Send Test Notification</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={checkNotificationStatus}
            >
                <Text style={styles.buttonText}>Check Notification Status</Text>
            </TouchableOpacity>

            <Text style={styles.hint}>
                Use these buttons to verify notifications are working correctly
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        margin: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#10b981',
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
        alignItems: 'center',
    },
    secondaryButton: {
        backgroundColor: '#6366f1',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    hint: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        marginTop: 8,
    },
});
