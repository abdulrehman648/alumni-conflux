import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity
} from "react-native";

export default function AdminMentors() {

  const mentors = [
    { id: "1", name: "Ali Khan", field: "AI" },
    { id: "2", name: "Usman Ali", field: "Frontend" },
  ];

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Mentors</Text>

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
  container: { flex: 1, padding: 20, backgroundColor: "#F4EAD8" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },

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