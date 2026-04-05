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
import { FontSizes, Spacing } from "../../constants/theme";
import { useList } from "../../src/hooks/useAsync";
import { mentorshipService } from "../../src/services/api";
import colors from "../../src/theme/colors";

export default function MentorsScreen() {
  const router = useRouter();

  // Fetch mentors using custom hook
  const {
    items: mentors,
    searchQuery,
    setSearchQuery,
    loading,
    error,
    refetch,
  } = useList(() => mentorshipService.getAvailableMentors(), "name");

  const renderRating = (rating: number) => {
    return (
      <View style={styles.ratingContainer}>
        <Star size={14} color="#FDB022" strokeWidth={2} fill="#FDB022" />
        <Text style={styles.ratingText}>{rating}</Text>
      </View>
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
          <ChevronLeft size={24} color={colors.primary} strokeWidth={2} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Find a Mentor</Text>
          <Text style={styles.headerSubtitle}>
            {mentors.length} mentors available
          </Text>
        </View>
      </View>

      {/* Search Bar */}
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

      {/* Mentors List */}
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
          {mentors.map((mentor) => (
            <TouchableOpacity
              key={mentor.id}
              style={styles.mentorCard}
              onPress={() => {
                // Navigate to mentor details
                router.push(`/(student)/mentor-details/${mentor.id}`);
              }}
              activeOpacity={0.7}
            >
              {/* Avatar */}
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarLetter}>{mentor.name.charAt(0)}</Text>
              </View>

              {/* Mentor Info */}
              <View style={styles.mentorInfo}>
                <View>
                  <Text style={styles.mentorName}>{mentor.name}</Text>
                  <Text style={styles.mentorRole}>{mentor.industry}</Text>
                  <View style={styles.skillsRow}>
                    <Code size={14} color={colors.primary} strokeWidth={1.5} />
                    <Text style={styles.skillsText}>
                      {mentor.currentCompany}
                    </Text>
                  </View>
                </View>

                {/* Rating */}
                <View style={styles.ratingSection}>
                  {renderRating(mentor.rating)}
                  <Text style={styles.studentCount}>
                    {mentor.students} students
                  </Text>
                </View>
              </View>

              {/* Action Arrow */}
              <ChevronRight
                size={20}
                color={colors.textLight}
                strokeWidth={1.5}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <MessageSquare size={48} color={colors.textLight} strokeWidth={1} />
          <Text style={styles.emptyStateText}>No mentors found</Text>
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
    alignItems: "flex-start",
    paddingHorizontal: Spacing.LG,
    paddingTop: Spacing.LG,
    paddingBottom: Spacing.XL,
    gap: Spacing.MD,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },

  headerContent: {
    flex: 1,
  },

  headerTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.LG,
    fontWeight: "600",
    color: colors.textDark,
  },

  headerSubtitle: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.SM,
    fontWeight: "400",
    color: colors.textLight,
    marginTop: Spacing.XS,
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

  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
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
