import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity
} from "react-native";
import { FontSizes, Spacing } from "../../constants/theme";

export default function AdminMentors() {
  const router = useRouter();

  const mentors = [
    { id: "1", name: "Ali Khan", field: "AI" },
    { id: "2", name: "Usman Ali", field: "Frontend" },
  ];

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
          <Text style={styles.headerTitle}>Mentors</Text>
          <Text style={styles.headerSubtitle}>
            Manage platform mentors
          </Text>
        </View>
      </View>

      <FlatList
        data={mentors}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (

          <View style={styles.row}>

            <View>
              <Text style={styles.name}>{item.name}</Text>
              <Text>{item.field}</Text>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity style={styles.editBtn}>
                <Text style={styles.btnText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.deleteBtn}>
                <Text style={styles.btnText}>Delete</Text>
              </TouchableOpacity>
            </View>

          </View>

        )}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4EAD8" },
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

  row: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 3
  },

  name: { fontWeight: "bold" },

  actions: { flexDirection: "row" },

  editBtn: {
    backgroundColor: "#0F4C4F",
    padding: 8,
    borderRadius: 8,
    marginRight: 8
  },

  deleteBtn: {
    backgroundColor: "red",
    padding: 8,
    borderRadius: 8
  },

  btnText: { color: "white", fontSize: 12 }
});