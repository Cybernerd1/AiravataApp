import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/ui/Button';
import { clearAllStorage, clearAuthStorage, getAllStorageData } from '../utils/storage';
import { COLORS } from '../constants/colors';

/**
 * Debug Screen - Use this to clear AsyncStorage if you encounter errors
 * This screen can be temporarily added to your navigation for debugging
 */
export default function DebugScreen() {
  const [loading, setLoading] = useState(false);

  const handleClearAll = async () => {
    Alert.alert(
      'Clear All Storage',
      'This will clear ALL data from AsyncStorage. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            const success = await clearAllStorage();
            setLoading(false);
            if (success) {
              Alert.alert('Success', 'All storage cleared. Please restart the app.');
            } else {
              Alert.alert('Error', 'Failed to clear storage');
            }
          },
        },
      ]
    );
  };

  const handleClearAuth = async () => {
    setLoading(true);
    const success = await clearAuthStorage();
    setLoading(false);
    if (success) {
      Alert.alert('Success', 'Auth storage cleared. Please restart the app.');
    } else {
      Alert.alert('Error', 'Failed to clear auth storage');
    }
  };

  const handleViewStorage = async () => {
    setLoading(true);
    const data = await getAllStorageData();
    setLoading(false);
    console.log('Storage Data:', data);
    Alert.alert('Storage Data', JSON.stringify(data, null, 2));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🛠️ Debug Tools</Text>
        <Text style={styles.subtitle}>
          Use these tools to fix storage-related errors
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Storage Management</Text>
          
          <Button
            title="Clear Auth Storage"
            onPress={handleClearAuth}
            loading={loading}
            style={styles.button}
          />

          <Button
            title="Clear All Storage"
            onPress={handleClearAll}
            loading={loading}
            variant="secondary"
            style={styles.button}
          />

          <Button
            title="View Storage Data"
            onPress={handleViewStorage}
            loading={loading}
            variant="secondary"
            style={styles.button}
          />
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>ℹ️ When to use:</Text>
          <Text style={styles.infoText}>
            • If you see "String cannot be cast to Boolean" error{'\n'}
            • If login/logout is not working properly{'\n'}
            • If the app crashes on startup{'\n'}
            • After making changes to storage structure
          </Text>
        </View>

        <Text style={styles.warning}>
          ⚠️ Clearing storage will log you out and remove all local data
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  button: {
    marginBottom: 12,
  },
  infoBox: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.info,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 20,
  },
  warning: {
    fontSize: 12,
    color: COLORS.danger,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
