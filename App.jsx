import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/contexts/AuthContext';
import { AlertProvider } from './src/contexts/AlertContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <AuthProvider>
      <AlertProvider>
        <AppNavigator />
        <StatusBar style="auto" />
      </AlertProvider>
    </AuthProvider>
  );
}
