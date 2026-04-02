/**
 * Design System Constants for Alumni Conflux App
 * Poppins Font, Modern Professional Design
 */

import { Platform } from 'react-native';

// ============================================
// FONT CONFIGURATION
// ============================================

export const FontFamily = Platform.select({
  ios: {
    regular: 'Poppins-Regular',
    medium: 'Poppins-Medium',
    semibold: 'Poppins-SemiBold',
    bold: 'Poppins-Bold',
  },
  android: {
    regular: 'Poppins-Regular',
    medium: 'Poppins-Medium',
    semibold: 'Poppins-SemiBold',
    bold: 'Poppins-Bold',
  },
  default: {
    regular: 'Poppins-Regular',
    medium: 'Poppins-Medium',
    semibold: 'Poppins-SemiBold',
    bold: 'Poppins-Bold',
  },
});

export const FontWeights = {
  Regular: 400,
  Medium: 500,
  SemiBold: 600,
  Bold: 700,
} as const;

// ============================================
// TYPOGRAPHY SIZES
// ============================================

export const FontSizes = {
  XS: 12,
  SM: 14,
  Base: 16,
  LG: 18,
  XL: 20,
  XXL: 24,
  XXXL: 28,
  HUGE: 32,
} as const;

// ============================================
// SPACING SCALE
// ============================================

export const Spacing = {
  XS: 4,
  SM: 8,
  MD: 12,
  LG: 16,
  XL: 20,
  XXL: 24,
  XXXL: 32,
  HUGE: 40,
} as const;

// ============================================
// BORDER RADIUS
// ============================================

export const BorderRadius = {
  SM: 8,
  MD: 12,
  LG: 16,
  XL: 20,
  FULL: 30,
} as const;

// ============================================
// LEGACY COLORS (Keep for backward compatibility)
// ============================================

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
