/**
 * Appointments Screen - Agent
 * Gestione appuntamenti
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  FAB,
  Chip,
  Text,
  ActivityIndicator,
  Searchbar,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, getColorByStatus } from '../../constants/colors';
import { apiClient } from '../../services/api';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

const AppointmentsScreen = ({ navigation }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const response = await apiClient.get('/api/appointments');
      setAppointments(response.data);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAppointments();
  };

  const filteredAppointments = appointments.filter(apt =>
    apt.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    apt.property_reference?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const AppointmentCard = ({ item }) => {
    const statusColor = getColorByStatus(item.status);
    
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => navigation.navigate('AppointmentDetail', { appointmentId: item.id })}
      >
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <View style={styles.headerLeft}>
                <MaterialCommunityIcons
                  name="calendar"
                  size={24}
                  color={statusColor}
                />
                <View style={styles.headerText}>
                  <Text style={styles.clientName}>{item.client_name}</Text>
                  <Text style={styles.date}>
                    {item.date && format(new Date(item.date), 'PPP', { locale: it })}
                  </Text>
                </View>
              </View>
              <Chip
                mode="flat"
                textStyle={{ color: statusColor }}
                style={[styles.chip, { backgroundColor: statusColor + '20' }]}
              >
                {item.status}
              </Chip>
            </View>

            {item.property_reference && (
              <View style={styles.propertyInfo}>
                <MaterialCommunityIcons
                  name="home"
                  size={16}
                  color={COLORS.light.textSecondary}
                />
                <Text style={styles.propertyText}>
                  Proprietà: {item.property_reference}
                </Text>
              </View>
            )}

            {item.notes && (
              <Paragraph style={styles.notes} numberOfLines={2}>
                {item.notes}
              </Paragraph>
            )}
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Cerca appuntamenti..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      <FlatList
        data={filteredAppointments}
        renderItem={({ item }) => <AppointmentCard item={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="calendar-blank"
              size={64}
              color={COLORS.light.textSecondary}
            />
            <Text style={styles.emptyText}>Nessun appuntamento trovato</Text>
          </View>
        }
      />

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('AppointmentForm', {})}
        color="#ffffff"
      />
    </View>
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
  searchbar: {
    margin: 16,
    elevation: 2,
  },
  list: {
    padding: 16,
    paddingTop: 0,
  },
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerText: {
    marginLeft: 12,
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.light.text,
  },
  date: {
    fontSize: 12,
    color: COLORS.light.textSecondary,
    marginTop: 2,
  },
  chip: {
    height: 28,
  },
  propertyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  propertyText: {
    fontSize: 14,
    color: COLORS.light.textSecondary,
    marginLeft: 8,
  },
  notes: {
    fontSize: 14,
    color: COLORS.light.textSecondary,
    marginTop: 8,
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.light.textSecondary,
    marginTop: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default AppointmentsScreen;
