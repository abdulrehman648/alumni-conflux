import { Tabs } from "expo-router";
import { Briefcase, Calendar, Heart, House, User } from "lucide-react-native";
import BottomTabNavigator, {
  createTabBarIcon,
  hiddenTabScreenOptions,
} from "../../src/components/BottomTabNavigator";

export default function AlumniLayout() {
  return (
    <BottomTabNavigator>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: createTabBarIcon(House),
        }}
      />
      <Tabs.Screen name="requests" options={hiddenTabScreenOptions} />
      <Tabs.Screen
        name="events"
        options={{
          title: "Events",
          tabBarIcon: createTabBarIcon(Calendar),
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          title: "Jobs",
          tabBarIcon: createTabBarIcon(Briefcase),
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
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: createTabBarIcon(User),
        }}
      />
      <Tabs.Screen name="availability" options={hiddenTabScreenOptions} />
      <Tabs.Screen name="history" options={hiddenTabScreenOptions} />
      <Tabs.Screen name="mentor-assessment" options={hiddenTabScreenOptions} />
      <Tabs.Screen
        name="chat/[conversationId]"
        options={hiddenTabScreenOptions}
      />
    </BottomTabNavigator>
  );
}
