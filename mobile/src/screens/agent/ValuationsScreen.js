/**
 * Valuations Screen - Agent
 * Gestione valutazioni
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
  FAB,
  Chip,
  Text,
  ActivityIndicator,
  Searchbar,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, getColorByStatus } from '../../constants/colors';
import { apiClient } from '../../services/api';

const ValuationsScreen = ({ navigation }) => {
  const [valuations, setValuations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadValuations();
  }, []);

  const loadValuations = async () => {
    try {
      const response = await apiClient.get('/api/valuations');
      setValuations(response.data);
    } catch (error) {
      console.error('Error loading valuations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadValuations();
  };

  const filteredValuations = valuations.filter(val =>
    val.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    val.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const ValuationCard = ({ item }) => {
    const statusColor = getColorByStatus(item.status);

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => navigation.navigate('ValuationDetail', { valuationId: item.id })}
      >
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <View style={styles.headerLeft}>
                <MaterialCommunityIcons
                  name="clipboard-check"
                  size={24}
                  color={statusColor}
                />
                <View style={styles.headerText}>
                  <Text style={styles.clientName}>{item.client_name}</Text>
                  <Text style={styles.address}>{item.property_location}</Text>
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

            {item.property_type && (
              <View style={styles.propertyInfo}>
                <MaterialCommunityIcons
                  name="home-variant"
                  size={16}
                  color={COLORS.light.textSecondary}
                />
                <Text style={styles.propertyType}>
                  Tipo: {item.property_type}
                </Text>
              </View>
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Valutazioni</Text>
      </View>
      <Searchbar
        placeholder="Cerca valutazioni..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      <FlatList
        data={filteredValuations}
        renderItem={({ item }) => <ValuationCard item={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="clipboard-text"
              size={64}
              color={COLORS.light.textSecondary}
            />
            <Text style={styles.emptyText}>Nessuna valutazione trovata</Text>
          </View>
        }
      />

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('ValuationForm', {})}
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
  header: {
    backgroundColor: COLORS.primary,
    padding: 16,
    paddingTop: 48,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
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
  address: {
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
  propertyType: {
    fontSize: 14,
    color: COLORS.light.textSecondary,
    marginLeft: 8,
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

export default ValuationsScreen;
