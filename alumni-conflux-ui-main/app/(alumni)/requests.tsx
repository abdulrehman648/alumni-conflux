import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert
} from "react-native";
import { FontSizes, Spacing } from "../../constants/theme";

type Request = {
  id: string;
  student: string;
  topic: string;
};

export default function Requests() {
  const router = useRouter();

  const requests: Request[] = [
    { id: "1", student: "Ali", topic: "React Help" },
    { id: "2", student: "Ahmed", topic: "AI Guidance" },
  ];

  const handleAction = (type: string, name: string) => {
    Alert.alert(type, `${name} request ${type}`);
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

      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        renderItem={({ item }: { item: Request }) => (

          <View style={styles.card}>

            <Text style={styles.name}>{item.student}</Text>
            <Text style={styles.topic}>{item.topic}</Text>

            <View style={styles.actions}>

              <TouchableOpacity
                style={styles.accept}
                onPress={() => handleAction("Accepted", item.student)}
              >
                <Text style={styles.btnText}>Accept</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.reject}
                onPress={() => handleAction("Rejected", item.student)}
              >
                <Text style={styles.btnText}>Reject</Text>
              </TouchableOpacity>

            </View>

          </View>

        )}
      />

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F4EAD8"
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
  }

});