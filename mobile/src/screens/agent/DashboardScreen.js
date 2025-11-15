/**
 * Dashboard Screen - Agent
 * Dashboard principale per agenti immobiliari
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Avatar,
  Text,
  ActivityIndicator,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../constants/colors';
import { apiClient } from '../../services/api';

const DashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await apiClient.get('/api/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadStats();
  };

  const StatCard = ({ title, value, icon, color, onPress }) => (
    <TouchableOpacity
      style={styles.statCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
        <MaterialCommunityIcons name={icon} size={32} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value || 0}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Welcome Card */}
      <Card style={styles.welcomeCard}>
        <Card.Content>
          <View style={styles.welcomeContent}>
            <View>
              <Title style={styles.welcomeTitle}>
                Ciao, {user?.full_name || 'Agente'}!
              </Title>
              <Paragraph style={styles.welcomeSubtitle}>
                Ecco la situazione di oggi
              </Paragraph>
            </View>
            <Avatar.Icon
              size={56}
              icon="account"
              style={styles.avatar}
              color="#ffffff"
            />
          </View>
        </Card.Content>
      </Card>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard
          title="Appuntamenti"
          value={stats?.pending_appointments}
          icon="calendar-check"
          color={COLORS.primary}
          onPress={() => navigation.navigate('Appuntamenti')}
        />
        <StatCard
          title="Clienti"
          value={stats?.total_clients}
          icon="account-group"
          color={COLORS.info}
          onPress={() => navigation.navigate('Clienti')}
        />
        <StatCard
          title="Valutazioni"
          value={stats?.pending_valuations}
          icon="clipboard-check"
          color={COLORS.warning}
          onPress={() => navigation.navigate('Valutazioni')}
        />
        <StatCard
          title="Proprietà"
          value={stats?.available_properties}
          icon="home"
          color={COLORS.success}
          onPress={() => navigation.navigate('Altro')}
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Title style={styles.sectionTitle}>Azioni Rapide</Title>
        
        <Card style={styles.actionCard}>
          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => navigation.navigate('Appuntamenti')}
          >
            <MaterialCommunityIcons
              name="calendar-plus"
              size={24}
              color={COLORS.primary}
            />
            <Text style={styles.actionText}>Nuovo Appuntamento</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={COLORS.light.textSecondary}
            />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => navigation.navigate('Clienti')}
          >
            <MaterialCommunityIcons
              name="account-plus"
              size={24}
              color={COLORS.info}
            />
            <Text style={styles.actionText}>Nuovo Cliente</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={COLORS.light.textSecondary}
            />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => navigation.navigate('Valutazioni')}
          >
            <MaterialCommunityIcons
              name="clipboard-text"
              size={24}
              color={COLORS.warning}
            />
            <Text style={styles.actionText}>Nuova Valutazione</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={COLORS.light.textSecondary}
            />
          </TouchableOpacity>
        </Card>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Title style={styles.sectionTitle}>Attività Recente</Title>
        <Card style={styles.activityCard}>
          <Card.Content>
            <Paragraph style={styles.emptyText}>
              Nessuna attività recente
            </Paragraph>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light.surface,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeCard: {
    margin: 16,
    elevation: 2,
  },
  welcomeContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.light.text,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: COLORS.light.textSecondary,
    marginTop: 4,
  },
  avatar: {
    backgroundColor: COLORS.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    margin: '1%',
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.light.text,
  },
  statTitle: {
    fontSize: 12,
    color: COLORS.light.textSecondary,
    marginTop: 2,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  actionCard: {
    elevation: 2,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 16,
    color: COLORS.light.text,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.light.border,
  },
  activityCard: {
    elevation: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.light.textSecondary,
    fontStyle: 'italic',
  },
});

export default DashboardScreen;
