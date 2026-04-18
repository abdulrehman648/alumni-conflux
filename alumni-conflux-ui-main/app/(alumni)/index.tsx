import { useRouter } from "expo-router";
import {
  Bell,
  Briefcase,
  Calendar,
  ChevronRight,
  Clock,
  Heart,
  Settings,
  User,
  Users,
} from "lucide-react-native";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { FontSizes, Spacing } from "../../constants/theme";
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
    {
      title: "My Profile",
      description: "Edit your alumni profile",
      icon: Settings,
      route: "/(alumni)/profile",
    },
    {
      title: "Donations",
      description: "Contribute to campus fundings",
      icon: Heart,
      route: "/(alumni)/donations",
    },
  ] as const;

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeContent}>
            <Text style={styles.name}>{fullName || "Alumni"}</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/(alumni)/profile")}
            style={styles.profileIconButton}
          >
            <User size={24} color="#F4EAD8" strokeWidth={1.5} />
          </TouchableOpacity>
        </View>

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
                    <Icon size={20} color={colors.primary} strokeWidth={1.5} />
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
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: Spacing.LG,
    paddingTop: Spacing.LG,
  },

  welcomeSection: {
    marginBottom: Spacing.XXL,
    position: "relative",
  },

  welcomeContent: {
    gap: Spacing.SM,
  },

  profileIconButton: {
    position: "absolute",
    right: 0,
    top: 0,
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
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

  designation: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.SM,
    fontWeight: "400",
    color: colors.textLight,
  },

  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.XXXL,
    gap: Spacing.MD,
  },

  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    padding: Spacing.MD,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
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
    textAlign: "center",
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

  actionCard: {
    backgroundColor: colors.card,
    padding: Spacing.MD,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.border,
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
    borderRadius: 12,
    backgroundColor: colors.background,
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
    marginTop: Spacing.XS,
  },
});
