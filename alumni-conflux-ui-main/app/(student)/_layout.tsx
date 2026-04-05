import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
        headerStyle: {
          backgroundColor: "#0F4C4F",
        },
        headerTintColor: "#F4EAD8",
        headerShown: true,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: "#fff" },
        headerRight: () => (
          <TouchableOpacity
            style={{ marginRight: 15 }}
            onPress={() => router.push("/(student)/profile")}
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
      <Stack.Screen name="mentors" options={{ title: "Mentors" }} />
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
