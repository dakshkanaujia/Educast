import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useWebSocket } from '../../context/WebSocketContext';
import * as bountyService from '../../services/bounty';
import * as bidService from '../../services/bid';
import { showAlert } from '../../utils/alert';

const BountyDetailScreen = ({ route, navigation }) => {
  const { bountyId } = route.params;
  const [bounty, setBounty] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(false);
  const { messages } = useWebSocket();

  useEffect(() => {
    loadBountyDetails();
    loadBids();
  }, []);

  useEffect(() => {
    // Listen for new bids
    const newBids = messages.filter(m => m.type === 'bid_created');
    if (newBids.length > 0) {
      loadBids();
    }
  }, [messages]);

  const loadBountyDetails = async () => {
    try {
      const data = await bountyService.getBountyById(bountyId);
      setBounty(data);
    } catch (error) {
      showAlert('Error', 'Failed to load bounty details');
    }
  };

  const loadBids = async () => {
    setLoading(true);
    try {
      const data = await bountyService.getBidsForBounty(bountyId);
      setBids(data || []);
    } catch (error) {
      console.error('Error loading bids:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptBid = async (bidId) => {
    showAlert(
      'Accept Bid',
      'Are you sure you want to accept this bid?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            try {
              const result = await bidService.acceptBid(bidId);
              showAlert('Success', 'Bid accepted!');
              navigation.navigate('SessionRoom', {
                roomId: result.room_id,
                bountyId: bountyId,
                targetUserId: result.mentor_id
              });
            } catch (error) {
              showAlert('Error', error.response?.data?.error || 'Failed to accept bid');
            }
          },
        },
      ]
    );
  };

  const renderBid = ({ item }) => (
    <View style={styles.bidCard}>
      <View style={styles.bidHeader}>
        <Text style={styles.mentorName}>{item.mentor?.name || 'Mentor'}</Text>
        <Text style={styles.bidPrice}>${item.price_offer}</Text>
      </View>
      {item.note && <Text style={styles.bidNote}>{item.note}</Text>}
      {bounty?.status === 'OPEN' && !item.is_accepted && (
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() => handleAcceptBid(item.id)}
        >
          <Text style={styles.acceptButtonText}>Accept Bid</Text>
        </TouchableOpacity>
      )}
      {item.is_accepted && (
        <Text style={styles.acceptedText}>✓ Accepted</Text>
      )}
    </View>
  );

  if (!bounty) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.bountyCard}>
        <Text style={styles.title}>{bounty.title}</Text>
        <Text style={styles.description}>{bounty.description}</Text>
        <View style={styles.infoRow}>
          <Text style={styles.budget}>${bounty.budget}</Text>
          <Text style={[styles.status, { color: getStatusColor(bounty.status) }]}>
            {bounty.status}
          </Text>
        </View>
        {bounty.subject_tag && (
          <Text style={styles.tag}>#{bounty.subject_tag}</Text>
        )}
      </View>

      <Text style={styles.sectionTitle}>Bids ({bids.length})</Text>

      {bids.length === 0 ? (
        <Text style={styles.emptyText}>No bids yet. Waiting for mentors...</Text>
      ) : (
        <FlatList
          data={bids}
          renderItem={renderBid}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
        />
      )}

      {bounty.status === 'IN_PROGRESS' && (
        <TouchableOpacity
          style={styles.completeButton}
          onPress={() => navigation.navigate('Completion', { bountyId })}
        >
          <Text style={styles.completeButtonText}>Mark as Complete</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const getStatusColor = (status) => {
  switch (status) {
    case 'OPEN': return '#4CAF50';
    case 'IN_PROGRESS': return '#FF9800';
    case 'CLOSED': return '#9E9E9E';
    default: return '#000';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  bountyCard: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  budget: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  status: {
    fontSize: 16,
    fontWeight: '600',
  },
  tag: {
    color: '#007AFF',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 20,
    paddingBottom: 10,
  },
  bidCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 15,
    borderRadius: 8,
  },
  bidHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  mentorName: {
    fontSize: 18,
    fontWeight: '600',
  },
  bidPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  bidNote: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  acceptButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  acceptedText: {
    color: '#4CAF50',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    padding: 20,
  },
  completeButton: {
    backgroundColor: '#4CAF50',
    margin: 20,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  completeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default BountyDetailScreen;
