import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme';

const RatingStars = ({ rating = 0, size = 14, showValue = true, count }) => {
  const full = Math.round(rating);

  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Text key={i} style={{ fontSize: size, color: i <= full ? colors.textPrimary : colors.borderStrong }}>
          ★
        </Text>
      ))}
      {showValue && (
        <Text style={[styles.value, { fontSize: size - 1 }]}>
          {rating > 0 ? rating.toFixed(1) : 'New'}
          {count != null ? ` (${count})` : ''}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  value: {
    marginLeft: 6,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});

export default RatingStars;
