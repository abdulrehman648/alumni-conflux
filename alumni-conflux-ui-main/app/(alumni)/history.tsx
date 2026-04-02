import { View, Text, StyleSheet, FlatList } from "react-native";

export default function History() {

  const sessions = [
    { id: "1", student: "Ali", date: "Mon, 10 AM" },
    { id: "2", student: "Ahmed", date: "Tue, 3 PM" },
  ];

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Session History</Text>

      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (

          <View style={styles.card}>
            <Text style={styles.name}>{item.student}</Text>
            <Text>{item.date}</Text>
          </View>

        )}
      />

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F4EAD8"
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15
  },

  card: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    elevation: 3
  },

  name: {
    fontWeight: "bold"
  }

});