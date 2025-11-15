/**
 * Appointment Detail Screen
 * Visualizza i dettagli di un appuntamento
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Chip,
  Text,
  ActivityIndicator,
  Divider,
  Menu,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, getColorByStatus } from '../../constants/colors';
import { apiClient } from '../../services/api';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

const AppointmentDetailScreen = ({ route, navigation }) => {
  const { appointmentId } = route.params;
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);

  useEffect(() => {
    loadAppointment();
  }, []);

  const loadAppointment = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/appointments/${appointmentId}`);
      setAppointment(response.data);
    } catch (error) {
      console.error('Error loading appointment:', error);
      Alert.alert('Errore', 'Impossibile caricare i dettagli dell\'appuntamento');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Conferma eliminazione',
      'Sei sicuro di voler eliminare questo appuntamento?',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete(`/api/appointments/${appointmentId}`);
              Alert.alert('Successo', 'Appuntamento eliminato');
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting appointment:', error);
              Alert.alert('Errore', 'Impossibile eliminare l\'appuntamento');
            }
          },
        },
      ]
    );
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await apiClient.put(`/api/appointments/${appointmentId}`, {
        status: newStatus,
      });
      setAppointment({ ...appointment, status: newStatus });
      setStatusMenuVisible(false);
      Alert.alert('Successo', 'Stato aggiornato');
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Errore', 'Impossibile aggiornare lo stato');
    }
  };

  const handleCall = () => {
    if (appointment?.client_phone) {
      Linking.openURL(`tel:${appointment.client_phone}`);
    }
  };

  const handleEdit = () => {
    navigation.navigate('AppointmentForm', { appointment });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!appointment) {
    return null;
  }

  const statusColor = getColorByStatus(appointment.status);

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <MaterialCommunityIcons
                name="calendar"
                size={32}
                color={statusColor}
              />
              <View style={styles.headerText}>
                <Title style={styles.title}>{appointment.client_name}</Title>
                <Text style={styles.date}>
                  {format(new Date(appointment.appointment_date), 'PPPp', { locale: it })}
                </Text>
              </View>
            </View>
            <Menu
              visible={statusMenuVisible}
              onDismiss={() => setStatusMenuVisible(false)}
              anchor={
                <Chip
                  mode="flat"
                  textStyle={{ color: statusColor }}
                  style={[styles.statusChip, { backgroundColor: statusColor + '20' }]}
                  onPress={() => setStatusMenuVisible(true)}
                >
                  {appointment.status}
                </Chip>
              }
            >
              <Menu.Item
                onPress={() => handleStatusChange('confermato')}
                title="Confermato"
                leadingIcon="check"
              />
              <Menu.Item
                onPress={() => handleStatusChange('completato')}
                title="Completato"
                leadingIcon="check-all"
              />
              <Menu.Item
                onPress={() => handleStatusChange('cancellato')}
                title="Cancellato"
                leadingIcon="close"
              />
            </Menu>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Informazioni Cliente</Title>
          <Divider style={styles.divider} />
          
          <View style={styles.infoRow}>
            <MaterialCommunityIcons
              name="account"
              size={20}
              color={COLORS.light.textSecondary}
            />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Nome</Text>
              <Text style={styles.infoValue}>{appointment.client_name}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <MaterialCommunityIcons
              name="phone"
              size={20}
              color={COLORS.light.textSecondary}
            />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Telefono</Text>
              <Text style={styles.infoValue}>{appointment.client_phone}</Text>
            </View>
            <Button
              mode="contained-tonal"
              compact
              onPress={handleCall}
            >
              Chiama
            </Button>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Proprietà</Title>
          <Divider style={styles.divider} />
          
          <View style={styles.infoRow}>
            <MaterialCommunityIcons
              name="home"
              size={20}
              color={COLORS.light.textSecondary}
            />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Proprietà</Text>
              <Text style={styles.infoValue}>{appointment.property_title}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {appointment.notes && (
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Note</Title>
            <Divider style={styles.divider} />
            <Paragraph style={styles.notes}>{appointment.notes}</Paragraph>
          </Card.Content>
        </Card>
      )}

      <View style={styles.actions}>
        <Button
          mode="contained"
          icon="pencil"
          onPress={handleEdit}
          style={styles.actionButton}
        >
          Modifica
        </Button>
        <Button
          mode="outlined"
          icon="delete"
          onPress={handleDelete}
          style={styles.actionButton}
          textColor={COLORS.error}
        >
          Elimina
        </Button>
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
  card: {
    margin: 16,
    marginBottom: 0,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerText: {
    marginLeft: 16,
    flex: 1,
  },
  title: {
    fontSize: 20,
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: COLORS.light.textSecondary,
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  divider: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.light.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: COLORS.light.text,
    fontWeight: '500',
  },
  notes: {
    fontSize: 14,
    color: COLORS.light.text,
    lineHeight: 20,
  },
  actions: {
    padding: 16,
    gap: 12,
  },
  actionButton: {
    marginBottom: 8,
  },
});

export default AppointmentDetailScreen;
