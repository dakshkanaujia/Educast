import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme';

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] || '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
};

const Avatar = ({ name, size = 48, style }) => (
  <View
    style={[
      styles.circle,
      { width: size, height: size, borderRadius: size / 2 },
      style,
    ]}
  >
    <Text style={[styles.initials, { fontSize: size * 0.36 }]}>{getInitials(name)}</Text>
  </View>
);

const styles = StyleSheet.create({
  circle: {
    backgroundColor: colors.avatarBg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
});

export default Avatar;
