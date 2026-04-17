import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useEffect, useState } from "react";
import { FontSizes, Spacing } from "../../constants/theme";
import { useAuth } from "../../src/context/AuthContext";
import { mentorshipService } from "../../src/services/api";
import colors from "../../src/theme/colors";
import Toast from "react-native-toast-message";

type SentRequest = {
  id: number;
  requesterId: number;
  requesterName: string;
  mentorId: number;
  mentorName: string;
  status: string;
  message: string;
  createdAt: string;
};

export default function MySessions() {
  const router = useRouter();
  const { userId } = useAuth();
  const [requests, setRequests] = useState<SentRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSentRequests();
  }, [userId]);

  const fetchSentRequests = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const data = await mentorshipService.getSentRequests(Number(userId));
      setRequests(data);
    } catch (error) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to fetch sessions/requests",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return "green";
      case "REJECTED":
        return "red";
      default:
        return "#0F4C4F";
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ChevronLeft size={18} color={colors.textDark} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Mentorship Requests</Text>
        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0F4C4F" />
        </View>
      ) : requests.length === 0 ? (
        <Text style={styles.empty}>No mentorship requests sent yet.</Text>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.name}>{item.mentorName}</Text>
              <Text style={styles.details}>
                Status:{" "}
                <Text
                  style={{
                    color: getStatusColor(item.status),
                    fontWeight: "bold",
                  }}
                >
                  {item.status}
                </Text>
              </Text>
              <Text style={styles.details}>Message: {item.message}</Text>
              <Text style={styles.date}>
                Requested on: {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: Spacing.LG,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
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
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: {
    fontSize: FontSizes.Base,
    textAlign: "center",
    marginTop: 50,
    color: colors.textLight,
    fontFamily: "Poppins-Regular",
  },
  card: {
    backgroundColor: colors.card,
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 5,
  },
  details: { fontSize: 14, marginTop: 4, color: "#333" },
  date: { fontSize: 12, marginTop: 8, color: "#666", fontStyle: "italic" },
});
