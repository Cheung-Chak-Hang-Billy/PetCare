import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { X, Camera } from "lucide-react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import useUpload from "@/utils/useUpload";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";

const MOODS = [
  { label: "Happy", emoji: "😊" },
  { label: "Excited", emoji: "🎉" },
  { label: "Playful", emoji: "🐾" },
  { label: "Calm", emoji: "😌" },
  { label: "Tired", emoji: "😴" },
  { label: "Sad", emoji: "😢" },
  { label: "Anxious", emoji: "😰" },
  { label: "Sick", emoji: "🤒" },
];

export default function NewDiaryEntry() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [upload, { loading: uploading }] = useUpload();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [petId, setPetId] = useState(null);
  const [mood, setMood] = useState("Happy");
  const [image, setImage] = useState(null);
  const [showMoodPicker, setShowMoodPicker] = useState(false);

  const { data: pets } = useQuery({
    queryKey: ["pets"],
    queryFn: () => fetch("/api/pets").then((res) => res.json()),
  });

  const mutation = useMutation({
    mutationFn: (newEntry) =>
      fetch("/api/diary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEntry),
      }).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diary"] });
      router.back();
    },
  });

  const pickImage = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      const { url, error } = await upload({ reactNativeAsset: asset });
      if (!error) setImage(url);
    }
  }, [upload]);

  const handleSubmit = () => {
    if (!title || !content || !petId) return;
    mutation.mutate({ pet_id: petId, title, content, mood, image_url: image });
  };

  const selectedMoodObj = MOODS.find((m) => m.label === mood);

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top,
          borderBottomWidth: 1,
          borderBottomColor: "#E5E7EB",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 20,
            paddingVertical: 16,
          }}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <X size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={{ fontSize: 16, fontWeight: "600", color: "#111827" }}>
            New Memory
          </Text>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={mutation.isPending || !title || !content || !petId}
            style={{
              opacity:
                mutation.isPending || !title || !content || !petId ? 0.4 : 1,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "600", color: "#2563EB" }}>
              Post
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingAnimatedView style={{ flex: 1 }} behavior="padding">
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
          {/* Pet Selector */}
          <Text
            style={{
              fontSize: 13,
              fontWeight: "500",
              color: "#6B7280",
              marginBottom: 8,
            }}
          >
            Choose Companion
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ flexGrow: 0, marginBottom: 24 }}
          >
            {pets?.map((pet) => (
              <TouchableOpacity
                key={pet.id}
                onPress={() => setPetId(pet.id)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: petId === pet.id ? "#EFF6FF" : "#FFFFFF",
                  borderWidth: 1,
                  borderColor: petId === pet.id ? "#2563EB" : "#E5E7EB",
                  borderRadius: 999,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  marginRight: 8,
                }}
              >
                <Image
                  source={{ uri: pet.image_url }}
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    marginRight: 8,
                  }}
                />
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "500",
                    color: petId === pet.id ? "#2563EB" : "#111827",
                  }}
                >
                  {pet.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TextInput
            placeholder="Title of your memory"
            placeholderTextColor="#9CA3AF"
            style={{
              fontSize: 24,
              fontWeight: "600",
              color: "#111827",
              marginBottom: 20,
            }}
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            placeholder="What happened today?"
            placeholderTextColor="#9CA3AF"
            multiline
            style={{
              fontSize: 16,
              color: "#111827",
              lineHeight: 24,
              minHeight: 150,
              textAlignVertical: "top",
            }}
            value={content}
            onChangeText={setContent}
          />

          {image && (
            <View style={{ marginTop: 20, position: "relative" }}>
              <Image
                source={{ uri: image }}
                style={{ width: "100%", height: 250, borderRadius: 12 }}
                contentFit="cover"
              />
              <TouchableOpacity
                onPress={() => setImage(null)}
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  backgroundColor: "rgba(0,0,0,0.5)",
                  borderRadius: 20,
                  padding: 4,
                }}
              >
                <X size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Bottom toolbar */}
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: "#E5E7EB",
            paddingHorizontal: 20,
            paddingVertical: 12,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            onPress={pickImage}
            disabled={uploading}
            style={{
              backgroundColor: "#F9FAFB",
              padding: 10,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: "#E5E7EB",
              marginRight: 12,
            }}
          >
            <Camera size={20} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowMoodPicker(true)}
            style={{
              backgroundColor: "#F9FAFB",
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: "#E5E7EB",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 18, marginRight: 8 }}>
              {selectedMoodObj?.emoji}
            </Text>
            <Text style={{ fontSize: 14, color: "#6B7280", fontWeight: "500" }}>
              {mood}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingAnimatedView>

      {/* Mood Picker Modal */}
      <Modal
        visible={showMoodPicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowMoodPicker(false)}
      >
        <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 20,
              borderBottomWidth: 1,
              borderBottomColor: "#E5E7EB",
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "600", color: "#111827" }}>
              How is {pets?.find((p) => p.id === petId)?.name || "your pet"}{" "}
              feeling?
            </Text>
            <TouchableOpacity onPress={() => setShowMoodPicker(false)}>
              <X size={24} color="#111827" />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: 20 }}>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
              {MOODS.map((m) => (
                <TouchableOpacity
                  key={m.label}
                  onPress={() => {
                    setMood(m.label);
                    setShowMoodPicker(false);
                  }}
                  style={{
                    width: "46%",
                    backgroundColor: mood === m.label ? "#EFF6FF" : "#F9FAFB",
                    borderRadius: 12,
                    borderWidth: 1.5,
                    borderColor: mood === m.label ? "#2563EB" : "#E5E7EB",
                    padding: 16,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontSize: 36, marginBottom: 8 }}>
                    {m.emoji}
                  </Text>
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "600",
                      color: mood === m.label ? "#2563EB" : "#111827",
                    }}
                  >
                    {m.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
