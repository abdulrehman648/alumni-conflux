import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Switch } from "react-native";
import { useState, useEffect } from "react";
import { useAuth } from "../../src/context/AuthContext";
import { profileService, mentorshipService } from "../../src/services/api";
import { Ionicons } from "@expo/vector-icons";

export default function Availability() {
  const { userId } = useAuth();
  const [isAvailable, setIsAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchCurrentStatus();
  }, [userId]);

  const fetchCurrentStatus = async () => {
    if (!userId) return;
    try {
      const profile = await profileService.getAlumniProfile(parseInt(userId));
      setIsAvailable(profile.isAvailableForMentorship);
    } catch (error) {
      console.error("Failed to fetch alumni profile:", error);
      Alert.alert("Error", "Could not load your availability status.");
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async (value: boolean) => {
    if (!userId) return;
    setUpdating(true);
    try {
      await mentorshipService.updateAvailability(parseInt(userId), value);
      setIsAvailable(value);
      Alert.alert("Success", `Mentorship availability turned ${value ? "ON" : "OFF"}`);
    } catch (error) {
      console.error("Failed to update availability:", error);
      Alert.alert("Error", "Failed to update your availability. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0F4C4F" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="calendar-outline" size={32} color="#0F4C4F" />
        <Text style={styles.title}>Mentorship Availability</Text>
      </View>
      
      <View style={styles.card}>
        <View style={styles.infoRow}>
          <View style={styles.infoTextContainer}>
            <Text style={styles.label}>Open for Mentorship</Text>
            <Text style={styles.description}>
              When enabled, students will be able to see you in the mentors list and send you mentorship requests.
            </Text>
          </View>
          <Switch
            value={isAvailable}
            onValueChange={toggleAvailability}
            disabled={updating}
            trackColor={{ false: "#ccc", true: "#0F4C4F" }}
            thumbColor={isAvailable ? "#fff" : "#f4f3f4"}
          />
        </View>

        {updating && (
          <View style={styles.updatingOverlay}>
            <ActivityIndicator size="small" color="#0F4C4F" />
            <Text style={styles.updatingText}>Updating...</Text>
          </View>
        )}
      </View>

      <View style={styles.guidelinesCard}>
        <Text style={styles.guidelineTitle}>Mentor Guidelines</Text>
        <BulletItem text="Respond to requests within 48 hours." />
        <BulletItem text="Be clear about your availability for sessions." />
        <BulletItem text="Set expectations regarding call duration and frequency." />
      </View>
    </View>
  );
}

function BulletItem({ text }: { text: string }) {
  return (
    <View style={styles.bulletRow}>
      <Ionicons name="checkmark-circle" size={18} color="#0F4C4F" style={{ marginRight: 8 }} />
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F8F9FA" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 25 },
  title: { fontSize: 24, fontWeight: "bold", marginLeft: 10, color: "#0F4C4F" },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 20,
    position: "relative",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  infoTextContainer: { flex: 1, marginRight: 15 },
  label: { fontSize: 18, fontWeight: "600", color: "#333", marginBottom: 4 },
  description: { fontSize: 14, color: "#666", lineHeight: 20 },
  updatingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  updatingText: { marginLeft: 10, fontWeight: "500", color: "#0F4C4F" },
  guidelinesCard: {
    backgroundColor: "#E7F3F4",
    borderRadius: 16,
    padding: 20,
  },
  guidelineTitle: { fontSize: 18, fontWeight: "bold", color: "#0F4C4F", marginBottom: 15 },
  bulletRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 12 },
  bulletText: { fontSize: 15, color: "#444", flex: 1 },
});