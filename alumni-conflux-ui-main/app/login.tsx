import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
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

        // If a specific role was selected, validate that the user has that role
        if (selectedRole && userRole !== selectedRole) {
          setLoading(false);
          Toast.show({
            type: "error",
            text1: "Role Mismatch",
            text2: `You are a ${userRole}, but trying to log in as ${selectedRole}`,
          });
          return;
        }

        Toast.show({
          type: "success",
          text1: "Welcome",
          text2: `Welcome ${response.fullName || "User"}`,
        });

        setTimeout(() => {
          setLoading(false);

          // Check if user needs to complete their profile
          const userRole = response.role?.toUpperCase();
          const userId = (response.userId || response.id).toString();
          const profileComplete = response.profileComplete !== false;

          // Set auth data in context
          setAuthData({
            userId,
            userRole,
            fullName: response.fullName,
            profileComplete,
          });

          if (userRole === "ADMIN") {
            router.replace("/(admin)");
          } else if (
            (userRole === "ALUMNI" || userRole === "STUDENT") &&
            !profileComplete
          ) {
            // Redirect to profile if not complete
            router.replace({
              pathname: "/add-profile",
              params: {
                userId,
                role: userRole,
              },
            });
          } else if (userRole === "ALUMNI") {
            router.replace("/(alumni)");
          } else if (userRole === "STUDENT") {
            router.replace("/(student)");
          } else {
            router.replace("/(student)");
          }
        }, 1000);
      } else {
        setLoading(false);
        Toast.show({
          type: "error",
          text1: "Login Failed",
          text2: "Invalid credentials",
        });
      }
    } catch (error: any) {
      setLoading(false);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An error occurred during login";

      Toast.show({
        type: "error",
        text1: "Error",
        text2: errorMessage,
      });
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
            <Text style={styles.label}>Email or Username</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Email or Username"
              placeholderTextColor={colors.textLight}
              value={emailOrUsername}
              onChangeText={(text) => {
                setEmailOrUsername(text);
                if (errors.emailOrUsername) {
                  setErrors({ ...errors, emailOrUsername: undefined });
                }
              }}
              editable
            />
            {errors.emailOrUsername && (
              <Text style={styles.errorText}>{errors.emailOrUsername}</Text>
            )}

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Password"
              placeholderTextColor={colors.textLight}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) {
                  setErrors({ ...errors, password: undefined });
                }
              }}
              secureTextEntry
              editable
            />
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
              <Text style={styles.signupText}>Don&apos;t have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/signup")}>
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
    marginBottom: Spacing.MD,
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
