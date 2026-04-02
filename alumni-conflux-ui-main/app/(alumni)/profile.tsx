import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Camera, ChevronLeft, Plus, X } from "lucide-react-native";
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

interface AlumniProfile {
  fullName: string;
  username: string;
  email: string;
  institutionName: string;
  graduationYear: number;
  industry: string;
  currentCompany: string;
  jobTitle: string;
  experienceLevel: string;
  skills: string[];
  achievements: string[];
}

export default function AlumniProfileScreen() {
  const router = useRouter();
  const { userId, userRole, setAuthData, profileComplete } = useAuth();
  const [profile, setProfile] = useState<AlumniProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [institution, setInstitution] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [industry, setIndustry] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/alumni/${userId}`);
      setProfile(response.data);
      setName(response.data.fullName);
      setEmail(response.data.email);
      setInstitution(response.data.institutionName);
      setGraduationYear(response.data.graduationYear.toString());
      setCompany(response.data.currentCompany);
      setJobTitle(response.data.jobTitle);
      setIndustry(response.data.industry);
      setExperienceLevel(response.data.experienceLevel);
      setSkills(response.data.skills || []);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Toast.show({
        type: "error",
        text1: "Permission Required",
        text2: "Allow access to media library",
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    try {
      const updateData = {
        fullName: name,
        email: email,
        institutionName: institution,
        graduationYear: graduationYear ? parseInt(graduationYear) : 0,
        currentCompany: company,
        jobTitle: jobTitle,
        industry: industry,
        experienceLevel: experienceLevel,
        skills: skills,
      };

      await apiClient.put(`/alumni/${userId}`, updateData);

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
    } catch (error) {
      console.error("Error updating profile:", error);
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: "Failed to save your changes",
        topOffset: 50,
      });
    }
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const deleteSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => {
            if (profileComplete) {
              router.back();
            }
          }}
          style={[
            styles.backButton,
            !profileComplete && styles.backButtonDisabled,
          ]}
          disabled={!profileComplete}
        >
          <ChevronLeft
            size={24}
            color={profileComplete ? colors.primary : colors.textLight}
            strokeWidth={2}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {profileComplete ? "Edit Profile" : "Complete Your Profile"}
        </Text>
      </View>

      <ScrollView
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            {avatar ? (
              <View style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarLetter}>{name.charAt(0)}</Text>
            )}
          </View>
          <TouchableOpacity style={styles.cameraButton} onPress={pickImage}>
            <Camera size={16} color={colors.white} strokeWidth={2} />
          </TouchableOpacity>
        </View>

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

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Location</Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="Enter your location"
              placeholderTextColor={colors.textLight}
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Bio</Text>
            <TextInput
              style={[styles.input, styles.bioInput]}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell us about yourself"
              placeholderTextColor={colors.textLight}
              multiline
              numberOfLines={4}
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

          {/* Current Position Section */}
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
        </View>

        {profile && !loading && (
          <>
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

            {profile.achievements && profile.achievements.length > 0 && (
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
          </>
        )}

        <View style={styles.buttonSection}>
          <RoundedButton
            title="Save Changes"
            variant="primary"
            size="large"
            onPress={handleSave}
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
    paddingTop: Spacing.LG,
    paddingBottom: Spacing.XL,
    gap: Spacing.MD,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },

  backButtonDisabled: {
    opacity: 0.5,
  },

  headerTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.LG,
    fontWeight: "600",
    color: colors.textDark,
    flex: 1,
  },

  contentContainer: {
    flex: 1,
  },

  content: {
    paddingHorizontal: Spacing.LG,
    paddingBottom: Spacing.XXXL,
  },

  avatarSection: {
    alignItems: "center",
    marginBottom: Spacing.XXXL,
    paddingTop: Spacing.LG,
  },

  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.MD,
    borderWidth: 4,
    borderColor: colors.background,
  },

  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 48,
    backgroundColor: colors.background,
  },

  avatarLetter: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.XXXL,
    fontWeight: "600",
    color: colors.white,
  },

  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: "35%",
    backgroundColor: colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: colors.background,
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
