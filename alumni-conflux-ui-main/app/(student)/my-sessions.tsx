import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator
} from "react-native";
import { useEffect, useState } from "react";
import { useAuth } from "../../src/context/AuthContext";
import { mentorshipService } from "../../src/services/api";
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
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to fetch sessions/requests' });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACCEPTED": return "green";
      case "REJECTED": return "red";
      default: return "#0F4C4F";
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Mentorship Requests</Text>

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
              <Text style={styles.details}>Status: <Text style={{ color: getStatusColor(item.status), fontWeight: 'bold' }}>{item.status}</Text></Text>
              <Text style={styles.details}>Message: {item.message}</Text>
              <Text style={styles.date}>Requested on: {new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  empty: { fontSize: 16, textAlign: "center", marginTop: 50 },
  card: {
    backgroundColor: "#f3f3f3",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  name: { fontSize: 18, fontWeight: "bold", color: '#0F4C4F', marginBottom: 5 },
  details: { fontSize: 14, marginTop: 4, color: '#333' },
  date: { fontSize: 12, marginTop: 8, color: '#666', fontStyle: 'italic' },
});
