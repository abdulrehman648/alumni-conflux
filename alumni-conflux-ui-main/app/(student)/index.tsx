import { useRouter } from "expo-router";
import {
  Award,
  BookOpen,
  Briefcase,
  Calendar,
  ChevronRight,
  MessageSquare,
  User,
  Users,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { FontSizes, Spacing } from "../../constants/theme";
import { useAuth } from "../../src/context/AuthContext";
import {
  eventsService,
  jobsService,
  mentorshipService,
} from "../../src/services/api";
import colors from "../../src/theme/colors";

export default function StudentHome() {
  const router = useRouter();
  const { fullName, userId } = useAuth();
  const [eventCount, setEventCount] = useState<string>("-");
  const [mentorCount, setMentorCount] = useState<string>("-");
  const [jobCount, setJobCount] = useState<string>("-");
  const [statsLoadFailed, setStatsLoadFailed] = useState(false);

  useEffect(() => {
    if (userId) {
      loadStats();
    }
  }, [userId]);

  const loadStats = async () => {
    try {
      setStatsLoadFailed(false);
      setEventCount("-");
      setJobCount("-");
      setMentorCount("-");

      const [events, jobs, mentors] = await Promise.all([
        eventsService.getAll(Number(userId)),
        jobsService.getAll(),
        mentorshipService.getAvailableMentors(),
      ]);
      setEventCount(events.length ? events.length.toString() : "0");
      setJobCount(jobs.length ? jobs.length.toString() : "0");
      setMentorCount(mentors.length ? mentors.length.toString() : "0");
    } catch (error) {
      console.error("Failed to load dashboard stats:", error);
      setStatsLoadFailed(true);
    }
  };

  const stats = [
    {
      icon: Users,
      number: mentorCount,
      label: "Mentors",
    },
    {
      icon: Briefcase,
      number: jobCount,
      label: "Jobs",
    },
    {
      icon: Calendar,
      number: eventCount,
      label: "Events",
    },
  ];

  const quickActions = [
    {
      title: "Find a Mentor",
      description: "Take the matching tests to unlock mentor suggestions",
      icon: Users,
      route: "/(student)/mentors",
    },
    {
      title: "Explore Jobs",
      description: "Discover job and internship",
      icon: Briefcase,
      route: "/(student)/jobs",
    },
    {
      title: "Upcoming Events",
      description: "Explore and register for events",
      icon: Calendar,
      route: "/(student)/events",
    },
    {
      title: "My Sessions",
      description: "Track your mentoring sessions",
      icon: MessageSquare,
      route: "/(student)/my-sessions",
    },
    {
      title: "Career Guidance",
      description: "Get AI-powered career insights",
      icon: Award,
      route: "/(student)/ai-career",
    },
    {
      title: "My Bookings",
      description: "View and manage your bookings",
      icon: BookOpen,
      route: "/(student)/bookings",
    },
    {
      title: "Edit Profile",
      description: "View and update your profile info",
      icon: User,
      route: "/(student)/profile",
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.headerProfileRow}>
          <View style={styles.headerProfileIconWrap}>
            <User size={20} color={colors.textDark} strokeWidth={2.2} />
          </View>
          <Text style={styles.headerTitle}>{fullName}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeContent}></View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <View key={index} style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <Icon size={24} color={colors.primary} strokeWidth={1.5} />
                </View>
                <Text style={styles.statNumber}>{stat.number}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            );
          })}
        </View>
        {statsLoadFailed && (
          <Text style={styles.statsErrorText}>
            Unable to load dashboard stats right now.
          </Text>
        )}

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>

        <View style={styles.actionsContainer}>
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <TouchableOpacity
                key={index}
                style={styles.actionCard}
                onPress={() => router.push(action.route as any)}
                activeOpacity={0.7}
              >
                <View style={styles.actionLeft}>
                  <View style={styles.actionIconContainer}>
                    <Icon size={20} color={colors.white} strokeWidth={1.5} />
                  </View>
                  <View style={styles.actionTextContainer}>
                    <Text style={styles.actionTitle}>{action.title}</Text>
                    <Text style={styles.actionText}>{action.description}</Text>
                  </View>
                </View>
                <ChevronRight
                  size={20}
                  color={colors.textLight}
                  strokeWidth={1.5}
                />
              </TouchableOpacity>
            );
          })}
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

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: Spacing.LG,
    paddingBottom: Spacing.XXXL,
  },

  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.LG,
    paddingTop: Spacing.MD,
    paddingBottom: Spacing.MD,
    backgroundColor: colors.background,
  },

  headerProfileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.SM,
  },

  headerProfileIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    flex: 1,
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.XL,
    fontWeight: "600",
    color: colors.textDark,
    textAlign: "left",
  },

  welcomeSection: {
    marginBottom: Spacing.XXL,
  },

  welcomeContent: {
    gap: Spacing.SM,
  },

  welcomeText: {
    fontFamily: "Poppins-Medium",
    fontSize: FontSizes.Base,
    fontWeight: "500",
    color: colors.textLight,
  },

  name: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.XL,
    fontWeight: "600",
    color: colors.primary,
  },

  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.XL,
    gap: Spacing.MD,
  },

  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    padding: Spacing.MD,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
  },

  statIconContainer: {
    marginBottom: Spacing.SM,
  },

  statNumber: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.LG,
    fontWeight: "600",
    color: colors.primary,
  },

  statLabel: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.XS,
    fontWeight: "400",
    color: colors.textLight,
    marginTop: Spacing.XS,
  },

  statsErrorText: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.XS,
    fontWeight: "400",
    color: colors.danger,
    marginTop: -Spacing.XL,
    marginBottom: Spacing.XXL,
    textAlign: "center",
  },

  sectionHeader: {
    marginBottom: Spacing.MD,
  },

  sectionTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.LG,
    fontWeight: "600",
    color: colors.textDark,
  },

  actionsContainer: {
    marginBottom: Spacing.XXXL,
    gap: Spacing.MD,
  },

  actionCard: {
    backgroundColor: colors.card,
    padding: Spacing.MD,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  actionLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.MD,
  },

  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  actionTextContainer: {
    flex: 1,
  },

  actionTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.SM,
    fontWeight: "600",
    color: colors.textDark,
  },

  actionText: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.XS,
    fontWeight: "400",
    color: colors.textLight,
  },
});
