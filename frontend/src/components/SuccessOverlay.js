import React from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import Button from './Button';
import { colors, typography, layout } from '../theme';

const SuccessOverlay = ({
  visible,
  title,
  subtitle,
  ctaLabel,
  onCta,
  secondaryLabel,
  onSecondary,
}) => (
  <Modal visible={visible} animationType="fade">
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.checkCircle}>
          <Text style={styles.checkMark}>✓</Text>
        </View>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

        <Button title={ctaLabel} onPress={onCta} style={styles.cta} />
        {secondaryLabel ? (
          <Button title={secondaryLabel} variant="ghost" onPress={onSecondary} />
        ) : null}
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    width: '100%',
    maxWidth: layout.authMaxWidth,
    alignItems: 'center',
  },
  checkCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.successBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  checkMark: {
    fontSize: 38,
    fontWeight: '700',
    color: colors.success,
  },
  title: {
    ...typography.h1,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    ...typography.bodySecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  cta: {
    marginBottom: 12,
  },
});

export default SuccessOverlay;
