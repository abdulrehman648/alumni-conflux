import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { FontSizes, Spacing } from "../../constants/theme";
import { useAuth } from "../../src/context/AuthContext";
import colors from "../../src/theme/colors";
import {
  MENTOR_ASSESSMENT_TESTS,
  buildProfileTags,
  clearMentorAssessmentState,
  getCompletedQuestionCount,
  loadMentorAssessmentState,
  saveMentorAssessmentState,
  type MentorAssessmentAnswer,
  type MentorAssessmentState,
} from "../../src/services/mentorMatch";

const ALUMNI_ASSESSMENT_VERSION = "alumni-readiness-v1";

const buildInitialState = (): MentorAssessmentState => ({
  currentTestIndex: 0,
  currentQuestionIndex: 0,
  answers: {},
  completed: false,
  version: ALUMNI_ASSESSMENT_VERSION,
});

export default function AlumniMentorAssessmentScreen() {
  const router = useRouter();
  const { userId } = useAuth();

  const [state, setState] = useState<MentorAssessmentState>(buildInitialState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const hydrate = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const stored = await loadMentorAssessmentState(userId);
        if (stored?.version === ALUMNI_ASSESSMENT_VERSION) {
          setState({
            currentTestIndex: stored.currentTestIndex ?? 0,
            currentQuestionIndex: stored.currentQuestionIndex ?? 0,
            answers: stored.answers ?? {},
            completed: stored.completed ?? false,
            completedAt: stored.completedAt,
            profileTags: stored.profileTags ?? [],
            version: ALUMNI_ASSESSMENT_VERSION,
          });
        } else if (stored) {
          await clearMentorAssessmentState(userId);
          setState(buildInitialState());
        }
      } catch (error) {
        console.error("Failed to load alumni mentor assessment:", error);
      } finally {
        setLoading(false);
      }
    };

    hydrate();
  }, [userId]);

  useEffect(() => {
    const persist = async () => {
      if (!userId || loading) {
        return;
      }
      setSaving(true);
      try {
        await saveMentorAssessmentState(userId, state);
      } finally {
        setSaving(false);
      }
    };

    persist();
  }, [state, userId, loading]);

  const totalQuestions = useMemo(
    () => MENTOR_ASSESSMENT_TESTS.reduce((sum, test) => sum + test.questions.length, 0),
    [],
  );

  const completedQuestions = useMemo(
    () => getCompletedQuestionCount(state),
    [state],
  );

  const currentTest = MENTOR_ASSESSMENT_TESTS[state.currentTestIndex];
  const currentQuestion = currentTest?.questions[state.currentQuestionIndex];

  const moveNext = (answer: MentorAssessmentAnswer) => {
    if (!currentQuestion) return;

    const nextAnswers = {
      ...state.answers,
      [currentQuestion.id]: answer,
    };

    const isLastQuestionInTest =
      state.currentQuestionIndex >= currentTest.questions.length - 1;
    const isLastTest = state.currentTestIndex >= MENTOR_ASSESSMENT_TESTS.length - 1;

    if (isLastQuestionInTest && isLastTest) {
      const completedState: MentorAssessmentState = {
        currentTestIndex: state.currentTestIndex,
        currentQuestionIndex: state.currentQuestionIndex,
        answers: nextAnswers,
        completed: true,
        completedAt: new Date().toISOString(),
        version: ALUMNI_ASSESSMENT_VERSION,
      };
      setState({
        ...completedState,
        profileTags: buildProfileTags(completedState),
      });
      return;
    }

    if (isLastQuestionInTest) {
      setState((prev) => ({
        ...prev,
        answers: nextAnswers,
        currentTestIndex: prev.currentTestIndex + 1,
        currentQuestionIndex: 0,
        version: ALUMNI_ASSESSMENT_VERSION,
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      answers: nextAnswers,
      currentQuestionIndex: prev.currentQuestionIndex + 1,
      version: ALUMNI_ASSESSMENT_VERSION,
    }));
  };

  const retake = () => {
    if (!userId) return;

    Alert.alert(
      "Retake assessment?",
      "This will clear your previous answers.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Retake",
          style: "destructive",
          onPress: async () => {
            await clearMentorAssessmentState(userId);
            setState(buildInitialState());
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.centeredTitle}>Loading assessment...</Text>
      </View>
    );
  }

  if (state.completed) {
    return (
      <View style={styles.screen}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Assessment complete</Text>
          <Text style={styles.summarySubtitle}>
            You are now eligible to enable mentorship availability.
          </Text>
          <Text style={styles.summaryMeta}>
            {completedQuestions}/{totalQuestions} questions answered
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.replace("/(alumni)/availability" as any)}
          >
            <Text style={styles.primaryButtonText}>Back to availability</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={retake}>
            <Text style={styles.secondaryButtonText}>Retake assessment</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!currentQuestion || !currentTest) {
    return (
      <View style={styles.centered}>
        <Text style={styles.centeredTitle}>Assessment is unavailable.</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.progressCard}>
        <Text style={styles.progressText}>
          Test {state.currentTestIndex + 1} of {MENTOR_ASSESSMENT_TESTS.length}
        </Text>
        <Text style={styles.progressText}>
          Question {completedQuestions + 1} of {totalQuestions}
        </Text>
        {saving && <Text style={styles.progressHint}>Saving progress...</Text>}
      </View>

      <View style={styles.questionCard}>
        <Text style={styles.testTitle}>{currentTest.title}</Text>
        <Text style={styles.testSubtitle}>{currentTest.subtitle}</Text>
        <Text style={styles.questionText}>{currentQuestion.prompt}</Text>

        <View style={styles.optionsWrap}>
          {currentQuestion.options.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.optionButton}
              onPress={() =>
                moveNext({
                  questionId: currentQuestion.id,
                  optionId: option.id,
                  optionLabel: option.label,
                  tags: option.tags,
                })
              }
            >
              <Text style={styles.optionText}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    padding: Spacing.LG,
    gap: Spacing.MD,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.MD,
    backgroundColor: colors.background,
    padding: Spacing.LG,
  },
  centeredTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.Base,
    color: colors.textDark,
    textAlign: "center",
  },
  progressCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: Spacing.MD,
    gap: Spacing.XS,
  },
  progressText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.SM,
    color: colors.textDark,
  },
  progressHint: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.XS,
    color: colors.textLight,
  },
  questionCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: Spacing.LG,
    gap: Spacing.MD,
  },
  testTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.LG,
    color: colors.textDark,
  },
  testSubtitle: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.SM,
    color: colors.textLight,
  },
  questionText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.Base,
    color: colors.textDark,
    marginTop: Spacing.SM,
  },
  optionsWrap: {
    gap: Spacing.SM,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: Spacing.MD,
    paddingHorizontal: Spacing.MD,
    backgroundColor: "#FFFFFF",
  },
  optionText: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.SM,
    color: colors.textDark,
  },
  summaryCard: {
    marginTop: Spacing.XXL,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: Spacing.LG,
    gap: Spacing.MD,
  },
  summaryTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.XL,
    color: colors.textDark,
  },
  summarySubtitle: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.SM,
    color: colors.textLight,
  },
  summaryMeta: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.SM,
    color: colors.primary,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: Spacing.MD,
    alignItems: "center",
  },
  primaryButtonText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.SM,
    color: colors.white,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: Spacing.MD,
    alignItems: "center",
  },
  secondaryButtonText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.SM,
    color: colors.textDark,
  },
});
