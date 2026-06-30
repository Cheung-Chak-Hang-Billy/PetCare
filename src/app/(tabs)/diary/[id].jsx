import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  Edit3,
  Check,
  X,
  Camera,
  Trash2,
} from "lucide-react-native";
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

export default function DiaryDetail() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const queryClient = useQueryClient();
  const [upload, { loading: uploading }] = useUpload();

  const [isEditing, setIsEditing] = useState(false);
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editMood, setEditMood] = useState("Happy");
  const [editImage, setEditImage] = useState(null);

  const { data: entry, isLoading } = useQuery({
    queryKey: ["diary", id],
    queryFn: () => fetch(`/api/diary/${id}`).then((res) => res.json()),
    onSuccess: (data) => {
      setEditTitle(data.title || "");
      setEditContent(data.content || "");
      setEditMood(data.mood || "Happy");
      setEditImage(data.image_url || null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (updates) =>
      fetch(`/api/diary/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      }).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diary"] });
      queryClient.invalidateQueries({ queryKey: ["diary", id] });
      setIsEditing(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () =>
      fetch(`/api/diary/${id}`, { method: "DELETE" }).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diary"] });
      router.back();
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      title: editTitle,
      content: editContent,
      mood: editMood,
      image_url: editImage,
    });
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Entry",
      "Are you sure you want to delete this diary entry?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteMutation.mutate(),
        },
      ],
    );
  };

  const pickImage = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      const { url, error } = await upload({ reactNativeAsset: asset });
      if (!error) setEditImage(url);
    }
  }, [upload]);

  const startEdit = () => {
    if (entry) {
      setEditTitle(entry.title);
      setEditContent(entry.content);
      setEditMood(entry.mood || "Happy");
      setEditImage(entry.image_url || null);
    }
    setIsEditing(true);
  };

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#FFFFFF",
          paddingTop: insets.top,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: 14, color: "#6B7280" }}>Loading...</Text>
      </View>
    );
  }

  if (!entry || entry.error) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#FFFFFF",
          paddingTop: insets.top,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: 14, color: "#6B7280" }}>Entry not found.</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginTop: 16 }}
        >
          <Text style={{ color: "#2563EB" }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
            <ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={{ fontSize: 16, fontWeight: "600", color: "#111827" }}>
            {isEditing ? "Edit Entry" : "Diary Entry"}
          </Text>
          <View style={{ flexDirection: "row", gap: 12 }}>
            {isEditing ? (
              <>
                <TouchableOpacity onPress={() => setIsEditing(false)}>
                  <X size={22} color="#6B7280" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSave}
                  disabled={updateMutation.isPending}
                >
                  <Check size={22} color="#2563EB" />
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity onPress={handleDelete}>
                  <Trash2 size={20} color="#EF4444" />
                </TouchableOpacity>
                <TouchableOpacity onPress={startEdit}>
                  <Edit3 size={22} color="#2563EB" />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>

      {isEditing ? (
        <KeyboardAvoidingAnimatedView style={{ flex: 1 }} behavior="padding">
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 20 }}
          >
            {/* Mood picker button */}
            <TouchableOpacity
              onPress={() => setShowMoodPicker(true)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#F9FAFB",
                borderWidth: 1,
                borderColor: "#E5E7EB",
                borderRadius: 999,
                paddingHorizontal: 14,
                paddingVertical: 8,
                alignSelf: "flex-start",
                marginBottom: 20,
              }}
            >
              <Text style={{ fontSize: 18, marginRight: 8 }}>
                {MOOD_EMOJI[editMood] || "😊"}
              </Text>
              <Text
                style={{ fontSize: 14, color: "#6B7280", fontWeight: "500" }}
              >
                {editMood}
              </Text>
            </TouchableOpacity>

            <TextInput
              style={{
                fontSize: 22,
                fontWeight: "600",
                color: "#111827",
                marginBottom: 16,
                borderBottomWidth: 1,
                borderBottomColor: "#F3F4F6",
                paddingBottom: 12,
              }}
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="Entry title"
              placeholderTextColor="#9CA3AF"
            />
            <TextInput
              multiline
              style={{
                fontSize: 16,
                color: "#111827",
                lineHeight: 26,
                minHeight: 200,
                textAlignVertical: "top",
              }}
              value={editContent}
              onChangeText={setEditContent}
              placeholder="What happened?"
              placeholderTextColor="#9CA3AF"
            />
            {editImage && (
              <View style={{ marginTop: 20, position: "relative" }}>
                <Image
                  source={{ uri: editImage }}
                  style={{ width: "100%", height: 220, borderRadius: 12 }}
                  contentFit="cover"
                />
                <TouchableOpacity
                  onPress={() => setEditImage(null)}
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    borderRadius: 20,
                    padding: 6,
                  }}
                >
                  <X size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            )}
            <TouchableOpacity
              onPress={pickImage}
              disabled={uploading}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 20,
                backgroundColor: "#F9FAFB",
                borderWidth: 1,
                borderColor: "#E5E7EB",
                borderRadius: 10,
                padding: 14,
              }}
            >
              <Camera size={20} color="#6B7280" />
              <Text style={{ fontSize: 14, color: "#6B7280", marginLeft: 10 }}>
                {uploading
                  ? "Uploading..."
                  : editImage
                    ? "Change Photo"
                    : "Add Photo"}
              </Text>
            </TouchableOpacity>
            <View style={{ height: 60 }} />
          </ScrollView>
        </KeyboardAvoidingAnimatedView>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            padding: 24,
            paddingBottom: insets.bottom + 40,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Date & Mood */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 16,
              gap: 10,
            }}
          >
            <Text style={{ fontSize: 13, color: "#6B7280" }}>
              {new Date(entry.date).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
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
                <Text style={{ fontSize: 14 }}>
                  {MOOD_EMOJI[entry.mood] || "😊"}
                </Text>
                <Text
                  style={{
                    fontSize: 11,
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
              fontSize: 26,
              fontWeight: "700",
              color: "#111827",
              marginBottom: 16,
              lineHeight: 34,
            }}
          >
            {entry.title}
          </Text>
          <Text style={{ fontSize: 16, color: "#374151", lineHeight: 28 }}>
            {entry.content}
          </Text>

          {entry.image_url && (
            <Image
              source={{ uri: entry.image_url }}
              style={{
                width: "100%",
                height: 260,
                borderRadius: 12,
                backgroundColor: "#F9FAFB",
                marginTop: 24,
              }}
              contentFit="cover"
            />
          )}
        </ScrollView>
      )}

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
              Choose a mood
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
                    setEditMood(m.label);
                    setShowMoodPicker(false);
                  }}
                  style={{
                    width: "46%",
                    backgroundColor:
                      editMood === m.label ? "#EFF6FF" : "#F9FAFB",
                    borderRadius: 12,
                    borderWidth: 1.5,
                    borderColor: editMood === m.label ? "#2563EB" : "#E5E7EB",
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
                      color: editMood === m.label ? "#2563EB" : "#111827",
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
