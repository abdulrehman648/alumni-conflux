import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { useEffect } from "react";
import { useAuth } from "../../src/context/AuthContext";

export default function AlumniLayout() {
  const router = useRouter();
  const { profileComplete } = useAuth();

  useEffect(() => {
    if (!profileComplete) {
      router.replace("/(alumni)/profile");
    }
  }, [profileComplete, router]);

  return (
    <Drawer
      screenOptions={{
        headerStyle: { backgroundColor: "#0F4C4F" },
        headerTintColor: "#F4EAD8",
      }}
    >
      <Drawer.Screen name="index" options={{ title: "Home" }} />
      <Drawer.Screen name="availability" options={{ title: "Availability" }} />
      <Drawer.Screen name="requests" options={{ title: "Requests" }} />
      <Drawer.Screen name="profile" options={{ title: "Profile" }} />
      <Drawer.Screen
        name="events"
        options={{
          title: "Events",
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="event" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="jobs"
        options={{
          title: "Job Hub",
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="work" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen name="history" options={{ title: "History" }} />
    </Drawer>
  );
}
