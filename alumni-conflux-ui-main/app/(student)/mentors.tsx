import { useRouter } from "expo-router";
import {
  ChevronLeft,
  ChevronRight,
  Code,
  MessageSquare,
  Search,
  Star,
} from "lucide-react-native";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useCallback, useEffect, useState } from "react";
import { FontSizes, Spacing } from "../../constants/theme";
import { useAuth } from "../../src/context/AuthContext";
import { useList } from "../../src/hooks/useAsync";
import { mentorshipService } from "../../src/services/api";
import {
  loadMentorAssessmentState,
  normalizeMentorRecommendations,
  saveMentorAssessmentState,
  type MentorAssessmentRecommendation,
} from "../../src/services/mentorMatch";
import colors from "../../src/theme/colors";
export default function MentorsScreen() {
  const router = useRouter();
  const { userId, profileComplete } = useAuth();
  const [assessmentComplete, setAssessmentComplete] = useState(false);
  const [assessmentLoading, setAssessmentLoading] = useState(true);
  const [recommendedMentors, setRecommendedMentors] = useState<
    MentorAssessmentRecommendation[]
  >([]);
  const [recommendationLoading, setRecommendationLoading] = useState(false);
  const [recommendationError, setRecommendationError] = useState<string | null>(
    null,
  );
  const [matchTags, setMatchTags] = useState<string[]>([]);
  const canAccessMentors = profileComplete && assessmentComplete;

  const fetchAvailableMentors = useCallback(
    () =>
      canAccessMentors
        ? mentorshipService.getAvailableMentors()
        : Promise.resolve([]),
    [canAccessMentors],
  );

  // Fetch mentors using custom hook
  const {
    items: mentors,
    searchQuery,
    setSearchQuery,
    loading,
    error,
    refetch,
  } = useList(fetchAvailableMentors, "name");

  useEffect(() => {
    const hydrateAssessment = async () => {
      if (!userId) {
        setAssessmentLoading(false);
        return;
      }

      try {
        const storedState = await loadMentorAssessmentState(userId);
        if (storedState?.completed) {
          setAssessmentComplete(true);
          setMatchTags(storedState.profileTags || []);

          if (
            Array.isArray(storedState.recommendations) &&
            storedState.recommendations.length > 0
          ) {
            setRecommendedMentors(storedState.recommendations);
          } else {
            setRecommendationLoading(true);
            const response = await mentorshipService.getRecommendedMentors(
              Number(userId),
            );
            const normalized = normalizeMentorRecommendations(
              response,
              storedState.profileTags || [],
            );
            setRecommendedMentors(normalized);
            await saveMentorAssessmentState(userId, {
              ...storedState,
              recommendations: normalized,
            });
          }
        }
      } catch (error) {
        console.error("Failed to load mentor assessment state:", error);
      } finally {
        setAssessmentLoading(false);
      }
    };

    hydrateAssessment();
  }, [userId]);

  const handleRequestRecommendations = async () => {
    if (!userId) {
      setRecommendationError(
        "Please sign in again to request mentor suggestions.",
      );
      return;
    }

    if (!profileComplete) {
      setRecommendationError(
        "Please complete your student profile before requesting mentor suggestions.",
      );
      router.push("/(student)/profile" as any);
      return;
    }

    if (!assessmentComplete) {
      router.push("/(student)/mentor-assessment" as any);
      return;
    }

    setRecommendationLoading(true);
    setRecommendationError(null);

    try {
      const response = await mentorshipService.getRecommendedMentors(
        Number(userId),
      );
      const normalized = normalizeMentorRecommendations(response, matchTags);
      setRecommendedMentors(normalized);
      await saveMentorAssessmentState(userId, {
        currentTestIndex: 2,
        currentQuestionIndex: 4,
        answers: {},
        completed: true,
        completedAt: new Date().toISOString(),
        profileTags: matchTags,
        recommendations: normalized,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to generate mentor suggestions";
      setRecommendationError(errorMessage);
    } finally {
      setRecommendationLoading(false);
    }
  };

  const renderRating = (rating: number) => {
    return (
      <View style={styles.ratingContainer}>
        <Star size={14} color="#FDB022" strokeWidth={2} fill="#FDB022" />
        <Text style={styles.ratingText}>{rating}</Text>
      </View>
    );
  };

  const renderMentorCard = (mentor: any, isRecommended = false) => {
    const mentorName = mentor.name || mentor.fullName || "Mentor";
    const mentorIndustry =
      mentor.industry || mentor.designation || "Available mentor";
    const mentorCompany = mentor.currentCompany || mentor.company || "";
    const mentorId = mentor.id ?? mentor.alumniId;

    return (
      <TouchableOpacity
        key={mentorId}
        style={[
          styles.mentorCard,
          isRecommended && styles.recommendedMentorCard,
        ]}
        onPress={() => {
          if (mentorId) {
            router.push(`/(student)/mentor-details/${mentorId}`);
          }
        }}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.avatarContainer,
            isRecommended && styles.recommendedAvatarContainer,
          ]}
        >
          <Text style={styles.avatarLetter}>{mentorName.charAt(0)}</Text>
        </View>

        <View style={styles.mentorInfo}>
          <View style={styles.mentorTextBlock}>
            <Text style={styles.mentorName}>{mentorName}</Text>
            <Text style={styles.mentorRole}>{mentorIndustry}</Text>
            <View style={styles.skillsRow}>
              <Code size={14} color={colors.primary} strokeWidth={1.5} />
              <Text style={styles.skillsText}>
                {mentorCompany ||
                  (isRecommended
                    ? "Ranked from your profile"
                    : "Mentor profile")}
              </Text>
            </View>
          </View>

          {isRecommended ? (
            <View style={styles.matchSection}>
              <View style={styles.matchBadge}>
                <Text style={styles.matchBadgeText}>
                  {mentor.matchScore != null
                    ? `${mentor.matchScore}% match`
                    : "Recommended"}
                </Text>
              </View>
              {Array.isArray(mentor.matchReasons) &&
                mentor.matchReasons.length > 0 && (
                  <Text style={styles.matchReasonText} numberOfLines={2}>
                    {mentor.matchReasons.slice(0, 2).join(" · ")}
                  </Text>
                )}
            </View>
          ) : (
            <View style={styles.ratingSection}>
              {renderRating(mentor.rating || 0)}
              <Text style={styles.studentCount}>
                {mentor.students || mentor.totalStudents || 0} students
              </Text>
            </View>
          )}
        </View>

        <ChevronRight size={20} color={colors.textLight} strokeWidth={1.5} />
      </TouchableOpacity>
    );
  };

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MessageSquare size={48} color={colors.danger} strokeWidth={1} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refetch}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ChevronLeft size={18} color={colors.textDark} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Find a Mentor</Text>
        <View style={styles.headerSpacer} />
      </View>

      {assessmentLoading ? (
        <View style={styles.loadingBanner}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.loadingBannerText}>
            Checking your mentor match status...
          </Text>
        </View>
      ) : !profileComplete ? (
        <View style={styles.gateBanner}>
          <View style={styles.recommendationCopy}>
            <Text style={styles.recommendationTitle}>
              Complete your profile
            </Text>
            <Text style={styles.recommendationSubtitle}>
              Add your details first to unlock mentor assessments and AI
              matching.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.recommendationButton}
            onPress={() => router.push("/(student)/profile" as any)}
          >
            <Text style={styles.recommendationButtonText}>
              Complete profile
            </Text>
          </TouchableOpacity>
        </View>
      ) : !assessmentComplete ? (
        <View style={styles.gateBanner}>
          <View style={styles.recommendationCopy}>
            <Text style={styles.recommendationTitle}>
              Unlock mentor matching
            </Text>
            <Text style={styles.recommendationSubtitle}>
              Complete 3 short tests to get personalized mentor suggestions.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.recommendationButton}
            onPress={() => router.push("/(student)/mentor-assessment" as any)}
          >
            <Text style={styles.recommendationButtonText}>Start tests</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.recommendationBanner}>
          <View style={styles.recommendationCopy}>
            <Text style={styles.recommendationTitle}>
              Your top mentor matches
            </Text>
            <Text style={styles.recommendationSubtitle}>
              Ranked from your completed tests and student profile.
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.recommendationButton,
              recommendationLoading && styles.recommendationButtonDisabled,
            ]}
            onPress={handleRequestRecommendations}
            disabled={recommendationLoading}
          >
            <Text style={styles.recommendationButtonText}>
              {recommendationLoading ? "Updating" : "Refresh match"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {recommendationLoading && (
        <View style={styles.processingCard}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.processingText}>
            Analyzing your profile and ranking the best mentor matches
          </Text>
        </View>
      )}

      {recommendationError && !recommendationLoading && (
        <View style={styles.recommendationErrorCard}>
          <Text style={styles.recommendationErrorText}>
            {recommendationError}
          </Text>
        </View>
      )}

      {profileComplete &&
        recommendedMentors.length > 0 &&
        !recommendationLoading && (
          <View style={styles.recommendationsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recommended for you</Text>
              <Text style={styles.sectionSubtitle}>
                Best matches from available alumni
              </Text>
            </View>

            <View style={styles.recommendationsList}>
              {recommendedMentors
                .slice(0, 5)
                .map((mentor) => renderMentorCard(mentor, true))}
            </View>
          </View>
        )}

      {canAccessMentors ? (
        <>
          <View style={styles.searchContainer}>
            <Search size={20} color={colors.textLight} strokeWidth={1.5} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by skill or name"
              placeholderTextColor={colors.textLight}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Loading mentors...</Text>
            </View>
          ) : mentors.length > 0 ? (
            <ScrollView
              style={styles.listContainer}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
            >
              {mentors.map((mentor) => renderMentorCard(mentor))}
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <MessageSquare
                size={48}
                color={colors.textLight}
                strokeWidth={1}
              />
              <Text style={styles.emptyStateText}>No mentors found</Text>
            </View>
          )}
        </>
      ) : (
        <View style={styles.lockedMentorsState}>
          <MessageSquare size={48} color={colors.textLight} strokeWidth={1} />
          <Text style={styles.emptyStateText}>Mentor list is locked</Text>
          <Text style={styles.emptyStateSubtext}>
            Complete your student profile and finish the 3 assessments to view
            available mentors.
          </Text>
          <TouchableOpacity
            style={styles.lockedStateButton}
            onPress={() =>
              router.push(
                profileComplete
                  ? "/(student)/mentor-assessment"
                  : "/(student)/profile",
              )
            }
          >
            <Text style={styles.lockedStateButtonText}>
              {profileComplete ? "Start tests" : "Complete profile"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
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
    flex: 1,
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.LG,
    fontWeight: "600",
    color: colors.textDark,
    textAlign: "center",
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: Spacing.LG,
    marginBottom: Spacing.LG,
    paddingHorizontal: Spacing.MD,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: Spacing.SM,
  },

  searchInput: {
    flex: 1,
    paddingVertical: Spacing.SM,
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.Base,
    fontWeight: "400",
    color: colors.textDark,
  },

  listContainer: {
    flex: 1,
  },

  listContent: {
    paddingHorizontal: Spacing.LG,
    paddingBottom: Spacing.XXXL,
    gap: Spacing.MD,
  },

  mentorCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: Spacing.MD,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    gap: Spacing.MD,
  },

  recommendedMentorCard: {
    borderColor: colors.secondary,
    backgroundColor: "#F7FBFB",
  },

  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  recommendedAvatarContainer: {
    backgroundColor: colors.secondary,
  },

  avatarLetter: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.XL,
    fontWeight: "600",
    color: colors.white,
  },

  mentorInfo: {
    flex: 1,
    justifyContent: "space-between",
  },

  mentorTextBlock: {
    gap: Spacing.XS,
  },

  mentorName: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.SM,
    fontWeight: "600",
    color: colors.textDark,
  },

  mentorRole: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.XS,
    fontWeight: "400",
    color: colors.textLight,
    marginTop: Spacing.XS,
  },

  skillsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.XS,
    marginTop: Spacing.SM,
  },

  skillsText: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.XS,
    fontWeight: "400",
    color: colors.primary,
  },

  ratingSection: {
    alignItems: "flex-end",
    gap: Spacing.XS,
  },

  matchSection: {
    alignItems: "flex-end",
    gap: Spacing.XS,
  },

  matchBadge: {
    backgroundColor: colors.secondary,
    paddingHorizontal: Spacing.SM,
    paddingVertical: 4,
    borderRadius: 999,
  },

  matchBadgeText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.XS,
    fontWeight: "600",
    color: colors.white,
  },

  matchReasonText: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.XS,
    fontWeight: "400",
    color: colors.textLight,
    textAlign: "right",
  },

  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.XS,
  },

  ratingText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.SM,
    fontWeight: "600",
    color: colors.textDark,
  },

  studentCount: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.XS,
    fontWeight: "400",
    color: colors.textLight,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.MD,
  },

  loadingText: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.Base,
    fontWeight: "400",
    color: colors.textLight,
  },

  recommendationBanner: {
    marginHorizontal: Spacing.LG,
    marginBottom: Spacing.LG,
    padding: Spacing.MD,
    borderRadius: 16,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.MD,
  },

  recommendationCopy: {
    flex: 1,
  },

  recommendationTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.SM,
    fontWeight: "600",
    color: colors.white,
  },

  recommendationSubtitle: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.XS,
    fontWeight: "400",
    color: "rgba(255,255,255,0.84)",
    marginTop: Spacing.XS,
  },

  recommendationButton: {
    backgroundColor: colors.white,
    paddingHorizontal: Spacing.MD,
    paddingVertical: Spacing.SM,
    borderRadius: 12,
  },

  recommendationButtonDisabled: {
    opacity: 0.65,
  },

  loadingBanner: {
    marginHorizontal: Spacing.LG,
    marginBottom: Spacing.LG,
    padding: Spacing.MD,
    borderRadius: 16,
    backgroundColor: colors.card,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.SM,
  },

  loadingBannerText: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.XS,
    fontWeight: "400",
    color: colors.textLight,
  },

  gateBanner: {
    marginHorizontal: Spacing.LG,
    marginBottom: Spacing.LG,
    padding: Spacing.MD,
    borderRadius: 16,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.MD,
  },

  recommendationButtonText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.XS,
    fontWeight: "600",
    color: colors.primary,
  },

  processingCard: {
    marginHorizontal: Spacing.LG,
    marginBottom: Spacing.LG,
    padding: Spacing.MD,
    borderRadius: 14,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.SM,
  },

  processingText: {
    flex: 1,
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.SM,
    fontWeight: "400",
    color: colors.textDark,
  },

  recommendationErrorCard: {
    marginHorizontal: Spacing.LG,
    marginBottom: Spacing.LG,
    padding: Spacing.MD,
    borderRadius: 14,
    backgroundColor: "#FFF4F4",
    borderWidth: 1,
    borderColor: "#F1C7C7",
  },

  recommendationErrorText: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.SM,
    fontWeight: "400",
    color: colors.danger,
  },

  recommendationsSection: {
    marginBottom: Spacing.LG,
  },

  sectionHeader: {
    paddingHorizontal: Spacing.LG,
    marginBottom: Spacing.MD,
  },

  sectionTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.Base,
    fontWeight: "600",
    color: colors.textDark,
  },

  sectionSubtitle: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.XS,
    fontWeight: "400",
    color: colors.textLight,
    marginTop: Spacing.XS,
  },

  recommendationsList: {
    paddingHorizontal: Spacing.LG,
    gap: Spacing.MD,
  },

  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing.XXXL,
    gap: Spacing.MD,
  },

  emptyStateText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.Base,
    fontWeight: "600",
    color: colors.textDark,
    marginTop: Spacing.MD,
  },

  emptyStateSubtext: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.SM,
    fontWeight: "400",
    color: colors.textLight,
  },

  lockedMentorsState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.LG,
    paddingBottom: Spacing.XXXL,
    gap: Spacing.SM,
  },

  lockedStateButton: {
    marginTop: Spacing.MD,
    backgroundColor: colors.primary,
    paddingHorizontal: Spacing.XL,
    paddingVertical: Spacing.MD,
    borderRadius: 12,
  },

  lockedStateButtonText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.SM,
    fontWeight: "600",
    color: colors.white,
  },

  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.LG,
    gap: Spacing.MD,
  },

  errorText: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.Base,
    fontWeight: "400",
    color: colors.danger,
    textAlign: "center",
  },

  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: Spacing.XL,
    paddingVertical: Spacing.MD,
    borderRadius: 12,
    marginTop: Spacing.MD,
  },

  retryText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.SM,
    fontWeight: "600",
    color: colors.white,
  },
});
