/**
 * API Integration Guide for Airavata Backend
 * 
 * This file documents how to use the API service in your components
 */

import { authAPI, elephantAPI, sightingAPI, alertAPI } from '../services/api';

// ============================================
// AUTHENTICATION EXAMPLES
// ============================================

// Login (already implemented in AuthContext)
const handleLogin = async (email, password) => {
  try {
    const response = await authAPI.login(email, password);
    console.log('Login successful:', response.data);
  } catch (error) {
    console.error('Login failed:', error.response?.data);
  }
};

// Register (already implemented in AuthContext)
const handleRegister = async (name, email, password) => {
  try {
    const response = await authAPI.register(name, email, password);
    console.log('Registration successful:', response.data);
  } catch (error) {
    console.error('Registration failed:', error.response?.data);
  }
};

// ============================================
// ELEPHANT TRACKING EXAMPLES
// ============================================

// Get all elephants
const fetchElephants = async () => {
  try {
    const response = await elephantAPI.getAll();
    console.log('Elephants:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching elephants:', error);
  }
};

// Get single elephant
const fetchElephant = async (elephantId) => {
  try {
    const response = await elephantAPI.getById(elephantId);
    console.log('Elephant details:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching elephant:', error);
  }
};

// Create new elephant
const createElephant = async (elephantData) => {
  try {
    const response = await elephantAPI.create({
      name: elephantData.name,
      age: elephantData.age,
      gender: elephantData.gender,
      description: elephantData.description,
      // Add other fields as per backend schema
    });
    console.log('Elephant created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating elephant:', error);
  }
};

// Update elephant
const updateElephant = async (elephantId, updates) => {
  try {
    const response = await elephantAPI.update(elephantId, updates);
    console.log('Elephant updated:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating elephant:', error);
  }
};

// Delete elephant
const deleteElephant = async (elephantId) => {
  try {
    await elephantAPI.delete(elephantId);
    console.log('Elephant deleted');
  } catch (error) {
    console.error('Error deleting elephant:', error);
  }
};

// ============================================
// SIGHTING EXAMPLES
// ============================================

// Get all sightings
const fetchSightings = async () => {
  try {
    const response = await sightingAPI.getAll();
    console.log('Sightings:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching sightings:', error);
  }
};

// Create new sighting
const createSighting = async (sightingData) => {
  try {
    const response = await sightingAPI.create({
      elephantId: sightingData.elephantId,
      location: {
        latitude: sightingData.latitude,
        longitude: sightingData.longitude,
      },
      timestamp: new Date().toISOString(),
      description: sightingData.description,
      imageUrl: sightingData.imageUrl,
      // Add other fields as per backend schema
    });
    console.log('Sighting created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating sighting:', error);
  }
};

// ============================================
// ALERT EXAMPLES
// ============================================

// Get all alerts
const fetchAlerts = async () => {
  try {
    const response = await alertAPI.getAll();
    console.log('Alerts:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching alerts:', error);
  }
};

// Create new alert
const createAlert = async (alertData) => {
  try {
    const response = await alertAPI.create({
      type: alertData.type, // e.g., 'danger', 'warning', 'info'
      message: alertData.message,
      location: {
        latitude: alertData.latitude,
        longitude: alertData.longitude,
      },
      severity: alertData.severity,
      // Add other fields as per backend schema
    });
    console.log('Alert created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating alert:', error);
  }
};

// Acknowledge alert
const acknowledgeAlert = async (alertId) => {
  try {
    const response = await alertAPI.acknowledge(alertId);
    console.log('Alert acknowledged:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error acknowledging alert:', error);
  }
};

// ============================================
// USAGE IN REACT COMPONENTS
// ============================================

/**
 * Example: Elephant List Screen
 */
import React, { useState, useEffect } from 'react';
import { View, FlatList, Text } from 'react-native';
import { elephantAPI } from '../services/api';

const ElephantListScreen = () => {
  const [elephants, setElephants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadElephants();
  }, []);

  const loadElephants = async () => {
    try {
      setLoading(true);
      const response = await elephantAPI.getAll();
      setElephants(response.data);
    } catch (error) {
      console.error('Error loading elephants:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <FlatList
        data={elephants}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text>{item.name}</Text>
        )}
      />
    </View>
  );
};

/**
 * Example: Create Sighting Screen
 */
import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { sightingAPI } from '../services/api';
import { Button } from '../components/ui/Button';

const CreateSightingScreen = ({ route, navigation }) => {
  const [loading, setLoading] = useState(false);
  const { elephantId, latitude, longitude } = route.params;

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await sightingAPI.create({
        elephantId,
        latitude,
        longitude,
        description: 'Elephant spotted',
      });
      Alert.alert('Success', 'Sighting reported successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to report sighting');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <Button
        title="Report Sighting"
        onPress={handleSubmit}
        loading={loading}
      />
    </View>
  );
};

// ============================================
// ERROR HANDLING
// ============================================

/**
 * The API service automatically handles:
 * - Adding auth tokens to requests
 * - Logging out on 401 errors
 * - Returning proper error responses
 * 
 * Always wrap API calls in try-catch blocks
 */

const safeAPICall = async () => {
  try {
    const response = await elephantAPI.getAll();
    return { success: true, data: response.data };
  } catch (error) {
    if (error.response) {
      // Server responded with error
      console.error('Server error:', error.response.data);
      return { success: false, error: error.response.data.message };
    } else if (error.request) {
      // No response received
      console.error('Network error:', error.request);
      return { success: false, error: 'Network error. Please check your connection.' };
    } else {
      // Other errors
      console.error('Error:', error.message);
      return { success: false, error: error.message };
    }
  }
};
