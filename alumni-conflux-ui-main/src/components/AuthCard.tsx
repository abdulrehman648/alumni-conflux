import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import colors from '../theme/colors';
import { Spacing, BorderRadius } from '../../constants/theme';

interface AuthCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function AuthCard({ children, style }: AuthCardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: colors.white,
    borderRadius: BorderRadius.XL,
    padding: Spacing.XXL,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
});
