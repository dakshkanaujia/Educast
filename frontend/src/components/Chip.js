import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, radii } from '../theme';

const Chip = ({ label, selected = false, onPress, style }) => {
  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.chip, selected && styles.chipSelected, style]}
    >
      <Text style={[styles.text, selected && styles.textSelected]}>{label}</Text>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  textSelected: {
    color: colors.onPrimary,
  },
});

export default Chip;
