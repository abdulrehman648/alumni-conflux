import React from "react";
import {
  View,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextInputProps,
} from "react-native";
import { Search, X } from "lucide-react-native";
import colors from "../theme/colors";
import { FontSizes, Spacing } from "../../constants/theme";

interface SearchBarProps extends Omit<TextInputProps, "style"> {
  onClear?: () => void;
  containerStyle?: ViewStyle;
}

export default function SearchBar({
  value = "",
  onChangeText,
  onClear,
  placeholder = "Search...",
  containerStyle,
  ...props
}: SearchBarProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      <Search size={20} color={colors.textLight} strokeWidth={1.5} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.textLight}
        value={value}
        onChangeText={onChangeText}
        {...props}
      />
      {value && value.length > 0 && onClear && (
        <X
          size={20}
          color={colors.textLight}
          strokeWidth={1.5}
          onPress={onClear}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: Spacing.LG,
    marginBottom: Spacing.LG,
    paddingHorizontal: Spacing.MD,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: Spacing.SM,
  },

  input: {
    flex: 1,
    paddingVertical: Spacing.SM,
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.Base,
    fontWeight: "400",
    color: colors.textDark,
  },
});
