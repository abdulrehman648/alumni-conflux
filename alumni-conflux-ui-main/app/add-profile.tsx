import { useLocalSearchParams, useRouter } from "expo-router";
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
import { useAuth } from "../src/context/AuthContext";
import { profileService } from "../src/services/api";
import colors from "../src/theme/colors";

interface StudentProfile {
  institutionName: string;
  expectedGraduationYear: number;
  department: string;
  degreeProgram: string;
  major: string;
  currentSemester: number;
  skills: string[];
  careerPreferences: string[];
}

interface AlumniProfile {
  institutionName: string;
  graduationYear: number;
  industry: string;
  currentCompany: string;
  jobTitle: string;
  experienceLevel: string;
  skills: string[];
  achievements: string[];
}

export default function AddProfile() {
  const router = useRouter();
  const { setAuthData } = useAuth();
  const { userId: paramUserId, role: paramRole } = useLocalSearchParams<{
    userId: string;
    role: string;
  }>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Use param values or defaults
  const userId = paramUserId;
  const role = paramRole;

  // Student fields
  const [institutionName, setInstitutionName] = useState("");
  const [expectedGraduationYear, setExpectedGraduationYear] = useState("");
  const [department, setDepartment] = useState("");
  const [degreeProgram, setDegreeProgram] = useState("");
  const [major, setMajor] = useState("");
  const [currentSemester, setCurrentSemester] = useState("");
  const [skills, setSkills] = useState("");
  const [careerPreferences, setCareerPreferences] = useState("");

  // Alumni fields
  const [graduationYear, setGraduationYear] = useState("");
  const [industry, setIndustry] = useState("");
  const [currentCompany, setCurrentCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("FRESHER");
  const [achievements, setAchievements] = useState("");

  const isStudent = role?.toUpperCase() === "STUDENT";
  const isAlumni = role?.toUpperCase() === "ALUMNI";

  const handleSubmit = async () => {
    setError("");

    // Validation
    if (!institutionName.trim()) {
      setError("Institution name is required");
      return;
    }

    if (isStudent) {
      if (!expectedGraduationYear.trim()) {
        setError("Expected graduation year is required");
        return;
      }
      if (!/^\d{4}$/.test(expectedGraduationYear)) {
        setError("Please enter a valid year (YYYY)");
        return;
      }
      if (!department.trim()) {
        setError("Department is required");
        return;
      }
      if (!degreeProgram.trim()) {
        setError("Degree program is required");
        return;
      }
      if (!major.trim()) {
        setError("Major is required");
        return;
      }
      if (!currentSemester.trim()) {
        setError("Current semester is required");
        return;
      }
      if (!/^\d+$/.test(currentSemester)) {
        setError("Semester must be a number");
        return;
      }
      if (!skills.trim()) {
        setError("Please add at least one skill");
        return;
      }
      if (!careerPreferences.trim()) {
        setError("Please add at least one career preference");
        return;
      }
    }

    if (isAlumni) {
      if (!graduationYear.trim()) {
        setError("Graduation year is required");
        return;
      }
      if (!/^\d{4}$/.test(graduationYear)) {
        setError("Please enter a valid year (YYYY)");
        return;
      }
      if (!industry.trim()) {
        setError("Industry is required");
        return;
      }
      if (!currentCompany.trim()) {
        setError("Current company is required");
        return;
      }
      if (!jobTitle.trim()) {
        setError("Job title is required");
        return;
      }
      if (!skills.trim()) {
        setError("Please add at least one skill");
        return;
      }
      if (!achievements.trim()) {
        setError("Please add at least one achievement");
        return;
      }
    }

    setLoading(true);

    try {
      const skillsArray = skills
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      let payload: StudentProfile | AlumniProfile;

      if (isStudent) {
        const preferencesArray = careerPreferences
          .split(",")
          .map((p) => p.trim())
          .filter((p) => p.length > 0);

        payload = {
          institutionName: institutionName.trim(),
          expectedGraduationYear: parseInt(expectedGraduationYear),
          department: department.trim(),
          degreeProgram: degreeProgram.trim(),
          major: major.trim(),
          currentSemester: parseInt(currentSemester),
          skills: skillsArray,
          careerPreferences: preferencesArray,
        };
      } else {
        const achievementsArray = achievements
          .split(",")
          .map((a) => a.trim())
          .filter((a) => a.length > 0);

        payload = {
          institutionName: institutionName.trim(),
          graduationYear: parseInt(graduationYear),
          industry: industry.trim(),
          currentCompany: currentCompany.trim(),
          jobTitle: jobTitle.trim(),
          experienceLevel: experienceLevel.toUpperCase(),
          skills: skillsArray,
          achievements: achievementsArray,
        };
      }

      const profileResponse = isStudent 
        ? await profileService.saveStudentProfile(Number(userId), payload)
        : await profileService.saveAlumniProfile(Number(userId), payload);

      if (profileResponse) {
        Toast.show({
          type: "success",
          text1: "Profile Created",
          text2: "Your profile has been saved successfully",
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

        // Update auth context with profile completion status
        setAuthData({
          userId: userId!,
          userRole: role!,
          fullName: "",
          profileComplete: true,
        });

        setLoading(false);

        // Navigate to appropriate dashboard
        if (isStudent) {
          router.replace("/(student)");
        } else if (isAlumni) {
          router.replace("/(alumni)");
        } else {
          router.replace("/(admin)");
        }
      } else {
        setError("Failed to save profile. Please try again.");
        setLoading(false);
      }
    } catch (err: any) {
      console.error("Profile creation error:", err);
      setError(err.response?.data?.message || "Failed to create profile");
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <AuthHeader
          title="Complete Your Profile"
          subtitle="Help us know you better"
        />

        <AuthCard>
          <Text style={styles.label}>Institution Name *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="University of Education Lahore"
            placeholderTextColor={colors.textLight}
            value={institutionName}
            onChangeText={setInstitutionName}
            editable={!loading}
          />

          {isStudent && (
            <>
              <Text style={styles.label}>Expected Graduation Year *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="2026"
                placeholderTextColor={colors.textLight}
                value={expectedGraduationYear}
                onChangeText={setExpectedGraduationYear}
                keyboardType="number-pad"
                maxLength={4}
                editable={!loading}
              />

              <Text style={styles.label}>Department *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Computer Science"
                placeholderTextColor={colors.textLight}
                value={department}
                onChangeText={setDepartment}
                editable={!loading}
              />

              <Text style={styles.label}>Degree Program *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="BSIT"
                placeholderTextColor={colors.textLight}
                value={degreeProgram}
                onChangeText={setDegreeProgram}
                editable={!loading}
              />

              <Text style={styles.label}>Major *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Software Engineering"
                placeholderTextColor={colors.textLight}
                value={major}
                onChangeText={setMajor}
                editable={!loading}
              />

              <Text style={styles.label}>Current Semester *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="6"
                placeholderTextColor={colors.textLight}
                value={currentSemester}
                onChangeText={setCurrentSemester}
                keyboardType="number-pad"
                editable={!loading}
              />

              <Text style={styles.label}>Skills (comma-separated) *</Text>
              <TextInput
                style={[styles.textInput, styles.multilineInput]}
                placeholder="Java, Spring Boot, MySQL"
                placeholderTextColor={colors.textLight}
                value={skills}
                onChangeText={setSkills}
                multiline
                numberOfLines={3}
                editable={!loading}
              />

              <Text style={styles.label}>
                Career Preferences (comma-separated) *
              </Text>
              <TextInput
                style={[styles.textInput, styles.multilineInput]}
                placeholder="Backend Developer, Java Developer"
                placeholderTextColor={colors.textLight}
                value={careerPreferences}
                onChangeText={setCareerPreferences}
                multiline
                numberOfLines={3}
                editable={!loading}
              />
            </>
          )}

          {isAlumni && (
            <>
              <Text style={styles.label}>Graduation Year *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="2023"
                placeholderTextColor={colors.textLight}
                value={graduationYear}
                onChangeText={setGraduationYear}
                keyboardType="number-pad"
                maxLength={4}
                editable={!loading}
              />

              <Text style={styles.label}>Industry *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Software Engineering"
                placeholderTextColor={colors.textLight}
                value={industry}
                onChangeText={setIndustry}
                editable={!loading}
              />

              <Text style={styles.label}>Current Company *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Tech Solutions Pvt Ltd"
                placeholderTextColor={colors.textLight}
                value={currentCompany}
                onChangeText={setCurrentCompany}
                editable={!loading}
              />

              <Text style={styles.label}>Job Title *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Backend Developer"
                placeholderTextColor={colors.textLight}
                value={jobTitle}
                onChangeText={setJobTitle}
                editable={!loading}
              />

              <Text style={styles.label}>Experience Level *</Text>
              <View style={styles.pickerContainer}>
                {["FRESHER", "JUNIOR", "SENIOR", "LEAD"].map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.levelButton,
                      experienceLevel === level && styles.levelButtonActive,
                    ]}
                    onPress={() => setExperienceLevel(level)}
                    disabled={loading}
                  >
                    <Text
                      style={[
                        styles.levelButtonText,
                        experienceLevel === level &&
                          styles.levelButtonTextActive,
                      ]}
                    >
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Skills (comma-separated) *</Text>
              <TextInput
                style={[styles.textInput, styles.multilineInput]}
                placeholder="Java, Spring Boot, MySQL, REST APIs"
                placeholderTextColor={colors.textLight}
                value={skills}
                onChangeText={setSkills}
                multiline
                numberOfLines={3}
                editable={!loading}
              />

              <Text style={styles.label}>Achievements (comma-separated) *</Text>
              <TextInput
                style={[styles.textInput, styles.multilineInput]}
                placeholder="Built alumni management system as final year project"
                placeholderTextColor={colors.textLight}
                value={achievements}
                onChangeText={setAchievements}
                multiline
                numberOfLines={3}
                editable={!loading}
              />
            </>
          )}

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </AuthCard>

        <View style={styles.buttonContainer}>
          <RoundedButton
            title="Save Profile"
            onPress={handleSubmit}
            variant="primary"
            size="large"
            loading={loading}
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
  contentContainer: {
    flexGrow: 1,
    padding: Spacing.LG,
    paddingBottom: Spacing.XXL,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontFamily: "Poppins-Medium",
    fontSize: FontSizes.SM,
    color: colors.textDark,
    marginBottom: Spacing.SM,
    fontWeight: "500",
    marginTop: Spacing.MD,
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
  },
  multilineInput: {
    textAlignVertical: "top",
    minHeight: 80,
  },
  pickerContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.SM,
    marginBottom: Spacing.MD,
  },
  levelButton: {
    paddingHorizontal: Spacing.MD,
    paddingVertical: Spacing.SM,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  levelButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  levelButtonText: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.SM,
    color: colors.textDark,
  },
  levelButtonTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  errorText: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.XS,
    fontWeight: "400",
    color: colors.danger,
    marginTop: Spacing.MD,
  },
  buttonContainer: {
    width: "100%",
    marginTop: Spacing.XL,
  },
});
