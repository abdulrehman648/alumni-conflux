import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ViewStyle,
  ImageSourcePropType,
} from 'react-native';
import colors from '../theme/colors';
import { FontFamily, FontSizes, Spacing } from '../../constants/theme';

interface AuthHeaderProps {
  title: string;
  subtitle?: string;
  illustration?: ImageSourcePropType;
  style?: ViewStyle;
}

export default function AuthHeader({
  title,
  subtitle,
  illustration,
  style,
}: AuthHeaderProps) {
  return (
    <View style={[styles.container, style]}>
      {illustration && (
        <Image
          source={illustration}
          style={styles.illustration}
          resizeMode="contain"
        />
      )}
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: Spacing.XXXL,
  },
  illustration: {
    width: 200,
    height: 200,
    marginBottom: Spacing.XXXL,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSizes.XXXL,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: Spacing.MD,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSizes.Base,
    fontWeight: '400',
    color: colors.textLight,
    textAlign: 'center',
  },
});
