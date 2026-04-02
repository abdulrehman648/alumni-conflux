import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import colors from '../theme/colors';
import { FontFamily, FontSizes, Spacing, BorderRadius } from '../../constants/theme';

interface RoundedButtonProps {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
}

export default function RoundedButton({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  icon,
}: RoundedButtonProps) {
  const [pressed, setPressed] = useState(false);

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: BorderRadius.FULL,
      justifyContent: 'center',
      alignItems: 'center',
      opacity: disabled ? 0.6 : 1,
    };

    // Size variants
    const sizeStyles: Record<string, ViewStyle> = {
      small: {
        paddingVertical: Spacing.SM,
        paddingHorizontal: Spacing.LG,
      },
      medium: {
        paddingVertical: Spacing.MD + 2,
        paddingHorizontal: Spacing.XL + 4,
      },
      large: {
        paddingVertical: Spacing.LG,
        paddingHorizontal: Spacing.XXXL,
      },
    };

    // Color variants
    const colorStyles: Record<string, ViewStyle> = {
      primary: {
        backgroundColor: colors.primary,
        elevation: 4,
        shadowColor: colors.primary,
        shadowOpacity: 0.3,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      },
      secondary: {
        backgroundColor: colors.background,
        borderWidth: 1.5,
        borderColor: colors.primary,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: colors.primary,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...colorStyles[variant],
      transform: [{ scale: pressed ? 0.98 : 1 }],
    };
  };

  const getTextStyle = (): TextStyle => {
    const colorMap: Record<string, string> = {
      primary: colors.white,
      secondary: colors.primary,
      outline: colors.primary,
    };

    return {
      fontFamily: FontFamily.semibold,
      fontSize: FontSizes.Base,
      fontWeight: '600' as const,
      color: colorMap[variant],
      textAlign: 'center',
    };
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? colors.white : colors.primary}
        />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.icon}>{icon}</View>}
          <Text style={getTextStyle()}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.SM,
  },
  icon: {
    marginRight: Spacing.XS,
  },
});
