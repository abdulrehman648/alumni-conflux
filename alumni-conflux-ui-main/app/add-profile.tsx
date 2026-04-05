import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Platform,
  SafeAreaView,
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
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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
    const newErrors: { [key: string]: string } = {};

    // Validation
    if (!institutionName.trim()) {
      newErrors.institutionName = "Institution name is required";
    }

    if (isStudent) {
      if (!expectedGraduationYear.trim()) {
        newErrors.expectedGraduationYear =
          "Expected graduation year is required";
      } else if (!/^\d{4}$/.test(expectedGraduationYear)) {
        newErrors.expectedGraduationYear = "Please enter a valid year (YYYY)";
      }
      if (!department.trim()) {
        newErrors.department = "Department is required";
      }
      if (!degreeProgram.trim()) {
        newErrors.degreeProgram = "Degree program is required";
      }
      if (!major.trim()) {
        newErrors.major = "Major is required";
      }
      if (!currentSemester.trim()) {
        newErrors.currentSemester = "Current semester is required";
      } else if (!/^\d+$/.test(currentSemester)) {
        newErrors.currentSemester = "Semester must be a number";
      }
      if (!skills.trim()) {
        newErrors.skills = "Please add at least one skill";
      }
      if (!careerPreferences.trim()) {
        newErrors.careerPreferences =
          "Please add at least one career preference";
      }
    }

    if (isAlumni) {
      if (!graduationYear.trim()) {
        newErrors.graduationYear = "Graduation year is required";
      } else if (!/^\d{4}$/.test(graduationYear)) {
        newErrors.graduationYear = "Please enter a valid year (YYYY)";
      }
      if (!industry.trim()) {
        newErrors.industry = "Industry is required";
      }
      if (!currentCompany.trim()) {
        newErrors.currentCompany = "Current company is required";
      }
      if (!jobTitle.trim()) {
        newErrors.jobTitle = "Job title is required";
      }
      if (!skills.trim()) {
        newErrors.skills = "Please add at least one skill";
      }
      if (!achievements.trim()) {
        newErrors.achievements = "Please add at least one achievement";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

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

        setAuthData({
          userId: userId!,

          userRole: role!,
          fullName: "",
          profileComplete: true,
        });

        setLoading(false);

        if (isStudent) {
          router.replace("/(student)/profile");
        } else if (isAlumni) {
          router.replace("/(alumni)/profile");
        } else {
          router.replace("/(admin)");
        }
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to save profile. Please try again.",
        });
        setLoading(false);
      }
    } catch (err: any) {
      console.error("Profile creation error:", err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err.response?.data?.message || "Failed to create profile",
      });
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
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
          <Text style={styles.label}>Institution Name</Text>
          <TextInput
            style={[
              styles.textInput,
              errors.institutionName && styles.textInputError,
            ]}
            placeholder="Institution Name"
            placeholderTextColor={colors.textLight}
            value={institutionName}
            onChangeText={(text) => {
              setInstitutionName(text);
              if (errors.institutionName && text.trim()) {
                const newErrors = { ...errors };
                delete newErrors.institutionName;
                setErrors(newErrors);
              }
            }}
            editable={!loading}
          />
          {errors.institutionName && (
            <Text style={styles.errorText}>{errors.institutionName}</Text>
          )}

          {isStudent && (
            <>
              <Text style={styles.label}>Expected Graduation Year</Text>
              <TextInput
                style={[
                  styles.textInput,
                  errors.expectedGraduationYear && styles.textInputError,
                ]}
                placeholder="2026"
                placeholderTextColor={colors.textLight}
                value={expectedGraduationYear}
                onChangeText={(text) => {
                  setExpectedGraduationYear(text);
                  if (errors.expectedGraduationYear && text.trim()) {
                    const newErrors = { ...errors };
                    delete newErrors.expectedGraduationYear;
                    setErrors(newErrors);
                  }
                }}
                keyboardType="number-pad"
                maxLength={4}
                editable={!loading}
              />
              {errors.expectedGraduationYear && (
                <Text style={styles.errorText}>
                  {errors.expectedGraduationYear}
                </Text>
              )}

              <Text style={styles.label}>Department</Text>
              <TextInput
                style={[
                  styles.textInput,
                  errors.department && styles.textInputError,
                ]}
                placeholder="Computer Science"
                placeholderTextColor={colors.textLight}
                value={department}
                onChangeText={(text) => {
                  setDepartment(text);
                  if (errors.department && text.trim()) {
                    const newErrors = { ...errors };
                    delete newErrors.department;
                    setErrors(newErrors);
                  }
                }}
                editable={!loading}
              />
              {errors.department && (
                <Text style={styles.errorText}>{errors.department}</Text>
              )}

              <Text style={styles.label}>Degree Program</Text>
              <TextInput
                style={[
                  styles.textInput,
                  errors.degreeProgram && styles.textInputError,
                ]}
                placeholder="BSIT"
                placeholderTextColor={colors.textLight}
                value={degreeProgram}
                onChangeText={(text) => {
                  setDegreeProgram(text);
                  if (errors.degreeProgram && text.trim()) {
                    const newErrors = { ...errors };
                    delete newErrors.degreeProgram;
                    setErrors(newErrors);
                  }
                }}
                editable={!loading}
              />
              {errors.degreeProgram && (
                <Text style={styles.errorText}>{errors.degreeProgram}</Text>
              )}

              <Text style={styles.label}>Major *</Text>
              <TextInput
                style={[
                  styles.textInput,
                  errors.major && styles.textInputError,
                ]}
                placeholder="Software Engineering"
                placeholderTextColor={colors.textLight}
                value={major}
                onChangeText={(text) => {
                  setMajor(text);
                  if (errors.major && text.trim()) {
                    const newErrors = { ...errors };
                    delete newErrors.major;
                    setErrors(newErrors);
                  }
                }}
                editable={!loading}
              />
              {errors.major && (
                <Text style={styles.errorText}>{errors.major}</Text>
              )}

              <Text style={styles.label}>Current Semester *</Text>
              <TextInput
                style={[
                  styles.textInput,
                  errors.currentSemester && styles.textInputError,
                ]}
                placeholder="6"
                placeholderTextColor={colors.textLight}
                value={currentSemester}
                onChangeText={(text) => {
                  setCurrentSemester(text);
                  if (errors.currentSemester && text.trim()) {
                    const newErrors = { ...errors };
                    delete newErrors.currentSemester;
                    setErrors(newErrors);
                  }
                }}
                keyboardType="number-pad"
                editable={!loading}
              />
              {errors.currentSemester && (
                <Text style={styles.errorText}>{errors.currentSemester}</Text>
              )}

              <Text style={styles.label}>Skills (comma-separated) *</Text>
              <TextInput
                style={[
                  styles.textInput,
                  styles.multilineInput,
                  errors.skills && styles.textInputError,
                ]}
                placeholder="Java, Spring Boot, MySQL"
                placeholderTextColor={colors.textLight}
                value={skills}
                onChangeText={(text) => {
                  setSkills(text);
                  if (errors.skills && text.trim()) {
                    const newErrors = { ...errors };
                    delete newErrors.skills;
                    setErrors(newErrors);
                  }
                }}
                multiline
                numberOfLines={3}
                editable={!loading}
              />
              {errors.skills && (
                <Text style={styles.errorText}>{errors.skills}</Text>
              )}

              <Text style={styles.label}>
                Career Preferences (comma-separated) *
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  styles.multilineInput,
                  errors.careerPreferences && styles.textInputError,
                ]}
                placeholder="Backend Developer, Java Developer"
                placeholderTextColor={colors.textLight}
                value={careerPreferences}
                onChangeText={(text) => {
                  setCareerPreferences(text);
                  if (errors.careerPreferences && text.trim()) {
                    const newErrors = { ...errors };
                    delete newErrors.careerPreferences;
                    setErrors(newErrors);
                  }
                }}
                multiline
                numberOfLines={3}
                editable={!loading}
              />
              {errors.careerPreferences && (
                <Text style={styles.errorText}>{errors.careerPreferences}</Text>
              )}
            </>
          )}

          {isAlumni && (
            <>
              <Text style={styles.label}>Graduation Year</Text>
              <TextInput
                style={[
                  styles.textInput,
                  errors.graduationYear && styles.textInputError,
                ]}
                placeholder="2023"
                placeholderTextColor={colors.textLight}
                value={graduationYear}
                onChangeText={(text) => {
                  setGraduationYear(text);
                  if (errors.graduationYear && text.trim()) {
                    const newErrors = { ...errors };
                    delete newErrors.graduationYear;
                    setErrors(newErrors);
                  }
                }}
                keyboardType="number-pad"
                maxLength={4}
                editable={!loading}
              />
              {errors.graduationYear && (
                <Text style={styles.errorText}>{errors.graduationYear}</Text>
              )}

              <Text style={styles.label}>Industry *</Text>
              <TextInput
                style={[
                  styles.textInput,
                  errors.industry && styles.textInputError,
                ]}
                placeholder="Software Engineering"
                placeholderTextColor={colors.textLight}
                value={industry}
                onChangeText={(text) => {
                  setIndustry(text);
                  if (errors.industry && text.trim()) {
                    const newErrors = { ...errors };
                    delete newErrors.industry;
                    setErrors(newErrors);
                  }
                }}
                editable={!loading}
              />
              {errors.industry && (
                <Text style={styles.errorText}>{errors.industry}</Text>
              )}

              <Text style={styles.label}>Current Company *</Text>
              <TextInput
                style={[
                  styles.textInput,
                  errors.currentCompany && styles.textInputError,
                ]}
                placeholder="Tech Solutions Pvt Ltd"
                placeholderTextColor={colors.textLight}
                value={currentCompany}
                onChangeText={(text) => {
                  setCurrentCompany(text);
                  if (errors.currentCompany && text.trim()) {
                    const newErrors = { ...errors };
                    delete newErrors.currentCompany;
                    setErrors(newErrors);
                  }
                }}
                editable={!loading}
              />
              {errors.currentCompany && (
                <Text style={styles.errorText}>{errors.currentCompany}</Text>
              )}

              <Text style={styles.label}>Job Title *</Text>
              <TextInput
                style={[
                  styles.textInput,
                  errors.jobTitle && styles.textInputError,
                ]}
                placeholder="Backend Developer"
                placeholderTextColor={colors.textLight}
                value={jobTitle}
                onChangeText={(text) => {
                  setJobTitle(text);
                  if (errors.jobTitle && text.trim()) {
                    const newErrors = { ...errors };
                    delete newErrors.jobTitle;
                    setErrors(newErrors);
                  }
                }}
                editable={!loading}
              />
              {errors.jobTitle && (
                <Text style={styles.errorText}>{errors.jobTitle}</Text>
              )}

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
                style={[
                  styles.textInput,
                  styles.multilineInput,
                  errors.skills && styles.textInputError,
                ]}
                placeholder="Java, Spring Boot, MySQL, REST APIs"
                placeholderTextColor={colors.textLight}
                value={skills}
                onChangeText={(text) => {
                  setSkills(text);
                  if (errors.skills && text.trim()) {
                    const newErrors = { ...errors };
                    delete newErrors.skills;
                    setErrors(newErrors);
                  }
                }}
                multiline
                numberOfLines={3}
                editable={!loading}
              />
              {errors.skills && (
                <Text style={styles.errorText}>{errors.skills}</Text>
              )}

              <Text style={styles.label}>Achievements (comma-separated) *</Text>
              <TextInput
                style={[
                  styles.textInput,
                  styles.multilineInput,
                  errors.achievements && styles.textInputError,
                ]}
                placeholder="Built alumni management system as final year project"
                placeholderTextColor={colors.textLight}
                value={achievements}
                onChangeText={(text) => {
                  setAchievements(text);
                  if (errors.achievements && text.trim()) {
                    const newErrors = { ...errors };
                    delete newErrors.achievements;
                    setErrors(newErrors);
                  }
                }}
                multiline
                numberOfLines={3}
                editable={!loading}
              />
              {errors.achievements && (
                <Text style={styles.errorText}>{errors.achievements}</Text>
              )}
            </>
          )}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === "android" ? Spacing.MD : 0,
  },
  contentContainer: {
    flexGrow: 1,
    padding: Spacing.LG,
    paddingTop: Spacing.XXL,
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
  textInputError: {
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
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
