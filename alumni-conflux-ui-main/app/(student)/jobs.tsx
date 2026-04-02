import { useRouter } from "expo-router";
import {
    Briefcase,
    Building2,
    CheckCircle,
    ChevronLeft,
    MapPin,
    Search,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Toast from "react-native-toast-message";
import { FontSizes, Spacing } from "../../constants/theme";
import colors from "../../src/theme/colors";
import { jobsService } from "../../src/services/api";
import { useAuth } from "../../src/context/AuthContext";

export default function JobsScreen() {
  const router = useRouter();
  const { userId } = useAuth();
  const [search, setSearch] = useState("");
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [appliedJobs, setAppliedJobs] = useState<number[]>([]);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const data = await jobsService.getAll();
      setJobs(data);
    } catch (error) {
      console.error("Fetch jobs error:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to fetch jobs",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.company.toLowerCase().includes(search.toLowerCase())
  );

  const handleApply = async (jobId: number, jobTitle: string) => {
    if (!userId) {
      Toast.show({
        type: "error",
        text1: "Authentication Error",
        text2: "You must be logged in to apply",
      });
      return;
    }

    try {
      await jobsService.apply(jobId, Number(userId), { resumeUrl: "https://example.com/resume.pdf" }); // Mock resume
      setAppliedJobs([...appliedJobs, jobId]);
      Toast.show({
        type: "success",
        text1: "Application Submitted",
        text2: `You applied for ${jobTitle}`,
        topOffset: 50,
      });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Apply Failed",
        text2: error.response?.data?.message || "Could not submit application",
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.primary} strokeWidth={2} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Job Opportunities</Text>
          <Text style={styles.headerSubtitle}>
            {loading ? "Loading..." : `${filteredJobs.length} jobs available`}
          </Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={20} color={colors.textLight} strokeWidth={1.5} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search jobs or companies"
          placeholderTextColor={colors.textLight}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Jobs List */}
      <ScrollView
        style={styles.listContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {loading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : filteredJobs.length > 0 ? (
          filteredJobs.map((job) => {
            const isApplied = appliedJobs.includes(job.id);

            return (
              <View key={job.id} style={styles.jobCard}>
                {/* Job Header */}
                <View style={styles.jobHeader}>
                  <View style={styles.jobIconContainer}>
                    <Briefcase
                      size={20}
                      color={colors.primary}
                      strokeWidth={1.5}
                    />
                  </View>
                  <View style={styles.jobTitleSection}>
                    <Text style={styles.jobTitle}>{job.title}</Text>
                    <View style={styles.companyRow}>
                      <Building2
                        size={14}
                        color={colors.textLight}
                        strokeWidth={1.5}
                      />
                      <Text style={styles.company}>{job.company}</Text>
                    </View>
                  </View>
                </View>

                {/* Job Details */}
                <View style={styles.jobDetails}>
                  <View style={styles.detailItem}>
                    <MapPin
                      size={14}
                      color={colors.primary}
                      strokeWidth={1.5}
                    />
                    <Text style={styles.detailText}>{job.location}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.badge}>{job.jobType || job.type}</Text>
                  </View>
                </View>

                {/* Salary and Button */}
                <View style={styles.jobFooter}>
                  <View>
                    <Text style={styles.salaryLabel}>Expected Salary</Text>
                    <Text style={styles.salary}>{job.salary || "Not Specified"}</Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.applyButton,
                      isApplied && styles.appliedButton,
                    ]}
                    disabled={isApplied}
                    onPress={() => handleApply(job.id, job.title)}
                  >
                    {isApplied ? (
                      <>
                        <CheckCircle
                          size={16}
                          color={colors.success}
                          strokeWidth={2}
                        />
                        <Text style={styles.appliedText}>Applied</Text>
                      </>
                    ) : (
                      <Text style={styles.buttonText}>Apply Now</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <Briefcase size={48} color={colors.textLight} strokeWidth={1} />
            <Text style={styles.emptyStateText}>No jobs found</Text>
            <Text style={styles.emptyStateSubtext}>
              Try searching with different keywords
            </Text>
          </View>
        )}
      </ScrollView>
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

  jobCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: Spacing.MD,
    borderWidth: 1,
    borderColor: colors.border,
    gap: Spacing.MD,
  },

  jobHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.MD,
  },

  jobIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },

  jobTitleSection: {
    flex: 1,
    gap: Spacing.XS,
  },

  jobTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.SM,
    fontWeight: "600",
    color: colors.textDark,
  },

  companyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.XS,
  },

  company: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.XS,
    fontWeight: "400",
    color: colors.textLight,
  },

  jobDetails: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.MD,
    paddingTop: Spacing.SM,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.XS,
  },

  detailText: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.XS,
    fontWeight: "400",
    color: colors.primary,
  },

  badge: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.XS,
    fontWeight: "400",
    color: colors.primary,
    backgroundColor: colors.background,
    paddingHorizontal: Spacing.SM,
    paddingVertical: Spacing.XS,
    borderRadius: 8,
    overflow: "hidden",
  },

  jobFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Spacing.SM,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  salaryLabel: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.XS,
    fontWeight: "400",
    color: colors.textLight,
  },

  salary: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.SM,
    fontWeight: "600",
    color: colors.primary,
    marginTop: Spacing.XS,
  },

  applyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: Spacing.MD,
    paddingVertical: Spacing.SM,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.XS,
    flexDirection: "row",
  },

  buttonText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.SM,
    fontWeight: "600",
    color: colors.white,
  },

  appliedButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.success,
  },

  appliedText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.SM,
    fontWeight: "600",
    color: colors.success,
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
});
