import { View, Text, StyleSheet } from "react-native";

export default function AdminProfile() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Profile</Text>
      <Text>Name: Admin</Text>
      <Text>Email: admin@gmail.com</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F4EAD8",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
  },
});