import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { FontSizes, Spacing } from "../../constants/theme";
import colors from "../theme/colors";

type SegmentedOption<T extends string> = {
  value: T;
  label: string;
};

type SegmentedControlProps<T extends string> = {
  options: Array<SegmentedOption<T>>;
  value: T;
  onChange: (nextValue: T) => void;
  containerStyle?: StyleProp<ViewStyle>;
};

export default function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  containerStyle,
}: SegmentedControlProps<T>) {
  return (
    <View style={[styles.container, containerStyle]}>
      {options.map((option, index) => {
        const isActive = option.value === value;

        return (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.segmentButton,
              index < options.length - 1 && styles.segmentButtonDivider,
              isActive && styles.segmentButtonActive,
            ]}
            onPress={() => onChange(option.value)}
            activeOpacity={0.85}
          >
            <Text
              style={[styles.segmentText, isActive && styles.segmentTextActive]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    overflow: "hidden",
  },
  segmentButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  segmentButtonDivider: {
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  segmentButtonActive: {
    backgroundColor: colors.secondary,
  },
  segmentText: {
    fontFamily: "Poppins-Medium",
    fontSize: FontSizes.SM,
    color: colors.textDark,
  },
  segmentTextActive: {
    color: colors.white,
  },
});
