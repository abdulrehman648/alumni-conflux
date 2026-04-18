import { useRouter } from "expo-router";
import { ChevronLeft, ChevronRight, Edit, LogOut } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { FontSizes, Spacing } from "../../constants/theme";
import RoundedButton from "../../src/components/RoundedButton";
import { useAuth } from "../../src/context/AuthContext";
import { apiClient } from "../../src/services/api";
import colors from "../../src/theme/colors";

interface UserProfile {
  userId: number;
  fullName: string;
  username: string;
  email: string;
  role?: string;
  [key: string]: any;
}

type ProfileView = "overview" | "editPersonal" | "editAcademic";

export default function StudentProfileScreen() {
  const router = useRouter();
  const { userId, userRole, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<ProfileView>("overview");

  // Edit form states
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [institutionName, setInstitutionName] = useState("");
  const [expectedGraduationYear, setExpectedGraduationYear] = useState("");
  const [department, setDepartment] = useState("");
  const [degreeProgram, setDegreeProgram] = useState("");
  const [major, setMajor] = useState("");
  const [currentSemester, setCurrentSemester] = useState("");
  const [skills, setSkills] = useState("");
  const [careerPreferences, setCareerPreferences] = useState("");
  const [updating, setUpdating] = useState(false);

  const formatRoleToPascalCase = (role?: string | null) => {
    if (!role) return "Student";

    return role
      .trim()
      .split(/[^a-zA-Z0-9]+/)
      .filter(Boolean)
      .map(
        (segment) =>
          segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase(),
      )
      .join("");
  };

  useEffect(() => {
    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/student/${userId}`);
      const data = response.data;
      setProfile(data);
      setName(data.fullName || "");
      setUsername(data.username || "");
      setEmail(data.email || "");
      setInstitutionName(data.institutionName || "");
      setExpectedGraduationYear(
        data.expectedGraduationYear ? String(data.expectedGraduationYear) : "",
      );
      setDepartment(data.department || "");
      setDegreeProgram(data.degreeProgram || "");
      setMajor(data.major || "");
      setCurrentSemester(
        data.currentSemester ? String(data.currentSemester) : "",
      );
      setSkills(Array.isArray(data.skills) ? data.skills.join(", ") : "");
      setCareerPreferences(
        Array.isArray(data.careerPreferences)
          ? data.careerPreferences.join(", ")
          : "",
      );
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePersonal = async () => {
    try {
      setUpdating(true);
      const updateData = {
        fullName: name,
        username: username,
        email: email,
      };

      await apiClient.put(`/student/${userId}`, updateData);
      await fetchProfile();

      setCurrentView("overview");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: error.response?.data?.message || "Failed to save your changes",
        topOffset: 50,
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveAcademic = async () => {
    try {
      setUpdating(true);
      const academicPayload = {
        fullName: name,
        username,
        email,
        institutionName: institutionName.trim(),
        expectedGraduationYear: expectedGraduationYear
          ? parseInt(expectedGraduationYear, 10)
          : undefined,
        department: department.trim(),
        degreeProgram: degreeProgram.trim(),
        major: major.trim(),
        currentSemester: currentSemester
          ? parseInt(currentSemester, 10)
          : undefined,
        skills: skills
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        careerPreferences: careerPreferences
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      };

      await apiClient.put(`/student/${userId}`, academicPayload);
      await fetchProfile();

      Toast.show({
        type: "success",
        text1: "Academic Profile Updated",
        text2: "Your changes have been saved",
        topOffset: 50,
        props: {
          style: {
            backgroundColor: colors.success,
            borderRadius: 12,
            marginHorizontal: Spacing.LG,
          },
          text1Style: {
            fontFamily: "Poppins-SemiBold",
            fontSize: FontSizes.Base,
            fontWeight: "600",
            color: "#FFFFFF",
          },
          text2Style: {
            fontFamily: "Poppins-Regular",
            fontSize: FontSizes.SM,
            fontWeight: "400",
            color: "#FFFFFF",
          },
        },
      });

      setCurrentView("overview");
    } catch (error: any) {
      console.error("Error updating academic profile:", error);
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: error.response?.data?.message || "Failed to save your changes",
        topOffset: 50,
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  // Profile Overview Screen
  if (currentView === "overview" && profile) {
    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.overviewContent}
        >
          {/* Profile Card */}
          <View style={styles.profileCard}>
            <Text style={styles.avatarLabel}>Profile</Text>

            {/* Avatar */}
            <View style={styles.avatarContainer}>
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarPlaceholderText}>
                  {profile.fullName?.charAt(0).toUpperCase()}
                </Text>
              </View>
            </View>

            {/* Profile Info */}
            <Text style={styles.profileName}>{profile.fullName}</Text>
            <Text style={styles.profileRole}>
              {formatRoleToPascalCase(userRole)}
            </Text>

            {/* Menu Items */}
            <View style={styles.menuSection}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => setCurrentView("editPersonal")}
              >
                <View style={styles.menuIconContainer}>
                  <Edit size={20} color={colors.primary} strokeWidth={2} />
                </View>
                <Text style={styles.menuItemText}>Edit Personal Profile</Text>
                <ChevronRight
                  size={20}
                  color={colors.textLight}
                  strokeWidth={2}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => setCurrentView("editAcademic")}
              >
                <View style={styles.menuIconContainer}>
                  <Edit size={20} color={colors.primary} strokeWidth={2} />
                </View>
                <Text style={styles.menuItemText}>Edit Academic Profile</Text>
                <ChevronRight
                  size={20}
                  color={colors.textLight}
                  strokeWidth={2}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign Out Button */}
          <RoundedButton
            title="Sign Out"
            variant="primary"
            size="small"
            onPress={handleLogout}
            style={styles.signOutButton}
            icon={<LogOut size={18} color={colors.white} strokeWidth={2} />}
          />
        </ScrollView>
      </View>
    );
  }

  // Edit Personal Profile Screen
  if (currentView === "editPersonal") {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={() => setCurrentView("overview")}
            style={styles.backButton}
          >
            <ChevronLeft size={20} color={colors.primary} strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Personal Profile</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.editContent}
        >
          <View style={styles.formSection}>
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your full name"
                placeholderTextColor={colors.textLight}
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Username</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="Enter your username"
                placeholderTextColor={colors.textLight}
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor={colors.textLight}
                keyboardType="email-address"
                editable={false}
              />
            </View>
          </View>

          <View>
            <RoundedButton
              title={updating ? "Saving..." : "Save"}
              variant="primary"
              size="large"
              onPress={handleSavePersonal}
              loading={updating}
              style={styles.saveButton}
            />
          </View>
        </ScrollView>
      </View>
    );
  }

  // Edit Academic Profile Screen
  if (currentView === "editAcademic") {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={() => setCurrentView("overview")}
            style={styles.backButton}
          >
            <ChevronLeft size={20} color={colors.primary} strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Academic Profile</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.editContent}
        >
          <View style={styles.formSection}>
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Institution Name</Text>
              <TextInput
                style={styles.input}
                value={institutionName}
                onChangeText={setInstitutionName}
                placeholder="Enter institution name"
                placeholderTextColor={colors.textLight}
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Expected Graduation Year</Text>
              <TextInput
                style={styles.input}
                value={expectedGraduationYear}
                onChangeText={setExpectedGraduationYear}
                placeholder="Enter expected graduation year"
                placeholderTextColor={colors.textLight}
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Department</Text>
              <TextInput
                style={styles.input}
                value={department}
                onChangeText={setDepartment}
                placeholder="Enter department"
                placeholderTextColor={colors.textLight}
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Degree Program</Text>
              <TextInput
                style={styles.input}
                value={degreeProgram}
                onChangeText={setDegreeProgram}
                placeholder="Enter degree program"
                placeholderTextColor={colors.textLight}
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Major</Text>
              <TextInput
                style={styles.input}
                value={major}
                onChangeText={setMajor}
                placeholder="Enter major"
                placeholderTextColor={colors.textLight}
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Current Semester</Text>
              <TextInput
                style={styles.input}
                value={currentSemester}
                onChangeText={setCurrentSemester}
                placeholder="Enter current semester"
                placeholderTextColor={colors.textLight}
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Skills (comma-separated)</Text>
              <TextInput
                style={styles.input}
                value={skills}
                onChangeText={setSkills}
                placeholder="e.g. Java, Spring Boot, SQL"
                placeholderTextColor={colors.textLight}
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>
                Career Preferences (comma-separated)
              </Text>
              <TextInput
                style={styles.input}
                value={careerPreferences}
                onChangeText={setCareerPreferences}
                placeholder="e.g. Data Science, Backend Engineering"
                placeholderTextColor={colors.textLight}
              />
            </View>
          </View>

          <View>
            <RoundedButton
              title={updating ? "Saving..." : "Save"}
              variant="primary"
              size="large"
              onPress={handleSaveAcademic}
              loading={updating}
              style={styles.saveButton}
            />
          </View>
        </ScrollView>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    flex: 1,
  },
  overviewContent: {
    paddingHorizontal: Spacing.LG,
    paddingVertical: Spacing.LG,
    paddingBottom: Spacing.XXXL,
  },
  editContent: {
    paddingHorizontal: Spacing.LG,
    paddingVertical: Spacing.LG,
    paddingBottom: Spacing.XXXL,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.LG,
    paddingTop: Spacing.MD,
    paddingBottom: Spacing.MD,
    backgroundColor: colors.card,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerSpacer: {
    width: 36,
    height: 36,
  },
  headerTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.LG,
    fontWeight: "600",
    color: colors.textDark,
    flex: 1,
    textAlign: "center",
  },
  profileCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: Spacing.LG,
    alignItems: "center",
    marginBottom: Spacing.LG,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarLabel: {
    fontFamily: "Poppins-Bold",
    fontSize: FontSizes.XXL,
    fontWeight: "600",
    color: colors.textDark,
    marginBottom: Spacing.SM,
  },
  avatarContainer: {
    marginBottom: Spacing.MD,
    position: "relative",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: colors.primary,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: colors.primary,
  },
  avatarPlaceholderText: {
    fontFamily: "Poppins-Bold",
    fontSize: 40,
    fontWeight: "700",
    color: colors.white,
  },

  profileName: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.LG,
    fontWeight: "600",
    color: colors.textDark,
    marginBottom: Spacing.XS,
  },
  profileRole: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.SM,
    fontWeight: "400",
    color: colors.textLight,
    marginBottom: Spacing.LG,
  },
  menuSection: {
    width: "100%",
    gap: Spacing.SM,
    marginTop: Spacing.MD,
    paddingTop: Spacing.MD,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.MD,
    paddingHorizontal: Spacing.SM,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.MD,
  },
  menuItemText: {
    flex: 1,
    fontFamily: "Poppins-Medium",
    fontSize: FontSizes.Base,
    fontWeight: "500",
    color: colors.textDark,
  },
  signOutButton: {
    marginTop: Spacing.LG,
  },
  formSection: {
    gap: Spacing.MD,
    marginBottom: Spacing.XL,
  },
  fieldContainer: {
    gap: Spacing.SM,
  },
  fieldLabel: {
    fontFamily: "Poppins-Medium",
    fontSize: FontSizes.SM,
    fontWeight: "500",
    color: colors.textDark,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: Spacing.MD,
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.Base,
    fontWeight: "400",
    color: colors.textDark,
  },

  saveButton: {
    marginTop: Spacing.MD,
  },
  loadingText: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.Base,
    fontWeight: "400",
    color: colors.textLight,
    textAlign: "center",
    marginTop: Spacing.XL,
  },
});
