import { useRouter } from "expo-router";
import {
  ArrowLeft,
  CheckCircle2,
  RotateCcw,
  Sparkles,
} from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { FontSizes, Spacing } from "../../constants/theme";
import { useAuth } from "../../src/context/AuthContext";
import {
  assessmentService,
  mentorshipService,
  type AssessmentQuestionResponse,
  type AssessmentType,
} from "../../src/services/api";
import colors from "../../src/theme/colors";
import {
  buildProfileTags,
  clearMentorAssessmentState,
  getCompletedQuestionCount,
  loadMentorAssessmentState,
  normalizeMentorRecommendations,
  saveMentorAssessmentState,
  type MentorAssessmentAnswer,
  type MentorAssessmentRecommendation,
  type MentorAssessmentTest,
  type MentorAssessmentState,
} from "../../src/services/mentorMatch";

const ASSESSMENT_VERSION = "backend-seeded-v2";

const ASSESSMENT_BLUEPRINTS: {
  assessmentType: AssessmentType;
  id: string;
  title: string;
  subtitle: string;
  color: string;
}[] = [
  {
    assessmentType: "APTITUDE",
    id: "aptitude",
    title: "Aptitude",
    subtitle: "How you solve problems and work with numbers",
    color: "#2457FF",
  },
  {
    assessmentType: "INTELLIGENCE",
    id: "intelligence",
    title: "Intelligence",
    subtitle: "How you reason through patterns and logic",
    color: "#00A676",
  },
  {
    assessmentType: "PERSONALITY",
    id: "personality",
    title: "Personality",
    subtitle: "How you collaborate, plan, and adapt",
    color: "#F97316",
  },
];

const getQuestionTags = (
  assessmentType: AssessmentType,
  questionText: string,
  optionText: string,
  optionIndex: number,
  correctOptionIndex?: number | null,
) => {
  const haystack = `${questionText} ${optionText}`.toLowerCase();
  const tags = new Set<string>();

  if (assessmentType === "APTITUDE") {
    tags.add("analytical");
    tags.add("problem-solving");
    if (
      typeof correctOptionIndex === "number" &&
      optionIndex === correctOptionIndex
    ) {
      tags.add("precision");
      tags.add("structured");
    }
    if (/(speed|ratio|series|discount|task|average|number)/.test(haystack)) {
      tags.add("analytical");
    }
  } else if (assessmentType === "INTELLIGENCE") {
    tags.add("analytical");
    tags.add("logic");
    tags.add("problem-solving");
    if (/(analogy|series|symmetry|letter|word|reason)/.test(haystack)) {
      tags.add("pattern-thinking");
    }
    if (
      typeof correctOptionIndex === "number" &&
      optionIndex === correctOptionIndex
    ) {
      tags.add("confidence");
    }
  } else {
    if (
      /(people|conversation|network|help|team|group|others|helping)/.test(
        haystack,
      )
    ) {
      tags.add("collaborative");
      tags.add("communication");
      tags.add("networking");
    }
    if (
      /(plan|planning|deadline|details|timeline|organized|before the deadline)/.test(
        haystack,
      )
    ) {
      tags.add("structured");
      tags.add("leadership");
    }
    if (
      /(pressure|problems|complex|adapt|change|suddenly|spontaneously|calm)/.test(
        haystack,
      )
    ) {
      tags.add("analytical");
      tags.add("adaptable");
    }
    if (!tags.size) {
      tags.add("growth");
    }
  }

  if (!tags.size) {
    tags.add("growth");
  }

  return Array.from(tags);
};

const buildAssessmentTests = (
  questionSets: Record<AssessmentType, AssessmentQuestionResponse[]>,
): MentorAssessmentTest[] => {
  return ASSESSMENT_BLUEPRINTS.map((blueprint) => {
    const questions = (questionSets[blueprint.assessmentType] || [])
      .slice()
      .sort((left, right) => left.displayOrder - right.displayOrder)
      .map((question) => ({
        id: `${blueprint.id}-${question.id}`,
        prompt: question.questionText,
        options: question.options.map((option, optionIndex) => ({
          id: `${question.id}-${optionIndex}`,
          label: option,
          tags: getQuestionTags(
            blueprint.assessmentType,
            question.questionText,
            option,
            optionIndex,
            question.correctOptionIndex,
          ),
        })),
      }));

    return {
      id: blueprint.id,
      title: blueprint.title,
      subtitle: blueprint.subtitle,
      color: blueprint.color,
      questions,
    };
  });
};

export default function MentorAssessmentScreen() {
  const router = useRouter();
  const { userId, profileComplete } = useAuth();
  const [loadingState, setLoadingState] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [savingState, setSavingState] = useState(false);
  const [generatingMatch, setGeneratingMatch] = useState(false);
  const [assessmentTests, setAssessmentTests] = useState<
    MentorAssessmentTest[]
  >([]);
  const [state, setState] = useState<MentorAssessmentState>({
    currentTestIndex: 0,
    currentQuestionIndex: 0,
    answers: {},
    completed: false,
    version: ASSESSMENT_VERSION,
  });
  const [recommendations, setRecommendations] = useState<
    MentorAssessmentRecommendation[]
  >([]);
  const [matchError, setMatchError] = useState<string | null>(null);

  useEffect(() => {
    const hydrate = async () => {
      if (!userId || !profileComplete) {
        setLoadingState(false);
        return;
      }

      try {
        const [aptitudeQuestions, intelligenceQuestions, personalityQuestions] =
          await Promise.all([
            assessmentService.getQuestionsByType("APTITUDE"),
            assessmentService.getQuestionsByType("INTELLIGENCE"),
            assessmentService.getQuestionsByType("PERSONALITY"),
          ]);

        const nextTests = buildAssessmentTests({
          APTITUDE: aptitudeQuestions,
          INTELLIGENCE: intelligenceQuestions,
          PERSONALITY: personalityQuestions,
        });

        setAssessmentTests(nextTests);

        const storedState = await loadMentorAssessmentState(userId);
        if (storedState?.version === ASSESSMENT_VERSION) {
          const nextState: MentorAssessmentState = {
            currentTestIndex: storedState.currentTestIndex ?? 0,
            currentQuestionIndex: storedState.currentQuestionIndex ?? 0,
            answers: storedState.answers ?? {},
            completed: storedState.completed ?? false,
            completedAt: storedState.completedAt,
            profileTags: storedState.profileTags ?? [],
            recommendations: storedState.recommendations ?? [],
            version: ASSESSMENT_VERSION,
          };
          setState(nextState);
          if (Array.isArray(storedState.recommendations)) {
            setRecommendations(storedState.recommendations);
          }
        } else if (storedState) {
          await clearMentorAssessmentState(userId);
        }
        setLoadingError(null);
      } catch (error: any) {
        console.error("Failed to load assessment questions:", error);
        setLoadingError(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to load assessment questions from the server.",
        );
      } finally {
        setLoadingState(false);
      }
    };

    hydrate();
  }, [userId, profileComplete]);

  useEffect(() => {
    if (!userId || loadingState || !profileComplete) {
      return;
    }

    const persist = async () => {
      setSavingState(true);
      try {
        await saveMentorAssessmentState(userId, state);
      } finally {
        setSavingState(false);
      }
    };

    persist();
  }, [state, userId, loadingState, profileComplete]);

  const currentTest = useMemo(
    () => assessmentTests[state.currentTestIndex] || null,
    [assessmentTests, state.currentTestIndex],
  );

  const currentQuestion = currentTest?.questions[state.currentQuestionIndex];
  const totalQuestions = useMemo(
    () => assessmentTests.reduce((sum, test) => sum + test.questions.length, 0),
    [assessmentTests],
  );
  const answeredCount = getCompletedQuestionCount(state);
  const remainingQuestions = Math.max(totalQuestions - answeredCount, 0);
  const progressPercent = Math.min(
    (answeredCount / Math.max(totalQuestions, 1)) * 100,
    100,
  );
  const profileTags = state.profileTags?.length
    ? state.profileTags
    : buildProfileTags(state);

  const runMatch = async (
    overrideAnswers?: Record<string, MentorAssessmentAnswer>,
  ) => {
    if (!userId) {
      setMatchError("Please sign in again before running the mentor match.");
      return [];
    }

    if (!profileComplete) {
      setMatchError(
        "Please complete your student profile before requesting mentor matches.",
      );
      return [];
    }

    const answers = overrideAnswers || state.answers;
    const nextState: MentorAssessmentState = {
      ...state,
      answers,
      profileTags: buildProfileTags({ ...state, answers }),
      version: ASSESSMENT_VERSION,
    };
    const tags = nextState.profileTags || [];

    setGeneratingMatch(true);
    setMatchError(null);

    try {
      const response = await mentorshipService.getRecommendedMentors(
        Number(userId),
      );
      const normalized = normalizeMentorRecommendations(response, tags);
      const completedState: MentorAssessmentState = {
        ...nextState,
        completed: true,
        completedAt: new Date().toISOString(),
        profileTags: tags,
        recommendations: normalized,
        version: ASSESSMENT_VERSION,
      };

      setState(completedState);
      setRecommendations(normalized);
      await saveMentorAssessmentState(userId, completedState);
      return normalized;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to generate mentor matches.";
      setMatchError(message);
      return [];
    } finally {
      setGeneratingMatch(false);
    }
  };

  const handleAnswer = async (optionId: string) => {
    if (!currentQuestion || !userId || !profileComplete) {
      return;
    }

    const selectedOption = currentQuestion.options.find(
      (option) => option.id === optionId,
    );
    if (!selectedOption) {
      return;
    }

    const updatedAnswers = {
      ...state.answers,
      [currentQuestion.id]: {
        questionId: currentQuestion.id,
        optionId: selectedOption.id,
        optionLabel: selectedOption.label,
        tags: selectedOption.tags,
      },
    };

    const nextQuestionIndex = state.currentQuestionIndex + 1;
    const isLastQuestionInTest =
      nextQuestionIndex >= currentTest.questions.length;
    const isLastTest = state.currentTestIndex >= assessmentTests.length - 1;

    if (isLastQuestionInTest && isLastTest) {
      const finalState: MentorAssessmentState = {
        ...state,
        answers: updatedAnswers,
        completed: true,
        profileTags: buildProfileTags({ ...state, answers: updatedAnswers }),
        version: ASSESSMENT_VERSION,
      };

      setState(finalState);
      await saveMentorAssessmentState(userId, finalState);
      await runMatch(updatedAnswers);
      return;
    }

    const nextState: MentorAssessmentState = isLastQuestionInTest
      ? {
          ...state,
          answers: updatedAnswers,
          currentTestIndex: state.currentTestIndex + 1,
          currentQuestionIndex: 0,
          profileTags: buildProfileTags({ ...state, answers: updatedAnswers }),
          version: ASSESSMENT_VERSION,
        }
      : {
          ...state,
          answers: updatedAnswers,
          currentQuestionIndex: nextQuestionIndex,
          profileTags: buildProfileTags({ ...state, answers: updatedAnswers }),
          version: ASSESSMENT_VERSION,
        };

    setState(nextState);
  };

  const handleRetake = async () => {
    if (!userId || !profileComplete) {
      return;
    }

    Alert.alert(
      "Retake assessment?",
      "This will clear your saved answers and mentor matches.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Retake",
          style: "destructive",
          onPress: async () => {
            await clearMentorAssessmentState(userId);
            const resetState: MentorAssessmentState = {
              currentTestIndex: 0,
              currentQuestionIndex: 0,
              answers: {},
              completed: false,
              version: ASSESSMENT_VERSION,
            };
            setRecommendations([]);
            setMatchError(null);
            setState(resetState);
            await saveMentorAssessmentState(userId, resetState);
          },
        },
      ],
    );
  };

  if (!profileComplete) {
    return (
      <View style={styles.centeredState}>
        <Sparkles size={42} color={colors.primary} strokeWidth={1.6} />
        <Text style={styles.centeredTitle}>Complete your profile first</Text>
        <Text style={styles.centeredText}>
          Add your student details to unlock mentor assessment tests and AI
          mentor matching.
        </Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push("/(student)/profile" as any)}
        >
          <Text style={styles.primaryButtonText}>Complete profile</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loadingState) {
    return (
      <View style={styles.centeredState}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.centeredTitle}>Loading your assessment</Text>
        {loadingError ? (
          <Text style={styles.centeredText}>{loadingError}</Text>
        ) : null}
      </View>
    );
  }

  if (!assessmentTests.length) {
    return (
      <View style={styles.centeredState}>
        <Sparkles size={42} color={colors.primary} strokeWidth={1.6} />
        <Text style={styles.centeredTitle}>No assessment questions found</Text>
        <Text style={styles.centeredText}>
          The backend did not return any seeded assessment questions.
        </Text>
        {loadingError ? (
          <Text style={styles.centeredText}>{loadingError}</Text>
        ) : null}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push("/(student)/mentor-assessment" as any)}
        >
          <Text style={styles.primaryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!currentTest || !currentQuestion) {
    return (
      <View style={styles.centeredState}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.centeredTitle}>Preparing your assessment</Text>
        <Text style={styles.centeredText}>
          Loading the current test state from the backend questions.
        </Text>
      </View>
    );
  }

  if (state.completed) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.iconButton}
          >
            <ArrowLeft size={18} color={colors.textDark} strokeWidth={2.5} />
          </TouchableOpacity>
          <View style={styles.headerCopy}>
            <Text style={styles.headerTitle}>Mentor match complete</Text>
            <Text style={styles.headerSubtitle}>
              Your AI recommendations are ready.
            </Text>
          </View>
          <TouchableOpacity onPress={handleRetake} style={styles.iconButton}>
            <RotateCcw size={18} color={colors.textDark} strokeWidth={2.2} />
          </TouchableOpacity>
        </View>

        <View style={styles.centeredState}>
          <Sparkles size={42} color={colors.primary} strokeWidth={1.6} />
          <Text style={styles.centeredTitle}>Assessment completed</Text>
          <Text style={styles.centeredText}>
            Your mentor matching assessment is complete. Open Find a Mentor to
            view your profile highlights and top suggestions.
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push("/(student)/mentors" as any)}
          >
            <Text style={styles.primaryButtonText}>Find a Mentor</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.iconButton}
        >
          <ArrowLeft size={18} color={colors.textDark} strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>{currentTest.title} test</Text>
          <Text style={styles.headerSubtitle}>
            {state.currentTestIndex + 1} of {assessmentTests.length} ·{" "}
            {currentTest?.subtitle}
          </Text>
        </View>
        <TouchableOpacity onPress={handleRetake} style={styles.iconButton}>
          <RotateCcw size={18} color={colors.textDark} strokeWidth={2.2} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.stepperCard}>
          <View style={styles.stepperRow}>
            {assessmentTests.map((test, index) => {
              const isActive = index === state.currentTestIndex;
              const isDone = index < state.currentTestIndex;

              return (
                <View key={test.id} style={styles.stepperItem}>
                  <View
                    style={[
                      styles.stepperDot,
                      isActive && styles.stepperDotActive,
                      isDone && styles.stepperDotDone,
                    ]}
                  >
                    {isDone ? (
                      <CheckCircle2
                        size={14}
                        color={colors.white}
                        strokeWidth={2.4}
                      />
                    ) : (
                      <Text
                        style={[
                          styles.stepperDotLabel,
                          isActive && styles.stepperDotLabelActive,
                        ]}
                      >
                        {index + 1}
                      </Text>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.stepperLabel,
                      isActive && styles.stepperLabelActive,
                    ]}
                  >
                    {test.title}
                  </Text>
                </View>
              );
            })}
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[styles.progressFill, { width: `${progressPercent}%` }]}
            />
          </View>
          <Text style={styles.progressCopy}>
            Test {state.currentTestIndex + 1} of {assessmentTests.length} ·{" "}
            {currentTest?.title} · {remainingQuestions} questions remaining
          </Text>
        </View>

        <View style={styles.questionCard}>
          <Text style={styles.questionNumber}>
            Question {state.currentQuestionIndex + 1} of{" "}
            {currentTest.questions.length}
          </Text>
          <Text style={styles.questionText}>{currentQuestion.prompt}</Text>

          <View style={styles.optionList}>
            {currentQuestion.options.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.optionCard}
                onPress={() => handleAnswer(option.id)}
                activeOpacity={0.78}
              >
                <View style={styles.optionDot} />
                <Text style={styles.optionText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Text style={styles.helperText}>
          Your progress is saved automatically, so you can close the app and
          return later.
        </Text>

        {savingState ? (
          <View style={styles.savingRow}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.savingText}>Saving progress...</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.LG,
    paddingTop: Spacing.MD,
    paddingBottom: Spacing.MD,
    gap: Spacing.SM,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
  },
  headerCopy: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.LG,
    color: colors.textDark,
    fontWeight: "600",
    textAlign: "center",
  },
  headerSubtitle: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.XS,
    color: colors.textLight,
    textAlign: "center",
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: Spacing.LG,
    paddingBottom: Spacing.XXXL,
    gap: Spacing.LG,
  },
  stepperCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: Spacing.MD,
    gap: Spacing.MD,
  },
  stepperRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.SM,
  },
  stepperItem: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  stepperDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },
  stepperDotActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  stepperDotDone: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  stepperDotLabel: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.XS,
    color: colors.textLight,
  },
  stepperDotLabelActive: {
    color: colors.white,
  },
  stepperLabel: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.XS,
    color: colors.textLight,
    textAlign: "center",
  },
  stepperLabelActive: {
    color: colors.textDark,
    fontFamily: "Poppins-SemiBold",
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: "#E9EDF5",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  progressCopy: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.XS,
    color: colors.textLight,
  },
  questionCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: Spacing.LG,
    gap: Spacing.MD,
  },
  questionNumber: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.XS,
    color: colors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  questionText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.XL,
    color: colors.textDark,
    fontWeight: "600",
    lineHeight: 30,
  },
  optionList: {
    gap: Spacing.SM,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.SM,
    padding: Spacing.MD,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  optionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  optionText: {
    flex: 1,
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.Base,
    color: colors.textDark,
    lineHeight: 22,
  },
  helperText: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.XS,
    color: colors.textLight,
    textAlign: "center",
    paddingHorizontal: Spacing.MD,
  },
  savingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.SM,
  },
  savingText: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.XS,
    color: colors.textLight,
  },
  centeredState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.LG,
    gap: Spacing.MD,
    backgroundColor: colors.background,
  },
  centeredTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.XL,
    color: colors.textDark,
    textAlign: "center",
  },
  centeredText: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.Base,
    color: colors.textLight,
    textAlign: "center",
    lineHeight: 22,
  },
  primaryButton: {
    minWidth: 160,
    paddingHorizontal: Spacing.LG,
    paddingVertical: Spacing.SM,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: "center",
  },
  primaryButtonText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.SM,
    color: colors.white,
  },
  resultsHero: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: Spacing.LG,
    flexDirection: "row",
    gap: Spacing.MD,
    alignItems: "flex-start",
  },
  resultsHeroCopy: {
    flex: 1,
    gap: 4,
  },
  resultsHeroTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.LG,
    color: colors.white,
  },
  resultsHeroText: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.SM,
    color: "rgba(255,255,255,0.9)",
    lineHeight: 20,
  },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: Spacing.LG,
    gap: Spacing.SM,
  },
  summaryTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.SM,
    color: colors.textDark,
  },
  summaryText: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.Base,
    color: colors.textDark,
    lineHeight: 22,
  },
  summaryMeta: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.XS,
    color: colors.textLight,
  },
  matchingCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: Spacing.MD,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.SM,
  },
  matchingText: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.SM,
    color: colors.textLight,
  },
  errorCard: {
    backgroundColor: "#FFF1F1",
    borderRadius: 18,
    padding: Spacing.MD,
  },
  errorText: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.SM,
    color: colors.danger,
    lineHeight: 20,
  },
  recommendationCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: Spacing.MD,
    flexDirection: "row",
    gap: Spacing.MD,
    alignItems: "flex-start",
  },
  recommendationRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  recommendationRankText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.SM,
    color: colors.white,
  },
  recommendationBody: {
    flex: 1,
    gap: 8,
  },
  recommendationTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: Spacing.SM,
  },
  recommendationTextBlock: {
    flex: 1,
    gap: 4,
  },
  recommendationName: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.SM,
    color: colors.textDark,
  },
  recommendationRole: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.XS,
    color: colors.textLight,
  },
  recommendationCompany: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.XS,
    color: colors.primary,
  },
  recommendationReason: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.XS,
    color: colors.textLight,
    lineHeight: 18,
  },
  matchBadge: {
    paddingHorizontal: Spacing.SM,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.secondary,
  },
  matchBadgeText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.XS,
    color: colors.white,
  },
  secondaryButton: {
    paddingVertical: Spacing.SM,
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  secondaryButtonText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.SM,
    color: colors.textDark,
  },
});
