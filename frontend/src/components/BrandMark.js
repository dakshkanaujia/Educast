import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../theme';

// Small abstract geometric mark — no image asset required.
const BrandMark = ({ size = 56 }) => (
  <View style={[styles.wrap, { width: size, height: size }]}>
    <View style={[styles.square, { width: size, height: size, borderRadius: size * 0.28 }]} />
    <View
      style={[
        styles.ring,
        {
          width: size * 0.44,
          height: size * 0.44,
          borderRadius: size * 0.22,
          top: -size * 0.12,
          right: -size * 0.12,
        },
      ]}
    />
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
  },
  square: {
    backgroundColor: colors.primary,
  },
  ring: {
    position: 'absolute',
    backgroundColor: colors.background,
    borderWidth: 2.5,
    borderColor: colors.primary,
  },
});

export default BrandMark;
