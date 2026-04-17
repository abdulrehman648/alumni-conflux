import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import colors from "../../src/theme/colors";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    async function prepare() {
      try {
        await SplashScreen.hideAsync();
      } catch (e) {
        console.warn(e);
      }
    }

    prepare();
  }, []);

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
        options={{
          title: "Mentor Details",
        }}
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

const Splash = () => {
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      router.replace("/role");
    }, 2000);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Alumni Conflux</Text>
      <Text style={styles.subtitle}>Connecting Futures</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.white,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 16,
    color: colors.textLight,
  },
});
