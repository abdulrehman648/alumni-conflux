import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  AtSign,
  Eye,
  EyeOff,
  Hash,
  Lock,
  Mail,
  User,
} from "lucide-react-native";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { useAuth } from "../src/context/AuthContext";
import { authService } from "../src/services/api";
import colors from "../src/theme/colors";

export default function SignUp() {
  const router = useRouter();
  const { setAuthData } = useAuth();
  const { role } = useLocalSearchParams<{ role: string }>();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [error, setError] = useState("");
  const [fullNameLengthError, setFullNameLengthError] = useState("");
  const [usernameExistsError, setUsernameExistsError] = useState("");
  const [emailExistsError, setEmailExistsError] = useState("");
  const [passwordFieldError, setPasswordFieldError] = useState("");
  const [codeFieldError, setCodeFieldError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [focusedField, setFocusedField] = useState<
    "fullName" | "username" | "email" | "password" | "code" | null
  >(null);
  const fullNameRef = useRef<TextInput>(null);
  const usernameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const codeRef = useRef<TextInput>(null);

  if (role === "ADMIN") {
    Alert.alert("Restricted", "Admins cannot sign up via this portal.", [
      { text: "Cancel", style: "cancel" },
      { text: "OK" },
    ]);
    router.replace("/role");
    return null;
  }

  const validateFormFields = (requireCode: boolean) => {
    setError("");
    setFullNameLengthError("");
    setUsernameExistsError("");
    setEmailExistsError("");
    setPasswordFieldError("");
    setCodeFieldError("");

    const fullNameLettersOnly = fullName.replace(/[^A-Za-z]/g, "");
    if (!fullName.trim() || fullNameLettersOnly.length < 3) {
      setFullNameLengthError("Full name must be at least 3 letters");
      fullNameRef.current?.focus();
      return false;
    }

    if (!username.trim() || username.length < 3) {
      setUsernameExistsError("Username must be at least 3 characters");
      usernameRef.current?.focus();
      return false;
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailExistsError("Please enter a valid email");
      emailRef.current?.focus();
      return false;
    }

    if (!password.trim() || password.length < 6) {
      setPasswordFieldError("Password should contain at least 6 characters.");
      passwordRef.current?.focus();
      return false;
    }

    if (requireCode) {
      if (!code.trim()) {
        setCodeFieldError("Verification code is required");
        codeRef.current?.focus();
        return false;
      } else if (code.length !== 6 || !/^\d+$/.test(code)) {
        setCodeFieldError("Code must be 6 digits");
        codeRef.current?.focus();
        return false;
      }
    }

    return true;
  };

  const handleSendCode = async () => {
    setError("");
    setFullNameLengthError("");
    setUsernameExistsError("");
    setEmailExistsError("");
    setPasswordFieldError("");
    setCodeFieldError("");

    const fullNameLettersOnly = fullName.replace(/[^A-Za-z]/g, "");
    if (!fullName.trim() || fullNameLettersOnly.length < 3) {
      setFullNameLengthError("Full name must be at least 3 letters");
      fullNameRef.current?.focus();
      return false;
    }

    if (!username.trim() || username.length < 3) {
      setUsernameExistsError("Username must be at least 3 characters");
      usernameRef.current?.focus();
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailExistsError("Please enter a valid email");
      emailRef.current?.focus();
      return;
    }

    if (!email.trim()) {
      emailRef.current?.focus();
      return;
    }

    setSendLoading(true);
    try {
      const result = await authService.checkEmail(email);
      const usernameResult = await authService.checkUsername(username);

      if (!usernameResult.success) {
        setUsernameExistsError(
          usernameResult.message || "Username is already in use",
        );
        usernameRef.current?.focus();
        return;
      } else if (result.success) {
        setOtpSent(true);
        codeRef.current?.focus();
        setCodeFieldError("Verification code is sent to your email");
        // Alert.alert("Code Sent", `Verification code sent to ${email}`, [
        //   { text: "OK" },
        // ]);
      } else {
        setEmailExistsError(result.message || "Email already registered");
        emailRef.current?.focus();
      }
    } catch (err: any) {
      const errData = err.response?.data;
      const msg =
        errData?.message ||
        errData?.error ||
        errData?.detail ||
        errData?.details ||
        (typeof errData === "string" ? errData : null) ||
        "Failed to check email";
      Alert.alert("Registration Error", msg, [{ text: "OK" }]);
    } finally {
      setSendLoading(false);
    }
  };

  const handleSignup = async () => {
    setError("");
    setFullNameLengthError("");
    setUsernameExistsError("");
    setEmailExistsError("");
    setPasswordFieldError("");
    setCodeFieldError("");

    const shouldRequireCode = otpSent || code.trim().length > 0;
    if (!validateFormFields(shouldRequireCode)) {
      return;
    }

    setLoading(true);
    try {
      const usernameResult = await authService.checkUsername(username);

      if (!usernameResult.success) {
        setUsernameExistsError(
          usernameResult.message || "Username is already in use",
        );
        usernameRef.current?.focus();
        return;
      }

      if (!otpSent) {
        const emailResult = await authService.checkEmail(email);
        if (!emailResult.success) {
          setEmailExistsError(
            emailResult.message || "Email is already registered",
          );
          emailRef.current?.focus();
          return;
        }

        setOtpSent(true);
        codeRef.current?.focus();
        Alert.alert("OTP Sent", `Verification code sent to ${email}`, [
          { text: "OK" },
        ]);
        return;
      }

      const verifyResult = await authService.verifyOtp(email, code);
      if (!verifyResult.success) {
        Alert.alert(
          "Verification Error",
          verifyResult.message || "Invalid or expired code",
          [{ text: "OK" }],
        );
        return;
      }

      const signupData = {
        fullName,
        username,
        email,
        password,
        role: role || "STUDENT",
        otp: code,
      };
      const signupResult = await authService.signup(signupData);

      if (!signupResult.success) {
        Alert.alert(
          "Registration Error",
          signupResult.message || "Failed to create account",
          [{ text: "OK" }],
        );
        return;
      }

      const userId = signupResult.data?.userId || signupResult.data?.id;
      const userIdStr = userId?.toString();

      if (!userIdStr) {
        Alert.alert(
          "Registration Error",
          "Failed to get user ID after signup",
          [{ text: "OK" }],
        );
        return;
      }

      setAuthData({
        userId: userIdStr,
        userRole: role || "STUDENT",
        fullName,
        profileComplete: false,
      });

      if (role === "ALUMNI") {
        router.replace("/(alumni)");
      } else {
        router.replace("/(student)");
      }
    } catch (err: any) {
      const errData = err.response?.data;
      const msg =
        errData?.message ||
        errData?.error ||
        errData?.detail ||
        errData?.details ||
        (typeof errData === "string" ? errData : null) ||
        "Signup failed";
      Alert.alert("Registration Error", msg, [{ text: "OK" }]);
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
                  !!fullNameLengthError && styles.iconInputContainerDanger,
                  focusedField === "fullName" &&
                    styles.iconInputContainerFocused,
                ]}
              >
                <User size={20} color={colors.primary} strokeWidth={2} />
                <TextInput
                  ref={fullNameRef}
                  style={styles.iconTextInput}
                  placeholder="Full name"
                  placeholderTextColor={colors.textLight}
                  value={fullName}
                  onChangeText={(text) => {
                    setFullName(text);
                    if (fullNameLengthError) {
                      setFullNameLengthError("");
                    }
                  }}
                  onFocus={() => setFocusedField("fullName")}
                  onBlur={() => setFocusedField(null)}
                  editable={!loading}
                />
              </View>
              {!!fullNameLengthError && (
                <Text style={styles.fullNameErrorText}>
                  {fullNameLengthError}
                </Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <View
                style={[
                  styles.iconInputContainer,
                  !!usernameExistsError && styles.iconInputContainerDanger,
                  focusedField === "username" &&
                    styles.iconInputContainerFocused,
                ]}
              >
                <AtSign size={20} color={colors.primary} strokeWidth={2} />
                <TextInput
                  ref={usernameRef}
                  style={styles.iconTextInput}
                  placeholder="Username"
                  placeholderTextColor={colors.textLight}
                  value={username}
                  onChangeText={(text) => {
                    const filtered = text.replace(/[^a-z0-9_]/g, "");
                    if (usernameExistsError) {
                      setUsernameExistsError("");
                    }
                    if (filtered !== username) {
                      setUsername(filtered);
                    }
                  }}
                  onFocus={() => setFocusedField("username")}
                  onBlur={() => setFocusedField(null)}
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="username"
                  editable={!loading}
                />
              </View>
              {!!usernameExistsError && (
                <Text style={styles.usernameExistsText}>
                  {usernameExistsError}
                </Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <View
                style={[
                  styles.iconInputContainer,
                  !!emailExistsError && styles.iconInputContainerDanger,
                  focusedField === "email" && styles.iconInputContainerFocused,
                ]}
              >
                <Mail size={20} color={colors.primary} strokeWidth={2} />
                <TextInput
                  ref={emailRef}
                  style={styles.iconTextInput}
                  placeholder="Email"
                  placeholderTextColor={colors.textLight}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (emailExistsError) {
                      setEmailExistsError("");
                    }
                    if (otpSent) {
                      setOtpSent(false);
                      setCode("");
                    }
                  }}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  keyboardType="email-address"
                  editable={!loading}
                />
              </View>
              {!!emailExistsError && (
                <Text style={styles.emailExistsText}>{emailExistsError}</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <View
                style={[
                  styles.iconInputContainer,
                  !!passwordFieldError && styles.iconInputContainerDanger,
                  focusedField === "password" &&
                    styles.iconInputContainerFocused,
                ]}
              >
                <Lock size={20} color={colors.primary} strokeWidth={2} />
                <TextInput
                  ref={passwordRef}
                  style={styles.iconPasswordInput}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (passwordFieldError) {
                      setPasswordFieldError("");
                    }
                  }}
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
              {!!passwordFieldError && (
                <Text style={styles.passwordErrorText}>
                  {passwordFieldError}
                </Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <View
                style={[
                  styles.iconInputContainer,
                  focusedField === "code" && styles.iconInputContainerFocused,
                ]}
              >
                <Hash size={20} color={colors.primary} strokeWidth={2} />
                <TextInput
                  ref={codeRef}
                  style={styles.iconTextInput}
                  placeholder="Verification Code"
                  placeholderTextColor={colors.textLight}
                  value={code}
                  onChangeText={(text) => {
                    const numericText = text.replace(/[^0-9]/g, "").slice(0, 6);
                    setCode(numericText);
                    if (codeFieldError) {
                      setCodeFieldError("");
                    }
                  }}
                  onFocus={() => setFocusedField("code")}
                  onBlur={() => setFocusedField(null)}
                  keyboardType="number-pad"
                  maxLength={6}
                  editable={!loading}
                />
                <TouchableOpacity
                  style={styles.otpSendButton}
                  onPress={handleSendCode}
                  disabled={sendLoading}
                  activeOpacity={0.8}
                >
                  {sendLoading ? (
                    <ActivityIndicator color={colors.white} size="small" />
                  ) : (
                    <Text style={styles.otpSendButtonText}>Send</Text>
                  )}
                </TouchableOpacity>
              </View>
              {!!codeFieldError && (
                <Text style={styles.codeErrorText}>{codeFieldError}</Text>
              )}
            </View>

            <RoundedButton
              title="Create Account"
              onPress={handleSignup}
              variant="primary"
              size="small"
              loading={loading}
              style={styles.createAccountButton}
            />

            <View style={styles.footerSpacer} />

            <RoundedButton
              title="Already have an account? Log In"
              onPress={() => router.push("/login")}
              variant="outline"
              size="small"
              style={styles.createAccountButton}
            />
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
    alignItems: "center",
    justifyContent: "flex-start",
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
    marginBottom: Spacing.XL,
  },
  inputContainer: {
    width: "100%",
    maxWidth: 420,
    marginBottom: Spacing.MD,
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
  },
  iconInputContainerFocused: {
    borderColor: colors.primary,
  },
  iconInputContainerDanger: {
    borderColor: colors.danger,
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
  otpSendButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: Spacing.MD,
    paddingVertical: Spacing.SM,
  },
  otpSendButtonText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.SM,
    fontWeight: "600",
    color: colors.white,
  },
  passwordErrorText: {
    marginTop: Spacing.XS,
    marginLeft: Spacing.SM,
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.XS,
    fontWeight: "400",
    color: colors.danger,
    textAlign: "left",
  },
  requirementMet: {
    color: colors.success,
  },
  emailExistsText: {
    marginTop: Spacing.XS,
    marginLeft: Spacing.SM,
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.XS,
    fontWeight: "400",
    color: colors.danger,
    textAlign: "left",
  },
  usernameExistsText: {
    marginTop: Spacing.XS,
    marginLeft: Spacing.SM,
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.XS,
    fontWeight: "400",
    color: colors.danger,
    textAlign: "left",
  },
  fullNameErrorText: {
    marginTop: Spacing.XS,
    marginLeft: Spacing.SM,
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.XS,
    fontWeight: "400",
    color: colors.danger,
    textAlign: "left",
  },
  codeErrorText: {
    marginTop: Spacing.XS,
    marginLeft: Spacing.SM,
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.XS,
    fontWeight: "400",
    color: colors.danger,
    textAlign: "left",
  },
  createAccountButton: {
    width: "100%",
    maxWidth: 420,
  },
  footerSpacer: {
    flexGrow: 1,
    minHeight: Spacing.XL,
  },
});
