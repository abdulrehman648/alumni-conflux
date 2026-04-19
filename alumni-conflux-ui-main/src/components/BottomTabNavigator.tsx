import { Tabs } from "expo-router";
import { ReactNode } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "../theme/colors";

type IconComponent = (props: {
  color?: string;
  size?: number;
  strokeWidth?: number;
}) => ReactNode;

const tabIconSize = 20;
const tabIconStroke = 1.8;

export function createTabBarIcon(
  Icon: IconComponent,
  config?: {
    size?: number;
    strokeWidth?: number;
  },
) {
  const iconSize = config?.size ?? tabIconSize;
  const strokeWidth = config?.strokeWidth ?? tabIconStroke;

  return ({
    color,
    focused,
  }: {
    color: string;
    size: number;
    focused: boolean;
  }) => (
    <Icon
      color={color}
      size={iconSize}
      strokeWidth={focused ? 2.2 : strokeWidth}
    />
  );
}

export const hiddenTabScreenOptions = {
  href: null,
  tabBarStyle: {
    display: "none",
  },
} as const;

type BottomTabNavigatorProps = {
  children: ReactNode;
};

export default function BottomTabNavigator({
  children,
}: BottomTabNavigatorProps) {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 10);

  return (
    <Tabs
      backBehavior="history"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.secondary,
        tabBarInactiveTintColor: colors.textLight,

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
        tabBarStyle: {
          backgroundColor: colors.card,
          paddingBottom: bottomInset,
          paddingTop: 6,
          height: 56 + bottomInset,
        },
        sceneStyle: {
          backgroundColor: colors.white,
        },
      }}
    >
      {children}
    </Tabs>
  );
}
