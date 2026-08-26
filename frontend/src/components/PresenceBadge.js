import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radii } from '../theme';

const PresenceBadge = ({ count, label, style }) => {
  if (!count) return null;

  return (
    <View style={[styles.badge, style]}>
      <View style={styles.dot} />
      <Text style={styles.text}>{label || `${count} mentor${count === 1 ? '' : 's'} bidding now`}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.successBg,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: radii.pill,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.success,
    marginRight: 7,
  },
  text: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.success,
  },
});

export default PresenceBadge;
