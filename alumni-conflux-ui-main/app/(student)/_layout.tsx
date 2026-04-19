import { Tabs } from "expo-router";
import { Briefcase, Calendar, House, User, Users } from "lucide-react-native";
import BottomTabNavigator, {
  createTabBarIcon,
  hiddenTabScreenOptions,
} from "../../src/components/BottomTabNavigator";

export default function StudentLayout() {
  return (
    <BottomTabNavigator>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: createTabBarIcon(House),
        }}
      />
      <Tabs.Screen
        name="mentors"
        options={{
          title: "Mentors",
          tabBarIcon: createTabBarIcon(Users),
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
        name="events"
        options={{
          title: "Events",
          tabBarIcon: createTabBarIcon(Calendar),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: createTabBarIcon(User),
        }}
      />
      <Tabs.Screen name="mentor-assessment" options={hiddenTabScreenOptions} />
      <Tabs.Screen name="my-sessions" options={hiddenTabScreenOptions} />
      <Tabs.Screen name="bookings" options={hiddenTabScreenOptions} />
      <Tabs.Screen
        name="chat/[conversationId]"
        options={hiddenTabScreenOptions}
      />
      <Tabs.Screen
        name="mentor-details/[id]"
        options={hiddenTabScreenOptions}
      />
      <Tabs.Screen name="ai-career" options={hiddenTabScreenOptions} />
    </BottomTabNavigator>
  );
}
