import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radii } from '../theme';

const VARIANTS = {
  open: { bg: colors.successBg, fg: colors.success, label: 'Open' },
  in_progress: { bg: colors.warningBg, fg: colors.warning, label: 'In progress' },
  closed: { bg: colors.infoBg, fg: colors.info, label: 'Completed' },
  success: { bg: colors.successBg, fg: colors.success },
  warning: { bg: colors.warningBg, fg: colors.warning },
  error: { bg: colors.errorBg, fg: colors.error },
  neutral: { bg: colors.surfaceMuted, fg: colors.textSecondary },
  accent: { bg: colors.accentBg, fg: colors.accent, label: 'New' },
};

const Badge = ({ status, label, variant, dot = true, style }) => {
  const key = variant || (status ? status.toLowerCase() : 'neutral');
  const v = VARIANTS[key] || VARIANTS.neutral;

  return (
    <View style={[styles.badge, { backgroundColor: v.bg }, style]}>
      {dot ? <View style={[styles.dot, { backgroundColor: v.fg }]} /> : null}
      <Text style={[styles.text, { color: v.fg }]}>{label || v.label || status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.pill,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 7,
  },
  text: {
    fontSize: 13,
    fontWeight: '650',
  },
});

export default Badge;
