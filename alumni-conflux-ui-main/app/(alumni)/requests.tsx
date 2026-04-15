import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from "react-native";
import { FontSizes, Spacing } from "../../constants/theme";
import { mentorshipService } from "../../src/services/api";
import { useAuth } from "../../src/context/AuthContext";
import Toast from "react-native-toast-message";

type MentorshipRequest = {
  id: number;
  requesterId: number;
  requesterName: string;
  mentorId: number;
  mentorName: string;
  status: string;
  message: string;
  createdAt: string;
};

export default function Requests() {
  const router = useRouter();
  const { userId } = useAuth();
  const [requests, setRequests] = useState<MentorshipRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, [userId]);

  const fetchRequests = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const data = await mentorshipService.getReceivedRequests(Number(userId));
      setRequests(data);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load requests' });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (requestId: number, newStatus: string) => {
    if (!userId) return;
    try {
      await mentorshipService.updateRequestStatus(requestId, Number(userId), newStatus);
      Toast.show({ type: 'success', text1: 'Status Updated', text2: `Request ${newStatus.toLowerCase()}` });
      // Refresh the list
      fetchRequests();
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to update request status' });
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
          <ChevronLeft size={24} color="#F4EAD8" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Session Requests</Text>
          <Text style={styles.headerSubtitle}>
            Manage mentoring requests
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0F4C4F" />
        </View>
      ) : requests.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No mentorship requests received.</Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 15 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.name}>{item.requesterName}</Text>
              <Text style={styles.topic}>Message: {item.message}</Text>
              <Text style={styles.status}>Status: {item.status}</Text>

              {item.status === 'PENDING' && (
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.accept}
                    onPress={() => handleAction(item.id, 'ACCEPTED')}
                  >
                    <Text style={styles.btnText}>Accept</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.reject}
                    onPress={() => handleAction(item.id, 'REJECTED')}
                  >
                    <Text style={styles.btnText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              )}
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
    backgroundColor: "#F4EAD8"
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.LG,
    paddingTop: 50,
    paddingBottom: Spacing.XL,
    gap: Spacing.MD,
    backgroundColor: "#0F4C4F",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(244, 234, 216, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(244, 234, 216, 0.3)",
  },
  headerContent: { flex: 1 },
  headerTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 22,
    color: "#F4EAD8",
    fontWeight: "700",
  },
  headerSubtitle: {
    fontFamily: "Poppins-Regular",
    fontSize: 13,
    color: "rgba(244, 234, 216, 0.8)",
    marginTop: 4,
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginBottom: 12,
    elevation: 3
  },

  name: {
    fontWeight: "bold",
    fontSize: 16
  },

  topic: {
    marginTop: 5,
    color: "#555"
  },

  status: {
    marginTop: 5,
    fontWeight: "bold",
    color: "#0F4C4F"
  },

  actions: {
    flexDirection: "row",
    marginTop: 10
  },

  accept: {
    backgroundColor: "green",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 10
  },

  reject: {
    backgroundColor: "red",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold"
  },
  emptyText: {
    fontSize: 16,
    color: "#555"
  }
});