import { useRouter } from "expo-router";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { FontSizes, Spacing } from "../../constants/theme";
import NestedScreenHeader from "../../src/components/NestedScreenHeader";
import { useBooking } from "../../src/context/BookingContext";
import colors from "../../src/theme/colors";

export default function Bookings() {
  const router = useRouter();

  const { bookings } = useBooking();

  return (
    <View style={styles.container}>
      <NestedScreenHeader title="My Sessions" onBack={() => router.back()} />

      {bookings.length === 0 ? (
        <Text style={styles.empty}>No sessions booked yet</Text>
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
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: Spacing.LG,
  },

  empty: {
    fontFamily: "Poppins-Regular",
    color: colors.textLight,
    fontSize: FontSizes.Base,
    marginTop: Spacing.XL,
  },

  card: {
    backgroundColor: colors.card,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },

  name: {
    fontWeight: "bold",
    color: colors.textDark,
  },
});
