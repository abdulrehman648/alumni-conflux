import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useState } from "react";

export default function Availability() {
  const [slots, setSlots] = useState(["10:00 AM", "12:00 PM", "3:00 PM", "6:00 PM"]);

  const handleToggle = (slot: string) => {
    Alert.alert("Slot Selected", `You selected ${slot}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set Your Availability</Text>
      {slots.map(slot => (
        <TouchableOpacity key={slot} style={styles.slot} onPress={() => handleToggle(slot)}>
          <Text style={styles.slotText}>{slot}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20, color: "#0F4C4F" },
  slot: { backgroundColor: "#0F4C4F", padding: 12, borderRadius: 8, marginBottom: 10 },
  slotText: { color: "white", textAlign: "center", fontWeight: "bold" }
});