import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ChevronRight,
  Edit,
  LogOut,
  Plus,
  ToggleRight,
  X,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { FontSizes, Spacing } from "../../constants/theme";
import ProfilePage, { ProfileView } from "../../src/components/ProfilePage";
import RoundedButton from "../../src/components/RoundedButton";
import { useAuth } from "../../src/context/AuthContext";
import { profileService } from "../../src/services/api";
import colors from "../../src/theme/colors";

interface AlumniProfile {
  fullName: string;
  username: string;
  email: string;
  institutionName: string;
  graduationYear: number | null;
  industry: string;
  currentCompany: string;
  jobTitle: string;
  experienceLevel: string;
  skills: string[];
  achievements: string[];
}

export default function AlumniProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ view?: string }>();
  const { userId, userRole, fullName, logout } = useAuth();
  const [profile, setProfile] = useState<AlumniProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<ProfileView>("overview");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [institution, setInstitution] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [industry, setIndustry] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!userId) return;
    fetchProfile();
  }, [userId]);

  useEffect(() => {
    const requestedView = params.view;
    if (requestedView === "editAcademic") {
      setCurrentView("editAcademic");
    }
  }, [params.view]);

  const buildFallbackProfile = (): AlumniProfile => ({
    fullName: fullName || "Alumni",
    username: username || "",
    email: email || "",
    institutionName: "",
    graduationYear: null,
    industry: "",
    currentCompany: "",
    jobTitle: "",
    experienceLevel: "",
    skills: [],
    achievements: [],
  });

  const applyProfileState = (data: AlumniProfile) => {
    setProfile(data);
    setName(data.fullName || "");
    setUsername(data.username || "");
    setEmail(data.email || "");
    setInstitution(data.institutionName || "");
    setGraduationYear(
      data.graduationYear != null ? String(data.graduationYear) : "",
    );
    setCompany(data.currentCompany || "");
    setJobTitle(data.jobTitle || "");
    setIndustry(data.industry || "");
    setExperienceLevel(data.experienceLevel || "");
    setSkills(Array.isArray(data.skills) ? data.skills : []);
  };

  const normalizeProfile = (data: Partial<AlumniProfile>): AlumniProfile => ({
    ...buildFallbackProfile(),
    ...data,
    graduationYear:
      data.graduationYear != null ? Number(data.graduationYear) : null,
    skills: Array.isArray(data.skills) ? data.skills : [],
    achievements: Array.isArray(data.achievements) ? data.achievements : [],
  });

  const fetchProfile = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const data = await profileService.getAlumniProfile(Number(userId));
      applyProfileState(normalizeProfile(data));
    } catch (error) {
      console.error("Error fetching profile:", error);
      const fallback = buildFallbackProfile();
      applyProfileState(fallback);
    } finally {
      setLoading(false);
    }
  };

  const buildUpdatePayload = () => ({
    fullName: name.trim() || profile?.fullName || fullName || "",
    username: username.trim() || profile?.username || "",
    email: email.trim() || profile?.email || "",
    institutionName: institution.trim() || profile?.institutionName || "",
    graduationYear: graduationYear.trim()
      ? parseInt(graduationYear, 10)
      : (profile?.graduationYear ?? undefined),
    industry: industry.trim() || profile?.industry || "",
    currentCompany: company.trim() || profile?.currentCompany || "",
    jobTitle: jobTitle.trim() || profile?.jobTitle || "",
    experienceLevel: experienceLevel.trim() || profile?.experienceLevel || "",
    skills,
    achievements: profile?.achievements || [],
  });

  const handleSavePersonal = async () => {
    try {
      setUpdating(true);
      await profileService.updateAlumniProfile(Number(userId), {
        ...buildUpdatePayload(),
        fullName: name.trim() || profile?.fullName || fullName || "",
        username: username.trim() || profile?.username || "",
        email: email.trim() || profile?.email || "",
      });
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
      await profileService.updateAlumniProfile(
        Number(userId),
        buildUpdatePayload(),
      );
      await fetchProfile();
      setCurrentView("overview");
      Toast.show({
        type: "success",
        text1: "Academic Profile Updated",
        text2: "Your changes have been saved",
        topOffset: 50,
      });
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

  const addSkill = () => {
    const skill = newSkill.trim();
    if (!skill) return;

    if (!skills.includes(skill)) {
      setSkills([...skills, skill]);
    }
    setNewSkill("");
  };

  const deleteSkill = (index: number) => {
    setSkills(skills.filter((_, currentIndex) => currentIndex !== index));
  };

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <ProfilePage
      currentView={currentView}
      loading={loading}
      loadingText="Loading profile..."
      onViewChange={setCurrentView}
      personalTitle="Personal Profile"
      academicTitle="Professional Profile"
      overviewContent={
        <>
          <View style={styles.profileCard}>
            <Text style={styles.avatarLabel}>Profile</Text>

            <View style={styles.avatarContainer}>
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarPlaceholderText}>
                  {profile?.fullName?.charAt(0).toUpperCase()}
                </Text>
              </View>
            </View>

            <Text style={styles.profileName}>{profile?.fullName}</Text>
            <Text style={styles.profileRole}>
              {userRole
                ? userRole.charAt(0).toUpperCase() +
                  userRole.slice(1).toLowerCase()
                : "Alumni"}
            </Text>

            <View style={styles.menuSection}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => setCurrentView("editPersonal")}
              >
                <View style={styles.menuIconContainer}>
                  <Edit size={20} color={colors.white} strokeWidth={2} />
                </View>
                <Text style={styles.menuItemText}>Personal Profile</Text>
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
                  <Edit size={20} color={colors.white} strokeWidth={2} />
                </View>
                <Text style={styles.menuItemText}>Professional Profile</Text>
                <ChevronRight
                  size={20}
                  color={colors.textLight}
                  strokeWidth={2}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => router.push("/(alumni)/availability" as any)}
              >
                <View style={styles.menuIconContainer}>
                  <ToggleRight size={20} color={colors.white} strokeWidth={2} />
                </View>
                <Text style={styles.menuItemText}>Open for Mentorship</Text>
                <ChevronRight
                  size={20}
                  color={colors.textLight}
                  strokeWidth={2}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() =>
                  router.push("/(alumni)/mentor-assessment" as any)
                }
              >
                <View style={styles.menuIconContainer}>
                  <Edit size={20} color={colors.white} strokeWidth={2} />
                </View>
                <Text style={styles.menuItemText}>Take Assessment</Text>
                <ChevronRight
                  size={20}
                  color={colors.textLight}
                  strokeWidth={2}
                />
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                <View style={styles.menuIconContainer}>
                  <LogOut size={20} color={colors.white} strokeWidth={2} />
                </View>
                <Text style={styles.menuItemText}>Sign Out</Text>
                <ChevronRight
                  size={20}
                  color={colors.textLight}
                  strokeWidth={2}
                />
              </TouchableOpacity>
            </View>
          </View>
        </>
      }
      personalContent={
        <View style={styles.formSection}>
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
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
            <Text style={styles.fieldLabel}>Email Address</Text>
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

          <View>
            <RoundedButton
              title={updating ? "Saving..." : "Save Changes"}
              variant="primary"
              size="small"
              onPress={handleSavePersonal}
              loading={updating}
              style={styles.saveButton}
            />
          </View>
        </View>
      }
      academicContent={
        <View style={styles.formSection}>
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Institution Name</Text>
            <TextInput
              style={styles.input}
              value={institution}
              onChangeText={setInstitution}
              placeholder="Enter institution name"
              placeholderTextColor={colors.textLight}
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Graduation Year</Text>
            <TextInput
              style={styles.input}
              value={graduationYear}
              onChangeText={setGraduationYear}
              placeholder="Enter graduation year"
              placeholderTextColor={colors.textLight}
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Company</Text>
            <TextInput
              style={styles.input}
              value={company}
              onChangeText={setCompany}
              placeholder="Enter your company"
              placeholderTextColor={colors.textLight}
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Job Title</Text>
            <TextInput
              style={styles.input}
              value={jobTitle}
              onChangeText={setJobTitle}
              placeholder="Enter your job title"
              placeholderTextColor={colors.textLight}
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Industry</Text>
            <TextInput
              style={styles.input}
              value={industry}
              onChangeText={setIndustry}
              placeholder="Enter your industry"
              placeholderTextColor={colors.textLight}
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Experience Level</Text>
            <TextInput
              style={styles.input}
              value={experienceLevel}
              onChangeText={setExperienceLevel}
              placeholder="Enter your experience level"
              placeholderTextColor={colors.textLight}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>

            <View style={styles.addSkillContainer}>
              <TextInput
                style={styles.addSkillInput}
                value={newSkill}
                onChangeText={setNewSkill}
                placeholder="Add a new skill"
                placeholderTextColor={colors.textLight}
              />
              <TouchableOpacity
                style={styles.addSkillButton}
                onPress={addSkill}
              >
                <Plus size={20} color={colors.white} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            {skills.length > 0 && (
              <View style={styles.tagsContainer}>
                {skills.map((skill, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{skill}</Text>
                    <TouchableOpacity
                      onPress={() => deleteSkill(index)}
                      style={styles.deleteSkillButton}
                    >
                      <X size={14} color={colors.primary} strokeWidth={2.5} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {profile?.achievements && profile.achievements.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Achievements</Text>
              <View style={styles.tagsContainer}>
                {profile.achievements.map((achievement, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{achievement}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

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
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    flex: 1,
  },

  loadingText: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.Base,
    color: colors.textLight,
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.SM,
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

  formSection: {
    marginBottom: Spacing.XL,
    gap: Spacing.MD,
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

  bioInput: {
    minHeight: 100,
    textAlignVertical: "top",
  },

  buttonSection: {
    gap: Spacing.MD,
    marginTop: Spacing.LG,
  },

  button: {
    marginTop: 0,
  },

  saveButton: {
    marginTop: Spacing.MD,
  },

  section: {
    marginBottom: Spacing.XL,
    paddingBottom: Spacing.XL,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  sectionTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.Base,
    fontWeight: "600",
    color: colors.primary,
    marginBottom: Spacing.MD,
  },

  detailRow: {
    marginBottom: Spacing.MD,
  },

  detailLabel: {
    fontFamily: "Poppins-Medium",
    fontSize: FontSizes.SM,
    fontWeight: "500",
    color: colors.textLight,
    marginBottom: Spacing.XS,
  },

  detailValue: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.Base,
    fontWeight: "400",
    color: colors.textDark,
  },

  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.SM,
  },

  tag: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: Spacing.MD,
    paddingVertical: Spacing.SM,
    borderWidth: 1,
    borderColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  tagText: {
    fontFamily: "Poppins-Medium",
    fontSize: FontSizes.SM,
    fontWeight: "500",
    color: colors.primary,
  },

  addSkillContainer: {
    flexDirection: "row",
    gap: Spacing.SM,
    marginBottom: Spacing.LG,
  },

  addSkillInput: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: Spacing.MD,
    paddingVertical: Spacing.SM,
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.Base,
    fontWeight: "400",
    color: colors.textDark,
  },

  addSkillButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: Spacing.MD,
    paddingVertical: Spacing.SM,
    alignItems: "center",
    justifyContent: "center",
  },

  deleteSkillButton: {
    marginLeft: Spacing.XS,
    padding: 4,
  },
});
