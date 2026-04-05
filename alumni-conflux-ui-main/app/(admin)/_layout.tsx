import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";

export default function AdminLayout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#0F4C4F" },
        headerTintColor: "#F4EAD8",
        headerShown: true,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: "#fff" },
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
      <Stack.Screen
        name="index"
        options={{ title: "Dashboard", headerShown: false }}
      />
      <Stack.Screen name="users" options={{ title: "Users" }} />
      <Stack.Screen name="mentors" options={{ title: "Mentors" }} />
      <Stack.Screen name="events" options={{ title: "Events" }} />
      <Stack.Screen name="donations" options={{ title: "Donations" }} />
      <Stack.Screen name="profile" options={{ title: "Profile" }} />
    </Stack>
  );
}
