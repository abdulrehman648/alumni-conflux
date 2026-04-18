import { Plus } from "lucide-react-native";
import {
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { Spacing } from "../../constants/theme";
import colors from "../theme/colors";

type FloatingAddButtonProps = {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

export default function FloatingAddButton({
  onPress,
  style,
}: FloatingAddButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.fabButton, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Plus size={22} color={colors.white} strokeWidth={2.2} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fabButton: {
    position: "absolute",
    right: Spacing.LG,
    bottom: Spacing.XXL,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.secondary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
});
