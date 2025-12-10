import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SOCKET_URL = process.env.EXPO_PUBLIC_API_URL || 'https://sih-saksham.onrender.com';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect(token) {
    if (this.socket?.connected) {
      console.log('WebSocket already connected');
      return;
    }

    console.log('Connecting to WebSocket:', SOCKET_URL);

    this.socket = io(SOCKET_URL, {
      auth: {
        token: token,
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    // Listen to all events
    this.setupEventListeners();
  }

  setupEventListeners() {
    // New elephant detection event
    this.socket.on('new_event', (data) => {
      console.log('🐘 New elephant detection:', data);
      this.notifyListeners('new_event', data);
    });

    // New notification
    this.socket.on('notification', (data) => {
      console.log('🔔 New notification:', data);
      this.notifyListeners('notification', data);
    });

    // Hotspot events
    this.socket.on('hotspot_created', (data) => {
      console.log('📍 Hotspot created:', data);
      this.notifyListeners('hotspot_created', data);
    });

    this.socket.on('hotspot_updated', (data) => {
      console.log('📍 Hotspot updated:', data);
      this.notifyListeners('hotspot_updated', data);
    });

    this.socket.on('hotspot_deleted', (data) => {
      console.log('📍 Hotspot deleted:', data);
      this.notifyListeners('hotspot_deleted', data);
    });

    // Proximity alert
    this.socket.on('proximity_alert', (data) => {
      console.log('⚠️ Proximity alert:', data);
      this.notifyListeners('proximity_alert', data);
    });
  }

  // Subscribe to events
  on(eventName, callback) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    this.listeners.get(eventName).push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(eventName);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    };
  }

  // Notify all listeners for an event
  notifyListeners(eventName, data) {
    const callbacks = this.listeners.get(eventName);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  // Emit event to server
  emit(eventName, data) {
    if (this.socket?.connected) {
      this.socket.emit(eventName, data);
    } else {
      console.warn('Socket not connected, cannot emit:', eventName);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
      console.log('WebSocket disconnected');
    }
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}

// Export singleton instance
export default new WebSocketService();
