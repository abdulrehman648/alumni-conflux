import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { FontSizes, Spacing } from "../../constants/theme";
import { useBooking } from "../../src/context/BookingContext";
import colors from "../../src/theme/colors";

export default function Bookings() {
  const router = useRouter();

  const { bookings } = useBooking();

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ChevronLeft size={18} color={colors.textDark} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Sessions</Text>
        <View style={styles.headerSpacer} />
      </View>

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

  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: Spacing.MD,
    paddingBottom: Spacing.MD,
  },

  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  headerSpacer: {
    width: 36,
    height: 36,
  },

  headerTitle: {
    flex: 1,
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.LG,
    fontWeight: "600",
    color: colors.textDark,
    textAlign: "center",
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
