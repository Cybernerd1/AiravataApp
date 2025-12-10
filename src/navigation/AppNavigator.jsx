import React from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { useAlert } from '../contexts/AlertContext';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import DebugScreen from '../screens/DebugScreen';
import MainTabs from './MainTabs';
import UserManagementScreen from '../screens/UserManagementScreen';
import DeviceManagementScreen from '../screens/DeviceManagementScreen';
import DeviceMapScreen from '../screens/DeviceMapScreen';
import EventsMapScreen from '../screens/EventsMapScreen';
import LiveAlertMapScreen from '../screens/LiveAlertMapScreen';
import AlertModal from '../components/alerts/AlertModal';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

const Stack = createNativeStackNavigator();

function AlertWrapper() {
  const { alertVisible, currentAlert, dismissAlert } = useAlert();
  const navigation = useNavigation();

  const handleViewLocation = () => {
    dismissAlert();
    navigation.navigate('LiveAlertMap', { alertData: currentAlert });
  };

  return (
    <AlertModal
      visible={alertVisible}
      onDismiss={dismissAlert}
      onViewLocation={handleViewLocation}
      alertData={currentAlert}
    />
  );
}

export default function AppNavigator() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="Debug" component={DebugScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="UserManagement" component={UserManagementScreen} />
            <Stack.Screen name="DeviceManagement" component={DeviceManagementScreen} />
            <Stack.Screen name="DeviceMap" component={DeviceMapScreen} />
            <Stack.Screen name="EventsMap" component={EventsMapScreen} />
            <Stack.Screen name="LiveAlertMap" component={LiveAlertMapScreen} />
          </>
        )}
      </Stack.Navigator>
      <AlertWrapper />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});
