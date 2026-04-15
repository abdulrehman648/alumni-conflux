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

type FormStep = 1 | 2 | 3 | 4 | 5;

export default function SignUp() {
  const router = useRouter();
  const { setAuthData } = useAuth();
  const { role } = useLocalSearchParams<{ role: string }>();
  const [step, setStep] = useState<FormStep>(1);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Block Admin Signup
  if (role === "ADMIN") {
    Alert.alert(
      "Restricted",
      "Admins cannot sign up via this portal.",
      [{ text: "Cancel", style: "cancel" }, { text: "OK" }]
    );
    router.replace("/role");
    return null;
  }

  const handleNextStep = async () => {
    setError("");
    switch (step) {
      case 1:
        if (!fullName.trim()) {
          setError("Full name is required");
          return;
        }
        if (fullName.trim().length < 3) {
          setError("Name must be at least 3 characters");
          return;
        }
        setStep(2);
        break;

      case 2:
        if (!username.trim()) {
          setError("Username is required");
          return;
        }
        if (username.length < 3) {
          setError("Username must be at least 3 characters");
          return;
        }
        if (!/^[a-z0-9_-]+$/.test(username)) {
          setError("Only lowercase letters, numbers, _, - allowed");
          return;
        }
        setLoading(true);

        try {
          const result = await authService.checkUsername(username);
          if (result.success) {
            setLoading(false);
            setStep(3);
          } else {
            Alert.alert("Registration Error", result.message || "Username already taken", [{ text: "OK" }]);
            setLoading(false);
          }
        } catch (err: any) {
          const errData = err.response?.data;
          const msg = errData?.message || errData?.error || errData?.detail || errData?.details || (typeof errData === 'string' ? errData : null) || "Failed to check username";
          Alert.alert("Registration Error", msg, [{ text: "OK" }]);
          setLoading(false);
        }
        break;

      case 3:
        if (!email.trim()) {
          setError("Email is required");
          return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          setError("Please enter a valid email");
          return;
        }
        setLoading(true);
        try {
          const result = await authService.checkEmail(email);
          if (result.success) {
            Alert.alert(
              "Code Sent",
              `Verification code sent to ${email}`,
              [{ text: "Cancel", style: "cancel" }, { text: "OK" }]
            );
            setLoading(false);
            setStep(4);
          } else {
            Alert.alert("Registration Error", result.message || "Email already registered", [{ text: "OK" }]);
            setLoading(false);
          }
        } catch (err: any) {
          const errData = err.response?.data;
          const msg = errData?.message || errData?.error || errData?.detail || errData?.details || (typeof errData === 'string' ? errData : null) || "Failed to check email";
          Alert.alert("Registration Error", msg, [{ text: "OK" }]);
          setLoading(false);
        }
        break;

      case 4:
        if (!password.trim()) {
          setError("Password is required");
          return;
        }
        if (password.length < 6) {
          setError("Password must be at least 6 characters");
          return;
        }
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
          setError("Password must have uppercase, lowercase, and number");
          return;
        }
        setStep(5);
        break;

      case 5:
        if (!code.trim()) {
          setError("Verification code is required");
          return;
        }
        if (code.length !== 6) {
          setError("Code must be 6 digits");
          return;
        }
        if (!/^\d+$/.test(code)) {
          setError("Code must contain only numbers");
          return;
        }
        setLoading(true);
        try {
          const result = await authService.verifyOtp(email, code);
          if (result.success) {
            // OTP verified, now signup and auto-login
            try {
              const signupData = {
                fullName,
                username,
                email,
                password,
                role: role || "STUDENT",
                otp: code,
              };
              const signupResult = await authService.signup(signupData);
              if (signupResult.success) {
                // Get the userId from signup response
                const userId =
                  signupResult.data?.userId || signupResult.data?.id;

                const userIdStr = userId?.toString();

                if (!userIdStr) {
                  Alert.alert("Registration Error", "Failed to get user ID after signup", [{ text: "OK" }]);
                  setLoading(false);
                  return;
                }

                setAuthData({
                  userId: userIdStr,
                  userRole: role || "STUDENT",
                  fullName: fullName,
                  profileComplete: false,
                });

                setLoading(false);

                if (role === "ALUMNI") {
                  router.replace("/(alumni)");
                } else {
                  router.replace("/(student)");
                }
              } else {
                Alert.alert("Registration Error", signupResult.message || "Failed to create account", [{ text: "OK" }]);
                setLoading(false);
              }
            } catch (signupErr: any) {
              const errData = signupErr.response?.data;
              const msg = errData?.message || errData?.error || errData?.detail || errData?.details || (typeof errData === 'string' ? errData : null) || "Signup failed";
              Alert.alert("Registration Error", msg, [{ text: "OK" }]);
              setLoading(false);
            }
          } else {
            Alert.alert("Verification Error", result.message || "Invalid or expired code", [{ text: "OK" }]);
            setLoading(false);
          }
        } catch (err: any) {
          const errData = err.response?.data;
          const msg = errData?.message || errData?.error || errData?.detail || errData?.details || (typeof errData === 'string' ? errData : null) || "Failed to verify code";
          Alert.alert("Verification Error", msg, [{ text: "OK" }]);
          setLoading(false);
        }
        break;
    }
  };

  const handleBackStep = () => {
    setError("");
    setStep((step - 1) as FormStep);
  };

  const renderProgressBar = () => {
    const progress = ((step - 1) / 4) * 100;
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>{step}/5</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <AuthHeader
          title="Welcome Onboard"
          subtitle={
            step === 1
              ? "Let's get started"
              : step === 2
                ? "Choose your username"
                : step === 3
                  ? "Verify your email"
                  : step === 4
                    ? "Set a password"
                    : step === 5
                      ? "Enter verification code"
                      : "Welcome!"
          }
        />

        {renderProgressBar()}

        {step === 1 && (
          <AuthCard>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your name"
              placeholderTextColor={colors.textLight}
              value={fullName}
              onChangeText={setFullName}
              editable
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </AuthCard>
        )}

        {step === 2 && (
          <AuthCard>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Username"
              placeholderTextColor={colors.textLight}
              value={username}
              onChangeText={setUsername}
              editable
            />
            <Text style={styles.hintText}>
              Letters, numbers, underscore or hyphen
            </Text>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </AuthCard>
        )}

        {step === 3 && (
          <AuthCard>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.textInput}
              placeholder=""
              placeholderTextColor={colors.textLight}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              editable
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </AuthCard>
        )}

        {step === 4 && (
          <AuthCard>
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
                  onChangeText={setPassword}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  secureTextEntry={!showPassword}
                  editable
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
            <View style={styles.passwordRequirements}>
              <Text
                style={[
                  styles.requirementText,
                  password.length >= 6 && styles.requirementMet,
                ]}
              >
                {password.length >= 6 ? "✓" : "○"} At least 6 characters
              </Text>
              <Text
                style={[
                  styles.requirementText,
                  /(?=.*[a-z])(?=.*[A-Z])/.test(password) &&
                  styles.requirementMet,
                ]}
              >
                {/(?=.*[a-z])(?=.*[A-Z])/.test(password) ? "✓" : "○"} Mix of
                uppercase & lowercase
              </Text>
              <Text
                style={[
                  styles.requirementText,
                  /\d/.test(password) && styles.requirementMet,
                ]}
              >
                {/\d/.test(password) ? "✓" : "○"} At least one number
              </Text>
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </AuthCard>
        )}

        {step === 5 && (
          <AuthCard>
            <Text style={styles.label}>Verification Code</Text>
            <TextInput
              style={styles.textInput}
              placeholder="000000"
              placeholderTextColor={colors.textLight}
              value={code}
              onChangeText={(text) => {
                const numericText = text.replace(/[^0-9]/g, "").slice(0, 6);
                setCode(numericText);
              }}
              keyboardType="number-pad"
              maxLength={6}
              editable
            />
            <TouchableOpacity style={styles.resendContainer}>
              <Text style={styles.resendText}>
                Didn't receive code?{" "}
                <Text style={styles.resendLink}>Resend</Text>
              </Text>
            </TouchableOpacity>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </AuthCard>
        )}

        <View style={styles.buttonContainer}>
          <RoundedButton
            title={
              step === 3 ? "Send Code" : step === 5 ? "Create Account" : "Next"
            }
            onPress={handleNextStep}
            variant="primary"
            size="large"
            loading={loading}
          />
          {step > 1 && (
            <RoundedButton
              title="Back"
              onPress={handleBackStep}
              variant="secondary"
              size="large"
              style={styles.backButtonAction}
            />
          )}
        </View>

        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/login")}>
            <Text style={styles.signupLink}>Sign In</Text>
          </TouchableOpacity>
        </View>

        {step === 1 && (
          <TouchableOpacity
            onPress={() => router.replace("/role")}
            style={styles.backLink}
          >
            <Text style={styles.backLinkText}>Back to Role Selection</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    padding: Spacing.LG,
    paddingBottom: Spacing.XXL,
    alignItems: "center",
    justifyContent: "center",
  },
  progressContainer: {
    width: "100%",
    marginBottom: Spacing.XL,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.MD,
    paddingHorizontal: Spacing.LG,
  },
  progressBarBackground: {
    flex: 1,
    height: 4,
    backgroundColor: "#E5D6C3",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.XS,
    fontWeight: "600",
    color: colors.textLight,
    minWidth: 25,
  },
  progressItemContainer: {
    display: "none",
  },
  progressDot: {
    display: "none",
  },
  progressDotActive: {
    display: "none",
  },
  progressLine: {
    display: "none",
  },
  progressLineActive: {
    display: "none",
  },
  stepIndicator: {
    display: "none",
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
  hintText: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.XS,
    fontWeight: "400",
    color: colors.textLight,
    marginBottom: Spacing.LG,
  },
  passwordRequirements: {
    marginTop: Spacing.MD,
    paddingTop: Spacing.MD,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  requirementText: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.SM,
    fontWeight: "400",
    color: colors.textLight,
    marginBottom: Spacing.SM,
  },
  requirementMet: {
    color: colors.success,
  },
  resendContainer: {
    marginTop: Spacing.MD,
  },
  resendText: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.SM,
    fontWeight: "400",
    color: colors.textLight,
    textAlign: "center",
  },
  resendLink: {
    fontFamily: "Poppins-SemiBold",
    fontWeight: "600",
    color: colors.primary,
  },
  successContainer: {
    alignItems: "center",
    paddingVertical: Spacing.LG,
  },
  successEmoji: {
    fontSize: 48,
    marginBottom: Spacing.LG,
  },
  successTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.LG,
    fontWeight: "600",
    color: colors.textDark,
    marginBottom: Spacing.SM,
    textAlign: "center",
  },
  successSubtitle: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.Base,
    fontWeight: "400",
    color: colors.textLight,
    textAlign: "center",
    marginBottom: Spacing.XXXL,
    lineHeight: 22,
  },
  accountInfoContainer: {
    width: "100%",
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: Spacing.LG,
    marginBottom: Spacing.XL,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.SM,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    fontFamily: "Poppins-Medium",
    fontSize: FontSizes.SM,
    fontWeight: "500",
    color: colors.textLight,
  },
  infoValue: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.Base,
    fontWeight: "600",
    color: colors.primary,
  },
  illustrationContainer: {
    display: "none",
  },
  illustration: {
    display: "none",
  },
  errorText: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.XS,
    fontWeight: "400",
    color: colors.danger,
    marginBottom: Spacing.MD,
  },
  actionButton: {
    display: "none",
  },
  backButton: {
    display: "none",
  },
  buttonContainer: {
    width: "100%",
    marginTop: Spacing.XL,
    gap: Spacing.MD,
  },
  backButtonAction: {
    marginTop: 0,
  },
  loginButton: {
    width: "100%",
    marginTop: Spacing.XL,
  },
  loginContainer: {
    display: "none",
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
  linkButton: {
    display: "none",
  },
  linkText: {
    display: "none",
  },
  backLink: {
    width: "100%",
    alignItems: "center",
    marginTop: Spacing.MD,
    paddingVertical: Spacing.SM,
  },
  backLinkText: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.SM,
    fontWeight: "400",
    color: colors.textLight,
    textDecorationLine: "underline",
  },
});
