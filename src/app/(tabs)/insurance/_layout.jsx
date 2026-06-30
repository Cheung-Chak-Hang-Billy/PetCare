import { Stack } from "expo-router";

export default function InsuranceLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="buy" options={{ presentation: "card" }} />
      <Stack.Screen name="claim" options={{ presentation: "card" }} />
      <Stack.Screen name="[id]" options={{ presentation: "card" }} />
    </Stack>
  );
}
