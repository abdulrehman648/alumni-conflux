import { useRouter } from "expo-router";
import { ChevronLeft, Plus, X } from "lucide-react-native";
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
import { apiClient, profileService } from "../../src/services/api";
import colors from "../../src/theme/colors";

interface StudentProfile {
  fullName: string;
  username: string;
  email: string;
  institutionName: string;
  expectedGraduationYear: number;
  department: string;
  degreeProgram: string;
  major: string;
  currentSemester: number;
  skills: string[];
  careerPreferences: string[];
}

export default function StudentProfileScreen() {
  const router = useRouter();
  const { userId, userRole, setAuthData, profileComplete } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [institution, setInstitution] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [department, setDepartment] = useState("");
  const [degreeProgram, setDegreeProgram] = useState("");
  const [major, setMajor] = useState("");
  const [semester, setSemester] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [careerPreferences, setCareerPreferences] = useState<string[]>([]);
  const [newPreference, setNewPreference] = useState("");
  const [uploading, setUploading] = useState(false);

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
      setEmail(data.email || "");
      setInstitution(data.institutionName || "");
      setGraduationYear(data.expectedGraduationYear?.toString() || "");
      setDepartment(data.department || "");
      setDegreeProgram(data.degreeProgram || "");
      setMajor(data.major || "");
      setSemester(data.currentSemester?.toString() || "");
      setSkills(data.skills || []);
      setCareerPreferences(data.careerPreferences || []);
    } catch (error) {
      console.error("Error fetching student profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setUploading(true);

      const updateData = {
        fullName: name,
        email: email,
        institutionName: institution,
        expectedGraduationYear: graduationYear ? parseInt(graduationYear) : 0,
        department: department,
        degreeProgram: degreeProgram,
        major: major,
        currentSemester: semester ? parseInt(semester) : 1,
        skills: skills,
        careerPreferences: careerPreferences,
      };

      await apiClient.put(`/student/${userId}`, updateData);

      await fetchProfile();

      setAuthData({
        userId: userId || "",
        userRole: userRole || "",
        fullName: name,
        profileComplete: true,
      });

      Toast.show({
        type: "success",
        text1: "Profile Updated",
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
    } catch (error: any) {
      console.error("Error updating profile:", error);
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: error.response?.data?.message || "Failed to save your changes",
        topOffset: 50,
      });
    } finally {
      setUploading(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const deleteSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const addPreference = () => {
    if (
      newPreference.trim() &&
      !careerPreferences.includes(newPreference.trim())
    ) {
      setCareerPreferences([...careerPreferences, newPreference.trim()]);
      setNewPreference("");
    }
  };

  const deletePreference = (index: number) => {
    setCareerPreferences(careerPreferences.filter((_, i) => i !== index));
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ChevronLeft size={18} color={colors.textDark} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
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
            <Text style={styles.fieldLabel}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor={colors.textLight}
              keyboardType="email-address"
            />
          </View>

          {/* Education Section */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Institution</Text>
            <TextInput
              style={styles.input}
              value={institution}
              onChangeText={setInstitution}
              placeholder="Enter your institution"
              placeholderTextColor={colors.textLight}
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Expected Graduation Year</Text>
            <TextInput
              style={styles.input}
              value={graduationYear}
              onChangeText={setGraduationYear}
              placeholder="e.g. 2026"
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
              placeholder="Enter your department"
              placeholderTextColor={colors.textLight}
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Degree Program</Text>
            <TextInput
              style={styles.input}
              value={degreeProgram}
              onChangeText={setDegreeProgram}
              placeholder="e.g. BSCS"
              placeholderTextColor={colors.textLight}
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Major</Text>
            <TextInput
              style={styles.input}
              value={major}
              onChangeText={setMajor}
              placeholder="Enter your major"
              placeholderTextColor={colors.textLight}
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Current Semester</Text>
            <TextInput
              style={styles.input}
              value={semester}
              onChangeText={setSemester}
              placeholder="e.g. 6"
              placeholderTextColor={colors.textLight}
              keyboardType="number-pad"
            />
          </View>
        </View>

        {profile && !loading && (
          <>
            {/* Skills Section */}
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
            </View>

            {/* Career Preferences Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Career Preferences</Text>
              <View style={styles.addSkillContainer}>
                <TextInput
                  style={styles.addSkillInput}
                  value={newPreference}
                  onChangeText={setNewPreference}
                  placeholder="Add a preference"
                  placeholderTextColor={colors.textLight}
                />
                <TouchableOpacity
                  style={styles.addSkillButton}
                  onPress={addPreference}
                >
                  <Plus size={20} color={colors.white} strokeWidth={2} />
                </TouchableOpacity>
              </View>

              <View style={styles.tagsContainer}>
                {careerPreferences.map((pref, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{pref}</Text>
                    <TouchableOpacity
                      onPress={() => deletePreference(index)}
                      style={styles.deleteSkillButton}
                    >
                      <X size={14} color={colors.primary} strokeWidth={2.5} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}

        <View style={styles.buttonSection}>
          <RoundedButton
            title={uploading ? "Saving..." : "Save Changes"}
            variant="primary"
            size="large"
            onPress={handleSave}
            loading={uploading}
            style={styles.button}
          />
          <RoundedButton
            title="Logout"
            variant="secondary"
            size="large"
            onPress={() => router.replace("/login")}
            style={styles.button}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.LG,
    paddingTop: Spacing.MD,
    paddingBottom: Spacing.MD,
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
  contentContainer: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.LG,
    paddingBottom: Spacing.XXXL,
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
  buttonSection: {
    gap: Spacing.MD,
    marginTop: Spacing.LG,
  },
  button: {
    marginTop: 0,
  },
});
