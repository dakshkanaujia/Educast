import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, layout } from '../theme';
import { ensureWebAnimations, prefersReducedMotion } from '../theme/webAnimations';

const STUDENT_QUOTES = [
  'The beautiful thing about learning is that nobody can take it away from you. — B.B. King',
  'Asking for help is a sign of strength, not weakness.',
  'The expert in anything was once a beginner. — Helen Hayes',
  "Every mentor you meet is a shortcut through someone else's mistakes.",
  'Progress, not perfection — one question at a time.',
  'The best investment you can make is in your own understanding.',
];

const MENTOR_QUOTES = [
  'Teaching is the highest form of understanding. — Aristotle',
  'The best way to learn is to teach. — Frank Oppenheimer',
  'Every question you answer sharpens your own expertise.',
  'Great mentors turn their knowledge into someone else’s confidence.',
  'Opportunity favors the mentor who shows up.',
  'To teach is to learn twice. — Joseph Joubert',
];

const SEPARATOR = '        ·        ';

// A thin marquee strip beneath the nav — the one piece of brand
// personality that keeps the dashboard feeling alive. Built on the
// classic "duplicate the track, translate -50%" CSS loop so it repeats
// seamlessly regardless of content width.
const QuoteBanner = ({ role }) => {
  const [reduced] = useState(prefersReducedMotion);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    ensureWebAnimations();
  }, []);

  const quotes = role === 'Mentor' ? MENTOR_QUOTES : STUDENT_QUOTES;

  const trackText = useMemo(
    () => quotes.join(SEPARATOR) + SEPARATOR,
    [quotes]
  );
  const duration = quotes.length * 10; // ~10s per quote, tuned for a slow unhurried scroll

  return (
    <Pressable
      style={styles.bar}
      onHoverIn={() => setPaused(true)}
      onHoverOut={() => setPaused(false)}
    >
      <View style={styles.inner}>
        <Text style={styles.mark}>✦</Text>
        <View style={styles.mask}>
          <View
            style={[
              styles.track,
              !reduced && {
                animationName: 'educast-marquee',
                animationDuration: `${duration}s`,
                animationTimingFunction: 'linear',
                animationIterationCount: 'infinite',
                animationPlayState: paused ? 'paused' : 'running',
              },
            ]}
          >
            <Text style={styles.text}>{trackText}</Text>
            <Text style={styles.text}>{trackText}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  bar: {
    height: 38,
    backgroundColor: colors.surfaceMuted,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    justifyContent: 'center',
  },
  inner: {
    width: '100%',
    maxWidth: layout.wideMaxWidth,
    alignSelf: 'center',
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  mark: {
    color: colors.accent,
    fontSize: 13,
    marginRight: 10,
  },
  mask: {
    flex: 1,
    overflow: 'hidden',
    maskImage: 'linear-gradient(to right, transparent, black 32px, black calc(100% - 32px), transparent)',
    WebkitMaskImage: 'linear-gradient(to right, transparent, black 32px, black calc(100% - 32px), transparent)',
  },
  track: {
    flexDirection: 'row',
    width: 'max-content',
  },
  text: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
    whiteSpace: 'nowrap',
  },
});

export default QuoteBanner;
