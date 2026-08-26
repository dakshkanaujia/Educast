import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as bountyService from '../../services/bounty';
import { showAlert } from '../../utils/alert';
import { Button, TextArea } from '../../components';
import { colors, typography, layout } from '../../theme';

const CompletionScreen = ({ route, navigation }) => {
  const { bountyId } = route.params;
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    if (rating === 0) {
      showAlert('Rating required', 'Please select a star rating before submitting');
      return;
    }

    setLoading(true);
    try {
      await bountyService.completeBounty(bountyId, rating, comment);
      showAlert('Success', 'Bounty completed and mentor rated!');
      navigation.navigate('StudentHome');
    } catch (error) {
      showAlert('Error', error.response?.data?.error || 'Failed to complete bounty');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Rate your mentor</Text>
        <Text style={styles.subtitle}>How was your session?</Text>

        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => setRating(star)} hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}>
              <Text style={styles.star}>{star <= rating ? '★' : '☆'}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextArea
          label="Leave a review (optional)"
          placeholder="What was helpful about this session?"
          value={comment}
          onChangeText={setComment}
          maxLength={500}
          style={styles.commentField}
        />

        <Button title="Complete & Submit" onPress={handleComplete} loading={loading} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: colors.background,
    justifyContent: 'center',
  },
  content: {
    width: '100%',
    maxWidth: layout.authMaxWidth,
    alignSelf: 'center',
  },
  title: {
    ...typography.display,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodySecondary,
    fontSize: 15,
    marginBottom: 28,
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 28,
  },
  star: {
    fontSize: 42,
    marginHorizontal: 6,
    color: colors.textPrimary,
  },
  commentField: {
    marginBottom: 8,
  },
});

export default CompletionScreen;
