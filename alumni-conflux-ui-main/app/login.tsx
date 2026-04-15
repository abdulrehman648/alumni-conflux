import { useLocalSearchParams, useRouter } from "expo-router";
import { EyeOff } from "lucide-react-native";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import Toast from "react-native-toast-message";
import { FontSizes, Spacing } from "../constants/theme";
import AuthCard from "../src/components/AuthCard";
import AuthHeader from "../src/components/AuthHeader";
import RoundedButton from "../src/components/RoundedButton";
import { useAuth } from "../src/context/AuthContext";
import { authService } from "../src/services/api";
import colors from "../src/theme/colors";

export default function Login() {
  const router = useRouter();
  const { setAuthData } = useAuth();
  const params = useLocalSearchParams();
  const selectedRole = (params.role as string)?.toUpperCase();
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    emailOrUsername?: string;
    password?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!emailOrUsername.trim()) {
      newErrors.emailOrUsername = "Email or username is required";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await authService.login(
        emailOrUsername.trim(),
        password.trim(),
      );

      if (response && response.role) {
        const userRole = response.role?.toUpperCase();

        if (selectedRole && userRole !== selectedRole) {
          setLoading(false);
          Alert.alert(
            "Role Mismatch",
            `You are a ${userRole}, but trying to log in as ${selectedRole}`,
            [{ text: "Cancel", style: "cancel" }, { text: "OK" }]
          );
          return;
        }

        setTimeout(() => {
          setLoading(false);

          const userRole = response.role?.toUpperCase();
          const userId = (response.userId || response.id).toString();
          const profileComplete = response.profileComplete !== false;

          setAuthData({
            userId,
            userRole,
            fullName: response.fullName,
            profileComplete,
          });

          if (userRole === "ADMIN") {
            router.replace("/(admin)");
          } else if (userRole === "ALUMNI") {
            router.replace("/(alumni)");
          } else {
            router.replace("/(student)");
          }
        }, 1000);
      } else {
        setLoading(false);
        Alert.alert(
          "Login Failed",
          "Invalid credentials",
          [{ text: "Cancel", style: "cancel" }, { text: "OK" }]
        );
      }
    } catch (error: any) {
      setLoading(false);
      const errorData = error.response?.data;
      const errorMessage =
        errorData?.message ||
        errorData?.error ||
        errorData?.detail ||
        errorData?.details ||
        (typeof errorData === 'string' ? errorData : null) ||
        "An error occurred during login";

      Alert.alert(
        "Login Failed",
        errorMessage,
        [{ text: "Cancel", style: "cancel" }, { text: "OK" }]
      );
    }
  };

  return (
    <>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <AuthHeader title="Welcome Back" subtitle="Sign in to continue" />

          <AuthCard>
            <View style={styles.floatingLabelContainer}>
              <Text
                style={[
                  styles.floatingLabel,
                  (emailFocused || emailOrUsername.length > 0) &&
                  styles.floatingLabelActive,
                ]}
              >
                Email or Username
              </Text>
              <TextInput
                style={[styles.textInput, styles.inputWithFloatingLabel]}
                value={emailOrUsername}
                onChangeText={(text) => {
                  setEmailOrUsername(text);
                  if (errors.emailOrUsername) {
                    setErrors({ ...errors, emailOrUsername: undefined });
                  }
                }}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                editable={!loading}
              />
            </View>
            {errors.emailOrUsername && (
              <Text style={styles.errorText}>{errors.emailOrUsername}</Text>
            )}

            <View style={styles.floatingLabelContainer}>
              <Text
                style={[
                  styles.floatingLabel,
                  (passwordFocused || password.length > 0) &&
                  styles.floatingLabelActive,
                ]}
              >
                Password
              </Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) {
                      setErrors({ ...errors, password: undefined });
                    }
                  }}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                />
                {password.length > 0 && (
                  <TouchableOpacity
                    style={styles.passwordIconButton}
                    onPress={() => setShowPassword(!showPassword)}
                    activeOpacity={0.7}
                  >
                    <EyeOff size={20} color={colors.textLight} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}

            <TouchableOpacity
              style={styles.forgotContainer}
              onPress={() => router.push("/forgot-password")}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          </AuthCard>

          <RoundedButton
            title="Sign In"
            onPress={handleLogin}
            variant="primary"
            size="large"
            loading={loading}
            style={styles.loginButton}
          />

          {selectedRole !== "ADMIN" && (
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>
                Don&apos;t have an account?{" "}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  router.push(`/signup?role=${selectedRole || "STUDENT"}`)
                }
              >
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace("/role")}
          >
            <Text style={styles.backButtonText}>Back to Role Selection</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    flexGrow: 1,
    padding: Spacing.LG,
    paddingBottom: Spacing.XXL,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontFamily: "Poppins-Medium",
    fontSize: FontSizes.SM,
    color: colors.textDark,
    marginBottom: Spacing.SM,
    fontWeight: "500",
  },
  textInput: {
    width: "100%",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: Spacing.MD,
    fontSize: FontSizes.Base,
    fontFamily: "Poppins-Regular",
    color: colors.textDark,
  },
  inputWithFloatingLabel: {
    paddingTop: Spacing.LG,
  },
  passwordContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingRight: Spacing.MD,
  },
  passwordInput: {
    flex: 1,
    padding: Spacing.MD,
    paddingTop: Spacing.LG,
    fontSize: FontSizes.Base,
    fontFamily: "Poppins-Regular",
    color: colors.textDark,
  },
  passwordIconButton: {
    padding: Spacing.SM,
  },
  floatingLabelContainer: {
    width: "100%",
    marginBottom: Spacing.MD,
    position: "relative" as const,
  },
  floatingLabel: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.Base,
    color: colors.textLight,
    position: "absolute" as const,
    left: Spacing.MD,
    top: Spacing.MD,
    zIndex: 1,
  },
  floatingLabelActive: {
    fontSize: FontSizes.XS,
    top: -Spacing.SM,
    backgroundColor: colors.white,
    paddingHorizontal: Spacing.SM,
    color: colors.primary,
    fontFamily: "Poppins-Medium",
    fontWeight: "500" as const,
  },
  errorText: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.XS,
    fontWeight: "400",
    color: colors.danger,
    marginBottom: Spacing.MD,
  },
  forgotContainer: {
    alignSelf: "flex-end",
    marginTop: Spacing.SM,
  },
  forgotText: {
    fontFamily: "Poppins-Medium",
    fontSize: FontSizes.SM,
    fontWeight: "500",
    color: colors.primary,
  },
  loginButton: {
    width: "100%",
    marginTop: Spacing.XL,
  },
  signupContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: Spacing.MD,
  },
  signupText: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.Base,
    fontWeight: "400",
    color: colors.textLight,
  },
  signupLink: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.Base,
    fontWeight: "600",
    color: colors.primary,
  },
  backButton: {
    width: "100%",
    alignItems: "center",
    marginTop: Spacing.MD,
    paddingVertical: Spacing.SM,
  },
  backButtonText: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.SM,
    fontWeight: "400",
    color: colors.textLight,
    textDecorationLine: "underline",
  },
});
