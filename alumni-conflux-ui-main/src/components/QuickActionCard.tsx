import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ViewStyle,
  TextStyle,
} from "react-native";
import { LucideIcon } from "lucide-react-native";
import { ChevronRight } from "lucide-react-native";
import colors from "../theme/colors";
import { FontSizes, Spacing } from "../../constants/theme";

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onPress: () => void;
  style?: ViewStyle;
}

export default function QuickActionCard({
  title,
  description,
  icon: Icon,
  onPress,
  style,
}: QuickActionCardProps) {
  return (
    <TouchableOpacity
      style={[styles.actionCard, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.actionLeft}>
        <View style={styles.actionIconContainer}>
          <Icon size={20} color={colors.primary} strokeWidth={1.5} />
        </View>
        <View style={styles.actionTextContainer}>
          <Text style={styles.actionTitle}>{title}</Text>
          <Text style={styles.actionText}>{description}</Text>
        </View>
      </View>
      <ChevronRight size={20} color={colors.textLight} strokeWidth={1.5} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  actionCard: {
    backgroundColor: colors.card,
    padding: Spacing.MD,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },

  actionLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.MD,
  },

  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },

  actionTextContainer: {
    flex: 1,
  },

  actionTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.SM,
    fontWeight: "600",
    color: colors.textDark,
  },

  actionText: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.XS,
    fontWeight: "400",
    color: colors.textLight,
  },
});
