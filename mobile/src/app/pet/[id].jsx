import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ChevronLeft,
  BookOpen,
  ShieldCheck,
  Plus,
  Activity,
  Calendar,
  X,
} from "lucide-react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const MOODS = ["😊 Happy", "😴 Tired", "🤒 Unwell", "🐾 Playful", "😐 Calm"];

export default function PetDetailScreen() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("Diary");
  const [showAddDiary, setShowAddDiary] = useState(false);
  const [diaryForm, setDiaryForm] = useState({
    title: "",
    content: "",
    mood: "",
  });

  const { data: pet, isLoading: petLoading } = useQuery({
    queryKey: ["pet", id],
    queryFn: async () => {
      const res = await fetch(`/api/pets/${id}`);
      if (!res.ok) throw new Error("Pet not found");
      return res.json();
    },
  });

  const { data: diaries = [], isLoading: diariesLoading } = useQuery({
    queryKey: ["diaries", id],
    queryFn: async () => {
      const res = await fetch(`/api/diaries?petId=${id}`);
      return res.json();
    },
  });

  const { data: insurances = [] } = useQuery({
    queryKey: ["pet-insurances", id],
    queryFn: async () => {
      const res = await fetch(`/api/insurances?petId=${id}`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const addDiaryMutation = useMutation({
    mutationFn: async (entry) => {
      const res = await fetch("/api/diaries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...entry, pet_id: id }),
      });
      if (!res.ok) throw new Error("Failed to save entry");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diaries", id] });
      setShowAddDiary(false);
      setDiaryForm({ title: "", content: "", mood: "" });
    },
  });

  if (petLoading)
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          backgroundColor: "#FFFFFF",
        }}
      >
        <ActivityIndicator color="#2563EB" />
      </View>
    );
  if (!pet)
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#FFFFFF",
        }}
      >
        <Text style={{ color: "#6B7280" }}>Pet not found</Text>
      </View>
    );

  return (
    <View
      style={{ flex: 1, backgroundColor: "#FFFFFF", paddingTop: insets.top }}
    >
      {/* Nav */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingVertical: 12,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "#F9FAFB",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ChevronLeft color="#111827" size={20} />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "600", color: "#111827" }}>
          {pet.name}
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Pet Hero */}
        <View style={{ padding: 20, alignItems: "center" }}>
          <View
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: "#F3F4F6",
              borderWidth: 1,
              borderColor: "#E5E7EB",
              overflow: "hidden",
            }}
          >
            {pet.photo_url ? (
              <Image
                source={{ uri: pet.photo_url }}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{ fontSize: 36, fontWeight: "700", color: "#D1D5DB" }}
                >
                  {pet.name[0]}
                </Text>
              </View>
            )}
          </View>
          <Text
            style={{
              fontSize: 24,
              fontWeight: "600",
              color: "#111827",
              marginTop: 16,
            }}
          >
            {pet.name}
          </Text>
          <View
            style={{
              backgroundColor: "#EFF6FF",
              borderRadius: 100,
              paddingHorizontal: 12,
              paddingVertical: 4,
              marginTop: 8,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                color: "#2563EB",
                fontWeight: "600",
                textTransform: "capitalize",
              }}
            >
              {pet.species}
            </Text>
          </View>
          {pet.breed && (
            <Text style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>
              {pet.breed}
            </Text>
          )}
        </View>

        {/* Stats */}
        <View
          style={{
            flexDirection: "row",
            paddingHorizontal: 20,
            gap: 12,
            marginBottom: 28,
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "#F9FAFB",
              borderRadius: 12,
              padding: 14,
              borderWidth: 1,
              borderColor: "#E5E7EB",
            }}
          >
            <Activity size={16} color="#6B7280" />
            <Text style={{ fontSize: 11, color: "#6B7280", marginTop: 8 }}>
              Weight
            </Text>
            <Text style={{ fontSize: 15, fontWeight: "600", color: "#111827" }}>
              {pet.weight || "--"} kg
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              backgroundColor: "#F9FAFB",
              borderRadius: 12,
              padding: 14,
              borderWidth: 1,
              borderColor: "#E5E7EB",
            }}
          >
            <Calendar size={16} color="#6B7280" />
            <Text style={{ fontSize: 11, color: "#6B7280", marginTop: 8 }}>
              Age
            </Text>
            <Text style={{ fontSize: 15, fontWeight: "600", color: "#111827" }}>
              {pet.birth_date
                ? `${new Date().getFullYear() - new Date(pet.birth_date).getFullYear()} yrs`
                : "--"}
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              backgroundColor: "#F9FAFB",
              borderRadius: 12,
              padding: 14,
              borderWidth: 1,
              borderColor: "#E5E7EB",
            }}
          >
            <ShieldCheck size={16} color="#6B7280" />
            <Text style={{ fontSize: 11, color: "#6B7280", marginTop: 8 }}>
              Insurance
            </Text>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color:
                  insurances.filter((i) => i.status === "active").length > 0
                    ? "#10B981"
                    : "#EF4444",
              }}
            >
              {insurances.filter((i) => i.status === "active").length > 0
                ? "Active"
                : "None"}
            </Text>
          </View>
        </View>

        {/* Tabs */}
        <View
          style={{
            flexDirection: "row",
            borderBottomWidth: 1,
            borderBottomColor: "#E5E7EB",
            paddingHorizontal: 20,
          }}
        >
          {["Diary", "Insurance"].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={{
                paddingBottom: 12,
                marginRight: 24,
                borderBottomWidth: 2,
                borderBottomColor:
                  activeTab === tab ? "#2563EB" : "transparent",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: activeTab === tab ? "#111827" : "#6B7280",
                }}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ padding: 20 }}>
          {activeTab === "Diary" ? (
            <View>
              {/* Add diary button */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <Text
                  style={{ fontSize: 16, fontWeight: "600", color: "#111827" }}
                >
                  Entries
                </Text>
                <TouchableOpacity
                  onPress={() => setShowAddDiary(!showAddDiary)}
                  style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
                >
                  {showAddDiary ? (
                    <X size={16} color="#6B7280" />
                  ) : (
                    <Plus size={16} color="#2563EB" />
                  )}
                  <Text
                    style={{
                      color: showAddDiary ? "#6B7280" : "#2563EB",
                      fontWeight: "600",
                      fontSize: 14,
                    }}
                  >
                    {showAddDiary ? "Cancel" : "New Entry"}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Diary form */}
              {showAddDiary && (
                <KeyboardAvoidingView
                  behavior={Platform.OS === "ios" ? "padding" : undefined}
                >
                  <View
                    style={{
                      backgroundColor: "#F9FAFB",
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: "#E5E7EB",
                      padding: 16,
                      marginBottom: 20,
                    }}
                  >
                    <TextInput
                      placeholder="Title"
                      value={diaryForm.title}
                      onChangeText={(v) =>
                        setDiaryForm((f) => ({ ...f, title: v }))
                      }
                      placeholderTextColor="#9CA3AF"
                      style={{
                        fontSize: 15,
                        fontWeight: "600",
                        color: "#111827",
                        borderBottomWidth: 1,
                        borderBottomColor: "#E5E7EB",
                        paddingBottom: 10,
                        marginBottom: 12,
                      }}
                    />
                    <TextInput
                      placeholder="Write something about your pet today..."
                      value={diaryForm.content}
                      onChangeText={(v) =>
                        setDiaryForm((f) => ({ ...f, content: v }))
                      }
                      multiline
                      numberOfLines={4}
                      placeholderTextColor="#9CA3AF"
                      style={{
                        fontSize: 14,
                        color: "#374151",
                        lineHeight: 20,
                        minHeight: 80,
                        textAlignVertical: "top",
                      }}
                    />
                    {/* Mood picker */}
                    <View style={{ marginTop: 12 }}>
                      <Text
                        style={{
                          fontSize: 12,
                          color: "#9CA3AF",
                          marginBottom: 8,
                        }}
                      >
                        Mood
                      </Text>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={{ flexGrow: 0 }}
                      >
                        {MOODS.map((mood) => (
                          <TouchableOpacity
                            key={mood}
                            onPress={() =>
                              setDiaryForm((f) => ({
                                ...f,
                                mood: f.mood === mood ? "" : mood,
                              }))
                            }
                            style={{
                              borderWidth: 1,
                              borderColor:
                                diaryForm.mood === mood ? "#2563EB" : "#E5E7EB",
                              borderRadius: 100,
                              paddingHorizontal: 12,
                              paddingVertical: 6,
                              marginRight: 8,
                              backgroundColor:
                                diaryForm.mood === mood ? "#EFF6FF" : "#FFFFFF",
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 12,
                                color:
                                  diaryForm.mood === mood
                                    ? "#2563EB"
                                    : "#374151",
                              }}
                            >
                              {mood}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                    <TouchableOpacity
                      onPress={() => addDiaryMutation.mutate(diaryForm)}
                      disabled={
                        addDiaryMutation.isPending ||
                        !diaryForm.title ||
                        !diaryForm.content
                      }
                      style={{
                        backgroundColor:
                          !diaryForm.title || !diaryForm.content
                            ? "#D1D5DB"
                            : "#2563EB",
                        borderRadius: 10,
                        paddingVertical: 12,
                        alignItems: "center",
                        marginTop: 16,
                      }}
                    >
                      {addDiaryMutation.isPending ? (
                        <ActivityIndicator color="white" size="small" />
                      ) : (
                        <Text
                          style={{
                            color: "white",
                            fontWeight: "600",
                            fontSize: 14,
                          }}
                        >
                          Save Entry
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </KeyboardAvoidingView>
              )}

              {/* Diary list */}
              {diariesLoading ? (
                <ActivityIndicator color="#2563EB" />
              ) : diaries.length === 0 ? (
                <View style={{ alignItems: "center", paddingVertical: 40 }}>
                  <BookOpen color="#D1D5DB" size={32} />
                  <Text
                    style={{ color: "#6B7280", fontSize: 13, marginTop: 8 }}
                  >
                    No entries yet. Start writing!
                  </Text>
                </View>
              ) : (
                diaries.map((d, idx) => (
                  <View
                    key={d.id}
                    style={{ flexDirection: "row", gap: 16, marginBottom: 24 }}
                  >
                    <View style={{ alignItems: "center" }}>
                      <View
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: "#2563EB",
                          marginTop: 4,
                        }}
                      />
                      {idx < diaries.length - 1 && (
                        <View
                          style={{
                            width: 1,
                            flex: 1,
                            backgroundColor: "#E5E7EB",
                            marginTop: 4,
                          }}
                        />
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "600",
                            color: "#111827",
                            flex: 1,
                          }}
                        >
                          {d.title}
                        </Text>
                        {d.mood && (
                          <Text style={{ fontSize: 12 }}>
                            {d.mood.split(" ")[0]}
                          </Text>
                        )}
                      </View>
                      <Text
                        style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}
                      >
                        {new Date(d.entry_date).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </Text>
                      <Text
                        style={{
                          fontSize: 13,
                          color: "#4B5563",
                          marginTop: 8,
                          lineHeight: 18,
                        }}
                      >
                        {d.content}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          ) : (
            <View>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: "#111827",
                  marginBottom: 16,
                }}
              >
                Insurance Policies
              </Text>
              {insurances.length === 0 ? (
                <View
                  style={{
                    backgroundColor: "#F9FAFB",
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: "#E5E7EB",
                    padding: 24,
                    alignItems: "center",
                  }}
                >
                  <ShieldCheck color="#D1D5DB" size={36} />
                  <Text
                    style={{
                      fontSize: 14,
                      color: "#6B7280",
                      marginTop: 12,
                      textAlign: "center",
                    }}
                  >
                    No insurance policies. Go to the Insurance tab to add one.
                  </Text>
                </View>
              ) : (
                insurances.map((ins) => (
                  <View
                    key={ins.id}
                    style={{
                      backgroundColor:
                        ins.status === "active" ? "#EFF6FF" : "#F9FAFB",
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor:
                        ins.status === "active" ? "#BFDBFE" : "#E5E7EB",
                      padding: 16,
                      marginBottom: 12,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <ShieldCheck
                          size={20}
                          color={
                            ins.status === "active" ? "#2563EB" : "#9CA3AF"
                          }
                        />
                        <Text
                          style={{
                            fontSize: 15,
                            fontWeight: "600",
                            color:
                              ins.status === "active" ? "#1D4ED8" : "#6B7280",
                          }}
                        >
                          {ins.plan_name}
                        </Text>
                      </View>
                      <View
                        style={{
                          backgroundColor:
                            ins.status === "active" ? "#DCFCE7" : "#F3F4F6",
                          borderRadius: 100,
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 10,
                            color:
                              ins.status === "active" ? "#16A34A" : "#9CA3AF",
                            fontWeight: "600",
                            textTransform: "capitalize",
                          }}
                        >
                          {ins.status}
                        </Text>
                      </View>
                    </View>
                    <Text
                      style={{ fontSize: 12, color: "#6B7280", marginTop: 6 }}
                    >
                      Policy: {ins.policy_number}
                    </Text>
                    {ins.premium && (
                      <Text style={{ fontSize: 12, color: "#6B7280" }}>
                        ${ins.premium}/month
                      </Text>
                    )}
                  </View>
                ))
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
