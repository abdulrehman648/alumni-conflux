import { useRouter } from "expo-router";
import {
  Calendar,
  ChevronLeft,
  Clock,
  MapPin,
  Search,
  Users,
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
import { eventsService } from "../../src/services/api";
import { useAuth } from "../../src/context/AuthContext";

export default function EventsScreen() {
  const router = useRouter();
  const { userId } = useAuth();
  const [search, setSearch] = useState("");
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [registeredEvents, setRegisteredEvents] = useState<number[]>([]);

  const filteredEvents = events.filter((event) => {
    const query = search.toLowerCase();
    return (
      event.title?.toLowerCase().includes(query) ||
      event.location?.toLowerCase().includes(query) ||
      event.targetAudience?.toLowerCase().includes(query)
    );
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
        topOffset: 50,
      });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Registration Failed",
        text2: error.response?.data?.message || "Could not register for event",
      });
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
          <ChevronLeft size={18} color={colors.textDark} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upcoming Events</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={20} color={colors.textLight} strokeWidth={1.5} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search events"
          placeholderTextColor={colors.textLight}
          value={search}
          onChangeText={setSearch}
        />
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
        ) : filteredEvents.length > 0 ? (
          filteredEvents.map((event) => {
            const isRegistered = registeredEvents.includes(event.id);
            return (
              <TouchableOpacity key={event.id} style={styles.eventCard}>
                {/* Top Section - Category & Date */}
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

                {/* Title */}
                <Text style={styles.eventTitle}>{event.title}</Text>

                {/* Details */}
                <View style={styles.eventDetails}>
                  {/* Time */}
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

                  {/* Location */}
                  <View style={styles.detailRow}>
                    <MapPin
                      size={14}
                      color={colors.textLight}
                      strokeWidth={1.5}
                    />
                    <Text style={styles.detailText}>{event.location}</Text>
                  </View>

                  {/* Attendees */}
                  <View style={styles.detailRow}>
                    <Users
                      size={14}
                      color={colors.textLight}
                      strokeWidth={1.5}
                    />
                    <Text style={styles.detailText}>
                      {event.currentAttendees || 0} attending
                    </Text>
                  </View>
                </View>

                {/* Register Button */}
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
                    {isRegistered ? "Registered" : "Register Now"}
                  </Text>
                </TouchableOpacity>
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
    paddingHorizontal: Spacing.MD,
    paddingTop: Spacing.MD,
    paddingBottom: Spacing.MD,
  },

  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  headerSpacer: {
    width: 36,
    height: 36,
  },

  headerTitle: {
    flex: 1,
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.LG,
    fontWeight: "600",
    color: colors.textDark,
    textAlign: "center",
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: Spacing.LG,
    marginBottom: Spacing.LG,
    paddingHorizontal: Spacing.MD,
    backgroundColor: colors.card,
    borderRadius: 12,
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
    fontWeight: "400",
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
    fontWeight: "600",
    color: colors.primary,
  },

  eventTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.Base,
    fontWeight: "600",
    color: colors.textDark,
    marginVertical: Spacing.SM,
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
    fontWeight: "400",
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
    fontWeight: "600",
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
    fontWeight: "600",
    color: colors.textDark,
    marginTop: Spacing.MD,
  },
});
