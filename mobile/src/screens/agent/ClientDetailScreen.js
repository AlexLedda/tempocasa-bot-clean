/**
 * Client Detail Screen
 * Visualizza i dettagli di un cliente
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
  List,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { apiClient } from '../../services/api';

const ClientDetailScreen = ({ route, navigation }) => {
  const { clientPhone } = route.params;
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClient();
  }, []);

  const loadClient = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/clients/${clientPhone}`);
      setClient(response.data);
    } catch (error) {
      console.error('Error loading client:', error);
      Alert.alert('Errore', 'Impossibile caricare i dettagli del cliente');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Conferma eliminazione',
      'Sei sicuro di voler eliminare questo cliente? Verranno eliminati anche tutti gli appuntamenti e valutazioni associati.',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete(`/api/clients/${clientPhone}`);
              Alert.alert('Successo', 'Cliente eliminato');
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting client:', error);
              Alert.alert('Errore', 'Impossibile eliminare il cliente');
            }
          },
        },
      ]
    );
  };

  const handleCall = () => {
    if (client?.phone) {
      Linking.openURL(`tel:${client.phone}`);
    }
  };

  const handleEmail = () => {
    if (client?.email) {
      Linking.openURL(`mailto:${client.email}`);
    }
  };

  const handleEdit = () => {
    navigation.navigate('ClientForm', { client });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!client) {
    return null;
  }

  const fullName = `${client.name} ${client.surname || ''}`.trim();

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              <MaterialCommunityIcons
                name="account-circle"
                size={64}
                color={COLORS.primary}
              />
              <View style={styles.headerText}>
                <Title style={styles.title}>{fullName}</Title>
                {client.profile_completed && (
                  <Chip
                    mode="flat"
                    icon="check-circle"
                    style={styles.completedChip}
                  >
                    Profilo Completo
                  </Chip>
                )}
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Contatti</Title>
          <Divider style={styles.divider} />
          
          <View style={styles.infoRow}>
            <MaterialCommunityIcons
              name="phone"
              size={20}
              color={COLORS.light.textSecondary}
            />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Telefono</Text>
              <Text style={styles.infoValue}>{client.phone}</Text>
            </View>
            <Button
              mode="contained-tonal"
              compact
              onPress={handleCall}
            >
              Chiama
            </Button>
          </View>

          {client.email && (
            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="email"
                size={20}
                color={COLORS.light.textSecondary}
              />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{client.email}</Text>
              </View>
              <Button
                mode="contained-tonal"
                compact
                onPress={handleEmail}
              >
                Email
              </Button>
            </View>
          )}
        </Card.Content>
      </Card>

      {(client.looking_for || client.budget) && (
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Ricerca Immobile</Title>
            <Divider style={styles.divider} />
            
            {client.looking_for && (
              <View style={styles.infoRow}>
                <MaterialCommunityIcons
                  name="home-search"
                  size={20}
                  color={COLORS.light.textSecondary}
                />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Cerca</Text>
                  <Text style={styles.infoValue}>{client.looking_for}</Text>
                </View>
              </View>
            )}

            {client.budget && (
              <View style={styles.infoRow}>
                <MaterialCommunityIcons
                  name="cash"
                  size={20}
                  color={COLORS.light.textSecondary}
                />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Budget</Text>
                  <Text style={styles.infoValue}>
                    € {client.budget.toLocaleString('it-IT')}
                  </Text>
                </View>
              </View>
            )}
          </Card.Content>
        </Card>
      )}

      {(client.needs_mortgage || client.needs_to_sell) && (
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Situazione Finanziaria</Title>
            <Divider style={styles.divider} />
            
            {client.needs_mortgage && (
              <>
                <List.Item
                  title="Necessita Mutuo"
                  left={props => <List.Icon {...props} icon="bank" />}
                  right={props => (
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={24}
                      color={COLORS.success}
                    />
                  )}
                />
                {client.mortgage_amount && (
                  <View style={styles.indentedInfo}>
                    <Text style={styles.infoLabel}>Importo Mutuo</Text>
                    <Text style={styles.infoValue}>
                      € {client.mortgage_amount.toLocaleString('it-IT')}
                    </Text>
                  </View>
                )}
                {client.mortgage_percentage && (
                  <View style={styles.indentedInfo}>
                    <Text style={styles.infoLabel}>Percentuale</Text>
                    <Text style={styles.infoValue}>{client.mortgage_percentage}%</Text>
                  </View>
                )}
              </>
            )}

            {client.needs_to_sell && (
              <>
                <List.Item
                  title="Deve vendere casa attuale"
                  left={props => <List.Icon {...props} icon="home-export-outline" />}
                  right={props => (
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={24}
                      color={COLORS.success}
                    />
                  )}
                />
                {client.property_to_sell_location && (
                  <View style={styles.indentedInfo}>
                    <Text style={styles.infoLabel}>Ubicazione immobile</Text>
                    <Text style={styles.infoValue}>{client.property_to_sell_location}</Text>
                  </View>
                )}
                {client.property_already_listed !== null && (
                  <View style={styles.indentedInfo}>
                    <Text style={styles.infoLabel}>Già in vendita</Text>
                    <Text style={styles.infoValue}>
                      {client.property_already_listed ? 'Sì' : 'No'}
                    </Text>
                  </View>
                )}
              </>
            )}

            {client.wants_evaluation && (
              <List.Item
                title="Richiede valutazione"
                left={props => <List.Icon {...props} icon="clipboard-check" />}
                right={props => (
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={24}
                    color={COLORS.success}
                  />
                )}
              />
            )}
          </Card.Content>
        </Card>
      )}

      {client.notes && (
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Note</Title>
            <Divider style={styles.divider} />
            <Paragraph style={styles.notes}>{client.notes}</Paragraph>
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
    marginBottom: 8,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 16,
    flex: 1,
  },
  title: {
    fontSize: 20,
    marginBottom: 8,
  },
  completedChip: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.success + '20',
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
  indentedInfo: {
    marginLeft: 56,
    marginBottom: 12,
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

export default ClientDetailScreen;
