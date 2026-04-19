import { User } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { FontSizes, Spacing } from "../../constants/theme";
import colors from "../theme/colors";

type DashboardHeaderProps = {
  fullName?: string | null;
  fallbackName: string;
};

export default function DashboardHeader({
  fullName,
  fallbackName,
}: DashboardHeaderProps) {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerProfileRow}>
        <View style={styles.headerProfileIconWrap}>
          <User size={20} color={colors.textDark} strokeWidth={2.2} />
        </View>
        <Text style={styles.headerTitle}>{fullName || fallbackName}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.LG,
    paddingTop: Spacing.SM,
    paddingBottom: Spacing.SM,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  headerProfileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.SM,
  },
  headerProfileIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.XL,
    fontWeight: "600",
    color: colors.textDark,
    textAlign: "left",
  },
});
