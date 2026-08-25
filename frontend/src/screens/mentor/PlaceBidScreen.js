import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import * as bidService from '../../services/bid';
import { showAlert } from '../../utils/alert';

const PlaceBidScreen = ({ route, navigation }) => {
  const { bountyId } = route.params;
  const [priceOffer, setPriceOffer] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!priceOffer) {
      showAlert('Error', 'Please enter your bid amount');
      return;
    }

    if (isNaN(parseFloat(priceOffer)) || parseFloat(priceOffer) <= 0) {
      showAlert('Error', 'Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      await bidService.createBid(bountyId, priceOffer, note);
      showAlert('Success', 'Bid placed successfully!');
      navigation.goBack();
    } catch (error) {
      showAlert('Error', error.response?.data?.error || 'Failed to place bid');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Place Your Bid</Text>

      <Text style={styles.label}>Your Offer ($) *</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., 20.00"
        value={priceOffer}
        onChangeText={setPriceOffer}
        keyboardType="decimal-pad"
      />

      <Text style={styles.label}>Note (Optional)</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Add a message to the student..."
        value={note}
        onChangeText={setNote}
        multiline
        numberOfLines={4}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Placing Bid...' : 'Submit Bid'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PlaceBidScreen;
