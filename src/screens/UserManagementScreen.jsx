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
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { userAPI, authAPI } from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { COLORS } from '../constants/colors';

export default function UserManagementScreen({ navigation }) {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [filterRole, setFilterRole] = useState('all');

    const [userForm, setUserForm] = useState({
        name: '',
        email: '',
        password: '',
        role: 'user',
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!isAdmin) {
            Alert.alert('Access Denied', 'Only admins can access user management');
            navigation.goBack();
            return;
        }
        loadUsers();
    }, [filterRole]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            let response;
            if (filterRole === 'all') {
                response = await userAPI.getAll();
            } else {
                response = await userAPI.getByRole(filterRole);
            }
            setUsers(response.data);
        } catch (error) {
            console.error('Error loading users:', error);
            if (error.response?.status !== 401) {
                Alert.alert('Error', 'Failed to load users');
            }
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadUsers();
        setRefreshing(false);
    };

    const handleAddUser = async () => {
        if (!userForm.name || !userForm.email || !userForm.password) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userForm.email)) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
        }

        // Password validation
        if (userForm.password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        try {
            setSubmitting(true);
            await authAPI.register(
                userForm.name,
                userForm.email,
                userForm.password,
                userForm.role
            );

            Alert.alert('Success', `${userForm.role} added successfully!`);
            setUserForm({ name: '', email: '', password: '', role: 'user' });
            setShowAddModal(false);
            loadUsers();
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Failed to add user';
            Alert.alert('Error', errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteUser = (userId, userName) => {
        Alert.alert(
            'Delete User',
            `Are you sure you want to delete ${userName}? This action cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await userAPI.delete(userId);
                            Alert.alert('Success', 'User deleted successfully');
                            loadUsers();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete user');
                        }
                    },
                },
            ]
        );
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderUser = ({ item }) => (
        <View style={styles.userCard}>
            <View style={styles.userHeader}>
                <View style={styles.userAvatar}>
                    <Ionicons name="person" size={24} color={COLORS.white} />
                </View>
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{item.name}</Text>
                    <Text style={styles.userEmail}>{item.email}</Text>
                    <View style={styles.userMeta}>
                        <View style={[styles.roleBadge, getRoleBadgeColor(item.role)]}>
                            <Text style={styles.roleText}>{item.role.toUpperCase()}</Text>
                        </View>
                        <Text style={styles.userDate}>
                            Joined {new Date(item.created_at).toLocaleDateString()}
                        </Text>
                    </View>
                </View>
            </View>

            {item.id !== user.id && (
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteUser(item.id, item.name)}
                    >
                        <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
                        <Text style={styles.deleteText}>Delete</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'admin':
                return { backgroundColor: COLORS.danger + '20', borderColor: COLORS.danger };
            case 'officer':
                return { backgroundColor: COLORS.primary + '20', borderColor: COLORS.primary };
            default:
                return { backgroundColor: COLORS.textLight + '20', borderColor: COLORS.textLight };
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.title}>User Management</Text>
                <TouchableOpacity onPress={() => setShowAddModal(true)}>
                    <Ionicons name="add-circle" size={28} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            {/* Search and Filter */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBox}>
                    <Ionicons name="search" size={20} color={COLORS.textLight} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search users..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor={COLORS.textLight}
                    />
                </View>
            </View>

            {/* Role Filter */}
            <View style={styles.filterContainer}>
                {['all', 'admin', 'officer', 'user'].map((role) => (
                    <TouchableOpacity
                        key={role}
                        style={[
                            styles.filterButton,
                            filterRole === role && styles.filterButtonActive
                        ]}
                        onPress={() => setFilterRole(role)}
                    >
                        <Text style={[
                            styles.filterText,
                            filterRole === role && styles.filterTextActive
                        ]}>
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <FlatList
                data={filteredUsers}
                renderItem={renderUser}
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
                        <Ionicons name="people-outline" size={64} color={COLORS.textLight} />
                        <Text style={styles.emptyText}>No users found</Text>
                    </View>
                }
            />

            {/* Add User Modal */}
            <Modal
                visible={showAddModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowAddModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Add New User</Text>
                            <TouchableOpacity onPress={() => setShowAddModal(false)}>
                                <Ionicons name="close" size={24} color={COLORS.text} />
                            </TouchableOpacity>
                        </View>

                        <Input
                            label="Full Name"
                            value={userForm.name}
                            onChangeText={(text) => setUserForm({ ...userForm, name: text })}
                            placeholder="Enter full name"
                            leftIcon="person-outline"
                        />

                        <Input
                            label="Email"
                            value={userForm.email}
                            onChangeText={(text) => setUserForm({ ...userForm, email: text })}
                            placeholder="Enter email"
                            leftIcon="mail-outline"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        <Input
                            label="Password"
                            value={userForm.password}
                            onChangeText={(text) => setUserForm({ ...userForm, password: text })}
                            placeholder="Minimum 6 characters"
                            leftIcon="lock-closed-outline"
                            secureTextEntry
                        />

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Role</Text>
                            <View style={styles.roleButtons}>
                                {['user', 'officer', 'admin'].map((role) => (
                                    <TouchableOpacity
                                        key={role}
                                        style={[
                                            styles.roleButton,
                                            userForm.role === role && styles.roleButtonActive
                                        ]}
                                        onPress={() => setUserForm({ ...userForm, role })}
                                    >
                                        <Text style={[
                                            styles.roleButtonText,
                                            userForm.role === role && styles.roleButtonTextActive
                                        ]}>
                                            {role.charAt(0).toUpperCase() + role.slice(1)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <Button
                            title={submitting ? "Creating..." : "Create User"}
                            onPress={handleAddUser}
                            loading={submitting}
                            style={styles.submitButton}
                        />
                    </View>
                </View>
            </Modal>
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
    searchContainer: {
        padding: 16,
        backgroundColor: COLORS.white,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 16,
        color: COLORS.text,
    },
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingBottom: 16,
        gap: 8,
    },
    filterButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    filterButtonActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    filterText: {
        fontSize: 14,
        color: COLORS.text,
        fontWeight: '500',
    },
    filterTextActive: {
        color: COLORS.white,
    },
    listContent: {
        padding: 16,
    },
    userCard: {
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
    userHeader: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    userAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 2,
    },
    userEmail: {
        fontSize: 14,
        color: COLORS.textLight,
        marginBottom: 6,
    },
    userMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    roleBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
        borderWidth: 1,
    },
    roleText: {
        fontSize: 11,
        fontWeight: '600',
    },
    userDate: {
        fontSize: 12,
        color: COLORS.textLight,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: COLORS.danger + '10',
        gap: 4,
    },
    deleteText: {
        fontSize: 14,
        color: COLORS.danger,
        fontWeight: '600',
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    inputContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 8,
    },
    roleButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    roleButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: 'center',
    },
    roleButtonActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    roleButtonText: {
        fontSize: 14,
        color: COLORS.text,
        fontWeight: '500',
    },
    roleButtonTextActive: {
        color: COLORS.white,
    },
    submitButton: {
        marginTop: 8,
    },
});
