import { useRouter } from "expo-router";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  X,
  Check,
  XCircle,
  Edit2,
} from "lucide-react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { FontSizes, Spacing } from "../../constants/theme";
import FloatingAddButton from "../../src/components/FloatingAddButton";
import NestedScreenHeader from "../../src/components/NestedScreenHeader";
import SegmentedControl from "../../src/components/SegmentedControl";
import colors from "../../src/theme/colors";
import { eventsService } from "../../src/services/api";
import { useAuth } from "../../src/context/AuthContext";

export default function AdminEventsScreen() {
  const router = useRouter();
  const { userId } = useAuth();
  const [pendingEvents, setPendingEvents] = useState<any[]>([]);
  const [approvedEvents, setApprovedEvents] = useState<any[]>([]);
  const [myEvents, setMyEvents] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState<
    "pending" | "approved" | "myEvents"
  >("pending");
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);

  // Edit Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [location, setLocation] = useState("");
  const [targetAudience, setTargetAudience] = useState("ALL");
  const [submitting, setSubmitting] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const pending = await eventsService.getPending();
      setPendingEvents(pending);

      // Also fetch approved events to show total view
      const available = await eventsService.getAll(Number(userId));
      setApprovedEvents(available);

      const created = await eventsService.getEventsCreatedByUser(
        Number(userId),
      );
      setMyEvents(created);
    } catch (error) {
      console.error("Fetch admin events error:", error);
      Alert.alert("Error", "Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (event: any) => {
    setIsCreateMode(false);
    setSelectedEvent(event);
    setTitle(event.title);
    setDescription(event.description);
    setEventDate(event.eventDate);
    setLocation(event.location || "");
    setTargetAudience(event.targetAudience || "ALL");
    setTempDate(event.eventDate ? new Date(event.eventDate) : new Date());
    setModalVisible(true);
  };

  const handleOpenCreate = () => {
    setIsCreateMode(true);
    setSelectedEvent(null);
    setTitle("");
    setDescription("");
    setLocation("");
    setTargetAudience("ALL");
    const now = new Date();
    setTempDate(now);
    setEventDate(formatDateTime(now));
    setModalVisible(true);
  };

  const handleCreateEvent = async () => {
    if (
      !title.trim() ||
      !description.trim() ||
      !location.trim() ||
      !eventDate
    ) {
      Alert.alert(
        "Missing Details",
        "Title, description, location, and date are required"
      );
      return;
    }

    setSubmitting(true);
    try {
      await eventsService.request(Number(userId), {
        title: title.trim(),
        description: description.trim(),
        eventDate,
        location: location.trim(),
        targetAudience,
      });

      Alert.alert(
        "Event Created",
        "Your event request has been submitted"
      );
      setModalVisible(false);
      setActiveFilter("myEvents");
      fetchEvents();
    } catch (error: any) {
      Alert.alert(
        "Create Failed",
        error.response?.data?.message || "Could not create event"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateAndApprove = async () => {
    if (!location) {
      Alert.alert(
        "Location Required",
        "Please allocate a location before approving"
      );
      return;
    }

    setSubmitting(true);
    try {
      // 1. Update event details (including location)
      await eventsService.updateEvent(selectedEvent.id, Number(userId), {
        title,
        description,
        eventDate,
        location,
        targetAudience,
      });

      // 2. Update status to APPROVED
      await eventsService.updateStatus(selectedEvent.id, "APPROVED");

      Alert.alert("Event Approved", "The event is now visible to students");
      setModalVisible(false);
      fetchEvents();
    } catch (error: any) {
      Alert.alert(
        "Action Failed",
        error.response?.data?.message || "Could not approve event"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (eventId: number) => {
    try {
      await eventsService.updateStatus(eventId, "REJECTED");
      Alert.alert("Event Rejected", "The request has been rejected");
      fetchEvents();
    } catch (error: any) {
      Alert.alert(
        "Action Failed",
        error.response?.data?.message || "Could not reject event"
      );
    }
  };

  const formatDateTime = (date: Date) => {
    const pad = (num: number) => num.toString().padStart(2, "0");
    const yyyy = date.getFullYear();
    const mm = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const hh = pad(date.getHours());
    const min = pad(date.getMinutes());
    const ss = pad(date.getSeconds());
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
  };

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === "android") setShowDatePicker(false);
    if (selectedDate) {
      setTempDate(selectedDate);
      if (Platform.OS === "android") setShowTimePicker(true);
    }
  };

  const onTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const finalDate = new Date(tempDate);
      finalDate.setHours(selectedTime.getHours());
      finalDate.setMinutes(selectedTime.getMinutes());
      setTempDate(finalDate);
      setEventDate(formatDateTime(finalDate));
    }
  };

  const eventFilterOptions = [
    { value: "pending" as const, label: `Pending (${pendingEvents.length})` },
    {
      value: "approved" as const,
      label: `All Events (${approvedEvents.length})`,
    },
    { value: "myEvents" as const, label: `My Events (${myEvents.length})` },
  ];

  return (
    <View style={styles.container}>
      <NestedScreenHeader title="Manage Events" onBack={() => router.back()} />

      <ScrollView
        style={styles.listContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        <SegmentedControl
          options={eventFilterOptions}
          value={activeFilter}
          onChange={setActiveFilter}
          containerStyle={styles.segmentedControlWrap}
        />

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : activeFilter === "pending" ? (
          pendingEvents.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>Pending Requests</Text>
              {pendingEvents.map((event) => (
                <View
                  key={event.id}
                  style={[styles.eventCard, styles.pendingCard]}
                >
                  <View style={styles.eventTop}>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryText}>
                        {event.targetAudience || "ALL"}
                      </Text>
                    </View>
                    <Text style={styles.pendingText}>PENDING</Text>
                  </View>

                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.creatorText}>
                    Requested by: {event.creatorName}
                  </Text>

                  <View style={styles.eventDetails}>
                    <View style={styles.detailRow}>
                      <Calendar
                        size={14}
                        color={colors.textLight}
                        strokeWidth={1.5}
                      />
                      <Text style={styles.detailText}>
                        {new Date(event.eventDate).toLocaleString()}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <MapPin
                        size={14}
                        color={colors.textLight}
                        strokeWidth={1.5}
                      />
                      <Text style={styles.detailText}>
                        {event.location || "Location not allocated"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.approveButton]}
                      onPress={() => handleOpenEdit(event)}
                    >
                      <Check size={18} color={colors.white} />
                      <Text style={styles.actionButtonText}>
                        Edit & Approve
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButton, styles.rejectButton]}
                      onPress={() => handleReject(event.id)}
                    >
                      <XCircle size={18} color={colors.white} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </>
          ) : (
            <View style={styles.emptyState}>
              <Clock size={44} color={colors.textLight} strokeWidth={1.2} />
              <Text style={styles.emptyStateText}>No event requests</Text>
            </View>
          )
        ) : activeFilter === "approved" ? (
          approvedEvents.length > 0 ? (
            <>
              {approvedEvents.map((event) => (
                <View key={event.id} style={styles.eventCard}>
                  <View style={styles.eventTop}>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryText}>
                        {event.targetAudience || "ALL"}
                      </Text>
                    </View>
                    <View style={styles.approvedBadge}>
                      <Check size={12} color={colors.success} />
                      <Text style={styles.approvedText}>Live</Text>
                    </View>
                  </View>

                  <Text style={styles.eventTitle}>{event.title}</Text>

                  <View style={styles.eventDetails}>
                    <View style={styles.detailRow}>
                      <MapPin
                        size={14}
                        color={colors.textLight}
                        strokeWidth={1.5}
                      />
                      <Text style={styles.detailText}>{event.location}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Users
                        size={14}
                        color={colors.textLight}
                        strokeWidth={1.5}
                      />
                      <Text style={styles.detailText}>
                        {event.attendeeCount || 0} registered
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </>
          ) : (
            <View style={styles.emptyState}>
              <Calendar size={48} color={colors.textLight} strokeWidth={1} />
              <Text style={styles.emptyStateText}>No approved events yet</Text>
            </View>
          )
        ) : myEvents.length > 0 ? (
          <>
            {myEvents.map((event) => (
              <View key={event.id} style={styles.eventCard}>
                <View style={styles.eventTop}>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>
                      {event.targetAudience || "ALL"}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      event.status === "APPROVED"
                        ? styles.statusApproved
                        : event.status === "REJECTED"
                          ? styles.statusRejected
                          : styles.statusPending,
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {event.status || "PENDING"}
                    </Text>
                  </View>
                </View>

                <Text style={styles.eventTitle}>{event.title}</Text>

                <View style={styles.eventDetails}>
                  <View style={styles.detailRow}>
                    <Calendar
                      size={14}
                      color={colors.textLight}
                      strokeWidth={1.5}
                    />
                    <Text style={styles.detailText}>
                      {event.eventDate
                        ? new Date(event.eventDate).toLocaleString()
                        : "Date not set"}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <MapPin
                      size={14}
                      color={colors.textLight}
                      strokeWidth={1.5}
                    />
                    <Text style={styles.detailText}>
                      {event.location || "Location not allocated"}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Calendar size={48} color={colors.textLight} strokeWidth={1} />
            <Text style={styles.emptyStateText}>No events created yet</Text>
          </View>
        )}
      </ScrollView>

      <FloatingAddButton onPress={handleOpenCreate} />

      {/* Edit & Approve Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isCreateMode ? "Create Event" : "Manage Event"}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color={colors.textDark} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Event Title</Text>
                <TextInput
                  style={styles.input}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Event title"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  multiline
                  numberOfLines={4}
                  value={description}
                  onChangeText={setDescription}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Allocate Location (Required)</Text>
                <TextInput
                  style={[
                    styles.input,
                    { borderColor: location ? colors.border : colors.danger },
                  ]}
                  placeholder="e.g. Auditorium, Room 302, or Online Link"
                  value={location}
                  onChangeText={setLocation}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Date & Time</Text>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.datePickerText}>
                    {eventDate ? eventDate.replace("T", " ") : "Select Date"}
                  </Text>
                  <Edit2 size={16} color={colors.primary} />
                </TouchableOpacity>
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={tempDate}
                  mode="date"
                  onChange={onDateChange}
                />
              )}

              {showTimePicker && (
                <DateTimePicker
                  value={tempDate}
                  mode="time"
                  onChange={onTimeChange}
                />
              )}

              <TouchableOpacity
                style={styles.submitButton}
                onPress={
                  isCreateMode ? handleCreateEvent : handleUpdateAndApprove
                }
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {isCreateMode ? "Create Event" : "Update & Approve Event"}
                  </Text>
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
  listContainer: { flex: 1 },
  listContent: {
    padding: Spacing.LG,
    gap: Spacing.MD,
    paddingBottom: Spacing.XXXL + 80,
  },
  segmentedControlWrap: {
    marginTop: Spacing.SM,
    marginBottom: Spacing.SM,
  },
  sectionTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.Base,
    color: colors.textDark,
    marginBottom: Spacing.SM,
  },
  eventCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: Spacing.MD,
    borderWidth: 1,
    borderColor: colors.border,
    gap: Spacing.SM,
    marginBottom: Spacing.MD,
  },
  pendingCard: {
    borderColor: "#f59e0b",
    borderLeftWidth: 4,
  },
  eventTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryBadge: {
    backgroundColor: colors.background,
    paddingHorizontal: Spacing.SM,
    paddingVertical: Spacing.XS,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "bold",
    color: colors.primary,
  },
  pendingText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#f59e0b",
  },
  approvedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  approvedText: {
    fontSize: 10,
    fontWeight: "bold",
    color: colors.success,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusPending: {
    backgroundColor: "#fff7ed",
  },
  statusApproved: {
    backgroundColor: "#ecfdf5",
  },
  statusRejected: {
    backgroundColor: "#fef2f2",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.textDark,
  },
  eventTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.Base,
    color: colors.textDark,
  },
  creatorText: {
    fontSize: 12,
    color: colors.textSecondary || "#666",
    fontStyle: "italic",
  },
  eventDetails: { gap: 4, marginTop: 4 },
  detailRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  detailText: { fontSize: 12, color: colors.textLight },
  actionRow: {
    flexDirection: "row",
    gap: Spacing.SM,
    marginTop: Spacing.MD,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  approveButton: {
    backgroundColor: colors.success,
    flex: 1,
  },
  rejectButton: {
    backgroundColor: colors.danger,
    width: 44,
  },
  actionButtonText: {
    color: colors.white,
    fontWeight: "bold",
    fontSize: 14,
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
  formGroup: { marginBottom: Spacing.MD },
  label: {
    fontFamily: "Poppins-Medium",
    fontSize: FontSizes.SM,
    color: colors.textDark,
    marginBottom: 4,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: Spacing.MD,
    fontSize: 14,
    color: colors.textDark,
  },
  textArea: { minHeight: 80, textAlignVertical: "top" },
  datePickerButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: Spacing.MD,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  datePickerText: { fontSize: 14, color: colors.textDark },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: Spacing.MD,
    borderRadius: 12,
    alignItems: "center",
    marginTop: Spacing.LG,
    marginBottom: 30,
  },
  submitButtonText: {
    color: colors.white,
    fontWeight: "bold",
    fontSize: 16,
  },
  emptyState: { alignItems: "center", padding: 40, gap: 10 },
  emptyStateText: { color: colors.textLight },
});
