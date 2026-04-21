import { useRouter } from "expo-router";
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
  BackHandler,
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
  role?: string;
  institutionName: string;
  graduationYear: number | null;
  industry: string;
  currentCompany: string;
  jobTitle: string;
  experienceLevel: string;
  skills: string[];
  achievements: string[];
  careerPath: string[];
  certifications: string[];
  advice: string;
}

export default function AlumniProfileScreen() {
  const router = useRouter();
  const { userId, logout, userRole } = useAuth();
  const [profile, setProfile] = useState<AlumniProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<ProfileView>("overview");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Form states
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [institution, setInstitution] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [industry, setIndustry] = useState("");
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [achievements, setAchievements] = useState("");
  const [careerPath, setCareerPath] = useState("");
  const [certifications, setCertifications] = useState("");
  const [advice, setAdvice] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (userId) fetchProfile();
  }, [userId]);

  useEffect(() => {
    const onBackPress = () => {
      if (currentView !== "overview") {
        setCurrentView("overview");
        return true;
      }
      return false;
    };
    const b = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => b.remove();
  }, [currentView]);

  const fetchProfile = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const data = await profileService.getAlumniProfile(Number(userId));
      setProfile(data);
      setName(data.fullName || "");
      setUsername(data.username || "");
      setEmail(data.email || "");
      setInstitution(data.institutionName || "");
      setGraduationYear(data.graduationYear ? String(data.graduationYear) : "");
      setIndustry(data.industry || "");
      setCompany(data.currentCompany || "");
      setJobTitle(data.jobTitle || "");
      setExperienceLevel(data.experienceLevel || "");
      setSkills(Array.isArray(data.skills) ? data.skills : []);
      setAchievements(
        Array.isArray(data.achievements) ? data.achievements.join(", ") : "",
      );
      setCareerPath(
        Array.isArray(data.careerPath) ? data.careerPath.join(", ") : "",
      );
      setCertifications(
        Array.isArray(data.certifications)
          ? data.certifications.join(", ")
          : "",
      );
      setAdvice(data.advice || "");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const validatePersonal = () => {
    const e: any = {};
    if (!name.trim()) e.name = "Required";
    if (!username.trim()) e.username = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateProfessional = () => {
    const e: any = {};
    if (!institution.trim()) e.institution = "Required";
    if (!graduationYear.trim()) e.graduationYear = "Required";
    else if (!/^\d{4}$/.test(graduationYear))
      e.graduationYear = "Enter a valid year";
    if (!industry.trim()) e.industry = "Required";
    if (!company.trim()) e.company = "Required";
    if (!jobTitle.trim()) e.jobTitle = "Required";
    if (!experienceLevel.trim()) e.experienceLevel = "Required";
    if (skills.length === 0) e.skills = "Add expertise";
    if (!achievements.trim()) e.achievements = "Add at least one achievement";
    if (!careerPath.trim()) e.careerPath = "Add at least one career role";
    if (!advice.trim()) e.advice = "Career advice is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async (isPersonal: boolean) => {
    const isValid = isPersonal ? validatePersonal() : validateProfessional();
    if (!isValid) return;

    try {
      setUpdating(true);
      await profileService.updateAlumniProfile(Number(userId), {
        fullName: name,
        username,
        email,
        institutionName: institution,
        graduationYear: graduationYear ? parseInt(graduationYear) : null,
        industry,
        currentCompany: company,
        jobTitle,
        experienceLevel: experienceLevel.toUpperCase(),
        skills,
        achievements: achievements
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item.length > 0),
        careerPath: careerPath
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item.length > 0),
        certifications: certifications
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item.length > 0),
        advice: advice.trim(),
      } as any);
      await fetchProfile();
      setCurrentView("overview");
      Toast.show({ type: "success", text1: "Saved" });
    } catch (e) {
      Toast.show({ type: "error", text1: "Failed" });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <ProfilePage
      currentView={currentView}
      loading={loading}
      onViewChange={setCurrentView}
      personalTitle="Edit Personal Profile"
      academicTitle="Edit Professional Profile"
      overviewContent={
        <View style={styles.profileCard}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarPlaceholderText}>
              {profile?.fullName?.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.profileName}>{profile?.fullName}</Text>
          <Text style={styles.profileRole}>Alumni Partner</Text>

          <View style={styles.menuSection}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => setCurrentView("editPersonal")}
            >
              <View style={styles.menuIconContainer}>
                <Edit size={18} color={colors.white} />
              </View>
              <Text style={styles.menuItemText}>Personal Profile</Text>
              <ChevronRight size={20} color={colors.textLight} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => setCurrentView("editAcademic")}
            >
              <View style={styles.menuIconContainer}>
                <Edit size={18} color={colors.white} />
              </View>
              <Text style={styles.menuItemText}>Professional Profile</Text>
              <ChevronRight size={20} color={colors.textLight} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/(alumni)/availability" as any)}
            >
              <View style={styles.menuIconContainer}>
                <ToggleRight size={18} color={colors.white} />
              </View>
              <Text style={styles.menuItemText}>Open for Mentorship</Text>
              <ChevronRight size={20} color={colors.textLight} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                logout();
                router.replace("/login");
              }}
            >
              <View style={styles.menuIconContainer}>
                <LogOut size={18} color={colors.white} />
              </View>
              <Text style={styles.menuItemText}>Logout</Text>
              <ChevronRight size={20} color={colors.textLight} />
            </TouchableOpacity>
          </View>
        </View>
      }
      personalContent={
        <View style={styles.formContainer}>
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Full Name</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              value={name}
              onChangeText={setName}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Username</Text>
            <TextInput
              style={[styles.input, errors.username && styles.inputError]}
              value={username}
              onChangeText={setUsername}
            />
          </View>
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput style={styles.input} value={email} editable={false} />
          </View>
          <RoundedButton
            title={updating ? "Saving..." : "Save"}
            size="small"
            variant="primary"
            onPress={() => handleSave(true)}
            loading={updating}
            style={styles.saveBtn}
          />
        </View>
      }
      academicContent={
        <View style={styles.formContainer}>
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Institution</Text>
            <TextInput
              style={[styles.input, errors.institution && styles.inputError]}
              value={institution}
              onChangeText={setInstitution}
            />
            {errors.institution && (
              <Text style={styles.errorText}>{errors.institution}</Text>
            )}
          </View>
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Graduation Year</Text>
            <TextInput
              style={[styles.input, errors.graduationYear && styles.inputError]}
              value={graduationYear}
              onChangeText={setGraduationYear}
              keyboardType="number-pad"
              maxLength={4}
            />
            {errors.graduationYear && (
              <Text style={styles.errorText}>{errors.graduationYear}</Text>
            )}
          </View>
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Industry</Text>
            <TextInput
              style={[styles.input, errors.industry && styles.inputError]}
              value={industry}
              onChangeText={setIndustry}
            />
            {errors.industry && (
              <Text style={styles.errorText}>{errors.industry}</Text>
            )}
          </View>
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Current Company</Text>
            <TextInput
              style={styles.input}
              value={company}
              onChangeText={setCompany}
            />
            {errors.company && (
              <Text style={styles.errorText}>{errors.company}</Text>
            )}
          </View>
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Job Title</Text>
            <TextInput
              style={[styles.input, errors.jobTitle && styles.inputError]}
              value={jobTitle}
              onChangeText={setJobTitle}
            />
            {errors.jobTitle && (
              <Text style={styles.errorText}>{errors.jobTitle}</Text>
            )}
          </View>
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Experience Level</Text>
            <View style={styles.levelRow}>
              {["FRESHER", "JUNIOR", "SENIOR", "LEAD"].map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.levelButton,
                    experienceLevel === level && styles.levelButtonActive,
                  ]}
                  onPress={() => setExperienceLevel(level)}
                >
                  <Text
                    style={[
                      styles.levelButtonText,
                      experienceLevel === level && styles.levelButtonTextActive,
                    ]}
                  >
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.experienceLevel && (
              <Text style={styles.errorText}>{errors.experienceLevel}</Text>
            )}
          </View>
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Achievements</Text>
            <TextInput
              style={[
                styles.input,
                styles.multilineInput,
                errors.achievements && styles.inputError,
              ]}
              value={achievements}
              onChangeText={setAchievements}
              placeholder="Project award, Hackathon win"
              multiline
              numberOfLines={3}
            />
            {errors.achievements && (
              <Text style={styles.errorText}>{errors.achievements}</Text>
            )}
          </View>
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Career Path</Text>
            <TextInput
              style={[
                styles.input,
                styles.multilineInput,
                errors.careerPath && styles.inputError,
              ]}
              value={careerPath}
              onChangeText={setCareerPath}
              placeholder="Intern, Associate, Senior Engineer"
              multiline
              numberOfLines={3}
            />
            {errors.careerPath && (
              <Text style={styles.errorText}>{errors.careerPath}</Text>
            )}
          </View>
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Certifications</Text>
            <TextInput
              style={styles.input}
              value={certifications}
              onChangeText={setCertifications}
              placeholder="AWS Certified, Oracle Java Professional"
              multiline
              numberOfLines={2}
            />
          </View>
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Career Advice</Text>
            <TextInput
              style={[
                styles.input,
                styles.multilineInput,
                errors.advice && styles.inputError,
              ]}
              value={advice}
              onChangeText={setAdvice}
              placeholder="Focus on projects, communication, and consistency."
              multiline
              numberOfLines={4}
            />
            {errors.advice && (
              <Text style={styles.errorText}>{errors.advice}</Text>
            )}
          </View>
          <View style={styles.skillsSection}>
            <Text style={styles.fieldLabel}>Expertise</Text>
            <View style={styles.tagInputRow}>
              <TextInput
                style={styles.tagInput}
                value={newSkill}
                onChangeText={setNewSkill}
                placeholder="expertise"
              />
              <TouchableOpacity
                style={styles.tagAddBtn}
                onPress={() => {
                  if (newSkill.trim() && !skills.includes(newSkill.trim())) {
                    setSkills([...skills, newSkill.trim()]);
                    setNewSkill("");
                  }
                }}
              >
                <Plus size={20} color={colors.white} />
              </TouchableOpacity>
            </View>
            <View style={styles.tagsArea}>
              {skills.map((s, i) => (
                <View key={i} style={styles.tag}>
                  <Text style={styles.tagText}>{s}</Text>
                  <TouchableOpacity
                    onPress={() =>
                      setSkills(skills.filter((_, idx) => idx !== i))
                    }
                  >
                    <X size={14} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
          <RoundedButton
            title={updating ? "Saving..." : "Save"}
            size="small"
            variant="primary"
            onPress={() => handleSave(false)}
            loading={updating}
            style={styles.saveBtn}
          />
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  profileCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: Spacing.LG,
    alignItems: "center",
    marginBottom: Spacing.LG,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarLabel: {
    fontFamily: "Poppins-Bold",
    fontSize: FontSizes.XL,
    color: colors.textDark,
    marginBottom: Spacing.MD,
    alignSelf: "flex-start",
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.MD,
    marginTop: Spacing.HUGE,
  },
  avatarPlaceholderText: {
    fontFamily: "Poppins-Bold",
    fontSize: 32,
    color: colors.white,
  },
  profileName: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.LG,
    color: colors.textDark,
  },
  profileRole: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.SM,
    color: colors.textLight,
    marginBottom: Spacing.LG,
  },
  menuSection: {
    width: "100%",
    gap: Spacing.SM,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.MD,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  menuItemText: {
    flex: 1,
    fontFamily: "Poppins-Medium",
    fontSize: FontSizes.Base,
    color: colors.textDark,
  },
  formContainer: {
    padding: Spacing.LG,
    backgroundColor: colors.card,
    borderRadius: 16,
  },
  fieldContainer: { gap: 6, marginBottom: Spacing.MD },
  fieldLabel: {
    fontFamily: "Poppins-Medium",
    fontSize: 13,
    color: colors.textDark,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: Spacing.MD,
    borderWidth: 1,
    borderColor: colors.border,
    fontFamily: "Poppins-Regular",
  },
  inputError: { borderColor: colors.danger },
  multilineInput: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  errorText: {
    fontFamily: "Poppins-Regular",
    fontSize: 11,
    color: colors.danger,
  },
  saveBtn: { marginTop: Spacing.LG },
  levelRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  levelButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.white,
  },
  levelButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  levelButtonText: {
    fontFamily: "Poppins-Medium",
    fontSize: 12,
    color: colors.textDark,
  },
  levelButtonTextActive: {
    color: colors.white,
  },
  skillsSection: { marginBottom: Spacing.MD },
  tagInputRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
  tagInput: {
    flex: 1,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagAddBtn: {
    backgroundColor: colors.primary,
    width: 45,
    height: 45,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  tagsArea: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: {
    backgroundColor: "#f0f7f7",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  tagText: {
    fontFamily: "Poppins-Medium",
    fontSize: 12,
    color: colors.primary,
  },
});
