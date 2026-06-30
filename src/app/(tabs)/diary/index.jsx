import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { Plus, Calendar, Smile } from "lucide-react-native";
import { Image } from "expo-image";
import { router } from "expo-router";

const MOOD_EMOJI = {
  Happy: "😊",
  Sad: "😢",
  Excited: "🎉",
  Tired: "😴",
  Anxious: "😰",
  Playful: "🐾",
  Sick: "🤒",
  Calm: "😌",
};

export default function DiaryList() {
  const insets = useSafeAreaInsets();

  const { data: entries, isLoading } = useQuery({
    queryKey: ["diary"],
    queryFn: () => fetch("/api/diary").then((res) => res.json()),
  });

  const { data: pets } = useQuery({
    queryKey: ["pets"],
    queryFn: () => fetch("/api/pets").then((res) => res.json()),
  });

  const handleNewEntry = () => {
    if (!pets || pets.length === 0) {
      Alert.alert(
        "No Companion Added",
        "Please add a companion in your Profile before writing a diary entry.",
        [{ text: "OK" }],
      );
      return;
    }
    router.push("/(tabs)/diary/new");
  };

  return (
    <View
      style={{ flex: 1, backgroundColor: "#FFFFFF", paddingTop: insets.top }}
    >
      {/* Header */}
      <View
        style={{
          paddingHorizontal: 24,
          paddingVertical: 20,
          borderBottomWidth: 1,
          borderBottomColor: "#E5E7EB",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 24, fontWeight: "600", color: "#111827" }}>
            Pet Diary
          </Text>
          <TouchableOpacity
            onPress={handleNewEntry}
            style={{
              backgroundColor: "#2563EB",
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 999,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Plus size={16} color="#FFFFFF" />
            <Text
              style={{
                fontSize: 13,
                fontWeight: "500",
                color: "#FFFFFF",
                marginLeft: 4,
              }}
            >
              New Entry
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={{ fontSize: 14, color: "#6B7280", marginTop: 4 }}>
          Document the journey with your companions.
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ padding: 24 }}>
          {isLoading ? (
            <Text style={{ fontSize: 14, color: "#6B7280" }}>
              Loading entries...
            </Text>
          ) : entries?.length > 0 ? (
            entries.map((entry) => (
              <TouchableOpacity
                key={entry.id}
                onPress={() => router.push(`/(tabs)/diary/${entry.id}`)}
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  padding: 16,
                  marginBottom: 16,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 10,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Calendar size={14} color="#6B7280" />
                    <Text
                      style={{ fontSize: 12, color: "#6B7280", marginLeft: 6 }}
                    >
                      {new Date(entry.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </Text>
                  </View>
                  {entry.mood && (
                    <View
                      style={{
                        backgroundColor: "#F9FAFB",
                        borderWidth: 1,
                        borderColor: "#E5E7EB",
                        borderRadius: 999,
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ fontSize: 13 }}>
                        {MOOD_EMOJI[entry.mood] || "😊"}
                      </Text>
                      <Text
                        style={{
                          fontSize: 10,
                          color: "#6B7280",
                          fontWeight: "500",
                          marginLeft: 4,
                        }}
                      >
                        {entry.mood}
                      </Text>
                    </View>
                  )}
                </View>
                <Text
                  style={{
                    fontSize: 17,
                    fontWeight: "600",
                    color: "#111827",
                    marginBottom: 6,
                  }}
                >
                  {entry.title}
                </Text>
                <Text
                  style={{ fontSize: 14, color: "#6B7280", lineHeight: 22 }}
                  numberOfLines={2}
                >
                  {entry.content}
                </Text>
                {entry.image_url && (
                  <Image
                    source={{ uri: entry.image_url }}
                    style={{
                      width: "100%",
                      height: 160,
                      borderRadius: 8,
                      backgroundColor: "#F9FAFB",
                      marginTop: 12,
                    }}
                    contentFit="cover"
                  />
                )}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 12,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      color: "#2563EB",
                      fontWeight: "500",
                    }}
                  >
                    Tap to read & edit →
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={{ alignItems: "center", paddingVertical: 48 }}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>📖</Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: "#111827",
                  marginBottom: 6,
                }}
              >
                No memories yet
              </Text>
              <Text
                style={{ fontSize: 14, color: "#6B7280", marginBottom: 20 }}
              >
                Start writing about your pet's adventures!
              </Text>
              <TouchableOpacity
                onPress={handleNewEntry}
                style={{
                  backgroundColor: "#2563EB",
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  borderRadius: 999,
                }}
              >
                <Text
                  style={{ fontSize: 14, fontWeight: "600", color: "#FFFFFF" }}
                >
                  Write First Entry
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
