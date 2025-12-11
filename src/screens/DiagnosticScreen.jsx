import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { COLORS } from '../constants/colors';

export default function DiagnosticScreen({ navigation }) {
    const [apiUrl, setApiUrl] = useState('');
    const [backendStatus, setBackendStatus] = useState('Checking...');
    const [backendColor, setBackendColor] = useState(COLORS.textLight);

    useEffect(() => {
        checkConfiguration();
    }, []);

    const checkConfiguration = async () => {
        // Check API URL
        const url = process.env.EXPO_PUBLIC_API_URL || 'NOT SET';
        setApiUrl(url);

        // Test backend connection
        if (url !== 'NOT SET') {
            try {
                const response = await axios.get(`${url}/api/health`, { timeout: 5000 });
                setBackendStatus('✅ Connected');
                setBackendColor(COLORS.success);
            } catch (error) {
                setBackendStatus(`❌ Error: ${error.message}`);
                setBackendColor(COLORS.danger);
            }
        } else {
            setBackendStatus('❌ API URL not configured');
            setBackendColor(COLORS.danger);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backButton}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>🔧 Diagnostics</Text>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>API Configuration</Text>

                    <View style={styles.item}>
                        <Text style={styles.label}>API URL:</Text>
                        <Text style={styles.value}>{apiUrl}</Text>
                    </View>

                    <View style={styles.item}>
                        <Text style={styles.label}>Backend Status:</Text>
                        <Text style={[styles.value, { color: backendColor }]}>
                            {backendStatus}
                        </Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Environment Variables</Text>

                    <View style={styles.item}>
                        <Text style={styles.label}>EXPO_PUBLIC_API_URL:</Text>
                        <Text style={styles.value}>
                            {process.env.EXPO_PUBLIC_API_URL || '❌ NOT SET'}
                        </Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Fixes</Text>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={checkConfiguration}
                    >
                        <Text style={styles.buttonText}> Recheck Connection</Text>
                    </TouchableOpacity>

                    <View style={styles.infoBox}>
                        <Text style={styles.infoTitle}>If Backend Not Connected:</Text>
                        <Text style={styles.infoText}>
                            1. Check .env file has:{'\n'}
                            EXPO_PUBLIC_API_URL=https://sih-saksham.onrender.com
                        </Text>
                        <Text style={styles.infoText}>
                            2. Restart Expo: Stop (Ctrl+C) and run "npm start"
                        </Text>
                        <Text style={styles.infoText}>
                            3. Reload app: Press R in terminal
                        </Text>
                    </View>
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
        padding: 20,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backButton: {
        fontSize: 16,
        color: COLORS.primary,
        marginBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    section: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 12,
    },
    item: {
        marginBottom: 12,
    },
    label: {
        fontSize: 14,
        color: COLORS.textLight,
        marginBottom: 4,
    },
    value: {
        fontSize: 14,
        color: COLORS.text,
        fontFamily: 'monospace',
    },
    button: {
        backgroundColor: COLORS.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 16,
    },
    buttonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    infoBox: {
        backgroundColor: COLORS.background,
        padding: 16,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.primary,
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 8,
    },
    infoText: {
        fontSize: 13,
        color: COLORS.text,
        marginBottom: 8,
        lineHeight: 20,
    },
});
