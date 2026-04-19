import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import {
  Banknote,
  CheckCircle,
  Clock,
  ExternalLink,
  Heart,
  Image as ImageIcon,
  Send,
  X,
  XCircle,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { FontSizes, Spacing } from "../../constants/theme";
import NestedScreenHeader from "../../src/components/NestedScreenHeader";
import SegmentedControl from "../../src/components/SegmentedControl";
import { useAuth } from "../../src/context/AuthContext";
import {
  Campaign,
  Contribution,
  donationsService,
} from "../../src/services/api";
import colors from "../../src/theme/colors";

export default function AlumniDonationsScreen() {
  const router = useRouter();
  const { userId } = useAuth();
  const [activeTab, setActiveTab] = useState<"explore" | "my">("explore");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [myContributions, setMyContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null,
  );

  // Form states
  const [amount, setAmount] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [note, setNote] = useState("");
  const [screenshot, setScreenshot] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const donationTabs = [
    { value: "explore" as const, label: "Explore" },
    { value: "my" as const, label: "My History" },
  ];

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "explore") {
        const data = await donationsService.getActiveCampaigns();
        setCampaigns(data);
      } else {
        const data = await donationsService.getMyContributions(Number(userId));
        setMyContributions(data);
      }
    } catch (error) {
      console.error("Fetch data error:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to fetch information",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      const filename = asset.uri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename || "");
      const type = match ? `image/${match[1] === "jpg" ? "jpeg" : match[1]}` : `image/jpeg`;

      setScreenshot({
        uri: Platform.OS === "android" ? asset.uri : asset.uri.replace("file://", ""),
        type: type,
        name: filename || "payment_proof.jpg",
      });
    }
  };

  const handleSubmitContribution = async () => {
    if (!selectedCampaign || !amount || !screenshot) {
      Toast.show({
        type: "error",
        text1: "Required Fields",
        text2: "Please provide amount and payment proof",
      });
      return;
    }

    setSubmitting(true);
    try {
      await donationsService.submitContribution(
        selectedCampaign.id,
        {
          amount: parseFloat(amount),
          alumniId: Number(userId),
          transactionId,
          note,
        },
        screenshot,
      );

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Contribution submitted for verification",
      });
      setModalVisible(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error("Submit contribution error:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.response?.data?.message || error.message || "Failed to submit contribution",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setAmount("");
    setTransactionId("");
    setNote("");
    setScreenshot(null);
  };

  const renderCampaignItem = ({ item }: { item: Campaign }) => (
    <View style={styles.campaignCard}>
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.typeBadge,
            {
              backgroundColor: item.type === "FUND" ? "#dbeafe" : "#fef3c7",
            },
          ]}
        >
          <Text
            style={[
              styles.typeText,
              {
                color: item.type === "FUND" ? colors.primary : "#d97706",
              },
            ]}
          >
            {item.type}
          </Text>
        </View>
        <Text style={styles.amountText}>
          Rs.{item.collectedAmount.toFixed(0)}
          {item.targetAmount ? ` / Rs.${item.targetAmount.toFixed(0)}` : ""}
        </Text>
      </View>

      <Text style={styles.campaignTitle}>{item.title}</Text>
      <Text style={styles.campaignDescription} numberOfLines={2}>
        {item.description}
      </Text>

      {item.targetAmount && (
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${Math.min(100, (item.collectedAmount / item.targetAmount) * 100)}%`,
              },
            ]}
          />
        </View>
      )}

      <TouchableOpacity
        style={styles.contributeButton}
        onPress={() => {
          setSelectedCampaign(item);
          setModalVisible(true);
        }}
      >
        <Text style={styles.contributeButtonText}>Contribute Now</Text>
      </TouchableOpacity>
    </View>
  );

  const renderContributionItem = ({ item }: { item: Contribution }) => (
    <View style={styles.contributionCard}>
      <View style={styles.contributionTop}>
        <View>
          <Text style={styles.contributionCampaign}>{item.campaignTitle}</Text>
          <Text style={styles.contributionDate}>
            {new Date(item.submittedAt).toLocaleDateString()}
          </Text>
        </View>
        <Text style={styles.contributionAmount}>
          Rs.{item.amount.toFixed(0)}
        </Text>
      </View>

      <View style={styles.statusRow}>
        {item.transactionId && (
          <Text style={styles.txIdText}>ID: {item.transactionId}</Text>
        )}
        <View
          style={[
            styles.statusTag,
            {
              backgroundColor:
                item.status === "VERIFIED"
                  ? "#d1fae5"
                  : item.status === "REJECTED"
                    ? "#fee2e2"
                    : "#fef3c7",
            },
          ]}
        >
          {item.status === "VERIFIED" ? (
            <CheckCircle size={14} color={colors.success} />
          ) : item.status === "REJECTED" ? (
            <XCircle size={14} color={colors.danger} />
          ) : (
            <Clock size={14} color="#d97706" />
          )}
          <Text
            style={[
              styles.statusText,
              {
                color:
                  item.status === "VERIFIED"
                    ? colors.success
                    : item.status === "REJECTED"
                      ? colors.danger
                      : "#d97706",
              },
            ]}
          >
            {item.status}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <NestedScreenHeader title="Donations" onBack={() => router.back()} />

      <SegmentedControl
        options={donationTabs}
        value={activeTab}
        onChange={setActiveTab}
        containerStyle={styles.segmentedControlWrap}
      />

      {loading ? (
        <ActivityIndicator
          color={colors.primary}
          size="large"
          style={{ marginTop: 50 }}
        />
      ) : activeTab === "explore" ? (
        <FlatList
          data={campaigns}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderCampaignItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Heart size={48} color={colors.textLight} strokeWidth={1.5} />
              <Text style={styles.emptyText}>No active donations or funds found</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={myContributions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderContributionItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Heart size={48} color={colors.textLight} strokeWidth={1.5} />
              <Text style={styles.emptyText}>
                You haven't made any contributions yet
              </Text>
            </View>
          }
        />
      )}

      {/* Contribution Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  {selectedCampaign?.type === "DONATION" ? "Make a Donation" : selectedCampaign?.title}
                </Text>

              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color={colors.textDark} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Account Details Display */}
              <View style={styles.accountBox}>
                <View style={styles.accountHeader}>
                  <Text style={styles.accountHeaderText}>Bank Details:</Text>
                </View>
                <Text style={styles.accountText}>
                  Bank: {selectedCampaign?.accountDetails?.bankName}
                </Text>
                <Text style={styles.accountText}>
                  A/C Name: {selectedCampaign?.accountDetails?.accountName}
                </Text>
                <Text style={styles.accountText}>
                  A/C No: {selectedCampaign?.accountDetails?.accountNumber}
                </Text>
                {selectedCampaign?.accountDetails?.iban ? (
                  <Text style={styles.accountText}>
                    IBAN: {selectedCampaign?.accountDetails?.iban}
                  </Text>
                ) : null}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Amount (Rs)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="Enter amount"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Transaction ID</Text>
                <TextInput
                  style={styles.input}
                  value={transactionId}
                  onChangeText={setTransactionId}
                  placeholder="Enter reference number"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Note (Optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  multiline
                  value={note}
                  onChangeText={setNote}
                  placeholder="Add a message..."
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Upload Payment Proof</Text>
                <TouchableOpacity
                  style={styles.imagePicker}
                  onPress={handlePickImage}
                >
                  {screenshot ? (
                    <View style={styles.screenshotPreview}>
                      <Image
                        source={{ uri: screenshot.uri }}
                        style={styles.previewImage}
                      />
                      <TouchableOpacity
                        style={styles.removeImageBtn}
                        onPress={() => setScreenshot(null)}
                      >
                        <X size={14} color={colors.white} />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.pickerContent}>
                      <ImageIcon size={32} color={colors.textLight} />
                      <Text style={styles.pickerText}>Select Screenshot</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmitContribution}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <>
                    <Send size={18} color={colors.white} />
                    <Text style={styles.submitButtonText}>
                      Submit Contribution
                    </Text>
                  </>
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
  container: { flex: 1, backgroundColor: colors.background },
  segmentedControlWrap: {
    marginHorizontal: Spacing.LG,
    marginTop: Spacing.SM,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  listContent: { padding: Spacing.LG, paddingTop: 20 },
  campaignCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: Spacing.LG,
    marginBottom: Spacing.LG,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    minHeight: 180,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeText: { fontSize: 10, fontWeight: "700", letterSpacing: 0.5 },
  amountText: { fontSize: 14, fontWeight: "700", color: colors.primary },
  campaignTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.Base,
    color: colors.textDark,
    marginBottom: 8,
    fontWeight: "700",
  },
  campaignDescription: {
    fontSize: 13,
    color: colors.textLight,
    marginBottom: 16,
    lineHeight: 18,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    marginBottom: 16,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: colors.secondary,
    borderRadius: 4,
  },
  contributeButton: {
    backgroundColor: colors.secondary,
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  contributeButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "700",
  },
  contributionCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: Spacing.MD,
    marginBottom: Spacing.MD,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    minHeight: 90,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  contributionTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  contributionCampaign: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textDark,
  },
  contributionDate: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  contributionAmount: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.secondary,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  statusText: { fontSize: 11, fontWeight: "700" },
  txIdText: { fontSize: 11, color: colors.textLight, fontWeight: "500" },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    gap: 12,
  },
  emptyText: {
    color: colors.textLight,
    fontSize: 14,
    textAlign: "center",
    fontFamily: "Poppins-Medium",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fafafa",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: Spacing.LG,
    paddingBottom: 20,
    maxHeight: "95%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
    gap: 12,
  },
  modalTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 20,
    color: colors.textDark,
    fontWeight: "700",
  },
  modalSubtitle: { fontSize: 13, color: colors.textLight, marginTop: 2 },
  accountBox: {
    backgroundColor: "#f8fafc",
    padding: Spacing.MD,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 20,
  },
  accountHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  accountHeaderText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary,
  },
  accountText: { fontSize: 13, color: colors.textDark, marginBottom: 2 },
  formGroup: { marginBottom: 6 },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textDark,
    marginBottom: 4,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    fontSize: 14,
    color: colors.textDark,
  },
  textArea: { minHeight: 80, textAlignVertical: "top" },
  imagePicker: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderStyle: "dashed",
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  pickerContent: { alignItems: "center", gap: 8 },
  pickerText: { fontSize: 12, color: colors.textLight, fontWeight: "500" },
  screenshotPreview: { width: "100%", height: "100%", borderRadius: 12 },
  previewImage: { width: "100%", height: "100%", borderRadius: 12 },
  removeImageBtn: {
    position: "absolute",
    right: 8,
    top: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 4,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "700",
  },
});
