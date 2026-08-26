import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { typography } from '../theme';

const EmptyState = ({ icon, title, hint, action, style }) => (
  <View style={[styles.container, style]}>
    {icon ? <Text style={styles.icon}>{icon}</Text> : null}
    <Text style={styles.title}>{title}</Text>
    {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    {action ? <View style={styles.action}>{action}</View> : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  icon: {
    fontSize: 32,
    marginBottom: 12,
  },
  title: {
    ...typography.title,
    marginBottom: 6,
    textAlign: 'center',
  },
  hint: {
    ...typography.bodySecondary,
    textAlign: 'center',
  },
  action: {
    marginTop: 16,
  },
});

export default EmptyState;
