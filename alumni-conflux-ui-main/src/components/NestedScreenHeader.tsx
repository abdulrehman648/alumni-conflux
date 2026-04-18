import { ChevronLeft } from "lucide-react-native";
import { ReactNode } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FontSizes, Spacing } from "../../constants/theme";
import colors from "../theme/colors";

type NestedScreenHeaderProps = {
  title: string;
  subtitle?: string;
  onBack: () => void;
  rightAction?: ReactNode;
};

export default function NestedScreenHeader({
  title,
  subtitle,
  onBack,
  rightAction,
}: NestedScreenHeaderProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.iconButton}>
        <ChevronLeft size={18} color={colors.textDark} strokeWidth={2.5} />
      </TouchableOpacity>

      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      {rightAction ? (
        <View style={styles.rightSlot}>{rightAction}</View>
      ) : (
        <View style={styles.spacer} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.MD,
    paddingTop: Spacing.MD,
    paddingBottom: Spacing.MD,
    gap: Spacing.SM,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    flex: 1,
    alignItems: "flex-start",
  },
  title: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.LG,
    fontWeight: "600",
    color: colors.textDark,
    textAlign: "left",
  },
  subtitle: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.SM,
    fontWeight: "400",
    color: colors.textLight,
    textAlign: "left",
  },
  rightSlot: {
    minWidth: 36,
    alignItems: "flex-end",
  },
  spacer: {
    width: 36,
    height: 36,
  },
});
