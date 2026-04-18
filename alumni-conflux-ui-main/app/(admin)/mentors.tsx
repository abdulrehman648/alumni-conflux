import { useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { FontSizes, Spacing } from "../../constants/theme";
import NestedScreenHeader from "../../src/components/NestedScreenHeader";

export default function AdminMentors() {
  const router = useRouter();

  const mentors = [
    { id: "1", name: "Ali Khan", field: "AI" },
    { id: "2", name: "Usman Ali", field: "Frontend" },
  ];

  return (
    <View style={styles.container}>
      <NestedScreenHeader
        title="Mentors"
        subtitle="Manage platform mentors"
        onBack={() => router.back()}
      />

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
  row: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 3,
  },

  name: { fontWeight: "bold" },

  actions: { flexDirection: "row" },

  editBtn: {
    backgroundColor: "#0F4C4F",
    padding: 8,
    borderRadius: 8,
    marginRight: 8,
  },

  deleteBtn: {
    backgroundColor: "red",
    padding: 8,
    borderRadius: 8,
  },

  btnText: { color: "white", fontSize: 12 },
});
