import { View, Text, StyleSheet, FlatList } from "react-native";
import { useRouter } from "expo-router";
import NestedScreenHeader from "../../src/components/NestedScreenHeader";
import colors from "@/src/theme/colors";

export default function History() {
  const router = useRouter();

  const sessions = [
    { id: "1", student: "Ali", date: "Mon, 10 AM" },
    { id: "2", student: "Ahmed", date: "Tue, 3 PM" },
  ];

  return (
    <View style={styles.container}>
      <NestedScreenHeader
        title="Session History"
        onBack={() => router.back()}
      />

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
    backgroundColor: colors.background,
  },

  card: {
    backgroundColor: colors.white,
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    elevation: 3,
  },

  name: {
    fontWeight: "bold",
  },
});
