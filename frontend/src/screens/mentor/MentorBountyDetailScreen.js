import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import * as bountyService from '../../services/bounty';
import { showAlert } from '../../utils/alert';

const MentorBountyDetailScreen = ({ route, navigation }) => {
  const { bountyId } = route.params;
  const [bounty, setBounty] = useState(null);

  useEffect(() => {
    loadBountyDetails();
  }, []);

  const loadBountyDetails = async () => {
    try {
      const data = await bountyService.getBountyById(bountyId);
      setBounty(data);
    } catch (error) {
      showAlert('Error', 'Failed to load bounty details');
    }
  };

  if (!bounty) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{bounty.title}</Text>
        <Text style={styles.description}>{bounty.description}</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Budget:</Text>
          <Text style={styles.budget}>${bounty.budget}</Text>
        </View>

        {bounty.subject_tag && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Subject:</Text>
            <Text style={styles.tag}>#{bounty.subject_tag}</Text>
          </View>
        )}

        <View style={styles.infoRow}>
          <Text style={styles.label}>Posted by:</Text>
          <Text style={styles.value}>{bounty.student?.name || 'Student'}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('PlaceBid', { bountyId })}
      >
        <Text style={styles.buttonText}>Place Bid</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: 'white',
    padding: 20,
    margin: 15,
    borderRadius: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    lineHeight: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    color: '#666',
  },
  budget: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  tag: {
    fontSize: 16,
    color: '#007AFF',
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#007AFF',
    margin: 15,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default MentorBountyDetailScreen;
