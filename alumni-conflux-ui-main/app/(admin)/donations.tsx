import { useRouter } from "expo-router";
import {
  CheckCircle,
  Clock,
  ExternalLink,
  Eye,
  Heart,
  TrendingUp,
  X,
  XCircle,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
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
import FloatingAddButton from "../../src/components/FloatingAddButton";
import NestedScreenHeader from "../../src/components/NestedScreenHeader";
import { useAuth } from "../../src/context/AuthContext";
import {
  Campaign,
  Contribution,
  donationsService,
} from "../../src/services/api";
import colors from "../../src/theme/colors";

export default function AdminDonationsScreen() {
  const router = useRouter();
  const { userId } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [contributionsModalVisible, setContributionsModalVisible] =
    useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null,
  );
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loadingContributions, setLoadingContributions] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("DONATION");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [iban, setIban] = useState("");
  const [bankName, setBankName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const data = await donationsService.getAllCampaignsAdmin();
      setCampaigns(data);
    } catch (error) {
      console.error("Fetch campaigns error:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to fetch campaigns",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async () => {
    if (!title || !description || !accountName || !accountNumber || !bankName) {
      Toast.show({
        type: "error",
        text1: "Required Fields",
        text2: "Please fill all mandatory fields",
      });
      return;
    }

    setSubmitting(true);
    try {
      await donationsService.createCampaign({
        title,
        description,
        type,
        accountDetails: {
          accountName,
          accountNumber,
          iban,
          bankName,
        },
        targetAmount: targetAmount ? parseFloat(targetAmount) : null,
        deadline: deadline || null,
        createdById: Number(userId),
      });

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Campaign created successfully",
      });
      setModalVisible(false);
      resetForm();
      fetchCampaigns();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to create campaign",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setType("DONATION");
    setAccountName("");
    setAccountNumber("");
    setIban("");
    setBankName("");
    setTargetAmount("");
    setDeadline("");
  };

  const viewContributions = async (campaign: any) => {
    setSelectedCampaign(campaign);
    setContributionsModalVisible(true);
    setLoadingContributions(true);
    try {
      const data = await donationsService.getContributions(campaign.id);
      setContributions(data);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to fetch contributions",
      });
    } finally {
      setLoadingContributions(false);
    }
  };

  const handleVerify = async (contributionId: number, status: string) => {
    if (!selectedCampaign) return;
    try {
      await donationsService.verifyContribution(contributionId, status);
      Toast.show({
        type: "success",
        text1: "Success",
        text2: `Contribution ${status.toLowerCase()} successfully`,
      });
      // Refresh contributions for the active campaign
      const data = await donationsService.getContributions(selectedCampaign.id);
      setContributions(data);
      // Also refresh campaign totals
      fetchCampaigns();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Action failed",
      });
    }
  };

  return (
    <View style={styles.container}>
      <NestedScreenHeader
        title="Donations & Funds"
        subtitle="Manage fundraising campaigns"
        onBack={() => router.back()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {loading ? (
          <ActivityIndicator
            color={colors.primary}
            size="large"
            style={{ marginTop: 50 }}
          />
        ) : campaigns.length > 0 ? (
          campaigns.map((campaign) => (
            <View key={campaign.id} style={styles.campaignCard}>
              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.typeBadge,
                    {
                      backgroundColor:
                        campaign.type === "FUND" ? "#dbeafe" : "#fef3c7",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.typeText,
                      {
                        color:
                          campaign.type === "FUND" ? colors.primary : "#d97706",
                      },
                    ]}
                  >
                    {campaign.type}
                  </Text>
                </View>
                <View style={styles.progressRow}>
                  <Text style={styles.amountText}>
                    ${campaign.collectedAmount.toFixed(0)}
                    {campaign.targetAmount
                      ? ` / $${campaign.targetAmount.toFixed(0)}`
                      : ""}
                  </Text>
                </View>
              </View>

              <Text style={styles.campaignTitle}>{campaign.title}</Text>

              {campaign.targetAmount && (
                <View style={styles.progressBarContainer}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${Math.min(100, (campaign.collectedAmount / campaign.targetAmount) * 100)}%`,
                      },
                    ]}
                  />
                </View>
              )}

              <TouchableOpacity
                style={styles.cardFooter}
                onPress={() => viewContributions(campaign)}
              >
                <View style={styles.footerItem}>
                  <TrendingUp size={14} color={colors.textLight} />
                  <Text style={styles.footerText}>Manage Submissions</Text>
                </View>
                <Eye size={18} color={colors.primary} />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Heart size={64} color={colors.textLight} strokeWidth={1} />
            <Text style={styles.emptyText}>No campaigns created yet</Text>
          </View>
        )}
      </ScrollView>

      <FloatingAddButton onPress={() => setModalVisible(true)} />

      {/* Create Campaign Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Campaign</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color={colors.textDark} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <View style={styles.typeSelector}>
                  <TouchableOpacity
                    style={[
                      styles.typeOption,
                      type === "DONATION" && styles.typeOptionActive,
                    ]}
                    onPress={() => setType("DONATION")}
                  >
                    <Text
                      style={[
                        styles.typeOptionText,
                        type === "DONATION" && styles.typeOptionTextActive,
                      ]}
                    >
                      Donation
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.typeOption,
                      type === "FUND" && styles.typeOptionActive,
                    ]}
                    onPress={() => setType("FUND")}
                  >
                    <Text
                      style={[
                        styles.typeOptionText,
                        type === "FUND" && styles.typeOptionTextActive,
                      ]}
                    >
                      Fund
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Campaign Title</Text>
                <TextInput
                  style={styles.input}
                  value={title}
                  onChangeText={setTitle}
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  multiline
                  value={description}
                  onChangeText={setDescription}
                  placeholder="What is this campaign for?"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Account Details</Text>
                <TextInput
                  style={[styles.input, { marginBottom: 8 }]}
                  value={accountName}
                  onChangeText={setAccountName}
                  placeholder="Account Holder Name"
                />
                <TextInput
                  style={[styles.input, { marginBottom: 8 }]}
                  value={accountNumber}
                  onChangeText={setAccountNumber}
                  placeholder="Account Number"
                />
                <TextInput
                  style={[styles.input, { marginBottom: 8 }]}
                  value={iban}
                  onChangeText={setIban}
                  placeholder="IBAN (Optional)"
                />
                <TextInput
                  style={styles.input}
                  value={bankName}
                  onChangeText={setBankName}
                  placeholder="Bank Name"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Target Amount (Optional)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={targetAmount}
                  onChangeText={setTargetAmount}
                  placeholder="e.g. 50000"
                />
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleCreateCampaign}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.submitButtonText}>Create Campaign</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Contributions Modal */}
      <Modal
        visible={contributionsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setContributionsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { height: "85%" }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Verify Submissions</Text>
                <Text style={styles.modalSubtitle}>
                  {selectedCampaign?.title}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setContributionsModalVisible(false)}
              >
                <X size={24} color={colors.textDark} />
              </TouchableOpacity>
            </View>

            {loadingContributions ? (
              <ActivityIndicator
                color={colors.primary}
                size="large"
                style={{ marginTop: 20 }}
              />
            ) : contributions.length > 0 ? (
              <FlatList
                data={contributions}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <View style={styles.contributionCard}>
                    <View style={styles.contributionTop}>
                      <View>
                        <Text style={styles.alumniName}>{item.alumniName}</Text>
                        <Text style={styles.contributionDate}>
                          {new Date(item.submittedAt).toLocaleDateString()}
                        </Text>
                      </View>
                      <Text style={styles.contributionAmount}>
                        ${item.amount.toFixed(0)}
                      </Text>
                    </View>

                    {item.note && (
                      <Text style={styles.contributionNote}>"{item.note}"</Text>
                    )}
                    {item.transactionId && (
                      <Text style={styles.txId}>ID: {item.transactionId}</Text>
                    )}

                    <TouchableOpacity
                      style={styles.screenshotLink}
                      onPress={() => {
                        /* Implement image viewer if needed */
                      }}
                    >
                      <Text style={styles.screenshotLinkText}>
                        View Screenshot Proof
                      </Text>
                      <ExternalLink size={14} color={colors.primary} />
                    </TouchableOpacity>

                    {item.status === "PENDING" ? (
                      <View style={styles.verifyActions}>
                        <TouchableOpacity
                          style={[styles.verifyButton, styles.approveBtn]}
                          onPress={() => handleVerify(item.id, "VERIFIED")}
                        >
                          <CheckCircle size={18} color={colors.white} />
                          <Text style={styles.verifyBtnText}>Approve</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.verifyButton, styles.rejectBtn]}
                          onPress={() => handleVerify(item.id, "REJECTED")}
                        >
                          <XCircle size={18} color={colors.white} />
                          <Text style={styles.verifyBtnText}>Reject</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View
                        style={[
                          styles.statusTag,
                          {
                            backgroundColor:
                              item.status === "VERIFIED"
                                ? "#d1fae5"
                                : "#fee2e2",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            {
                              color:
                                item.status === "VERIFIED"
                                  ? colors.success
                                  : colors.danger,
                            },
                          ]}
                        >
                          {item.status}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Clock size={48} color={colors.textLight} strokeWidth={1} />
                <Text style={styles.emptyText}>No contributions found</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: {
    padding: Spacing.LG,
    paddingTop: 20,
    paddingBottom: Spacing.XXXL + 80,
  },
  campaignCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: Spacing.LG,
    marginBottom: Spacing.MD,
    borderWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 0,
  },
  typeText: { fontSize: FontSizes.XS, fontWeight: "700", letterSpacing: 0.5 },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  amountText: { fontSize: 15, fontWeight: "700", color: colors.primary },
  campaignTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.LG,
    color: colors.textDark,
    marginBottom: 14,
    fontWeight: "700",
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: "#e5e7eb",
    borderRadius: 6,
    marginBottom: 14,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 6,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  footerItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  footerText: { fontSize: 13, color: colors.textDark, fontWeight: "500" },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 100,
    gap: 16,
  },
  emptyText: {
    color: colors.textLight,
    fontFamily: "Poppins-Medium",
    fontSize: FontSizes.Base,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fafafa",
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    padding: Spacing.LG,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.XL,
    gap: Spacing.MD,
  },
  modalTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.XXL,
    color: colors.textDark,
    fontWeight: "700",
  },
  modalSubtitle: {
    fontSize: 13,
    color: colors.textLight,
    marginTop: 4,
    fontWeight: "500",
  },
  formGroup: { marginBottom: Spacing.MD },
  label: {
    fontFamily: "Poppins-Medium",
    fontSize: FontSizes.SM,
    color: colors.textDark,
    marginBottom: 10,
    fontWeight: "600",
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: Spacing.MD,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    fontSize: FontSizes.SM,
    color: colors.textDark,
  },
  textArea: { minHeight: 80, textAlignVertical: "top" },
  typeSelector: { flexDirection: "row", gap: 12 },
  typeOption: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    alignItems: "center",
    backgroundColor: colors.white,
  },
  typeOptionActive: {
    borderColor: colors.primary,
    backgroundColor: "#f0f9ff",
    borderWidth: 2,
  },
  typeOptionText: {
    fontSize: FontSizes.SM,
    color: colors.textLight,
    fontWeight: "500",
  },
  typeOptionTextActive: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: FontSizes.SM,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 40,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: FontSizes.Base,
    fontWeight: "700",
  },
  contributionCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: Spacing.MD,
    marginBottom: Spacing.MD,
    borderWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  contributionTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  alumniName: { fontSize: 15, fontWeight: "700", color: colors.textDark },
  contributionDate: {
    fontSize: FontSizes.XS,
    color: colors.textLight,
    marginTop: 2,
    fontWeight: "500",
  },
  contributionAmount: {
    fontSize: FontSizes.Base,
    fontWeight: "700",
    color: colors.success,
  },
  contributionNote: {
    fontSize: 13,
    color: "#555",
    marginTop: 10,
    fontStyle: "italic",
    lineHeight: 18,
  },
  txId: {
    fontSize: 11,
    color: colors.textLight,
    marginTop: 6,
    fontWeight: "500",
  },
  screenshotLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    padding: 12,
    backgroundColor: "#f0f9ff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  screenshotLinkText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: "700",
    flex: 1,
  },
  verifyActions: { flexDirection: "row", gap: 10, marginTop: 16 },
  verifyButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  approveBtn: { backgroundColor: colors.success },
  rejectBtn: { backgroundColor: colors.danger },
  verifyBtnText: { color: colors.white, fontSize: 13, fontWeight: "700" },
  statusTag: {
    alignSelf: "flex-start",
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 0,
  },
  statusText: { fontSize: 11, fontWeight: "700", letterSpacing: 0.3 },
});
