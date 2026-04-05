import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";
import { useAuth } from "../../src/context/AuthContext";

export default function AlumniLayout() {
  const router = useRouter();
  const { profileComplete } = useAuth();

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
            onPress={() => router.push("/(alumni)/profile")}
            style={{ marginRight: 15 }}
          >
            <Ionicons name="person-circle-outline" size={28} color="#F4EAD8" />
          </TouchableOpacity>
        ),
      }}
    >
      <Stack.Screen
        name="index"
        options={{ title: "Home", headerShown: false }}
      />
      <Stack.Screen name="profile" options={{ title: "Profile" }} />
      <Stack.Screen name="availability" options={{ title: "Availability" }} />
      <Stack.Screen name="requests" options={{ title: "Requests" }} />
      <Stack.Screen name="events" options={{ title: "Events" }} />
      <Stack.Screen name="jobs" options={{ title: "Jobs" }} />
      <Stack.Screen name="history" options={{ title: "History" }} />
      <Stack.Screen name="donations" options={{ title: "Donations", headerShown: false }} />
    </Stack>
  );
}
