import { View, Text, StyleSheet, FlatList } from "react-native";

export default function AdminEvents() {
  const events = [
    { id: "1", title: "Webinar on React", date: "2026-03-25" },
    { id: "2", title: "AI Workshop", date: "2026-04-01" },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Events</Text>
      <FlatList
        data={events}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.title}</Text>
            <Text>Date: {item.date}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20, color: "#0F4C4F" },
  card: { backgroundColor: "white", padding: 15, borderRadius: 10, marginBottom: 15 },
  name: { fontWeight: "bold", fontSize: 16 }
});