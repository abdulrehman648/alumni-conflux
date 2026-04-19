import { useRouter } from "expo-router";
import {
  Bell,
  Briefcase,
  Calendar,
  Clock,
  Heart,
  Settings,
  Users,
} from "lucide-react-native";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { FontSizes, Spacing } from "../../constants/theme";
import DashboardHeader from "../../src/components/DashboardHeader";
import DashboardStatCard from "../../src/components/DashboardStatCard";
import QuickActionCard from "../../src/components/QuickActionCard";
import { useAuth } from "../../src/context/AuthContext";
import colors from "../../src/theme/colors";

export default function AlumniHome() {
  const router = useRouter();
  const { fullName } = useAuth();

  const stats = [
    {
      icon: Clock,
      number: "5",
      label: "Pending Requests",
    },
    {
      icon: Calendar,
      number: "3",
      label: "Upcoming Sessions",
    },
    {
      icon: Users,
      number: "12",
      label: "Students Helped",
    },
  ];

  const quickActions = [
    {
      title: "Manage Events",
      description: "Create and manage campus events",
      icon: Calendar,
      route: "/(alumni)/events",
    },
    {
      title: "Manage Jobs",
      description: "Post and manage job opportunities",
      icon: Briefcase,
      route: "/(alumni)/jobs",
    },
    {
      title: "View Requests",
      description: "Review mentoring requests from students",
      icon: Bell,
      route: "/(alumni)/requests",
    },
    {
      title: "My Sessions",
      description: "Manage your mentoring sessions",
      icon: Calendar,
      route: "/(alumni)/history",
    },
    {
      title: "Set Availability",
      description: "Update your availability",
      icon: Clock,
      route: "/(alumni)/availability",
    },
  ] as const;

  return (
    <View style={styles.container}>
      <DashboardHeader fullName={fullName} fallbackName="Alumni" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <DashboardStatCard
              key={index}
              icon={stat.icon}
              number={stat.number}
              label={stat.label}
            />
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
    paddingBottom: Spacing.XS,
  },

  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.XXL,
    gap: Spacing.MD,
  },

  sectionHeader: {
    marginBottom: Spacing.MD,
  },

  sectionTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.Base,
    fontWeight: "600",
    color: colors.primary,
  },

  actionsContainer: {
    marginBottom: Spacing.XXXL,
    gap: Spacing.MD,
  },
});
