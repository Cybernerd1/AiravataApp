import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import websocketService from '../services/websocket';
import { useAuth } from './AuthContext';
import { notificationAPI } from '../services/api';

const AlertContext = createContext();

// Configure notifications
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

export function AlertProvider({ children }) {
    const { user, token } = useAuth();
    const [alertVisible, setAlertVisible] = useState(false);
    const [currentAlert, setCurrentAlert] = useState(null);
    const [userLocation, setUserLocation] = useState(null);

    useEffect(() => {
        if (user && token) {
            // Connect to WebSocket
            websocketService.connect(token);

            // Request notification permissions
            requestNotificationPermissions();

            // Get user location
            getUserLocation();

            // Subscribe to WebSocket events
            const unsubscribeElephant = websocketService.on('new_event', handleElephantDetection);
            const unsubscribeNotification = websocketService.on('notification', handleNotification);
            const unsubscribeProximity = websocketService.on('proximity_alert', handleProximityAlert);

            return () => {
                unsubscribeElephant();
                unsubscribeNotification();
                unsubscribeProximity();
            };
        } else {
            // Disconnect when user logs out
            websocketService.disconnect();
        }
    }, [user, token]);

    const requestNotificationPermissions = async () => {
        try {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                console.log('Notification permission not granted');
                return;
            }

            // Get push notification token
            const token = await Notifications.getExpoPushTokenAsync();
            console.log('Push token:', token.data);

            // Register FCM token with backend
            try {
                await notificationAPI.registerToken(token.data, Platform.OS);
            } catch (error) {
                console.error('Error registering FCM token:', error);
            }
        } catch (error) {
            console.error('Error requesting notification permissions:', error);
        }
    };

    const getUserLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log('Location permission not granted');
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

    const handleElephantDetection = (data) => {
        console.log('🐘 Elephant detected!', data);

        // Show alert modal
        setCurrentAlert({
            type: 'elephant_detection',
            title: 'Elephant Detected!',
            message: `An elephant has been detected by ${data.source_device}`,
            latitude: data.latitude,
            longitude: data.longitude,
            confidence: data.confidence,
            source_device: data.source_device,
            detected_at: data.detected_at,
            ...data,
        });
        setAlertVisible(true);

        // Send local push notification
        sendLocalNotification(
            'Elephant Detected!',
            `Location: ${data.latitude.toFixed(4)}, ${data.longitude.toFixed(4)}`,
            data
        );
    };

    const handleNotification = (data) => {
        console.log('🔔 New notification:', data);

        // Show alert modal for important notifications
        setCurrentAlert({
            type: 'notification',
            title: data.title,
            message: data.body,
            ...data.data,
        });
        setAlertVisible(true);

        // Send local push notification
        sendLocalNotification(data.title, data.body, data.data);
    };

    const handleProximityAlert = (data) => {
        console.log('⚠️ Proximity alert:', data);

        // Show alert modal
        setCurrentAlert({
            type: 'proximity_alert',
            title: 'Proximity Alert!',
            message: `Elephant detected near ${data.hotspot_name || 'a hotspot'}`,
            latitude: data.latitude,
            longitude: data.longitude,
            ...data,
        });
        setAlertVisible(true);

        // Send local push notification
        sendLocalNotification(
            'Proximity Alert!',
            `Elephant near ${data.hotspot_name || 'hotspot'}`,
            data
        );
    };

    const sendLocalNotification = async (title, body, data = {}) => {
        try {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title,
                    body,
                    data,
                    sound: true,
                    priority: Notifications.AndroidNotificationPriority.HIGH,
                },
                trigger: null, // Show immediately
            });
        } catch (error) {
            console.error('Error sending local notification:', error);
        }
    };

    const dismissAlert = () => {
        setAlertVisible(false);
        setCurrentAlert(null);
    };

    const value = {
        alertVisible,
        currentAlert,
        userLocation,
        dismissAlert,
        setAlertVisible,
        setCurrentAlert,
    };

    return (
        <AlertContext.Provider value={value}>
            {children}
        </AlertContext.Provider>
    );
}

export function useAlert() {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useAlert must be used within AlertProvider');
    }
    return context;
}
