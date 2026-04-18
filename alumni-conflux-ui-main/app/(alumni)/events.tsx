import { useRouter } from "expo-router";
import { Calendar, Clock, Edit2, MapPin, Users, X } from "lucide-react-native";
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
} from "react-native";
import { FontSizes, Spacing } from "../../constants/theme";
import FloatingAddButton from "../../src/components/FloatingAddButton";
import NestedScreenHeader from "../../src/components/NestedScreenHeader";
import colors from "../../src/theme/colors";
import { eventsService } from "../../src/services/api";
import { useAuth } from "../../src/context/AuthContext";

export default function AlumniEventsScreen() {
  const router = useRouter();
  const { userId } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [registeredEvents, setRegisteredEvents] = useState<number[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [attendeesModalVisible, setAttendeesModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [loadingAttendees, setLoadingAttendees] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [targetAudience, setTargetAudience] = useState("ALL");
  const [submitting, setSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());
  const [errors, setErrors] = useState({
    title: "",
    description: "",
    eventDate: "",
  });

  useEffect(() => {
    if (userId) {
      fetchEvents();
    }
  }, [userId]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await eventsService.getAll(Number(userId));
      setEvents(data);
    } catch (error) {
      console.error("Fetch events error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId: number, eventTitle: string) => {
    if (!userId) return;

    try {
      await eventsService.register(eventId, Number(userId));
      setRegisteredEvents([...registeredEvents, eventId]);
      fetchEvents(); // Refresh to update attendee count
    } catch (error: any) {}
  };

  const handleCreateRequest = async () => {
    const validationErrors = {
      title: title.trim() ? "" : "Event title is required",
      description: description.trim() ? "" : "Description is required",
      eventDate: eventDate.trim() ? "" : "Date & time is required",
    };

    setErrors(validationErrors);

    const hasErrors = Object.values(validationErrors).some(
      (error) => error !== "",
    );

    setSubmitting(true);
    try {
      await eventsService.request(Number(userId), {
        title: title.trim(),
        description: description.trim(),
        eventDate,
        targetAudience,
      });
      setModalVisible(false);
      resetForm();
    } catch (error: any) {
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewAttendees = async (event: any) => {
    setSelectedEvent(event);
    setAttendeesModalVisible(true);
    setLoadingAttendees(true);
    try {
      const data = await eventsService.getAttendees(event.id, Number(userId));
      setAttendees(data);
    } catch (error) {
      console.error("Fetch attendees error:", error);
    } finally {
      setLoadingAttendees(false);
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
    return `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}`;
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

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setEventDate("");
    setTargetAudience("ALL");
    setErrors({
      title: "",
      description: "",
      eventDate: "",
    });
    setShowDatePicker(false);
    setShowTimePicker(false);
    setTempDate(new Date());
  };

  const handleOpenRequestModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const handleCloseRequestModal = () => {
    setModalVisible(false);
    resetForm();
  };

  return (
    <View style={styles.container}>
      <NestedScreenHeader title="Events" onBack={() => router.back()} />

      {/* Events List */}
      <ScrollView
        style={styles.listContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {loading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : events.length > 0 ? (
          events.map((event) => {
            const isRegistered = registeredEvents.includes(event.id);
            return (
              <TouchableOpacity key={event.id} style={styles.eventCard}>
                <View style={styles.eventTop}>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>
                      {event.targetAudience || "ALL"}
                    </Text>
                  </View>
                  <View style={styles.dateSection}>
                    <Calendar
                      size={16}
                      color={colors.primary}
                      strokeWidth={1.5}
                    />
                    <Text style={styles.eventDate}>
                      {new Date(event.eventDate).toLocaleDateString()}
                    </Text>
                  </View>
                </View>

                <Text style={styles.eventTitle}>{event.title}</Text>

                <View style={styles.eventDetails}>
                  <View style={styles.detailRow}>
                    <Clock
                      size={14}
                      color={colors.textLight}
                      strokeWidth={1.5}
                    />
                    <Text style={styles.detailText}>
                      {new Date(event.eventDate).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <MapPin
                      size={14}
                      color={colors.textLight}
                      strokeWidth={1.5}
                    />
                    <Text style={styles.detailText}>{event.location}</Text>
                  </View>
                </View>

                {event.creatorUserId === Number(userId) ? (
                  <TouchableOpacity
                    style={[
                      styles.registerButton,
                      { backgroundColor: colors.secondary || "#6366f1" },
                    ]}
                    onPress={() => handleViewAttendees(event)}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Users size={16} color={colors.white} />
                      <Text style={styles.registerText}>View Attendees</Text>
                    </View>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[
                      styles.registerButton,
                      isRegistered && styles.registeredButton,
                    ]}
                    onPress={() => handleRegister(event.id, event.title)}
                    disabled={isRegistered}
                  >
                    <Text
                      style={[
                        styles.registerText,
                        isRegistered && styles.registeredText,
                      ]}
                    >
                      {isRegistered ? "Registered" : "Join Event"}
                    </Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <Calendar size={48} color={colors.textLight} strokeWidth={1} />
            <Text style={styles.emptyStateText}>No events found</Text>
          </View>
        )}
      </ScrollView>

      <FloatingAddButton onPress={handleOpenRequestModal} />

      {/* View Attendees Modal */}
      <Modal
        visible={attendeesModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAttendeesModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Attendees</Text>
                <Text style={styles.modalSubtitle}>{selectedEvent?.title}</Text>
              </View>
              <TouchableOpacity onPress={() => setAttendeesModalVisible(false)}>
                <X size={24} color={colors.textDark} />
              </TouchableOpacity>
            </View>

            {loadingAttendees ? (
              <ActivityIndicator
                size="large"
                color={colors.primary}
                style={{ margin: 40 }}
              />
            ) : attendees.length > 0 ? (
              <ScrollView showsVerticalScrollIndicator={false}>
                {attendees.map((person) => (
                  <View key={person.id} style={styles.personCard}>
                    <View style={styles.personIcon}>
                      <Users size={20} color={colors.primary} />
                    </View>
                    <View style={styles.personInfo}>
                      <Text style={styles.personName}>{person.userName}</Text>
                      <Text style={styles.personDate}>
                        Registered: {person.registrationDate}
                      </Text>
                    </View>
                  </View>
                ))}
                <View style={{ height: 40 }} />
              </ScrollView>
            ) : (
              <View style={styles.emptyState}>
                <Users size={48} color={colors.textLight} strokeWidth={1} />
                <Text style={styles.emptyStateText}>No attendees yet</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Create Request Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseRequestModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Request New Event</Text>
              <TouchableOpacity onPress={handleCloseRequestModal}>
                <X size={24} color={colors.textDark} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Event Title</Text>
                <TextInput
                  style={[styles.input, errors.title && styles.inputError]}
                  placeholder="e.g. Alumni Networking 2026"
                  value={title}
                  onChangeText={setTitle}
                />
                {errors.title ? (
                  <Text style={styles.errorText}>{errors.title}</Text>
                ) : null}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[
                    styles.input,
                    errors.description && styles.inputError,
                    styles.textArea,
                  ]}
                  placeholder="Tell us about the event..."
                  multiline
                  numberOfLines={4}
                  value={description}
                  onChangeText={setDescription}
                />
                {errors.description ? (
                  <Text style={styles.errorText}>{errors.description}</Text>
                ) : null}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Date & Time</Text>
                <TouchableOpacity
                  style={[
                    styles.datePickerButton,
                    errors.eventDate && styles.inputError,
                  ]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.datePickerText}>
                    {eventDate
                      ? eventDate.replace("T", " ")
                      : "Select Date & Time"}
                  </Text>
                  <Edit2 size={16} color={colors.primary} />
                </TouchableOpacity>
                {errors.eventDate ? (
                  <Text style={styles.errorText}>{errors.eventDate}</Text>
                ) : null}
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

              <View style={styles.formGroup}>
                <Text style={styles.label}>Target Audience</Text>
                <View style={styles.audienceContainer}>
                  {["ALL", "STUDENT", "ALUMNI"].map((role) => (
                    <TouchableOpacity
                      key={role}
                      style={[
                        styles.audienceChip,
                        targetAudience === role && styles.activeChip,
                      ]}
                      onPress={() => setTargetAudience(role)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          targetAudience === role && styles.activeChipText,
                        ]}
                      >
                        {role}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleCreateRequest}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.submitButtonText}>Submit Request</Text>
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
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.LG,
    paddingBottom: Spacing.XXXL + 80,
    gap: Spacing.MD,
  },
  eventCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: Spacing.MD,
    borderWidth: 1,
    borderColor: colors.border,
    gap: Spacing.MD,
  },
  eventTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  categoryBadge: {
    backgroundColor: colors.background,
    paddingHorizontal: Spacing.SM,
    paddingVertical: Spacing.XS,
    borderRadius: 8,
  },
  categoryText: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.XS,
    color: colors.primary,
  },
  dateSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.XS,
  },
  eventDate: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.SM,
    color: colors.primary,
  },
  eventTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.Base,
    color: colors.textDark,
  },
  eventDetails: {
    gap: Spacing.SM,
    paddingTop: Spacing.SM,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.SM,
  },
  detailText: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.XS,
    color: colors.textLight,
  },
  registerButton: {
    backgroundColor: colors.secondary,
    paddingVertical: Spacing.SM,
    borderRadius: 12,
    alignItems: "center",
    marginTop: Spacing.SM,
  },
  registerText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.SM,
    color: colors.white,
  },
  registeredButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  registeredText: {
    color: colors.secondary,
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
    marginBottom: Spacing.MD,
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
    borderColor: colors.danger,
  },
  errorText: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.XS,
    color: colors.danger,
    marginTop: Spacing.XS,
  },
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
  datePickerText: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.Base,
    color: colors.textDark,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  audienceContainer: {
    flexDirection: "row",
    gap: Spacing.SM,
  },
  audienceChip: {
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
  personCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.MD,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: Spacing.SM,
    gap: Spacing.MD,
  },
  personIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.Base,
    color: colors.textDark,
  },
  personDate: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.XS,
    color: colors.textLight,
  },
});
