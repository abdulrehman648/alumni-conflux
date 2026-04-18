import { useRouter } from "expo-router";
import {
  BarChart3,
  Calendar,
  FileText,
  Heart,
  Settings,
  Shield,
  Users,
  Users2,
} from "lucide-react-native";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { FontSizes, Spacing } from "../../constants/theme";
import DashboardHeader from "../../src/components/DashboardHeader";
import DashboardStatCard from "../../src/components/DashboardStatCard";
import QuickActionCard from "../../src/components/QuickActionCard";
import { useAuth } from "../../src/context/AuthContext";
import colors from "../../src/theme/colors";

export default function AdminHome() {
  const router = useRouter();
  const { fullName } = useAuth();

  const stats = [
    {
      icon: Users,
      number: "50",
      label: "Total Users",
    },
    {
      icon: Users2,
      number: "20",
      label: "Mentors",
    },
    {
      icon: Calendar,
      number: "10",
      label: "Events",
    },
  ];

  const quickActions = [
    {
      title: "Manage Users",
      description: "View and manage all users",
      icon: Users,
      route: "/(admin)/users",
    },
    {
      title: "Manage Mentors",
      description: "Approve and manage mentor accounts",
      icon: Users2,
      route: "/(admin)/mentors",
    },
    {
      title: "Manage Events",
      description: "Create and manage events",
      icon: Calendar,
      route: "/(admin)/events",
    },
    {
      title: "Donations",
      description: "View and manage donation campaigns",
      icon: Heart,
      route: "/(admin)/donations",
    },
    {
      title: "View Analytics",
      description: "Track system analytics and insights",
      icon: BarChart3,
    },
  ];

  return (
    <View style={styles.container}>
      <DashboardHeader
        fullName={fullName}
        roleLabel="Admin"
        fallbackName="Admin"
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <DashboardStatCard
              key={index}
              icon={stat.icon}
              number={stat.number}
              label={stat.label}
              variant="grid"
            />
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Management</Text>
        </View>

        <View style={styles.actionsContainer}>
          {quickActions.map((action, index) => (
            <QuickActionCard
              key={index}
              title={action.title}
              description={action.description}
              icon={action.icon}
              onPress={() => {
                if (!action.route) {
                  return;
                }
                router.push(action.route as any);
              }}
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

  statsGrid: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: Spacing.XL,
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
    marginBottom: Spacing.MD,
    gap: Spacing.MD,
  },
});
