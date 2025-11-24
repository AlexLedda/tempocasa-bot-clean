import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, Avatar, Badge, Searchbar, SegmentedButtons, Card } from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { COLORS } from '../../constants/colors';

const BACKEND_URL = 'https://agent-dashboard-82.preview.emergentagent.com';

export default function TelegramScreen() {
  const navigation = useNavigation();
  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      
      const [conversationsRes, statsRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/telegram/conversations`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${BACKEND_URL}/api/telegram/dashboard-stats`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (conversationsRes.data.success) {
        setConversations(conversationsRes.data.conversations);
        setFilteredConversations(conversationsRes.data.conversations);
      }
      
      if (statsRes.data.success) {
        setStats(statsRes.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const filterConversations = (query, filterType) => {
    let filtered = conversations;

    // Filter by lead score
    if (filterType === 'hot') {
      filtered = filtered.filter(c => c.lead_score >= 70);
    } else if (filterType === 'warm') {
      filtered = filtered.filter(c => c.lead_score >= 40 && c.lead_score < 70);
    } else if (filterType === 'cold') {
      filtered = filtered.filter(c => c.lead_score < 40);
    }

    // Search filter
    if (query) {
      filtered = filtered.filter(c =>
        c.client_name?.toLowerCase().includes(query.toLowerCase()) ||
        c.phone?.includes(query)
      );
    }

    setFilteredConversations(filtered);
  };

  const onSearchChange = (query) => {
    setSearchQuery(query);
    filterConversations(query, filter);
  };

  const onFilterChange = (value) => {
    setFilter(value);
    filterConversations(searchQuery, value);
  };

  const getScoreBadgeColor = (score) => {
    if (score >= 70) return '#EF4444';
    if (score >= 40) return '#F59E0B';
    return '#6B7280';
  };

  const getScoreLabel = (score) => {
    if (score >= 70) return 'HOT';
    if (score >= 40) return 'WARM';
    return 'COLD';
  };

  const renderConversation = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('TelegramDetail', { conversationId: item.client_id })}
    >
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.avatarContainer}>
              <Avatar.Text 
                size={50} 
                label={item.client_name?.[0] || '?'} 
                style={styles.avatar}
              />
              <Badge
                style={[styles.badge, { backgroundColor: getScoreBadgeColor(item.lead_score) }]}
                size={20}
              >
                {item.lead_score}
              </Badge>
            </View>
            <View style={styles.infoContainer}>
              <Text style={styles.name}>{item.client_name || 'Sconosciuto'}</Text>
              <Text style={styles.phone}>{item.phone}</Text>
              <Text style={styles.lastMessage} numberOfLines={1}>
                {item.last_message || 'Nessun messaggio'}
              </Text>
            </View>
            <View style={styles.scoreContainer}>
              <Text style={[styles.scoreLabel, { color: getScoreBadgeColor(item.lead_score) }]}>
                {getScoreLabel(item.lead_score)}
              </Text>
              <Text style={styles.messageCount}>{item.message_count || 0} msg</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Stats Cards */}
      {stats && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.total_conversations || 0}</Text>
            <Text style={styles.statLabel}>Totali</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#FEE2E2' }]}>
            <Text style={[styles.statNumber, { color: '#EF4444' }]}>
              {stats.hot_leads || 0}
            </Text>
            <Text style={styles.statLabel}>HOT</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
            <Text style={[styles.statNumber, { color: '#F59E0B' }]}>
              {stats.warm_leads || 0}
            </Text>
            <Text style={styles.statLabel}>WARM</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#F3F4F6' }]}>
            <Text style={[styles.statNumber, { color: '#6B7280' }]}>
              {stats.cold_leads || 0}
            </Text>
            <Text style={styles.statLabel}>COLD</Text>
          </View>
        </View>
      )}

      <Searchbar
        placeholder="Cerca conversazioni..."
        onChangeText={onSearchChange}
        value={searchQuery}
        style={styles.searchBar}
      />

      <SegmentedButtons
        value={filter}
        onValueChange={onFilterChange}
        buttons={[
          { value: 'all', label: 'Tutte' },
          { value: 'hot', label: 'HOT' },
          { value: 'warm', label: 'WARM' },
          { value: 'cold', label: 'COLD' },
        ]}
        style={styles.segmented}
      />

      <FlatList
        data={filteredConversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.client_id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nessuna conversazione</Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#E0F2FE',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  searchBar: {
    marginHorizontal: 16,
    marginBottom: 12,
    elevation: 2,
  },
  segmented: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  listContent: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
    elevation: 2,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    backgroundColor: COLORS.primary,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  phone: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  lastMessage: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  messageCount: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
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
