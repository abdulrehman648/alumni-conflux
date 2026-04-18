import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Eye, EyeOff, Mail, Lock } from "lucide-react-native";
import { useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  Image,
  ImageBackground,
} from "react-native";
import { FontSizes, Spacing } from "../constants/theme";
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
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<
    "emailOrUsername" | "password" | null
  >(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const normalizeRole = (role?: string | null) =>
    (role || "")
      .toUpperCase()
      .replace(/^ROLE_/, "")
      .trim();

  const validateForm = () => {
    if (!emailOrUsername.trim()) {
      emailRef.current?.focus();
      return false;
    }

    if (!password.trim()) {
      passwordRef.current?.focus();
      return false;
    } else if (password.length < 6) {
      passwordRef.current?.focus();
      return false;
    }

    return true;
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
        const userRole = normalizeRole(response.role);
        const expectedRole = normalizeRole(selectedRole);

        if (expectedRole && userRole !== expectedRole) {
          Alert.alert(
            "Role Mismatch",
            `You are a ${userRole}, but trying to log in as ${expectedRole}`,
            [{ text: "Cancel", style: "cancel" }, { text: "OK" }],
          );
          return;
        }

        const userIdValue = response.userId ?? response.id;
        if (userIdValue === undefined || userIdValue === null) {
          Alert.alert(
            "Login Failed",
            "Unable to read user data from server response",
            [{ text: "Cancel", style: "cancel" }, { text: "OK" }],
          );
          return;
        }

        const userId = userIdValue.toString();
        const profileComplete = response.profileComplete !== false;
        const authToken =
          response.token || response.accessToken || response.access_token;

        setAuthData({
          userId,
          userRole,
          fullName: response.fullName,
          profileComplete,
          authToken,
        });

        if (userRole === "ADMIN") {
          router.replace("/(admin)");
        } else if (userRole === "ALUMNI") {
          router.replace("/(alumni)");
        } else {
          router.replace("/(student)");
        }
      } else {
        Alert.alert("Login Failed", "Invalid credentials", [
          { text: "Cancel", style: "cancel" },
          { text: "OK" },
        ]);
      }
    } catch (error: any) {
      const errorData = error.response?.data;
      const isTimeout =
        error?.code === "ECONNABORTED" ||
        (typeof error?.message === "string" &&
          error.message.toLowerCase().includes("timeout"));
      const rawErrorMessage =
        (isTimeout ? "Request timed out. Please try again." : null) ||
        errorData?.message ||
        errorData?.error ||
        errorData?.detail ||
        errorData?.details ||
        (typeof errorData === "string" ? errorData : null) ||
        error?.message ||
        "An error occurred during login";

      const errorMessage = String(rawErrorMessage)
        .replace(/occured/gi, "occurred")
        .replace(/while\s+login/gi, "while logging in");

      Alert.alert("Login Failed", errorMessage, [
        { text: "Cancel", style: "cancel" },
        { text: "OK" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <ImageBackground
        source={require("../assets/images/background.jpeg")}
        style={styles.container}
        resizeMode="cover"
      >
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Image
            source={require("../assets/images/alumni-conflux-logo.jpeg")}
            style={styles.logo}
            resizeMode="contain"
          />

          <View style={styles.formSection}>
            <View style={styles.inputContainer}>
              <View
                style={[
                  styles.iconInputContainer,
                  focusedField === "emailOrUsername" &&
                    styles.iconInputContainerFocused,
                ]}
              >
                <Mail size={20} color={colors.primary} strokeWidth={2} />
                <TextInput
                  ref={emailRef}
                  style={styles.iconTextInput}
                  value={emailOrUsername}
                  onChangeText={setEmailOrUsername}
                  onFocus={() => setFocusedField("emailOrUsername")}
                  onBlur={() => setFocusedField(null)}
                  editable={!loading}
                  placeholder="Email or Username"
                  placeholderTextColor={colors.textLight}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <View
                style={[
                  styles.iconInputContainer,
                  focusedField === "password" &&
                    styles.iconInputContainerFocused,
                ]}
              >
                <Lock size={20} color={colors.primary} strokeWidth={2} />
                <TextInput
                  ref={passwordRef}
                  style={styles.iconPasswordInput}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                  placeholder="Password"
                  placeholderTextColor={colors.textLight}
                />
                {password.length > 0 && (
                  <TouchableOpacity
                    style={styles.passwordIconButton}
                    onPress={() => setShowPassword(!showPassword)}
                    activeOpacity={0.7}
                  >
                    {showPassword ? (
                      <EyeOff size={20} color={colors.textLight} />
                    ) : (
                      <Eye size={20} color={colors.textLight} />
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <RoundedButton
              title="Login"
              onPress={handleLogin}
              variant="primary"
              size="small"
              loading={loading}
              style={styles.loginButton}
            />

            <TouchableOpacity
              style={styles.forgotContainer}
              onPress={() => router.push("/forgot-password")}
            >
              <Text style={styles.forgotText}>Forgotten Password?</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footerSpacer} />

          {selectedRole !== "ADMIN" && (
            <RoundedButton
              title="Create Account"
              onPress={() =>
                router.push(`/signup?role=${selectedRole || "STUDENT"}`)
              }
              variant="outline"
              size="small"
              style={styles.createAccountButton}
            />
          )}
        </ScrollView>
      </ImageBackground>
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
    padding: Spacing.MD,
    paddingBottom: Spacing.HUGE,
    paddingTop: 90,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  formSection: {
    width: "100%",
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 200,
    height: 150,
    marginTop: -40,
    marginBottom: Spacing.XL,
  },
  iconInputContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: Spacing.MD,
    gap: Spacing.MD,
    backgroundColor: colors.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  iconInputContainerFocused: {
    borderColor: colors.white,
  },
  iconTextInput: {
    flex: 1,
    padding: Spacing.MD,
    fontSize: FontSizes.Base,
    fontFamily: "Poppins-Regular",
    color: colors.textDark,
  },
  iconPasswordInput: {
    flex: 1,
    padding: Spacing.MD,
    fontSize: FontSizes.Base,
    fontFamily: "Poppins-Regular",
    color: colors.textDark,
  },
  passwordIconButton: {
    padding: Spacing.SM,
  },
  inputContainer: {
    width: "100%",
    maxWidth: 420,
    marginBottom: Spacing.MD,
  },
  errorText: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.XS,
    fontWeight: "400",
    color: colors.danger,
    marginBottom: Spacing.SM,
    paddingHorizontal: Spacing.MD,
    paddingVertical: Spacing.SM,
    borderRadius: 10,
    backgroundColor: colors.white,
    alignSelf: "flex-start",
    width: "100%",
    textAlign: "left",
  },
  forgotContainer: {
    alignSelf: "center",
  },
  forgotText: {
    fontFamily: "Poppins-Medium",
    fontSize: FontSizes.SM,
    fontWeight: "600",
    color: colors.primary,
    paddingTop: Spacing.MD,
  },
  loginButton: {
    width: "100%",
    maxWidth: 420,
    marginTop: Spacing.XS,
  },
  createAccountButton: {
    width: "100%",
    maxWidth: 420,
    alignItems: "center",
  },
  footerSpacer: {
    flexGrow: 1,
    minHeight: Spacing.XL,
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
    marginTop: "auto",
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
