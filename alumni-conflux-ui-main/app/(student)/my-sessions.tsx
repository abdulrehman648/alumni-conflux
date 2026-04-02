import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useBooking } from "../../src/context/BookingContext";

export default function MySessions() {
  const { bookings, cancelBooking } = useBooking();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Booked Sessions</Text>

      {bookings.length === 0 ? (
        <Text style={styles.empty}>No sessions booked yet.</Text>
      ) : (
        <FlatList
          data={bookings}
         keyExtractor={(_, index) => index.toString()}
          renderItem={({ item , index }) => (
            <View style={styles.card}>
              <Text style={styles.name}>{item.mentorName}</Text>
              <Text style={styles.details}>Date: {item.date}</Text>
              <Text style={styles.details}>Time: {item.time}</Text>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => cancelBooking(index)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  empty: { fontSize: 16, textAlign: "center", marginTop: 50 },
  card: {
    backgroundColor: "#f3f3f3",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  name: { fontSize: 18, fontWeight: "bold" },
  details: { fontSize: 14, marginTop: 4 },
  cancelButton: {
    backgroundColor: "red",
    padding: 8,
    borderRadius: 6,
    marginTop: 10,
    alignSelf: "flex-start",
  },
  cancelText: { color: "white" },
});
