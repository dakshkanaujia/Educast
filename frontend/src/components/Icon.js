import React from 'react';
import { Text } from 'react-native';
import { colors } from '../theme';

// Small, monochrome glyph set — deliberately not a full icon font dependency.
const GLYPHS = {
  back: '‹',
  chevronRight: '›',
  close: '✕',
  check: '✓',
  star: '★',
  starOutline: '☆',
  dot: '•',
  plus: '+',
};

const Icon = ({ name, size = 18, color = colors.textPrimary, style }) => (
  <Text style={[{ fontSize: size, color, fontWeight: '600' }, style]}>
    {GLYPHS[name] || ''}
  </Text>
);

export default Icon;
