/**
 * More Screen - Agent
 * Altre funzionalità e impostazioni
 */

import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Card, Title, List, Avatar, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../constants/colors';

const MoreScreen = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Sei sicuro di voler uscire?',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Esci',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* User Profile Card */}
      <Card style={styles.profileCard}>
        <Card.Content>
          <View style={styles.profileContent}>
            <Avatar.Icon
              size={64}
              icon="account"
              style={styles.avatar}
              color="#ffffff"
            />
            <View style={styles.profileInfo}>
              <Title style={styles.userName}>{user?.full_name}</Title>
              <List.Item
                title={`@${user?.username}`}
                titleStyle={styles.username}
                left={() => <MaterialCommunityIcons name="at" size={16} color={COLORS.light.textSecondary} />}
                style={styles.userItem}
              />
              <List.Item
                title={user?.role}
                titleStyle={styles.role}
                left={() => <MaterialCommunityIcons name="shield-account" size={16} color={COLORS.primary} />}
                style={styles.userItem}
              />
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Menu Items */}
      <Card style={styles.menuCard}>
        <List.Item
          title="Proprietà"
          left={() => <List.Icon icon="home" color={COLORS.primary} />}
          right={() => <List.Icon icon="chevron-right" />}
          onPress={() => {}}
        />
        <Divider />
        <List.Item
          title="Messaggi WhatsApp"
          left={() => <List.Icon icon="whatsapp" color={COLORS.success} />}
          right={() => <List.Icon icon="chevron-right" />}
          onPress={() => {}}
        />
        <Divider />
        <List.Item
          title="Impostazioni Bot"
          left={() => <List.Icon icon="robot" color={COLORS.info} />}
          right={() => <List.Icon icon="chevron-right" />}
          onPress={() => {}}
        />
      </Card>

      {/* Settings */}
      <Card style={styles.menuCard}>
        <List.Item
          title="Profilo"
          left={() => <List.Icon icon="account-circle" />}
          right={() => <List.Icon icon="chevron-right" />}
          onPress={() => {}}
        />
        <Divider />
        <List.Item
          title="Notifiche"
          left={() => <List.Icon icon="bell" />}
          right={() => <List.Icon icon="chevron-right" />}
          onPress={() => {}}
        />
        <Divider />
        <List.Item
          title="Informazioni"
          left={() => <List.Icon icon="information" />}
          right={() => <List.Icon icon="chevron-right" />}
          onPress={() => {}}
        />
      </Card>

      {/* Logout */}
      <TouchableOpacity onPress={handleLogout}>
        <Card style={[styles.menuCard, styles.logoutCard]}>
          <List.Item
            title="Esci"
            titleStyle={styles.logoutText}
            left={() => <List.Icon icon="logout" color={COLORS.error} />}
          />
        </Card>
      </TouchableOpacity>

      {/* App Version */}
      <View style={styles.footer}>
        <List.Item
          title="Tempocasa Tarquinia Pro"
          description="Versione 1.0.0"
          titleStyle={styles.appName}
          descriptionStyle={styles.version}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light.surface,
  },
  profileCard: {
    margin: 16,
    elevation: 2,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: COLORS.primary,
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userItem: {
    paddingLeft: 0,
    paddingVertical: 0,
    minHeight: 24,
  },
  username: {
    fontSize: 14,
    color: COLORS.light.textSecondary,
  },
  role: {
    fontSize: 12,
    color: COLORS.primary,
    textTransform: 'capitalize',
  },
  menuCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    elevation: 2,
  },
  logoutCard: {
    marginTop: 8,
    marginBottom: 16,
  },
  logoutText: {
    color: COLORS.error,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 32,
  },
  appName: {
    fontSize: 14,
    color: COLORS.light.textSecondary,
    textAlign: 'center',
  },
  version: {
    fontSize: 12,
    color: COLORS.light.placeholder,
    textAlign: 'center',
  },
});

export default MoreScreen;
