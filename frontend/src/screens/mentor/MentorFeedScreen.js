import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useWebSocket } from '../../context/WebSocketContext';
import * as bountyService from '../../services/bounty';
import { showAlert } from '../../utils/alert';

const MentorFeedScreen = ({ navigation }) => {
  const [bounties, setBounties] = useState([]);
  const [loading, setLoading] = useState(false);
  const { signOut } = useAuth();
  const { messages } = useWebSocket();

  useEffect(() => {
    loadBounties();
  }, []);

  useEffect(() => {
    // Listen for new bounties via WebSocket
    const newBounties = messages.filter(m => m.type === 'bounty_created');
    if (newBounties.length > 0) {
      loadBounties(); // Refresh list
    }

    // Listen for accepted bids - AUTO NAVIGATE to session room
    const acceptedBids = messages.filter(m => m.type === 'bid_accepted');
    if (acceptedBids.length > 0) {
      const latestAccepted = acceptedBids[acceptedBids.length - 1];

      // Show success notification
      showAlert('Bid Accepted!', 'Your bid has been accepted! Joining session room...');

      // Auto-navigate to session room
      setTimeout(() => {
        navigation.navigate('SessionRoom', {
          roomId: latestAccepted.payload.room_id,
          bountyId: latestAccepted.payload.bounty_id,
          targetUserId: latestAccepted.payload.student_id,
        });
      }, 1500); // Small delay to show the success message
    }
  }, [messages]);

  const loadBounties = async () => {
    setLoading(true);
    try {
      const data = await bountyService.getBounties();
      setBounties(data || []);
    } catch (error) {
      showAlert('Error', 'Failed to load bounties');
    } finally {
      setLoading(false);
    }
  };

  const renderBounty = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('MentorBountyDetail', { bountyId: item.id })}
    >
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
      <View style={styles.footer}>
        <Text style={styles.budget}>${item.budget}</Text>
        {item.subject_tag && <Text style={styles.tag}>#{item.subject_tag}</Text>}
      </View>
      <Text style={styles.student}>Posted by: {item.student?.name || 'Student'}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Live Bounty Feed</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.myBidsButton}
            onPress={() => navigation.navigate('MyBids')}
          >
            <Text style={styles.myBidsText}>My Bids</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={bounties}
        renderItem={renderBounty}
        keyExtractor={(item) => item.id.toString()}
        refreshing={loading}
        onRefresh={loadBounties}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No open bounties available</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  myBidsButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 10,
  },
  myBidsText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: 16,
  },
  card: {
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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  budget: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  tag: {
    color: '#007AFF',
    fontSize: 14,
  },
  student: {
    fontSize: 12,
    color: '#999',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#999',
  },
});

export default MentorFeedScreen;
