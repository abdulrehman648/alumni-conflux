import { useRouter } from "expo-router";
import {
  Briefcase,
  Building2,
  CheckCircle,
  ChevronLeft,
  MapPin,
  Search,
  X,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { FontSizes, Spacing } from "../../constants/theme";
import { useAuth } from "../../src/context/AuthContext";
import { jobsService } from "../../src/services/api";
import colors from "../../src/theme/colors";

export default function JobsScreen() {
  const router = useRouter();
  const { userId } = useAuth();
  const [search, setSearch] = useState("");
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [appliedJobs, setAppliedJobs] = useState<number[]>([]);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [resumeUrl, setResumeUrl] = useState("");
  const [submittingApplication, setSubmittingApplication] = useState(false);

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
      job.company.toLowerCase().includes(search.toLowerCase()),
  );

  const handleApply = async (
    jobId: number,
    jobTitle: string,
    resumeUri: string,
  ) => {
    if (!userId) {
      Toast.show({
        type: "error",
        text1: "Authentication Error",
        text2: "You must be logged in to apply",
      });
      return;
    }

    if (!resumeUri.trim()) {
      Toast.show({
        type: "error",
        text1: "Resume Required",
        text2: "Please enter a valid resume URL",
      });
      return;
    }

    setSubmittingApplication(true);
    try {
      await jobsService.apply(jobId, Number(userId), {
        resumeUrl: resumeUri,
      });
      setAppliedJobs([...appliedJobs, jobId]);
      setResumeUrl("");
      Toast.show({
        type: "success",
        text1: "Application Submitted",
        text2: `You applied for ${jobTitle}`,
        topOffset: 50,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Could not submit application";
      console.error("Apply error:", {
        status: error.response?.status,
        message: errorMessage,
        userId,
        jobId,
      });

      // More helpful error message for role-related errors
      if (
        errorMessage.toLowerCase().includes("only") ||
        error.response?.status === 403
      ) {
        Toast.show({
          type: "error",
          text1: "Application Error",
          text2:
            "Your account is not eligible to apply. Please contact support.",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Apply Failed",
          text2: errorMessage,
        });
      }
    } finally {
      setSubmittingApplication(false);
    }
  };

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
                    <Text style={styles.salary}>
                      {job.salary || "Not Specified"}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.viewButton}
                    onPress={() => {
                      setSelectedJob(job);
                      setResumeUrl("");
                      setDetailsModalVisible(true);
                    }}
                  >
                    <Text style={styles.viewButtonText}>View Details</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <Briefcase size={48} color={colors.textLight} strokeWidth={1} />
            <Text style={styles.emptyStateText}>No jobs found</Text>
          </View>
        )}
      </ScrollView>

      {/* Job Details Modal */}
      <Modal
        visible={detailsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDetailsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Job Details</Text>
              <TouchableOpacity
                onPress={() => setDetailsModalVisible(false)}
                style={styles.closeButton}
              >
                <X size={24} color={colors.textDark} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            {/* Modal Content */}
            <ScrollView
              style={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {selectedJob && (
                <View style={styles.detailsContainer}>
                  {/* Job Title Section */}
                  <View style={styles.titleSection}>
                    <View style={styles.jobIconContainer}>
                      <Briefcase
                        size={24}
                        color={colors.primary}
                        strokeWidth={1.5}
                      />
                    </View>
                    <View style={styles.titleContent}>
                      <Text style={styles.detailJobTitle}>
                        {selectedJob.title}
                      </Text>
                      <View style={styles.companyRow}>
                        <Building2
                          size={16}
                          color={colors.textLight}
                          strokeWidth={1.5}
                        />
                        <Text style={styles.detailCompany}>
                          {selectedJob.company}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Location and Type */}
                  <View style={styles.infoGrid}>
                    <View style={styles.infoCard}>
                      <MapPin
                        size={16}
                        color={colors.primary}
                        strokeWidth={1.5}
                      />
                      <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Location</Text>
                        <Text style={styles.infoValue}>
                          {selectedJob.location}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.infoCard}>
                      <Briefcase
                        size={16}
                        color={colors.primary}
                        strokeWidth={1.5}
                      />
                      <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Job Type</Text>
                        <Text style={styles.infoValue}>
                          {selectedJob.jobType || selectedJob.type}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Salary Section */}
                  <View style={styles.salarySection}>
                    <Text style={styles.sectionLabel}>Expected Salary</Text>
                    <Text style={styles.salaryAmount}>
                      {selectedJob.salary || "Not Specified"}
                    </Text>
                  </View>

                  {/* Description Section */}
                  <View style={styles.descriptionSection}>
                    <Text style={styles.sectionLabel}>Description</Text>
                    <Text style={styles.descriptionText}>
                      {selectedJob.description || "No description provided"}
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Resume URL Input and Apply Button */}
            <View style={styles.modalFooter}>
              {appliedJobs.includes(selectedJob?.id) ? (
                <View style={styles.appliedStatusContainer}>
                  <CheckCircle
                    size={20}
                    color={colors.success}
                    strokeWidth={2}
                  />
                  <Text style={styles.appliedStatusText}>
                    You have already applied
                  </Text>
                </View>
              ) : (
                <>
                  <View style={styles.formGroup}>
                    <Text style={styles.resumeLabel}>Resume URL</Text>
                    <TextInput
                      style={styles.resumeInput}
                      placeholder="https://example.com/your-resume.pdf"
                      placeholderTextColor={colors.textLight}
                      value={resumeUrl}
                      onChangeText={setResumeUrl}
                      editable={!submittingApplication}
                    />
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.applyButton,
                      submittingApplication && { opacity: 0.6 },
                    ]}
                    disabled={submittingApplication}
                    onPress={() => {
                      if (selectedJob) {
                        handleApply(
                          selectedJob.id,
                          selectedJob.title,
                          resumeUrl,
                        );
                        setDetailsModalVisible(false);
                      }
                    }}
                  >
                    {submittingApplication ? (
                      <ActivityIndicator size="small" color={colors.white} />
                    ) : (
                      <Text style={styles.buttonText}>Submit Application</Text>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>
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

  viewButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: Spacing.MD,
    paddingVertical: Spacing.SM,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  viewButtonText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.SM,
    fontWeight: "600",
    color: colors.white,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },

  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    flexDirection: "column",
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.LG,
    paddingVertical: Spacing.LG,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  modalTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.LG,
    fontWeight: "600",
    color: colors.textDark,
  },

  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },

  modalScrollContent: {
    flex: 1,
    paddingHorizontal: Spacing.LG,
  },

  detailsContainer: {
    paddingVertical: Spacing.LG,
    gap: Spacing.LG,
  },

  titleSection: {
    flexDirection: "row",
    gap: Spacing.MD,
    alignItems: "flex-start",
  },

  titleContent: {
    flex: 1,
    gap: Spacing.XS,
  },

  detailJobTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.LG,
    fontWeight: "600",
    color: colors.textDark,
  },

  detailCompany: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.Base,
    fontWeight: "400",
    color: colors.textLight,
  },

  infoGrid: {
    gap: Spacing.MD,
  },

  infoCard: {
    flexDirection: "row",
    gap: Spacing.MD,
    backgroundColor: colors.card,
    padding: Spacing.MD,
    borderRadius: 12,
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: colors.border,
  },

  infoContent: {
    flex: 1,
    gap: Spacing.XS,
  },

  infoLabel: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.XS,
    fontWeight: "400",
    color: colors.textLight,
  },

  infoValue: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.Base,
    fontWeight: "600",
    color: colors.textDark,
  },

  salarySection: {
    backgroundColor: colors.card,
    padding: Spacing.MD,
    borderRadius: 12,
    gap: Spacing.XS,
    borderWidth: 1,
    borderColor: colors.border,
  },

  sectionLabel: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.XS,
    fontWeight: "400",
    color: colors.textLight,
  },

  salaryAmount: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.LG,
    fontWeight: "600",
    color: colors.primary,
  },

  descriptionSection: {
    gap: Spacing.MD,
    marginBottom: Spacing.LG,
  },

  descriptionText: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.Base,
    fontWeight: "400",
    color: colors.textDark,
    lineHeight: 22,
  },

  modalFooter: {
    paddingHorizontal: Spacing.LG,
    paddingVertical: Spacing.LG,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: Spacing.MD,
  },

  formGroup: {
    gap: Spacing.XS,
  },

  resumeLabel: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.SM,
    fontWeight: "600",
    color: colors.textDark,
  },

  resumeInput: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: Spacing.MD,
    paddingVertical: Spacing.SM,
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.Base,
    color: colors.textDark,
  },

  appliedStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.MD,
    paddingVertical: Spacing.MD,
    paddingHorizontal: Spacing.LG,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.success,
  },

  appliedStatusText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.Base,
    fontWeight: "600",
    color: colors.success,
  },
});
