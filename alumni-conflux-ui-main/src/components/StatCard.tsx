import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { LucideIcon } from "lucide-react-native";
import colors from "../theme/colors";
import { FontSizes, Spacing } from "../../constants/theme";

interface StatCardProps {
  icon: LucideIcon;
  number: string;
  label: string;
  trend?: {
    value: string;
    direction: "up" | "down";
  };
  style?: ViewStyle;
  onPress?: () => void;
}

export default function StatCard({
  icon: Icon,
  number,
  label,
  trend,
  style,
}: StatCardProps) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.iconContainer}>
        <Icon size={24} color={colors.primary} strokeWidth={1.5} />
      </View>
      <Text style={styles.number}>{number}</Text>
      <Text style={styles.label}>{label}</Text>
      {trend && (
        <Text
          style={[
            styles.trend,
            trend.direction === "up" ? styles.trendUp : styles.trendDown,
          ]}
        >
          {trend.direction === "up" ? "↑" : "↓"} {trend.value}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.card,
    padding: Spacing.MD,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },

  iconContainer: {
    marginBottom: Spacing.SM,
  },

  number: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.LG,
    fontWeight: "600",
    color: colors.primary,
  },

  label: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.XS,
    fontWeight: "400",
    color: colors.textLight,
    marginTop: Spacing.XS,
    textAlign: "center",
  },

  trend: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.XS,
    fontWeight: "600",
    marginTop: Spacing.XS,
  },

  trendUp: {
    color: colors.success,
  },

  trendDown: {
    color: colors.danger,
  },
});
