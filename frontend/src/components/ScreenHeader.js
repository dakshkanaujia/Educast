import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, layout } from '../theme';
import LiveDot from './LiveDot';

// The page-level header: a big title, a short live-stats subtitle, and
// one compact action (usually a CTA). Sits below AppHeader, inside the
// scroll content of a hub screen — not a nav element itself.
const ScreenHeader = ({ title, subtitle, actions, live, style }) => (
  <View style={[styles.bar, style]}>
    <View style={styles.inner}>
      <View style={styles.titleWrap}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? (
          <View style={styles.subtitleRow}>
            {live ? <LiveDot size={6} style={styles.liveDot} /> : null}
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
        ) : null}
      </View>
      {actions ? <View style={styles.actions}>{actions}</View> : null}
    </View>
  </View>
);

const styles = StyleSheet.create({
  bar: {
    paddingTop: 28,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  inner: {
    width: '100%',
    maxWidth: layout.wideMaxWidth,
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  titleWrap: {
    flex: 1,
  },
  title: {
    ...typography.display,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  liveDot: {
    marginRight: 6,
  },
  subtitle: {
    ...typography.caption,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});

export default ScreenHeader;
