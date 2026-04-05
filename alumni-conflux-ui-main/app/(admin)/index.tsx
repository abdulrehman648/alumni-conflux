import { useRouter } from "expo-router";
import {
  BarChart3,
  Calendar,
  ChevronRight,
  FileText,
  Heart,
  Settings,
  Shield,
  Users,
  Users2,
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
    {
      icon: FileText,
      number: "5",
      label: "Reports",
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
      route: "/(admin)/profile",
    },
    {
      title: "System Settings",
      description: "Configure system settings",
      icon: Settings,
      route: "/(admin)/profile",
    },
    {
      title: "Admin Profile",
      description: "Manage your admin profile",
      icon: Shield,
      route: "/(admin)/profile",
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.statsGrid}>
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

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Management</Text>
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

  statsGrid: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: Spacing.XXXL,
    gap: Spacing.MD,
  },

  statCard: {
    width: "48%",
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
