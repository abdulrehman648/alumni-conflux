import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { TouchableOpacity } from "react-native";

export default function AdminLayout() {
  const router = useRouter();

  return (
    <Drawer
      screenOptions={{
        headerStyle: { backgroundColor: "#0F4C4F" },
        headerTintColor: "#F4EAD8",

        headerRight: () => (
          <TouchableOpacity
            onPress={() => router.push("/(admin)/profile")}
            style={{ marginRight: 15 }}
          >
            <Ionicons name="person-circle" size={28} color="#F4EAD8" />
          </TouchableOpacity>
        ),
      }}
    >
      <Drawer.Screen name="index" options={{ title: "Home" }} />
      <Drawer.Screen name="users" options={{ title: "Users" }} />
      <Drawer.Screen name="mentors" options={{ title: "Mentors" }} />
      <Drawer.Screen name="events" options={{ title: "Events" }} />
      <Drawer.Screen name="profile" options={{ title: "Profile" }} />
    </Drawer>
  );
}
