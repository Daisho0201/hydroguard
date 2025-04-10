import { Stack } from "expo-router";
import { Image } from "react-native";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#005792",
        },
        headerTintColor: "#fff",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          // Hide the title text completely
          headerTitle: () => null,
          // Keep the header visible
          headerShown: false,
        }}
      />
    </Stack>
  );
}