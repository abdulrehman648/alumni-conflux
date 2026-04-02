import { useRouter } from "expo-router";
import { ShieldCheck } from "lucide-react-native";
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleNextStep = async () => {
    setError("");

    switch (step) {
      case 1:
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
          await authService.forgotPassword(email.toLowerCase());
          Toast.show({
            type: "success",
            text1: "Code Sent",
            text2: `Reset code sent to ${email}`,
            topOffset: 50,
          });
          setStep(2);
        } catch (err: any) {
          setError(err.response?.data?.error || "Failed to send reset code");
        } finally {
          setLoading(false);
        }
        break;

      case 2:
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
          const res = await authService.verifyOtp(email.toLowerCase(), code);
          if (!res.success) throw new Error(res.message);

          Toast.show({
            type: "success",
            text1: "Code Verified",
            topOffset: 50,
          });
          setStep(3);
        } catch (err: any) {
          setError(err.message || "Invalid code");
        } finally {
          setLoading(false);
        }
        break;

      case 3:
        if (!newPassword.trim()) {
          setError("New password is required");
          return;
        }
        if (newPassword.length < 6) {
          setError("Password must be at least 6 characters");
          return;
        }
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
          setError("Password must have uppercase, lowercase, and number");
          return;
        }
        if (!confirmPassword.trim()) {
          setError("Please confirm your password");
          return;
        }
        if (newPassword !== confirmPassword) {
          setError("Passwords do not match");
          return;
        }
        setLoading(true);
        try {
          await authService.resetPassword(
            email.toLowerCase(),
            code,
            newPassword,
          );
          Toast.show({
            type: "success",
            text1: "Password Reset",
            text2: "Your password has been successfully changed",
            topOffset: 50,
          });
          setStep(4);
        } catch (err: any) {
          setError(err.response?.data?.error || "Failed to reset password");
        } finally {
          setLoading(false);
        }
        break;
    }
  };

  const handleBackStep = () => {
    setError("");
    setStep((step - 1) as PasswordStep);
  };

  const handleComplete = () => {
    router.replace("/login");
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
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <AuthHeader
          title="Reset Password"
          subtitle={
            step === 1
              ? "Enter your email address"
              : step === 2
                ? "Enter the verification code"
                : step === 3
                  ? "Create a new password"
                  : "Password reset complete"
          }
        />

        {renderProgressBar()}

        {step === 1 && (
          <AuthCard>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.textInput}
              placeholder="john@example.com"
              placeholderTextColor={colors.textLight}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              editable
            />
            <Text style={styles.hintText}>
              We'll send a verification code to this email
            </Text>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </AuthCard>
        )}

        {step === 2 && (
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

        {step === 3 && (
          <AuthCard>
            <Text style={styles.label}>New Password</Text>
            <TextInput
              style={styles.textInput}
              placeholder="••••••••"
              placeholderTextColor={colors.textLight}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              editable
            />
            <View style={styles.passwordRequirements}>
              <Text
                style={[
                  styles.requirementText,
                  newPassword.length >= 6 && styles.requirementMet,
                ]}
              >
                {newPassword.length >= 6 ? "✓" : "○"} At least 6 characters
              </Text>
              <Text
                style={[
                  styles.requirementText,
                  /(?=.*[a-z])(?=.*[A-Z])/.test(newPassword) &&
                    styles.requirementMet,
                ]}
              >
                {/(?=.*[a-z])(?=.*[A-Z])/.test(newPassword) ? "✓" : "○"} Mix of
                uppercase & lowercase
              </Text>
              <Text
                style={[
                  styles.requirementText,
                  /\d/.test(newPassword) && styles.requirementMet,
                ]}
              >
                {/\d/.test(newPassword) ? "✓" : "○"} At least one number
              </Text>
            </View>

            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.textInput}
              placeholder="••••••••"
              placeholderTextColor={colors.textLight}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              editable
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </AuthCard>
        )}

        {step === 4 && (
          <AuthCard>
            <View style={styles.successContainer}>
              <ShieldCheck size={64} color={colors.success} strokeWidth={1.5} />
              <Text style={styles.successTitle}>All Set!</Text>
              <Text style={styles.successSubtitle}>
                Your password has been successfully reset.
              </Text>
            </View>
          </AuthCard>
        )}

        {step !== 4 && (
          <View style={styles.buttonContainer}>
            <RoundedButton
              title={
                step === 1
                  ? "Send Code"
                  : step === 2
                    ? "Verify"
                    : "Reset Password"
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
        )}

        {step === 4 && (
          <RoundedButton
            title="Back to Sign In"
            onPress={handleComplete}
            variant="primary"
            size="large"
            style={styles.loginButton}
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
      </ScrollView>
    </View>
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
    marginBottom: Spacing.LG,
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
    gap: Spacing.LG,
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
    lineHeight: 22,
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
  errorText: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.SM,
    color: colors.danger || "#FF4D4D",
    marginTop: Spacing.SM,
  },
});
