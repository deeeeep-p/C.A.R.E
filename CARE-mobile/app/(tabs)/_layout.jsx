import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: "#0f172a",
        },
        headerTintColor: "#fff",
        tabBarStyle: {
          backgroundColor: "#0f172a",
          paddingBottom: 8, // Added padding at the bottom
        },
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#64748b",
        contentStyle: {
          backgroundColor: "#0f172a",
        },
        headerTitleStyle: {
          color: "#fff",
        },
        tabBarLabelStyle: {
          fontFamily: "Poppins-Medium",
        },
      }}
    >
      <Tabs.Screen
        name="emergency/index"
        options={{
          title: "Emergency",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="accessibility-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tracking"
        options={{
          title: "Track",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="location" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
