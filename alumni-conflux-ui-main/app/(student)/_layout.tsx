import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { TouchableOpacity } from "react-native";

export default function StudentLayout() {
  const router = useRouter();

  return (
    <Drawer
      screenOptions={{
        headerStyle: {
          backgroundColor: "#0F4C4F",
        },
        headerTintColor: "#F4EAD8",

        // PROFILE ICON TOP RIGHT
        headerRight: () => (
          <TouchableOpacity
            style={{ marginRight: 15 }}
            onPress={() => router.push("/profile")}
          >
            <Ionicons name="person-circle-outline" size={28} color="#F4EAD8" />
          </TouchableOpacity>
        ),
      }}
    >
      <Drawer.Screen name="index" options={{ title: "Home" }} />
      <Drawer.Screen name="profile" options={{ title: "Profile" }} />
      <Drawer.Screen name="mentors" options={{ title: "Mentors" }} />
      <Drawer.Screen name="jobs" options={{ title: "Jobs" }} />
      <Drawer.Screen name="events" options={{ title: "Events" }} />
      <Drawer.Screen name="my-sessions" options={{ title: "Book Sessions" }} />
      <Drawer.Screen name="bookings" options={{ title: "Bookings" }} />

      {/* Hide mentor details */}
      <Drawer.Screen
        name="mentor-details/[id]"
        options={{
          drawerItemStyle: { height: 0 },
          title: "",
        }}
      />
    </Drawer>
  );
}
