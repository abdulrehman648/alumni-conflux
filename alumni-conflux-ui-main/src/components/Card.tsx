import React from "react";
import { TouchableOpacity, StyleSheet, ViewStyle } from "react-native";
import colors from "../theme/colors";
import { Spacing } from "../../constants/theme";

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: "default" | "elevated" | "outlined";
  style?: ViewStyle;
  testID?: string;
}

export default function Card({
  children,
  onPress,
  variant = "default",
  style,
  testID,
}: CardProps) {
  const Component = onPress ? TouchableOpacity : React.Fragment;
  const componentProps = onPress
    ? { onPress, activeOpacity: 0.7, style: [styles.card, cardVariant[variant], style] }
    : { style: [styles.card, cardVariant[variant], style] };

  return (
    <Component {...componentProps}>
      {children}
    </Component>
  );
}

const cardVariant: Record<string, ViewStyle> = {
  default: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  elevated: {
    backgroundColor: colors.card,
    elevation: 4,
    shadowColor: colors.textDark,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  outlined: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: Spacing.MD,
  },
});
