import AsyncStorage from "@react-native-async-storage/async-storage";

export type MentorAssessmentOption = {
  id: string;
  label: string;
  tags: string[];
};

export type MentorAssessmentQuestion = {
  id: string;
  prompt: string;
  options: MentorAssessmentOption[];
};

export type MentorAssessmentTest = {
  id: string;
  title: string;
  subtitle: string;
  color: string;
  questions: MentorAssessmentQuestion[];
};

export type MentorAssessmentAnswer = {
  questionId: string;
  optionId: string;
  optionLabel: string;
  tags: string[];
};

export type MentorAssessmentRecommendation = {
  id?: string | number;
  alumniId?: string | number;
  name?: string;
  fullName?: string;
  industry?: string;
  designation?: string;
  currentCompany?: string;
  company?: string;
  matchScore?: number;
  matchReasons?: string[];
  rating?: number;
  students?: number;
  totalStudents?: number;
};

export type MentorAssessmentState = {
  currentTestIndex: number;
  currentQuestionIndex: number;
  answers: Record<string, MentorAssessmentAnswer>;
  completed: boolean;
  version?: string;
  completedAt?: string;
  profileTags?: string[];
  recommendations?: MentorAssessmentRecommendation[];
};

export const MENTOR_ASSESSMENT_TESTS: MentorAssessmentTest[] = [
  {
    id: "personality",
    title: "Personality",
    subtitle: "How you think, work, and collaborate",
    color: "#2457FF",
    questions: [
      {
        id: "personality-1",
        prompt: "When starting a project, you usually...",
        options: [
          {
            id: "structured",
            label: "Map the plan and keep everyone aligned",
            tags: ["structured", "leadership", "collaborative"],
          },
          {
            id: "analytical",
            label: "Dig into the data first",
            tags: ["analytical", "fintech", "data"],
          },
          {
            id: "creative",
            label: "Sketch ideas and test different angles",
            tags: ["creative", "product", "startup"],
          },
          {
            id: "supportive",
            label: "Check in with the group and keep momentum high",
            tags: ["collaborative", "networking", "communication"],
          },
        ],
      },
      {
        id: "personality-2",
        prompt: "Feedback feels most useful when it...",
        options: [
          {
            id: "actionable",
            label: "Includes clear next steps",
            tags: ["structured", "career-growth"],
          },
          {
            id: "evidence",
            label: "Highlights patterns and evidence",
            tags: ["analytical", "data"],
          },
          {
            id: "experimental",
            label: "Encourages experimentation",
            tags: ["creative", "startup"],
          },
          {
            id: "growth",
            label: "Focuses on team growth",
            tags: ["collaborative", "leadership"],
          },
        ],
      },
      {
        id: "personality-3",
        prompt: "In a group setting, you are most likely to...",
        options: [
          {
            id: "organize",
            label: "Own the timeline",
            tags: ["structured", "leadership"],
          },
          {
            id: "spot-risks",
            label: "Spot risks and edge cases",
            tags: ["analytical", "problem-solving"],
          },
          {
            id: "ideas",
            label: "Propose a fresh angle",
            tags: ["creative", "product"],
          },
          {
            id: "morale",
            label: "Keep the group connected and moving",
            tags: ["collaborative", "communication"],
          },
        ],
      },
      {
        id: "personality-4",
        prompt: "Your ideal learning style is...",
        options: [
          {
            id: "step-by-step",
            label: "Step-by-step guidance",
            tags: ["structured", "career-growth"],
          },
          {
            id: "case-study",
            label: "Case studies and numbers",
            tags: ["analytical", "fintech", "data"],
          },
          {
            id: "hands-on",
            label: "Hands-on experimentation",
            tags: ["creative", "startup", "product"],
          },
          {
            id: "discussion",
            label: "Discussion and reflection",
            tags: ["collaborative", "communication"],
          },
        ],
      },
      {
        id: "personality-5",
        prompt: "Under pressure, you tend to...",
        options: [
          {
            id: "checklist",
            label: "Create a checklist and reset priorities",
            tags: ["structured", "leadership"],
          },
          {
            id: "facts",
            label: "Revisit the facts and confirm the signal",
            tags: ["analytical", "data"],
          },
          {
            id: "adapt",
            label: "Try a few alternatives quickly",
            tags: ["creative", "startup"],
          },
          {
            id: "coordinate",
            label: "Coordinate with others and keep everyone calm",
            tags: ["collaborative", "communication"],
          },
        ],
      },
    ],
  },
  {
    id: "interests",
    title: "Interests",
    subtitle: "The topics, industries, and experiences that pull you in",
    color: "#00A676",
    questions: [
      {
        id: "interests-1",
        prompt: "Which path sounds most exciting right now?",
        options: [
          {
            id: "fintech",
            label: "Fintech and digital finance",
            tags: ["fintech", "data"],
          },
          {
            id: "startup",
            label: "Startup building and rapid learning",
            tags: ["startup", "product"],
          },
          {
            id: "research",
            label: "Research, systems, and deep problem-solving",
            tags: ["research", "analytical"],
          },
          {
            id: "impact",
            label: "Mission-driven work with social impact",
            tags: ["impact", "collaborative"],
          },
        ],
      },
      {
        id: "interests-2",
        prompt: "Which work topics do you follow most?",
        options: [
          {
            id: "product",
            label: "Product design and user experience",
            tags: ["product", "creative"],
          },
          {
            id: "analytics",
            label: "Analytics and decision making",
            tags: ["analytical", "data"],
          },
          {
            id: "networking",
            label: "Networking, careers, and alumni stories",
            tags: ["networking", "communication"],
          },
          {
            id: "leadership",
            label: "Leadership, teams, and strategy",
            tags: ["leadership", "structured"],
          },
        ],
      },
      {
        id: "interests-3",
        prompt: "Which skill would you most like to grow?",
        options: [
          {
            id: "strategy",
            label: "Career strategy and planning",
            tags: ["structured", "career-growth"],
          },
          {
            id: "analysis",
            label: "Data analysis and reasoning",
            tags: ["analytical", "data"],
          },
          {
            id: "communication",
            label: "Communication and relationship building",
            tags: ["collaborative", "communication"],
          },
          {
            id: "ideas",
            label: "Idea generation and experimentation",
            tags: ["creative", "startup"],
          },
        ],
      },
      {
        id: "interests-4",
        prompt: "Which environment energizes you most?",
        options: [
          {
            id: "fast-paced",
            label: "Fast-paced startup teams",
            tags: ["startup", "product"],
          },
          {
            id: "research-lab",
            label: "Research or analytical teams",
            tags: ["research", "analytical"],
          },
          {
            id: "creative-team",
            label: "Creative teams that build and iterate",
            tags: ["creative", "startup"],
          },
          {
            id: "mission",
            label: "Mission-driven teams with a clear purpose",
            tags: ["impact", "collaborative"],
          },
        ],
      },
      {
        id: "interests-5",
        prompt: "Which alumni story would you most want to hear?",
        options: [
          {
            id: "fintech-story",
            label: "Someone who broke into fintech",
            tags: ["fintech", "networking"],
          },
          {
            id: "startup-story",
            label: "Someone who launched a startup role",
            tags: ["startup", "product"],
          },
          {
            id: "research-story",
            label: "Someone who built a research career",
            tags: ["research", "analytical"],
          },
          {
            id: "impact-story",
            label: "Someone who turned interests into impact",
            tags: ["impact", "leadership"],
          },
        ],
      },
    ],
  },
  {
    id: "goals",
    title: "Goals",
    subtitle: "What you want from mentoring and what success looks like",
    color: "#F97316",
    questions: [
      {
        id: "goals-1",
        prompt: "What do you want most from a mentor?",
        options: [
          {
            id: "industry-insight",
            label: "Practical industry insight",
            tags: ["career-growth", "industry-insight"],
          },
          {
            id: "accountability",
            label: "Accountability and structure",
            tags: ["structured", "leadership"],
          },
          {
            id: "network",
            label: "Connections and networking guidance",
            tags: ["networking", "communication"],
          },
          {
            id: "confidence",
            label: "Confidence and encouragement",
            tags: ["collaborative", "career-growth"],
          },
        ],
      },
      {
        id: "goals-2",
        prompt: "What outcome would make mentoring feel worthwhile?",
        options: [
          {
            id: "job",
            label: "A job or internship opportunity",
            tags: ["career-growth", "networking"],
          },
          {
            id: "skills",
            label: "Stronger project and portfolio skills",
            tags: ["structured", "product"],
          },
          {
            id: "clarity",
            label: "A clearer career direction",
            tags: ["structured", "career-growth"],
          },
          {
            id: "leadership",
            label: "Sharper leadership habits",
            tags: ["leadership", "collaborative"],
          },
        ],
      },
      {
        id: "goals-3",
        prompt: "Which feedback style helps you move fastest?",
        options: [
          {
            id: "direct",
            label: "Direct and focused feedback",
            tags: ["structured", "career-growth"],
          },
          {
            id: "data-backed",
            label: "Data-backed feedback",
            tags: ["analytical", "data"],
          },
          {
            id: "idea-rich",
            label: "Idea-rich brainstorming",
            tags: ["creative", "startup"],
          },
          {
            id: "supportive",
            label: "Supportive coaching and encouragement",
            tags: ["collaborative", "communication"],
          },
        ],
      },
      {
        id: "goals-4",
        prompt: "Your long-term goal leans toward...",
        options: [
          {
            id: "fintech-leader",
            label: "Fintech or digital finance",
            tags: ["fintech", "leadership"],
          },
          {
            id: "product-builder",
            label: "Product and innovation roles",
            tags: ["product", "startup"],
          },
          {
            id: "researcher",
            label: "Research and analytical work",
            tags: ["research", "analytical"],
          },
          {
            id: "impact-builder",
            label: "Community or impact-driven work",
            tags: ["impact", "collaborative"],
          },
        ],
      },
      {
        id: "goals-5",
        prompt: "A strong match should help you...",
        options: [
          {
            id: "open-doors",
            label: "Open doors into the right opportunities",
            tags: ["networking", "career-growth"],
          },
          {
            id: "validate",
            label: "Validate my strengths with clear feedback",
            tags: ["analytical", "structured"],
          },
          {
            id: "refine",
            label: "Refine ideas into something concrete",
            tags: ["creative", "product"],
          },
          {
            id: "motivate",
            label: "Stay motivated and consistent",
            tags: ["collaborative", "leadership"],
          },
        ],
      },
    ],
  },
];

export const getMentorAssessmentStorageKey = (userId: string) =>
  `mentor-assessment:${userId}`;

export const loadMentorAssessmentState = async (
  userId: string,
): Promise<MentorAssessmentState | null> => {
  const rawState = await AsyncStorage.getItem(
    getMentorAssessmentStorageKey(userId),
  );
  if (!rawState) {
    return null;
  }

  try {
    return JSON.parse(rawState) as MentorAssessmentState;
  } catch {
    return null;
  }
};

export const saveMentorAssessmentState = async (
  userId: string,
  state: MentorAssessmentState,
) => {
  await AsyncStorage.setItem(
    getMentorAssessmentStorageKey(userId),
    JSON.stringify(state),
  );
};

export const clearMentorAssessmentState = async (userId: string) => {
  await AsyncStorage.removeItem(getMentorAssessmentStorageKey(userId));
};

export const getCurrentTest = (testIndex: number) =>
  MENTOR_ASSESSMENT_TESTS[
    Math.min(Math.max(testIndex, 0), MENTOR_ASSESSMENT_TESTS.length - 1)
  ];

export const getTotalQuestionCount = () =>
  MENTOR_ASSESSMENT_TESTS.reduce(
    (total, test) => total + test.questions.length,
    0,
  );

export const getCompletedQuestionCount = (state: MentorAssessmentState) =>
  Object.keys(state.answers).length;

const titleCase = (value: string) =>
  value
    .replace(/[-_]/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export const buildProfileTags = (state: MentorAssessmentState) => {
  const counts = new Map<string, number>();

  Object.values(state.answers).forEach((answer) => {
    answer.tags.forEach((tag) => {
      counts.set(tag, (counts.get(tag) || 0) + 1);
    });
  });

  return Array.from(counts.entries())
    .sort((left, right) => right[1] - left[1])
    .map(([tag]) => tag);
};

const includesAny = (haystack: string, needles: string[]) =>
  needles.some((needle) => haystack.includes(needle));

const getMentorSearchCorpus = (mentor: MentorAssessmentRecommendation) => {
  return [
    mentor.name,
    mentor.fullName,
    mentor.industry,
    mentor.designation,
    mentor.currentCompany,
    mentor.company,
    Array.isArray(mentor.matchReasons) ? mentor.matchReasons.join(" ") : "",
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
};

export const buildMatchReasons = (
  mentor: MentorAssessmentRecommendation,
  profileTags: string[],
) => {
  const corpus = getMentorSearchCorpus(mentor);
  const reasons: string[] = [];

  const reasonMap: Record<string, string> = {
    fintech: "both interested in fintech",
    data: "strong analytical profile",
    analytical: "strong analytical profile",
    startup: "startup energy matches your pace",
    product: "product thinking lines up with your goals",
    leadership: "leadership growth is a shared focus",
    collaborative: "you both value collaborative work",
    networking: "network-building is part of your plan",
    impact: "mission-driven goals align well",
    research: "research-heavy interests overlap",
    creative: "creative problem-solving shows up on both sides",
  };

  profileTags.slice(0, 5).forEach((tag) => {
    if (
      corpus.includes(tag) ||
      includesAny(corpus, [titleCase(tag).toLowerCase()])
    ) {
      const reason = reasonMap[tag];
      if (reason && !reasons.includes(reason)) {
        reasons.push(reason);
      }
    }
  });

  if (mentor.matchReasons?.length) {
    mentor.matchReasons.forEach((reason) => {
      if (!reasons.includes(reason)) {
        reasons.push(reason);
      }
    });
  }

  if (!reasons.length) {
    reasons.push("aligned with your assessment profile");
  }

  return reasons.slice(0, 3);
};

export const normalizeMentorRecommendations = (
  recommendations: MentorAssessmentRecommendation[],
  profileTags: string[],
) => {
  return recommendations.slice(0, 3).map((mentor, index) => ({
    ...mentor,
    matchScore:
      typeof mentor.matchScore === "number"
        ? mentor.matchScore
        : Math.max(72, 90 - index * 4),
    matchReasons: buildMatchReasons(mentor, profileTags),
  }));
};

export const getMentorDisplayName = (mentor: MentorAssessmentRecommendation) =>
  mentor.name || mentor.fullName || "Mentor";

export const getMentorDisplayRole = (mentor: MentorAssessmentRecommendation) =>
  mentor.industry || mentor.designation || "Available mentor";
