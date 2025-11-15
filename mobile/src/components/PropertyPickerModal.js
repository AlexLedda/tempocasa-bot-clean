/**
 * Property Picker Modal
 * Modale per selezionare una proprietà dal database
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
} from 'react-native';
import {
  Card,
  Text,
  Searchbar,
  ActivityIndicator,
  Button,
  Chip,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { apiClient } from '../services/api';

const PropertyPickerModal = ({ visible, onClose, onSelect, selectedPropertyId }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (visible) {
      loadProperties();
    }
  }, [visible]);

  const loadProperties = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/properties');
      // Filtro solo le proprietà disponibili
      const availableProperties = response.data.filter(
        p => p.status === 'disponibile' || p.id === selectedPropertyId
      );
      setProperties(availableProperties);
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProperties = properties.filter(property =>
    property.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    property.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    property.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const PropertyCard = ({ item }) => {
    const isSelected = item.id === selectedPropertyId;
    
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => {
          onSelect(item);
          onClose();
        }}
      >
        <Card style={[styles.card, isSelected && styles.selectedCard]}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <View style={styles.propertyInfo}>
                {item.reference && (
                  <Chip
                    mode="outlined"
                    compact
                    style={styles.referenceChip}
                  >
                    {item.reference}
                  </Chip>
                )}
                <Text style={styles.title}>{item.title}</Text>
              </View>
              {isSelected && (
                <MaterialCommunityIcons
                  name="check-circle"
                  size={24}
                  color={COLORS.primary}
                />
              )}
            </View>
            
            <View style={styles.details}>
              <View style={styles.detailRow}>
                <MaterialCommunityIcons
                  name="map-marker"
                  size={16}
                  color={COLORS.light.textSecondary}
                />
                <Text style={styles.detailText}>{item.location}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <MaterialCommunityIcons
                  name="home"
                  size={16}
                  color={COLORS.light.textSecondary}
                />
                <Text style={styles.detailText}>{item.property_type}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <MaterialCommunityIcons
                  name="cash"
                  size={16}
                  color={COLORS.light.textSecondary}
                />
                <Text style={styles.detailText}>
                  € {item.price?.toLocaleString('it-IT')}
                </Text>
              </View>
            </View>
            
            <View style={styles.specs}>
              <View style={styles.specItem}>
                <MaterialCommunityIcons name="bed" size={14} color={COLORS.light.textSecondary} />
                <Text style={styles.specText}>{item.bedrooms}</Text>
              </View>
              <View style={styles.specItem}>
                <MaterialCommunityIcons name="shower" size={14} color={COLORS.light.textSecondary} />
                <Text style={styles.specText}>{item.bathrooms}</Text>
              </View>
              <View style={styles.specItem}>
                <MaterialCommunityIcons name="ruler-square" size={14} color={COLORS.light.textSecondary} />
                <Text style={styles.specText}>{item.square_meters} m²</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Seleziona Proprietà</Text>
          <Button
            mode="text"
            onPress={onClose}
            textColor={COLORS.primary}
          >
            Annulla
          </Button>
        </View>

        <Searchbar
          placeholder="Cerca proprietà..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList
            data={filteredProperties}
            renderItem={({ item }) => <PropertyCard item={item} />}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons
                  name="home-search"
                  size={64}
                  color={COLORS.light.textSecondary}
                />
                <Text style={styles.emptyText}>Nessuna proprietà trovata</Text>
              </View>
            }
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.light.text,
  },
  searchbar: {
    margin: 16,
    elevation: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
    paddingTop: 0,
  },
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  selectedCard: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  propertyInfo: {
    flex: 1,
  },
  referenceChip: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.light.text,
  },
  details: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: COLORS.light.textSecondary,
    marginLeft: 8,
  },
  specs: {
    flexDirection: 'row',
    gap: 16,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  specText: {
    fontSize: 12,
    color: COLORS.light.textSecondary,
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
});

export default PropertyPickerModal;
