import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import {
  BorderRadius,
  FontFamily,
  FontSizes,
  Spacing,
} from "../../constants/theme";
import colors from "../theme/colors";

interface AuthInputProps extends TextInputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  icon?: string;
  error?: string;
  label?: string;
  containerStyle?: ViewStyle;
}

export default function AuthInput({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  icon,
  error,
  label,
  containerStyle,
  ...rest
}: AuthInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={[containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          error && styles.inputContainerError,
        ]}
      >
        {icon && (
          <Ionicons
            name={icon as any}
            size={20}
            color={isFocused ? colors.primary : colors.textLight}
            style={styles.icon}
          />
        )}
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.textLight}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !showPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...rest}
        />
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
          >
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={20}
              color={isFocused ? colors.primary : colors.textLight}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: FontFamily.medium,
    fontSize: FontSizes.SM,
    color: colors.textDark,
    marginBottom: Spacing.SM,
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    backgroundColor: colors.white,
    borderRadius: BorderRadius.LG,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: Spacing.LG,
    elevation: 0,
    shadowColor: "transparent",
  },
  inputContainerFocused: {
    borderColor: colors.primary,
    elevation: 1,
    shadowColor: colors.primary,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  inputContainerError: {
    borderColor: colors.danger,
  },
  icon: {
    marginRight: Spacing.MD,
  },
  input: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSizes.Base,
    color: colors.textDark,
    fontWeight: "400",
    padding: 0,
  },
  errorText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSizes.XS,
    color: colors.danger,
    marginTop: Spacing.SM,
    fontWeight: "400",
  },
  eyeButton: {
    padding: Spacing.SM,
    marginLeft: Spacing.SM,
  },
});
