/**
 * Valuation Detail Screen
 * Visualizza i dettagli di una valutazione
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
  Checkbox,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, getColorByStatus } from '../../constants/colors';
import { apiClient } from '../../services/api';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

const ValuationDetailScreen = ({ route, navigation }) => {
  const { valuationId } = route.params;
  const [valuation, setValuation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);

  useEffect(() => {
    loadValuation();
  }, []);

  const loadValuation = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/valuations/${valuationId}`);
      setValuation(response.data);
    } catch (error) {
      console.error('Error loading valuation:', error);
      Alert.alert('Errore', 'Impossibile caricare i dettagli della valutazione');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Conferma eliminazione',
      'Sei sicuro di voler eliminare questa valutazione?',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete(`/api/valuations/${valuationId}`);
              Alert.alert('Successo', 'Valutazione eliminata');
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting valuation:', error);
              Alert.alert('Errore', 'Impossibile eliminare la valutazione');
            }
          },
        },
      ]
    );
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await apiClient.put(`/api/valuations/${valuationId}`, {
        status: newStatus,
      });
      setValuation({ ...valuation, status: newStatus });
      setStatusMenuVisible(false);
      Alert.alert('Successo', 'Stato aggiornato');
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Errore', 'Impossibile aggiornare lo stato');
    }
  };

  const handleToggleEvaluated = async () => {
    try {
      const newValue = !valuation.is_evaluated;
      await apiClient.put(`/api/valuations/${valuationId}`, {
        is_evaluated: newValue,
      });
      setValuation({ ...valuation, is_evaluated: newValue });
      Alert.alert('Successo', newValue ? 'Segnata come valutata' : 'Segno rimosso');
    } catch (error) {
      console.error('Error updating evaluated status:', error);
      Alert.alert('Errore', 'Impossibile aggiornare lo stato');
    }
  };

  const handleCall = () => {
    if (valuation?.client_phone) {
      Linking.openURL(`tel:${valuation.client_phone}`);
    }
  };

  const handleEdit = () => {
    navigation.navigate('ValuationForm', { valuation });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!valuation) {
    return null;
  }

  const statusColor = getColorByStatus(valuation.status);

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <MaterialCommunityIcons
                name="clipboard-check"
                size={32}
                color={statusColor}
              />
              <View style={styles.headerText}>
                <Title style={styles.title}>{valuation.client_name}</Title>
                {valuation.property_location && (
                  <Text style={styles.subtitle}>{valuation.property_location}</Text>
                )}
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
                  {valuation.status}
                </Chip>
              }
            >
              <Menu.Item
                onPress={() => handleStatusChange('richiesta')}
                title="Richiesta"
                leadingIcon="help-circle"
              />
              <Menu.Item
                onPress={() => handleStatusChange('appuntamento_fissato')}
                title="Appuntamento Fissato"
                leadingIcon="calendar-check"
              />
              <Menu.Item
                onPress={() => handleStatusChange('valutata')}
                title="Valutata"
                leadingIcon="check"
              />
              <Menu.Item
                onPress={() => handleStatusChange('conclusa')}
                title="Conclusa"
                leadingIcon="check-all"
              />
            </Menu>
          </View>

          <View style={styles.evaluatedRow}>
            <Checkbox
              status={valuation.is_evaluated ? 'checked' : 'unchecked'}
              onPress={handleToggleEvaluated}
              color={COLORS.primary}
            />
            <Text style={styles.evaluatedText}>Valutazione completata</Text>
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
              <Text style={styles.infoValue}>{valuation.client_name}</Text>
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
              <Text style={styles.infoValue}>{valuation.client_phone}</Text>
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
          <Title style={styles.sectionTitle}>Immobile da Valutare</Title>
          <Divider style={styles.divider} />
          
          <View style={styles.infoRow}>
            <MaterialCommunityIcons
              name="map-marker"
              size={20}
              color={COLORS.light.textSecondary}
            />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Ubicazione</Text>
              <Text style={styles.infoValue}>{valuation.property_location}</Text>
            </View>
          </View>

          {valuation.property_type && (
            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="home-variant"
                size={20}
                color={COLORS.light.textSecondary}
              />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Tipo</Text>
                <Text style={styles.infoValue}>{valuation.property_type}</Text>
              </View>
            </View>
          )}

          {valuation.property_description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.infoLabel}>Descrizione</Text>
              <Paragraph style={styles.description}>
                {valuation.property_description}
              </Paragraph>
            </View>
          )}

          {valuation.estimated_value && (
            <View style={styles.valueContainer}>
              <MaterialCommunityIcons
                name="cash-multiple"
                size={24}
                color={COLORS.primary}
              />
              <View style={styles.valueContent}>
                <Text style={styles.valueLabel}>Valore Stimato</Text>
                <Text style={styles.valueAmount}>
                  € {valuation.estimated_value.toLocaleString('it-IT')}
                </Text>
              </View>
            </View>
          )}
        </Card.Content>
      </Card>

      {(valuation.already_listed || valuation.current_agency) && (
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Situazione Attuale</Title>
            <Divider style={styles.divider} />
            
            {valuation.already_listed && (
              <View style={styles.infoRow}>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={20}
                  color={COLORS.success}
                />
                <Text style={styles.infoValue}>Già in vendita</Text>
              </View>
            )}

            {valuation.current_agency && (
              <View style={styles.infoRow}>
                <MaterialCommunityIcons
                  name="office-building"
                  size={20}
                  color={COLORS.light.textSecondary}
                />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Agenzia attuale</Text>
                  <Text style={styles.infoValue}>{valuation.current_agency}</Text>
                </View>
              </View>
            )}
          </Card.Content>
        </Card>
      )}

      {valuation.appointment_date && (
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Appuntamento</Title>
            <Divider style={styles.divider} />
            
            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="calendar"
                size={20}
                color={COLORS.light.textSecondary}
              />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Data e ora</Text>
                <Text style={styles.infoValue}>
                  {format(new Date(valuation.appointment_date), 'PPPp', { locale: it })}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      )}

      {valuation.notes && (
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Note</Title>
            <Divider style={styles.divider} />
            <Paragraph style={styles.notes}>{valuation.notes}</Paragraph>
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
    marginBottom: 16,
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
  subtitle: {
    fontSize: 14,
    color: COLORS.light.textSecondary,
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  evaluatedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  evaluatedText: {
    fontSize: 16,
    color: COLORS.light.text,
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
  descriptionContainer: {
    marginTop: 8,
  },
  description: {
    fontSize: 14,
    color: COLORS.light.text,
    marginTop: 4,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  valueContent: {
    marginLeft: 12,
  },
  valueLabel: {
    fontSize: 12,
    color: COLORS.light.textSecondary,
    marginBottom: 2,
  },
  valueAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
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

export default ValuationDetailScreen;
