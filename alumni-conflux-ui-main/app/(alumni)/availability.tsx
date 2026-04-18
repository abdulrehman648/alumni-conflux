import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Switch,
} from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import NestedScreenHeader from "../../src/components/NestedScreenHeader";
import { useAuth } from "../../src/context/AuthContext";
import { profileService, mentorshipService } from "../../src/services/api";
import { loadMentorAssessmentState } from "../../src/services/mentorMatch";
import { Ionicons } from "@expo/vector-icons";
import colors from "@/src/theme/colors";
import { Colors } from "@/constants/theme";

export default function Availability() {
  const router = useRouter();
  const { userId } = useAuth();
  const [isAvailable, setIsAvailable] = useState(false);
  const [hasRequiredDetails, setHasRequiredDetails] = useState(false);
  const [hasCompletedAssessment, setHasCompletedAssessment] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const hasText = (value: unknown) =>
    typeof value === "string" && value.trim().length > 0;
  const hasList = (value: unknown) =>
    Array.isArray(value) && value.some((item) => hasText(item));

  const isMentorProfileReady = (profile: any) =>
    hasText(profile?.institutionName) &&
    (profile?.graduationYear != null || hasText(profile?.graduationYear)) &&
    hasText(profile?.industry) &&
    hasText(profile?.currentCompany) &&
    hasText(profile?.jobTitle) &&
    hasText(profile?.experienceLevel) &&
    hasList(profile?.skills);

  useEffect(() => {
    fetchCurrentStatus();
  }, [userId]);

  const fetchCurrentStatus = async () => {
    if (!userId) return;

    try {
      const [profile, assessmentState] = await Promise.all([
        profileService.getAlumniProfile(parseInt(userId)),
        loadMentorAssessmentState(userId),
      ]);

      setIsAvailable(profile.isAvailableForMentorship);
      setHasRequiredDetails(isMentorProfileReady(profile));
      setHasCompletedAssessment(Boolean(assessmentState?.completed));
    } catch (error) {
      console.error("Failed to fetch alumni profile:", error);
      Alert.alert("Error", "Could not load your availability status.");
    } finally {
      setLoading(false);
    }
  };

  const getLatestPrerequisites = async () => {
    if (!userId) {
      return { profileReady: false, assessmentReady: false };
    }

    const [profile, assessmentState] = await Promise.all([
      profileService.getAlumniProfile(parseInt(userId)),
      loadMentorAssessmentState(userId),
    ]);

    const profileReady = isMentorProfileReady(profile);
    const assessmentReady = Boolean(assessmentState?.completed);

    setHasRequiredDetails(profileReady);
    setHasCompletedAssessment(assessmentReady);

    return { profileReady, assessmentReady };
  };

  const toggleAvailability = async (value: boolean) => {
    if (!userId) return;

    let profileReady = hasRequiredDetails;
    let assessmentReady = hasCompletedAssessment;

    if (value) {
      try {
        const latest = await getLatestPrerequisites();
        profileReady = latest.profileReady;
        assessmentReady = latest.assessmentReady;
      } catch (error) {
        console.error("Failed to refresh mentorship prerequisites:", error);
      }
    }

    if (value && !profileReady) {
      Alert.alert(
        "Complete your profile",
        "Complete your professional profile from Profile before enabling mentorship.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Go to Profile",
            onPress: () =>
              router.push("/(alumni)/profile?view=editAcademic" as any),
          },
        ],
      );
      return;
    }

    if (value && !assessmentReady) {
      Alert.alert(
        "Complete your assessment",
        "Finish the assessments from My Profile to start mentorship.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Go to Assessment",
            onPress: () =>
              router.push("/(alumni)/profile?view=editAssessment" as any),
          },
        ],
      );
      return;
    }

    setUpdating(true);
    try {
      await mentorshipService.updateAvailability(parseInt(userId), value);
      setIsAvailable(value);
      Alert.alert(
        "Success",
        `Mentorship availability turned ${value ? "ON" : "OFF"}`,
      );
    } catch (error) {
      console.error("Failed to update availability:", error);
      Alert.alert(
        "Error",
        "Failed to update your availability. Please try again.",
      );
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0F4C4F" />
      </View>
    );
  }

  function GuidelinesItem({
    heading,
    text,
  }: {
    heading: string;
    text: string;
  }) {
    return (
      <View style={styles.guidelineRow}>
        <Text style={styles.guidelineHeading}>{heading}</Text>
        <Text style={styles.guidelineText}>{text}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <NestedScreenHeader
        title="Mentorship Availability"
        onBack={() => router.back()}
      />
      <View style={{ padding: 16 }}>
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <View style={styles.infoTextContainer}>
              <Text style={styles.label}>Open for Mentorship</Text>
              <Text style={styles.description}>
                Students are matched with you only when mentorship is ON and
                your profile plus mentor assessment are complete.
              </Text>
            </View>
            <Switch
              value={isAvailable}
              onValueChange={toggleAvailability}
              disabled={updating}
              trackColor={{ false: "#ccc", true: "#0F4C4F" }}
              thumbColor={isAvailable ? "#fff" : "#f4f3f4"}
            />
          </View>

          {updating && (
            <View style={styles.updatingOverlay}>
              <ActivityIndicator size="small" color="#0F4C4F" />
              <Text style={styles.updatingText}>Updating...</Text>
            </View>
          )}
        </View>

        <View style={styles.guidelinesCard}>
          <Text style={styles.guidelineTitle}>Mentor Guidelines</Text>
          <GuidelinesItem
            heading="1. Complete Your Profile"
            text="Turn on mentorship only after completing your profile and assessment. Student will be matched with you only when everything is properly setup."
          />
          <GuidelinesItem
            heading="2. Finish Professional Details"
            text="Go to Profile and finish your professional profile and assessment before activating mentorship."
          />
          <GuidelinesItem
            heading="3. Respond Promptly"
            text="Make sure to respond to student requests within 48 hours."
          />
          <GuidelinesItem
            heading="4. Keep Mentorship On"
            text="You can turn off mentorship anytime, but try to keep it on if you want to be matched with students and provide them mentorship."
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 12,
    position: "relative",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  infoTextContainer: { flex: 1, marginRight: 15 },
  label: { fontSize: 17.5, fontWeight: "600", color: "#333", marginBottom: 4 },
  description: { fontSize: 14, color: "#666", lineHeight: 20 },
  updatingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  updatingText: { marginLeft: 10, fontWeight: "500", color: "#0F4C4F" },
  guidelinesCard: {
    borderRadius: 16,
    padding: 4,
  },
  guidelineTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 15,
  },
  guidelineRow: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: "#e0e0e0",
    borderLeftWidth: 3,
    borderLeftColor: colors.secondary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  guidelineHeading: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.secondary,
    marginBottom: 4,
  },
  guidelineText: {
    fontSize: 13,
    color: "#666",
    lineHeight: 20,
  },
});
