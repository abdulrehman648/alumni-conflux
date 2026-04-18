import { useRouter } from "expo-router";
import {
  Briefcase,
  Building2,
  CheckCircle,
  ChevronLeft,
  FileText,
  MapPin,
  Plus,
  Search,
  Users,
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

export default function AlumniJobsScreen() {
  const router = useRouter();
  const { userId } = useAuth();
  const [search, setSearch] = useState("");
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [appliedJobs, setAppliedJobs] = useState<number[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [appsModalVisible, setAppsModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [resumeUrl, setResumeUrl] = useState("");
  const [submittingApplication, setSubmittingApplication] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("Full-time");
  const [salary, setSalary] = useState("");
  const [applyLink, setApplyLink] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({
    title: "",
    company: "",
    description: "",
    location: "",
    applyLink: "",
    salary: "",
  });

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
    if (!userId) return;

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

  const validateJobForm = (): {
    title: string;
    company: string;
    description: string;
    location: string;
    applyLink: string;
    salary: string;
  } => {
    const newErrors = {
      title: "",
      company: "",
      description: "",
      location: "",
      applyLink: "",
      salary: "",
    };

    // Trim whitespace for validation
    const titleTrimmed = title.trim();
    const companyTrimmed = company.trim();
    const descriptionTrimmed = description.trim();
    const locationTrimmed = location.trim();
    const applyLinkTrimmed = applyLink.trim();

    // Required fields check
    if (!titleTrimmed) {
      newErrors.title = "Job title is required";
    }

    if (!companyTrimmed) {
      newErrors.company = "Company name is required";
    }

    if (!descriptionTrimmed) {
      newErrors.description = "Job description is required";
    }

    if (!locationTrimmed) {
      newErrors.location = "Location is required";
    }

    // Apply Link validation - check format
    if (!applyLinkTrimmed) {
      newErrors.applyLink = "Apply link or email is required";
    }

    return newErrors;
  };

  const handlePostJob = async () => {
    const validationErrors = validateJobForm();
    setErrors(validationErrors);

    // Check if there are any errors
    const hasErrors = Object.values(validationErrors).some(
      (error) => error !== "",
    );
    if (hasErrors) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please fix the errors below",
      });
      return;
    }

    setSubmitting(true);
    try {
      await jobsService.create(Number(userId), {
        title: title.trim(),
        company: company.trim(),
        description: description.trim(),
        location: location.trim(),
        jobType,
        salary: salary.trim(),
        applyLink: applyLink.trim(),
      });

      Toast.show({
        type: "success",
        text1: "Job Posted",
        text2: "Your job opportunity has been posted successfully",
      });
      setModalVisible(false);
      resetForm();
      fetchJobs();
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Posting Failed",
        text2: error.response?.data?.message || "Could not post job",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewApplications = async (job: any) => {
    setSelectedJob(job);
    setAppsModalVisible(true);
    setLoadingApps(true);
    try {
      console.log("Fetching applications for job:", job.id, "userId:", userId);
      const data = await jobsService.getApplications(job.id, Number(userId));
      console.log("Applications fetched:", data);
      setApplications(data);
    } catch (error: any) {
      console.error("Fetch applications error:", error);
      console.error("Error response:", error.response?.data);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.response?.data?.message || "Failed to fetch applications",
      });
    } finally {
      setLoadingApps(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setCompany("");
    setDescription("");
    setLocation("");
    setJobType("Full-time");
    setSalary("");
    setApplyLink("");
    setErrors({
      title: "",
      company: "",
      description: "",
      location: "",
      applyLink: "",
      salary: "",
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ChevronLeft size={24} color={colors.primary} strokeWidth={2} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Job Hub</Text>
          <Text style={styles.headerSubtitle}>
            {loading ? "Loading..." : `${filteredJobs.length} jobs available`}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Plus size={24} color={colors.white} strokeWidth={2} />
        </TouchableOpacity>
      </View>

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

                <View style={styles.jobFooter}>
                  <View>
                    <Text style={styles.salaryLabel}>Expected Salary</Text>
                    <Text style={styles.salary}>{job.salary}</Text>
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

      {/* View Applications Modal */}
      <Modal
        visible={appsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAppsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Applications</Text>
                <Text style={styles.modalSubtitle}>{selectedJob?.title}</Text>
              </View>
              <TouchableOpacity onPress={() => setAppsModalVisible(false)}>
                <X size={24} color={colors.textDark} />
              </TouchableOpacity>
            </View>

            {loadingApps ? (
              <ActivityIndicator
                size="large"
                color={colors.primary}
                style={{ margin: 40 }}
              />
            ) : applications.length > 0 ? (
              <ScrollView showsVerticalScrollIndicator={false}>
                {applications.map((app) => (
                  <View key={app.id} style={styles.appCard}>
                    <View style={styles.appInfo}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <Text style={styles.appStudentName}>
                          {app.applicantName}
                        </Text>
                        <View
                          style={[
                            styles.roleBadge,
                            {
                              backgroundColor:
                                app.applicantRole === "STUDENT"
                                  ? "#dbeafe"
                                  : "#f3e8ff",
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.roleText,
                              {
                                color:
                                  app.applicantRole === "STUDENT"
                                    ? "#1e40af"
                                    : "#6b21a8",
                              },
                            ]}
                          >
                            {app.applicantRole}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.appDate}>
                        Applied: {app.appliedAt}
                      </Text>
                    </View>
                    <View style={styles.appActions}>
                      <TouchableOpacity style={styles.resumeButton}>
                        <FileText size={14} color={colors.primary} />
                        <Text style={styles.resumeText}>Resume</Text>
                      </TouchableOpacity>
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor:
                              app.status === "PENDING" ? "#fef3c7" : "#ecfdf5",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            {
                              color:
                                app.status === "PENDING"
                                  ? "#b45309"
                                  : "#059669",
                            },
                          ]}
                        >
                          {app.status}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
                <View style={{ height: 40 }} />
              </ScrollView>
            ) : (
              <View style={styles.emptyState}>
                <Users size={48} color={colors.textLight} strokeWidth={1} />
                <Text style={styles.emptyStateText}>No applications yet</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>

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

            {/* Modal Footer with Actions */}
            <View style={styles.modalFooter}>
              {selectedJob && selectedJob.alumniUserId === Number(userId) ? (
                <TouchableOpacity
                  style={[
                    styles.applyButton,
                    { backgroundColor: colors.secondary || "#6366f1" },
                  ]}
                  onPress={() => {
                    setDetailsModalVisible(false);
                    handleViewApplications(selectedJob);
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Users size={18} color={colors.white} />
                    <Text style={styles.buttonText}>View Applications</Text>
                  </View>
                </TouchableOpacity>
              ) : appliedJobs.includes(selectedJob?.id) ? (
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

      {/* Post Job Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Post Job Opportunity</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color={colors.textDark} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Job Title</Text>
                <TextInput
                  style={[styles.input, errors.title && styles.inputError]}
                  placeholder="e.g. Senior Software Engineer"
                  value={title}
                  onChangeText={setTitle}
                />
                {errors.title && (
                  <Text style={styles.errorText}>{errors.title}</Text>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Company</Text>
                <TextInput
                  style={[styles.input, errors.company && styles.inputError]}
                  placeholder="e.g. Google"
                  value={company}
                  onChangeText={setCompany}
                />
                {errors.company && (
                  <Text style={styles.errorText}>{errors.company}</Text>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[
                    styles.input,
                    styles.textArea,
                    errors.description && styles.inputError,
                  ]}
                  placeholder="Job requirements..."
                  multiline
                  numberOfLines={4}
                  value={description}
                  onChangeText={setDescription}
                />
                {errors.description && (
                  <Text style={styles.errorText}>{errors.description}</Text>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Location</Text>
                <TextInput
                  style={[styles.input, errors.location && styles.inputError]}
                  placeholder="e.g. Remote, Lahore"
                  value={location}
                  onChangeText={setLocation}
                />
                {errors.location && (
                  <Text style={styles.errorText}>{errors.location}</Text>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Job Type</Text>
                <View style={styles.chipsContainer}>
                  {["Full-time", "Part-time", "Contract", "Internship"].map(
                    (type) => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.chip,
                          jobType === type && styles.activeChip,
                        ]}
                        onPress={() => setJobType(type)}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            jobType === type && styles.activeChipText,
                          ]}
                        >
                          {type}
                        </Text>
                      </TouchableOpacity>
                    ),
                  )}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Salary Range</Text>
                <TextInput
                  style={[styles.input, errors.salary && styles.inputError]}
                  placeholder="e.g. $80k - $120k"
                  value={salary}
                  onChangeText={setSalary}
                />
                {errors.salary && (
                  <Text style={styles.errorText}>{errors.salary}</Text>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Apply Link / Email</Text>
                <TextInput
                  style={[styles.input, errors.applyLink && styles.inputError]}
                  placeholder="https://company.com/apply"
                  value={applyLink}
                  onChangeText={setApplyLink}
                />
                {errors.applyLink && (
                  <Text style={styles.errorText}>{errors.applyLink}</Text>
                )}
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handlePostJob}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.submitButtonText}>Post Job</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
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
    alignItems: "center",
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
    color: colors.textDark,
  },
  headerSubtitle: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.SM,
    color: colors.textLight,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
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
  },
  jobTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.SM,
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
    color: colors.primary,
  },
  badge: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.XS,
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
    color: colors.textLight,
  },
  salary: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.SM,
    color: colors.primary,
  },
  applyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: Spacing.MD,
    paddingVertical: Spacing.SM,
    borderRadius: 12,
  },
  buttonText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.SM,
    color: colors.white,
  },
  appliedButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.success,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.XS,
  },
  appliedText: {
    color: colors.success,
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.SM,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing.XXXL,
  },
  emptyStateText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.Base,
    color: colors.textDark,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.LG,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.XL,
  },
  modalTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.LG,
    color: colors.textDark,
  },
  formGroup: {
    marginBottom: Spacing.LG,
    gap: Spacing.XS,
  },
  label: {
    fontFamily: "Poppins-Medium",
    fontSize: FontSizes.SM,
    color: colors.textDark,
    marginBottom: Spacing.XS,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: Spacing.MD,
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.Base,
    color: colors.textDark,
  },
  inputError: {
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
  },
  errorText: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.XS,
    color: "#ef4444",
    marginTop: Spacing.XS,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.SM,
  },
  chip: {
    paddingHorizontal: Spacing.MD,
    paddingVertical: Spacing.SM,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  activeChip: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  chipText: {
    fontFamily: "Poppins-Medium",
    fontSize: FontSizes.XS,
    color: colors.textLight,
  },
  activeChipText: {
    color: colors.white,
  },
  submitButton: {
    backgroundColor: colors.secondary,
    paddingVertical: Spacing.MD,
    borderRadius: 12,
    alignItems: "center",
    marginTop: Spacing.MD,
    marginBottom: Spacing.XXL,
  },
  submitButtonText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.Base,
    color: colors.white,
  },
  modalSubtitle: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.SM,
    color: colors.textLight,
  },
  appCard: {
    padding: Spacing.MD,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: Spacing.SM,
    gap: Spacing.SM,
  },
  appInfo: {
    flex: 1,
  },
  appStudentName: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.Base,
    color: colors.textDark,
  },
  appDate: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.XS,
    color: colors.textLight,
  },
  appActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.XS,
  },
  resumeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  resumeText: {
    fontFamily: "Poppins-Medium",
    fontSize: FontSizes.XS,
    color: colors.primary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 10,
    textTransform: "uppercase",
  },
  roleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roleText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 8,
    textTransform: "uppercase",
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

  // Job Details Modal Styles
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

  modalFooter: {
    paddingHorizontal: Spacing.LG,
    paddingVertical: Spacing.LG,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: Spacing.MD,
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
