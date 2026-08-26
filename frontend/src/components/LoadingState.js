import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, typography } from '../theme';

const LoadingState = ({ label, style }) => (
  <View style={[styles.container, style]}>
    <ActivityIndicator size="large" color={colors.primary} />
    {label ? <Text style={styles.label}>{label}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  label: {
    ...typography.bodySecondary,
    marginTop: 12,
  },
});

export default LoadingState;
