import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Spacing } from "../constants/theme";
import AuthHeader from "../src/components/AuthHeader";
import colors from "../src/theme/colors";

export default function RoleScreen() {
  const router = useRouter();

  const roleOptions = [
    {
      id: "student",
      title: "Student",
      description: "Find mentors & book sessions",
      icon: "school",
      role: "STUDENT",
      onPress: () => router.push("/login?role=STUDENT"),
    },
    {
      id: "alumni",
      title: "Alumni",
      description: "Share your expertise",
      icon: "briefcase",
      role: "ALUMNI",
      onPress: () => router.push("/login?role=ALUMNI"),
    },
    {
      id: "admin",
      title: "Admin",
      description: "Manage the platform",
      icon: "shield-checkmark",
      role: "ADMIN",
      onPress: () => router.push("/login?role=ADMIN"),
    },
  ];

  const handleSignUp = (role: string) => {
    router.push(`/signup?role=${role}`);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <AuthHeader
        title="Choose Your Role"
        subtitle="Create a connection that matters"
        illustration={require("../assets/illustrations/select-role.png")}
      />

      <View style={styles.buttonsContainer}>
        {roleOptions.map((role) => (
          <View key={role.id}>
            <TouchableOpacity
              style={styles.roleButton}
              onPress={role.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.roleContent}>
                <View style={styles.iconContainer}>
                  <Ionicons
                    name={role.icon as any}
                    size={32}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.roleInfo}>
                  <Text style={styles.roleName}>{role.title}</Text>
                  <Text style={styles.roleDescription}>{role.description}</Text>
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
                size={24}
                color={colors.primary}
              />
            </TouchableOpacity>

            {role.role !== "ADMIN" && (
              <TouchableOpacity
                onPress={() => handleSignUp(role.role)}
                style={styles.signUpLinkContainer}
              ></TouchableOpacity>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    flexGrow: 1,
    padding: Spacing.XL,
    justifyContent: "center",
  },
  buttonsContainer: {
    marginBottom: Spacing.XXXL,
  },
  roleButton: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: Spacing.XL,
    marginBottom: Spacing.LG,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  roleContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.LG,
  },
  roleInfo: {
    flex: 1,
  },
  roleName: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    fontWeight: "600",
    color: colors.textDark,
    marginBottom: Spacing.XS,
  },
  roleDescription: {
    fontFamily: "Poppins-Regular",
    fontSize: 13,
    fontWeight: "400",
    color: colors.textLight,
  },
  signInContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.XL,
  },
  signInText: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: colors.textLight,
  },
  signInHint: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    color: colors.textLight,
    marginTop: Spacing.SM,
  },
  signInLink: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
  signUpLinkContainer: {
    marginTop: -Spacing.SM,
    marginBottom: Spacing.LG,
    paddingHorizontal: Spacing.SM,
    alignItems: "center",
  },
  signUpLinkText: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    color: colors.textLight,
  },
  signUpLinkHighlight: {
    color: colors.primary,
    fontFamily: "Poppins-SemiBold",
    textDecorationLine: "underline",
  },
});
