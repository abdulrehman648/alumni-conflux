import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ViewStyle,
  ImageSourcePropType,
} from "react-native";
import colors from "../theme/colors";
import { FontSizes, Spacing } from "../../constants/theme";

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
    alignItems: "center",
    marginBottom: Spacing.XL,
  },
  illustration: {
    width: 160,
    height: 160,
    marginBottom: Spacing.HUGE,
  },
  title: {
    fontFamily: "Poppins-Bold",
    fontSize: 32,
    fontWeight: "700",
    color: colors.primary,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.Base,
    fontWeight: "400",
    color: colors.textLight,
    textAlign: "center",
  },
});
