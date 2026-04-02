import React from "react";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  Text,
} from "react-native";
import colors from "../theme/colors";
import { FontSizes, Spacing } from "../../constants/theme";

interface LoadingStateProps {
  message?: string;
  size?: "small" | "large";
  style?: ViewStyle;
}

export default function LoadingState({
  message = "Loading...",
  size = "large",
  style,
}: LoadingStateProps) {
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator
        size={size}
        color={colors.primary}
      />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.MD,
  },

  message: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.Base,
    fontWeight: "400",
    color: colors.textLight,
  },
});
