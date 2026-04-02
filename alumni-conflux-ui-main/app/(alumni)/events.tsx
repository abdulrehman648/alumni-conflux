import { useRouter } from "expo-router";
import { 
  Calendar, 
  ChevronLeft, 
  Clock, 
  MapPin, 
  Plus, 
  Users,
  X 
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
  const [location, setLocation] = useState("");
  const [targetAudience, setTargetAudience] = useState("ALL");
  const [submitting, setSubmitting] = useState(false);

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
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to fetch events",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId: number, eventTitle: string) => {
    if (!userId) return;

    try {
      await eventsService.register(eventId, Number(userId));
      setRegisteredEvents([...registeredEvents, eventId]);
      Toast.show({
        type: "success",
        text1: "Registered!",
        text2: `You are registered for ${eventTitle}`,
      });
      fetchEvents(); // Refresh to update attendee count
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Registration Failed",
        text2: error.response?.data?.message || "Could not register for event",
      });
    }
  };

  const handleCreateRequest = async () => {
    if (!title || !description || !eventDate || !location) {
      Toast.show({
        type: "error",
        text1: "Missing Fields",
        text2: "Please fill in all fields",
      });
      return;
    }

    setSubmitting(true);
    try {
      await eventsService.request(Number(userId), {
        title,
        description,
        eventDate, // Expects ISO format like "2026-05-20T19:00:00"
        location,
        targetAudience,
      });

      Toast.show({
        type: "success",
        text1: "Request Sent",
        text2: "Your event request has been submitted for admin approval",
      });
      setModalVisible(false);
      resetForm();
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Request Failed",
        text2: error.response?.data?.message || "Could not submit event request",
      });
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
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to fetch attendees",
      });
    } finally {
      setLoadingAttendees(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setEventDate("");
    setLocation("");
    setTargetAudience("ALL");
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.primary} strokeWidth={2} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Events</Text>
          <Text style={styles.headerSubtitle}>
            {loading ? "Loading..." : `${events.length} events available`}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Plus size={24} color={colors.white} strokeWidth={2} />
        </TouchableOpacity>
      </View>

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
                    <Text style={styles.categoryText}>{event.targetAudience || "ALL"}</Text>
                  </View>
                  <View style={styles.dateSection}>
                    <Calendar size={16} color={colors.primary} strokeWidth={1.5} />
                    <Text style={styles.eventDate}>
                      {new Date(event.eventDate).toLocaleDateString()}
                    </Text>
                  </View>
                </View>

                <Text style={styles.eventTitle}>{event.title}</Text>
                
                <View style={styles.eventDetails}>
                  <View style={styles.detailRow}>
                    <Clock size={14} color={colors.textLight} strokeWidth={1.5} />
                    <Text style={styles.detailText}>
                      {new Date(event.eventDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <MapPin size={14} color={colors.textLight} strokeWidth={1.5} />
                    <Text style={styles.detailText}>{event.location}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Users size={14} color={colors.textLight} strokeWidth={1.5} />
                    <Text style={styles.detailText}>{event.currentAttendees || 0} attending</Text>
                  </View>
                </View>

                {event.creatorUserId === Number(userId) ? (
                  <TouchableOpacity 
                    style={[styles.registerButton, { backgroundColor: colors.secondary || "#6366f1" }]}
                    onPress={() => handleViewAttendees(event)}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Users size={16} color={colors.white} />
                      <Text style={styles.registerText}>View Attendees</Text>
                    </View>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity 
                    style={[styles.registerButton, isRegistered && styles.registeredButton]}
                    onPress={() => handleRegister(event.id, event.title)}
                    disabled={isRegistered}
                  >
                    <Text style={[styles.registerText, isRegistered && styles.registeredText]}>
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
              <ActivityIndicator size="large" color={colors.primary} style={{ margin: 40 }} />
            ) : attendees.length > 0 ? (
              <ScrollView showsVerticalScrollIndicator={false}>
                {attendees.map((person) => (
                  <View key={person.id} style={styles.personCard}>
                    <View style={styles.personIcon}>
                      <Users size={20} color={colors.primary} />
                    </View>
                    <View style={styles.personInfo}>
                      <Text style={styles.personName}>{person.userName}</Text>
                      <Text style={styles.personDate}>Registered: {person.registrationDate}</Text>
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
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Request New Event</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color={colors.textDark} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Event Title</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Alumni Networking 2026"
                  value={title}
                  onChangeText={setTitle}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Tell us about the event..."
                  multiline
                  numberOfLines={4}
                  value={description}
                  onChangeText={setDescription}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Date & Time (YYYY-MM-DDTHH:MM:SS)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="2026-05-20T19:00:00"
                  value={eventDate}
                  onChangeText={setEventDate}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Location</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Main Hall or Zoom Link"
                  value={location}
                  onChangeText={setLocation}
                />
              </View>

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
                      <Text style={[
                        styles.chipText,
                        targetAudience === role && styles.activeChipText,
                      ]}>{role}</Text>
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
    fontWeight: "600",
    color: colors.textDark,
  },
  headerSubtitle: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.SM,
    fontWeight: "400",
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
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.LG,
    paddingBottom: Spacing.XXXL,
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
    backgroundColor: colors.primary,
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
    borderColor: colors.success,
  },
  registeredText: {
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
    backgroundColor: colors.primary,
    borderColor: colors.primary,
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
    backgroundColor: colors.primary,
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
    flexDirection: 'row',
    alignItems: 'center',
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
    alignItems: 'center',
    justifyContent: 'center',
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
