import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useWebSocket } from '../../context/WebSocketContext';
import * as bidService from '../../services/bid';
import { showAlert } from '../../utils/alert';

const MyBidsScreen = ({ navigation }) => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(false);
  const { messages } = useWebSocket();

  useEffect(() => {
    loadMyBids();
  }, []);

  useEffect(() => {
    // Refresh when bid is accepted
    const acceptedBids = messages.filter(m => m.type === 'bid_accepted');
    if (acceptedBids.length > 0) {
      loadMyBids();
      // Navigate to the session room of the most recently accepted bid
      const latestAccepted = acceptedBids[acceptedBids.length - 1].payload;
      navigation.navigate('SessionRoom', {
        roomId: latestAccepted.room_id,
        bountyId: latestAccepted.bounty_id,
        targetUserId: latestAccepted.student_id
      });
    }
  }, [messages, navigation]);

  const loadMyBids = async () => {
    setLoading(true);
    console.log('Loading my bids...');
    try {
      const data = await bidService.getMyBids();
      console.log('My bids loaded:', data);
      setBids(data || []);
    } catch (error) {
      console.error('Failed to load bids:', error);
      showAlert('Error', 'Failed to load your bids');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (bid) => {
    if (bid.is_accepted) return '#4CAF50';
    if (bid.bounty?.status === 'CLOSED') return '#9E9E9E';
    return '#FF9800';
  };

  const getStatusText = (bid) => {
    if (bid.is_accepted) return '✓ Accepted';
    if (bid.bounty?.status === 'CLOSED') return 'Not Selected';
    return 'Pending';
  };

  const renderBid = ({ item }) => (
    <View style={styles.bidCard}>
      <View style={styles.header}>
        <Text style={styles.bountyTitle} numberOfLines={1}>
          {item.bounty?.title || 'Bounty'}
        </Text>
        <Text style={[styles.status, { color: getStatusColor(item) }]}>
          {getStatusText(item)}
        </Text>
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {item.bounty?.description || ''}
      </Text>

      <View style={styles.infoRow}>
        <View>
          <Text style={styles.label}>Your Offer</Text>
          <Text style={styles.price}>${item.price_offer}</Text>
        </View>
        <View>
          <Text style={styles.label}>Budget</Text>
          <Text style={styles.budget}>${item.bounty?.budget || 0}</Text>
        </View>
      </View>

      {item.note && (
        <View style={styles.noteSection}>
          <Text style={styles.noteLabel}>Your Note:</Text>
          <Text style={styles.note}>{item.note}</Text>
        </View>
      )}

      <Text style={styles.timestamp}>
        Placed: {new Date(item.created_at).toLocaleDateString()}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Bids</Text>

      <FlatList
        data={bids}
        renderItem={renderBid}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadMyBids} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>You haven't placed any bids yet</Text>
            <Text style={styles.emptyHint}>
              Browse bounties and place bids to see them here
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  bidCard: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginTop: 15,
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  bountyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
    marginBottom: 10,
  },
  label: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  budget: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
  },
  noteSection: {
    backgroundColor: '#f8f8f8',
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
  },
  noteLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  note: {
    fontSize: 14,
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyHint: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default MyBidsScreen;
