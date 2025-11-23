import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, Searchbar, FAB, Chip, Card } from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { COLORS } from '../../constants/colors';

const BACKEND_URL = 'https://rebot-tarquinia.preview.emergentagent.com';

export default function PropertiesScreen() {
  const navigation = useNavigation();
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  useFocusEffect(
    useCallback(() => {
      loadProperties();
    }, [])
  );

  const loadProperties = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${BACKEND_URL}/api/properties`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProperties(response.data);
      setFilteredProperties(response.data);
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadProperties();
  };

  const filterProperties = (query, type) => {
    let filtered = properties;

    if (type !== 'all') {
      filtered = filtered.filter(p => p.property_type === type);
    }

    if (query) {
      filtered = filtered.filter(p => 
        p.title?.toLowerCase().includes(query.toLowerCase()) ||
        p.location?.toLowerCase().includes(query.toLowerCase())
      );
    }

    setFilteredProperties(filtered);
  };

  const onSearchChange = (query) => {
    setSearchQuery(query);
    filterProperties(query, selectedType);
  };

  const onTypeChange = (type) => {
    setSelectedType(type);
    filterProperties(searchQuery, type);
  };

  const renderProperty = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('PropertyDetail', { propertyId: item.id })}
    >
      <Card style={styles.card}>
        <Card.Cover 
          source={{ uri: item.images?.[0] || 'https://via.placeholder.com/400x200' }} 
          style={styles.cardImage}
        />
        <Card.Content style={styles.cardContent}>
          <Text style={styles.price}>€{item.price?.toLocaleString()}</Text>
          <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.location} numberOfLines={1}>📍 {item.location}</Text>
          <View style={styles.detailsRow}>
            {item.bedrooms && (
              <Text style={styles.detail}>🛏️ {item.bedrooms}</Text>
            )}
            {item.bathrooms && (
              <Text style={styles.detail}>🚿 {item.bathrooms}</Text>
            )}
            {item.square_meters && (
              <Text style={styles.detail}>📐 {item.square_meters}m²</Text>
            )}
          </View>
          <Chip
            mode="flat"
            style={[styles.chip, { backgroundColor: item.status === 'disponibile' ? COLORS.success : COLORS.warning }]}
            textStyle={styles.chipText}
          >
            {item.status || 'Disponibile'}
          </Chip>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Cerca immobili..."
        onChangeText={onSearchChange}
        value={searchQuery}
        style={styles.searchBar}
      />

      <View style={styles.filterContainer}>
        <Chip
          selected={selectedType === 'all'}
          onPress={() => onTypeChange('all')}
          style={styles.filterChip}
          mode={selectedType === 'all' ? 'flat' : 'outlined'}
        >
          Tutti
        </Chip>
        <Chip
          selected={selectedType === 'Appartamento'}
          onPress={() => onTypeChange('Appartamento')}
          style={styles.filterChip}
          mode={selectedType === 'Appartamento' ? 'flat' : 'outlined'}
        >
          Appartamenti
        </Chip>
        <Chip
          selected={selectedType === 'Villa'}
          onPress={() => onTypeChange('Villa')}
          style={styles.filterChip}
          mode={selectedType === 'Villa' ? 'flat' : 'outlined'}
        >
          Ville
        </Chip>
      </View>

      <FlatList
        data={filteredProperties}
        renderItem={renderProperty}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nessun immobile trovato</Text>
            </View>
          )
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('PropertyForm')}
        color="white"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  searchBar: {
    margin: 16,
    elevation: 2,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  filterChip: {
    marginRight: 8,
  },
  listContent: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 3,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardImage: {
    height: 200,
  },
  cardContent: {
    padding: 16,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  detail: {
    fontSize: 14,
    color: '#666',
  },
  chip: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  chipText: {
    fontSize: 12,
    color: 'white',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});
