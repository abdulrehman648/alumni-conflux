import { useRouter } from "expo-router";
import {
  BookOpen,
  Bot,
  Briefcase,
  Calendar,
  MessageSquare,
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
import DashboardHeader from "../../src/components/DashboardHeader";
import DashboardStatCard from "../../src/components/DashboardStatCard";
import QuickActionCard from "../../src/components/QuickActionCard";
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
      route: "/(student)/mentors",
    },
    {
      icon: Briefcase,
      number: jobCount,
      label: "Jobs",
      route: "/(student)/jobs",
    },
    {
      icon: Calendar,
      number: eventCount,
      label: "Events",
      route: "/(student)/events",
    },
  ];

  const quickActions = [
    {
      title: "Find a Mentor",
      description: "Take the matching tests to unlock mentor suggestions",
      icon: Users,
      route: "/(student)/mentors",
    },
    // {
    //   title: "Explore Jobs",
    //   description: "Discover job and internship",
    //   icon: Briefcase,
    //   route: "/(student)/jobs",
    // },

    {
      title: "My Sessions",
      description: "Track your mentoring sessions",
      icon: MessageSquare,
      route: "/(student)/my-sessions",
    },
    {
      title: "Career Guidance",
      description: "Get AI-powered career insights",
      icon: Bot,
      route: "/(student)/ai-career",
    },
    {
      title: "My Bookings",
      description: "View and manage your bookings",
      icon: BookOpen,
      route: "/(student)/bookings",
    },
  ];

  return (
    <View style={styles.container}>
      <DashboardHeader fullName={fullName} fallbackName="Student" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Section */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <TouchableOpacity
              key={index}
              style={styles.statPressable}
              onPress={() => router.push(stat.route as any)}
              activeOpacity={0.8}
            >
              <DashboardStatCard
                icon={stat.icon}
                number={stat.number}
                label={stat.label}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>

        <View style={styles.actionsContainer}>
          {quickActions.map((action, index) => (
            <QuickActionCard
              key={index}
              title={action.title}
              description={action.description}
              icon={action.icon}
              onPress={() => router.push(action.route as any)}
            />
          ))}
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
    paddingBottom: Spacing.LG,
  },

  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.XL,
    gap: Spacing.MD,
    paddingTop: Spacing.SM,
  },

  statPressable: {
    flex: 1,
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
    gap: Spacing.MD,
  },
});
