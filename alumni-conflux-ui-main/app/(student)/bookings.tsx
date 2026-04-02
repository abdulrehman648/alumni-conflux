import { View, Text, FlatList, StyleSheet } from "react-native";
import { useBooking } from "../../src/context/BookingContext";

export default function Bookings() {

  const { bookings } = useBooking();

  return (
    <View style={styles.container}>

      <Text style={styles.title}>My Sessions</Text>

      {bookings.length === 0 ? (
        <Text>No sessions booked yet</Text>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.name}>{item.mentorName}</Text>
              <Text>Date: {item.date}</Text>
              <Text>Time: {item.time}</Text>
            </View>
          )}
        />
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container:{
    flex:1,
    padding:20,
    backgroundColor:"#F4EAD8"
  },

  title:{
    fontSize:22,
    fontWeight:"bold",
    marginBottom:20
  },

  card:{
    backgroundColor:"white",
    padding:15,
    borderRadius:10,
    marginBottom:10
  },

  name:{
    fontWeight:"bold"
  }
});