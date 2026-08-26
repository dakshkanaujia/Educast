import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, radii } from '../theme';

const VARIANTS = {
  primary: {
    container: { backgroundColor: colors.accent, borderWidth: 0 },
    text: { color: colors.onPrimary },
    spinner: colors.onPrimary,
  },
  secondary: {
    container: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderStrong },
    text: { color: colors.textPrimary },
    spinner: colors.textPrimary,
  },
  ghost: {
    container: { backgroundColor: 'transparent', borderWidth: 0 },
    text: { color: colors.textPrimary },
    spinner: colors.textPrimary,
  },
  danger: {
    container: { backgroundColor: colors.errorBg, borderWidth: 1, borderColor: '#F1C6C0' },
    text: { color: colors.error },
    spinner: colors.error,
  },
};

const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = true,
  style,
  textStyle,
}) => {
  const isDisabled = disabled || loading;
  const v = VARIANTS[variant] || VARIANTS.primary;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
      style={[
        styles.base,
        size === 'sm' && styles.sm,
        v.container,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.spinner} />
      ) : (
        <Text style={[styles.text, size === 'sm' && styles.textSm, v.text, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    paddingVertical: 17,
    paddingHorizontal: 22,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    minHeight: 54,
  },
  sm: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 44,
    borderRadius: radii.md,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.45,
  },
  text: {
    fontSize: 17,
    fontWeight: '700',
  },
  textSm: {
    fontSize: 15,
  },
});

export default Button;
