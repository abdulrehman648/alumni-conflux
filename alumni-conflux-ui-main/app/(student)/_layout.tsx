import { Stack } from "expo-router";
import colors from "../../src/theme/colors";

export default function StudentLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.white },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Home" }} />
      <Stack.Screen name="profile" options={{ title: "Profile" }} />
      <Stack.Screen name="mentors" options={{ title: "Mentors" }} />
      <Stack.Screen
        name="mentor-assessment"
        options={{ title: "Mentor Assessment" }}
      />
      <Stack.Screen name="jobs" options={{ title: "Jobs" }} />
      <Stack.Screen name="events" options={{ title: "Events" }} />
      <Stack.Screen name="my-sessions" options={{ title: "Book Sessions" }} />
      <Stack.Screen name="bookings" options={{ title: "Bookings" }} />
      <Stack.Screen
        name="mentor-details/[id]"
        options={{ title: "Mentor Details" }}
      />
      <Stack.Screen
        name="ai-career"
        options={{
          title: "AI Career Counselor",
        }}
      />
    </Stack>
  );
}
