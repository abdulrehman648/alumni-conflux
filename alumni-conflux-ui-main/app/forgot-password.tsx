import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ShieldCheck, Mail, Lock, Eye, EyeOff } from "lucide-react-native";
import { useState } from "react";
import {
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { FontSizes, Spacing } from "../constants/theme";
import RoundedButton from "../src/components/RoundedButton";
import { authService } from "../src/services/api";
import colors from "../src/theme/colors";

type PasswordStep = 1 | 2 | 3 | 4;

export default function ForgotPassword() {
  const router = useRouter();
  const [step, setStep] = useState<PasswordStep>(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [codeError, setCodeError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const resetErrors = () => {
    setEmailError("");
    setCodeError("");
    setPasswordError("");
    setConfirmPasswordError("");
  };

  const handleNextStep = async () => {
    resetErrors();

    switch (step) {
      case 1:
        if (!email.trim()) {
          setEmailError("Email is required");
          return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          setEmailError("Please enter a valid email");
          return;
        }
        setLoading(true);
        try {
          await authService.forgotPassword(email.toLowerCase());
          setStep(2);
        } catch (err: any) {
          const errData = err.response?.data;
          const msg =
            errData?.message ||
            errData?.error ||
            errData?.detail ||
            errData?.details ||
            (typeof errData === "string" ? errData : null) ||
            "Failed to send reset code";
          setEmailError(msg);
        } finally {
          setLoading(false);
        }
        break;

      case 2:
        if (!code.trim()) {
          setCodeError("Verification code is required");
          return;
        }
        if (code.length !== 6) {
          setCodeError("Code must be 6 digits");
          return;
        }
        if (!/^\d+$/.test(code)) {
          setCodeError("Code must contain only numbers");
          return;
        }
        setLoading(true);
        try {
          const res = await authService.verifyOtp(email.toLowerCase(), code);
          if (!res.success) throw new Error(res.message);
          setStep(3);
        } catch (err: any) {
          setCodeError(err.message || "Invalid or expired code");
        } finally {
          setLoading(false);
        }
        break;

      case 3:
        if (!newPassword.trim()) {
          setPasswordError("New password is required");
          return;
        }
        if (newPassword.length < 6) {
          setPasswordError("Password should contain at least 6 characters.");
          return;
        }
        if (!confirmPassword.trim()) {
          setConfirmPasswordError("Please confirm your password");
          return;
        }
        if (newPassword !== confirmPassword) {
          setConfirmPasswordError("Passwords do not match");
          return;
        }
        setLoading(true);
        try {
          await authService.resetPassword(
            email.toLowerCase(),
            code,
            newPassword,
          );
          setStep(4);
        } catch (err: any) {
          const errData = err.response?.data;
          const msg =
            errData?.message ||
            errData?.error ||
            errData?.detail ||
            errData?.details ||
            (typeof errData === "string" ? errData : null) ||
            "Failed to reset password";
          setConfirmPasswordError(msg);
        } finally {
          setLoading(false);
        }
        break;
    }
  };

  const handleBackStep = () => {
    resetErrors();
    setStep((step - 1) as PasswordStep);
  };

  const handleComplete = () => {
    router.replace("/login");
  };

  const handleResendCode = async () => {
    resetErrors();

    if (!email.trim()) {
      setEmailError("Email is required to resend the code");
      setStep(1);
      return;
    }

    setLoading(true);

    try {
      await authService.forgotPassword(email.toLowerCase());
      setCodeError(`Verification code sent to ${email}`);
    } catch (err: any) {
      const errData = err.response?.data;
      const msg =
        errData?.message ||
        errData?.error ||
        errData?.detail ||
        errData?.details ||
        (typeof errData === "string" ? errData : null) ||
        "Failed to resend reset code";
      setCodeError(msg);
    } finally {
      setLoading(false);
    }
  };

  const renderProgressBar = () => {
    const progress = ((step - 1) / 3) * 100;
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>{step}/4</Text>
      </View>
    );
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
            <View style={styles.titleBlock}>
              <Text style={styles.title}>Reset Password</Text>
              {/* <Text style={styles.subtitle}>
                {step === 1
                  ? ""
                  : step === 2
                    ? "Enter the verification code"
                    : step === 3
                      ? "Create a new password"
                      : "Password reset complete"}
              </Text> */}
            </View>

            {renderProgressBar()}

            {step === 1 && (
              <View style={styles.formCard}>
                <View style={styles.inputContainer}>
                  <View style={styles.iconInputContainer}>
                    <Mail size={20} color={colors.primary} strokeWidth={2} />
                    <TextInput
                      style={styles.iconTextInput}
                      placeholder="Email"
                      placeholderTextColor={colors.textLight}
                      value={email}
                      onChangeText={(text) => {
                        setEmail(text);
                        if (emailError) {
                          setEmailError("");
                        }
                      }}
                      keyboardType="email-address"
                      editable={!loading}
                    />
                  </View>
                </View>
                {!!emailError && (
                  <Text style={styles.fieldErrorText}>{emailError}</Text>
                )}
              </View>
            )}

            {step === 2 && (
              <View style={styles.formCard}>
                <View style={styles.inputContainer}>
                  <View style={styles.iconInputContainer}>
                    <Mail size={20} color={colors.primary} strokeWidth={2} />
                    <TextInput
                      style={styles.iconTextInput}
                      placeholder="OTP Code"
                      placeholderTextColor={colors.textLight}
                      value={code}
                      onChangeText={(text) => {
                        const numericText = text
                          .replace(/[^0-9]/g, "")
                          .slice(0, 6);
                        setCode(numericText);
                        if (codeError) {
                          setCodeError("");
                        }
                      }}
                      keyboardType="number-pad"
                      maxLength={6}
                      editable={!loading}
                    />
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.resendContainer}
                  onPress={handleResendCode}
                  disabled={loading}
                >
                  <Text style={styles.resendText}>
                    Didn't receive code?{" "}
                    <Text style={styles.resendLink}>Resend</Text>
                  </Text>
                </TouchableOpacity>
                {!!codeError && (
                  <Text style={styles.fieldErrorText}>{codeError}</Text>
                )}
              </View>
            )}

            {step === 3 && (
              <View style={styles.formCard}>
                <View style={styles.inputContainer}>
                  <View
                    style={[
                      styles.iconInputContainer,
                      { marginBottom: Spacing.SM },
                    ]}
                  >
                    <Lock size={20} color={colors.primary} strokeWidth={2} />
                    <TextInput
                      style={styles.iconPasswordInput}
                      placeholder="New Password"
                      placeholderTextColor={colors.textLight}
                      value={newPassword}
                      onChangeText={(text) => {
                        setNewPassword(text);
                        if (passwordError) {
                          setPasswordError("");
                        }
                      }}
                      secureTextEntry={!showPassword}
                      editable={!loading}
                    />
                    {newPassword.length > 0 && (
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
                {!!passwordError && (
                  <Text style={styles.fieldErrorText}>{passwordError}</Text>
                )}
                <View style={styles.inputContainer}>
                  <View style={styles.iconInputContainer}>
                    <Lock size={20} color={colors.primary} strokeWidth={2} />
                    <TextInput
                      style={styles.iconPasswordInput}
                      placeholder="Confirm Password"
                      placeholderTextColor={colors.textLight}
                      value={confirmPassword}
                      onChangeText={(text) => {
                        setConfirmPassword(text);
                        if (confirmPasswordError) {
                          setConfirmPasswordError("");
                        }
                      }}
                      secureTextEntry={!showPassword}
                      editable={!loading}
                    />
                    {confirmPassword.length > 0 && (
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
                {!!confirmPasswordError && (
                  <Text style={styles.fieldErrorText}>
                    {confirmPasswordError}
                  </Text>
                )}
              </View>
            )}

            {step === 4 && (
              <View style={styles.formCard}>
                <View style={styles.successContainer}>
                  <ShieldCheck
                    size={64}
                    color={colors.success}
                    strokeWidth={1.5}
                  />
                  <Text style={styles.successTitle}>All Set!</Text>
                  <Text style={styles.successSubtitle}>
                    Your password has been successfully reset.
                  </Text>
                </View>
              </View>
            )}

            {step !== 4 && (
              <View style={styles.buttonContainer}>
                <RoundedButton
                  title={
                    step === 1
                      ? "Send OTP"
                      : step === 2
                        ? "Verify"
                        : "Reset Password"
                  }
                  onPress={handleNextStep}
                  variant="primary"
                  size="small"
                  loading={loading}
                  style={styles.primaryAction}
                />
                {step > 1 && (
                  <RoundedButton
                    title="Back"
                    onPress={handleBackStep}
                    variant="outline"
                    size="small"
                    style={styles.secondaryAction}
                  />
                )}
              </View>
            )}

            {step === 4 && (
              <RoundedButton
                title="Back to Sign In"
                onPress={handleComplete}
                variant="primary"
                size="small"
                style={styles.primaryAction}
              />
            )}

            {step === 1 && (
              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Remember your password? </Text>
                <TouchableOpacity onPress={() => router.replace("/login")}>
                  <Text style={styles.signupLink}>Sign In</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
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
    justifyContent: "flex-start",
    alignItems: "center",
  },
  formSection: {
    width: "100%",
    flexGrow: 1,
    alignItems: "center",
  },
  logo: {
    width: 200,
    height: 150,
    marginTop: -40,
    marginBottom: Spacing.LG,
  },
  titleBlock: {
    width: "100%",
    maxWidth: 420,
    alignItems: "center",
    marginBottom: Spacing.XS,
  },
  title: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 24,
    fontWeight: "600",
    color: colors.textDark,
    textAlign: "center",
  },
  subtitle: {
    marginTop: Spacing.LG,
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.Base,
    color: colors.textLight,
    textAlign: "center",
  },
  progressContainer: {
    width: "100%",
    maxWidth: 420,
    marginBottom: Spacing.XL,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.MD,
  },
  progressBarBackground: {
    flex: 1,
    height: 4,
    backgroundColor: "#E5D6C3",
    borderRadius: 2,
    overflow: "hidden",
    marginTop: Spacing.MD,
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
  formCard: {
    width: "100%",
    maxWidth: 420,
  },
  inputContainer: {
    width: "100%",
    marginBottom: Spacing.XS,
    marginTop: Spacing.SM,
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
  resendContainer: {
    marginTop: Spacing.XS,
  },
  resendText: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.SM,
    fontWeight: "400",
    color: colors.textLight,
    textAlign: "right",
  },
  resendLink: {
    fontFamily: "Poppins-SemiBold",
    fontWeight: "600",
    color: colors.primary,
  },
  successContainer: {
    alignItems: "center",
    paddingVertical: Spacing.LG,
    gap: Spacing.LG,
  },
  successTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.LG,
    fontWeight: "600",
    color: colors.textDark,
    textAlign: "center",
  },
  successSubtitle: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.Base,
    fontWeight: "400",
    color: colors.textLight,
    textAlign: "center",
    lineHeight: 22,
  },
  buttonContainer: {
    width: "100%",
    maxWidth: 420,
    gap: Spacing.MD,
    marginTop: Spacing.MD,
  },
  primaryAction: {
    width: "100%",
    maxWidth: 420,
  },
  secondaryAction: {
    width: "100%",
    maxWidth: 420,
  },
  signupContainer: {
    width: "100%",
    maxWidth: 420,
    flexDirection: "row",
    justifyContent: "center",
    marginTop: Spacing.SM,
  },
  signupText: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.SM,
    fontWeight: "400",
    color: colors.textLight,
  },
  signupLink: {
    fontFamily: "Poppins-Medium",
    fontSize: FontSizes.SM,
    fontWeight: "600",
    color: colors.primary,
  },
  fieldErrorText: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.XS,
    fontWeight: "400",
    color: colors.danger,
    marginTop: Spacing.XS,
    marginBottom: Spacing.SM,
    paddingHorizontal: Spacing.SM,
  },
});
