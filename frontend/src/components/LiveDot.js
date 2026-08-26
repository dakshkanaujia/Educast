import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../theme';
import { ensureWebAnimations, prefersReducedMotion } from '../theme/webAnimations';

// A small solid dot with a soft pulsing ring around it — the app's one
// "this is live" signal, reused for the quote banner and live-feed stats.
const LiveDot = ({ size = 7, color = colors.accent, style }) => {
  const [reduced] = useState(prefersReducedMotion);

  useEffect(() => {
    ensureWebAnimations();
  }, []);

  return (
    <View style={[styles.wrap, { width: size * 2.4, height: size * 2.4 }, style]}>
      {!reduced ? (
        <View
          style={[
            styles.ring,
            {
              width: size * 2.4,
              height: size * 2.4,
              borderRadius: size * 1.2,
              backgroundColor: color,
              animationName: 'educast-pulse',
              animationDuration: '2s',
              animationTimingFunction: 'ease-out',
              animationIterationCount: 'infinite',
            },
          ]}
        />
      ) : null}
      <View style={[styles.core, { width: size, height: size, borderRadius: size / 2, backgroundColor: color }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
  },
  core: {
    position: 'absolute',
  },
});

export default LiveDot;
