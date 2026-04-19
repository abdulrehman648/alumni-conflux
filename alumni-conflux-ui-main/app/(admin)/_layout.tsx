import { Tabs } from "expo-router";
import { Calendar, Heart, Home, Shield, Users } from "lucide-react-native";
import BottomTabNavigator, {
  createTabBarIcon,
  hiddenTabScreenOptions,
} from "../../src/components/BottomTabNavigator";

export default function AdminLayout() {
  return (
    <BottomTabNavigator>
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: createTabBarIcon(Home),
        }}
      />

      <Tabs.Screen
        name="mentors"
        options={{
          title: "Mentors",
          tabBarIcon: createTabBarIcon(Shield),
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: "Events",
          tabBarIcon: createTabBarIcon(Calendar),
        }}
      />
      <Tabs.Screen
        name="donations"
        options={{
          title: "Donations",
          tabBarIcon: createTabBarIcon(Heart),
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: "Users",
          tabBarIcon: createTabBarIcon(Users),
        }}
      />
      <Tabs.Screen name="user-details/[id]" options={hiddenTabScreenOptions} />
    </BottomTabNavigator>
  );
}
