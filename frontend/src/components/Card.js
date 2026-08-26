import React, { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { colors, radii, shadow } from '../theme';

// Minimal card: subtle 1px border, no shadow at rest. On hover it lifts
// a couple pixels and picks up a soft shadow — the only motion in the UI.
//
// Card IS the single interactive Pressable for a clickable row — pass
// `onPress` directly rather than wrapping it in another Touchable/Pressable.
// RNW's responder system lets an inner Pressable swallow the press before
// an outer Touchable ever sees it, so nesting silently breaks navigation.
const Card = ({ children, style, padded = true, elevated = false, hoverable = true, onPress, onHoverIn, onHoverOut }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => {
        if (hoverable) setHovered(true);
        onHoverIn?.();
      }}
      onHoverOut={() => {
        setHovered(false);
        onHoverOut?.();
      }}
      style={[
        styles.card,
        padded && styles.padded,
        elevated && shadow.card,
        hoverable && hovered && styles.hovered,
        style,
      ]}
    >
      {children}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    transitionProperty: 'transform, box-shadow',
    transitionDuration: '160ms',
    transitionTimingFunction: 'ease',
  },
  padded: {
    padding: 20,
  },
  hovered: {
    transform: [{ translateY: -2 }],
    ...shadow.hover,
  },
});

export default Card;
