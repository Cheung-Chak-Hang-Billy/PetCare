import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ChevronRight,
  Calendar,
  Heart,
  Moon,
  Thermometer,
  Wind,
  X,
  Plus,
} from "lucide-react-native";
import { router } from "expo-router";

export default function Dashboard() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const [selectedPetId, setSelectedPetId] = useState(null);
  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [heartRate, setHeartRate] = useState("");
  const [hoursOfSleep, setHoursOfSleep] = useState("");
  const [temperature, setTemperature] = useState("");
  const [respiratoryRate, setRespiratoryRate] = useState("");

  const { data: pets, isLoading: petsLoading } = useQuery({
    queryKey: ["pets"],
    queryFn: () => fetch("/api/pets").then((res) => res.json()),
  });

  useEffect(() => {
    if (pets?.length > 0 && !selectedPetId) {
      setSelectedPetId(pets[0].id);
    }
  }, [pets]);

  const activePetId = selectedPetId || pets?.[0]?.id;
  const selectedPet = pets?.find((p) => p.id === activePetId);

  const { data: vitals } = useQuery({
    queryKey: ["vitals", activePetId],
    queryFn: () =>
      fetch(`/api/vitals?petId=${activePetId}`).then((res) => res.json()),
    enabled: !!activePetId,
  });

  const { data: recentDiary } = useQuery({
    queryKey: ["diary", "recent"],
    queryFn: () => fetch("/api/diary").then((res) => res.json()),
  });

  const vitalsMutation = useMutation({
    mutationFn: (data) =>
      fetch("/api/vitals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vitals", activePetId] });
      setShowVitalsModal(false);
      setHeartRate("");
      setHoursOfSleep("");
      setTemperature("");
      setRespiratoryRate("");
    },
  });

  const handleSaveVitals = () => {
    if (!activePetId) return;
    vitalsMutation.mutate({
      pet_id: activePetId,
      heart_rate: heartRate ? parseInt(heartRate) : null,
      hours_of_sleep: hoursOfSleep ? parseFloat(hoursOfSleep) : null,
      temperature: temperature ? parseFloat(temperature) : null,
      respiratory_rate: respiratoryRate ? parseInt(respiratoryRate) : null,
    });
  };

  const latestVitals = vitals?.[0];

  const formatTime = (ts) => {
    if (!ts) return "No records yet";
    const d = new Date(ts);
    return (
      d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
      " at " +
      d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    );
  };

  const handleWriteDiary = () => {
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
      style={{ flex: 1, backgroundColor: "#F4F7FF", paddingTop: insets.top }}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View
          style={{
            paddingHorizontal: 24,
            paddingTop: 24,
            paddingBottom: 28,
            backgroundColor: "#2563EB",
            borderBottomLeftRadius: 28,
            borderBottomRightRadius: 28,
            marginBottom: 4,
          }}
        >
          <Text style={{ fontSize: 28, fontWeight: "700", color: "#FFFFFF" }}>
            🐾 Pet Care
          </Text>
          <Text style={{ fontSize: 14, color: "#BFDBFE", marginTop: 4 }}>
            Manage your pet's health and happiness.
          </Text>
        </View>

        {/* Pets Selector — horizontal scroll, selectable */}
        <View style={{ marginBottom: 28, marginTop: 20 }}>
          <View style={{ paddingHorizontal: 24, marginBottom: 14 }}>
            <Text style={{ fontSize: 17, fontWeight: "600", color: "#111827" }}>
              Your Pets
            </Text>
          </View>
          {petsLoading ? (
            <Text
              style={{ paddingHorizontal: 24, fontSize: 14, color: "#6B7280" }}
            >
              Loading...
            </Text>
          ) : pets?.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ flexGrow: 0 }}
              contentContainerStyle={{ paddingHorizontal: 24 }}
            >
              {pets.map((pet) => {
                const isSelected = pet.id === activePetId;
                return (
                  <TouchableOpacity
                    key={pet.id}
                    onPress={() => setSelectedPetId(pet.id)}
                    style={{
                      width: 240,
                      backgroundColor: isSelected ? "#EEF4FF" : "#FFFFFF",
                      borderRadius: 16,
                      borderWidth: isSelected ? 2 : 1,
                      borderColor: isSelected ? "#2563EB" : "#E5E7EB",
                      padding: 16,
                      marginRight: 16,
                      flexDirection: "row",
                      alignItems: "center",
                      shadowColor: "#2563EB",
                      shadowOpacity: isSelected ? 0.1 : 0,
                      shadowRadius: 8,
                      shadowOffset: { width: 0, height: 2 },
                      elevation: isSelected ? 2 : 0,
                    }}
                  >
                    <Image
                      source={{ uri: pet.image_url }}
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 28,
                        backgroundColor: "#F9FAFB",
                      }}
                    />
                    <View style={{ marginLeft: 12, flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "600",
                          color: "#111827",
                        }}
                      >
                        {pet.name}
                      </Text>
                      <Text
                        style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}
                      >
                        {pet.breed || pet.species}
                      </Text>
                      <View
                        style={{ flexDirection: "row", marginTop: 6, gap: 6 }}
                      >
                        <View
                          style={{
                            backgroundColor: isSelected ? "#DBEAFE" : "#F9FAFB",
                            borderWidth: 1,
                            borderColor: isSelected ? "#BFDBFE" : "#E5E7EB",
                            borderRadius: 999,
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 10,
                              color: isSelected ? "#1D4ED8" : "#6B7280",
                              fontWeight: "500",
                            }}
                          >
                            {pet.species}
                          </Text>
                        </View>
                        <View
                          style={{
                            backgroundColor: isSelected ? "#DBEAFE" : "#F9FAFB",
                            borderWidth: 1,
                            borderColor: isSelected ? "#BFDBFE" : "#E5E7EB",
                            borderRadius: 999,
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 10,
                              color: isSelected ? "#1D4ED8" : "#6B7280",
                              fontWeight: "500",
                            }}
                          >
                            {pet.age}y
                          </Text>
                        </View>
                      </View>
                    </View>
                    {isSelected && (
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: "#2563EB",
                          marginLeft: 4,
                        }}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          ) : (
            <View style={{ paddingHorizontal: 24 }}>
              <Text style={{ fontSize: 14, color: "#6B7280" }}>
                No pets yet. Add one in the Profile tab!
              </Text>
            </View>
          )}
        </View>

        {/* Vital Signs Section */}
        {selectedPet && (
          <View style={{ paddingHorizontal: 24, marginBottom: 28 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 14,
              }}
            >
              <Text
                style={{ fontSize: 17, fontWeight: "600", color: "#111827" }}
              >
                {selectedPet.name}'s Vitals
              </Text>
              <TouchableOpacity
                onPress={() => setShowVitalsModal(true)}
                style={{
                  backgroundColor: "#2563EB",
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 999,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Plus size={14} color="#FFFFFF" />
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "500",
                    color: "#FFFFFF",
                    marginLeft: 4,
                  }}
                >
                  Log Vitals
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 16,
                padding: 20,
                shadowColor: "#000",
                shadowOpacity: 0.05,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 2 },
                elevation: 2,
              }}
            >
              {latestVitals ? (
                <>
                  <Text
                    style={{
                      fontSize: 11,
                      color: "#6B7280",
                      fontWeight: "500",
                      textTransform: "uppercase",
                      marginBottom: 16,
                    }}
                  >
                    Last updated: {formatTime(latestVitals.recorded_at)}
                  </Text>
                  <View
                    style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}
                  >
                    {latestVitals.heart_rate != null && (
                      <View
                        style={{
                          flex: 1,
                          minWidth: "45%",
                          backgroundColor: "#FEF2F2",
                          borderRadius: 10,
                          padding: 14,
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginBottom: 6,
                          }}
                        >
                          <Heart size={16} color="#EF4444" />
                          <Text
                            style={{
                              fontSize: 11,
                              color: "#EF4444",
                              fontWeight: "600",
                              marginLeft: 6,
                            }}
                          >
                            Heart Rate
                          </Text>
                        </View>
                        <Text
                          style={{
                            fontSize: 22,
                            fontWeight: "700",
                            color: "#111827",
                          }}
                        >
                          {latestVitals.heart_rate}
                        </Text>
                        <Text style={{ fontSize: 11, color: "#6B7280" }}>
                          bpm
                        </Text>
                      </View>
                    )}
                    {latestVitals.hours_of_sleep != null && (
                      <View
                        style={{
                          flex: 1,
                          minWidth: "45%",
                          backgroundColor: "#EFF6FF",
                          borderRadius: 10,
                          padding: 14,
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginBottom: 6,
                          }}
                        >
                          <Moon size={16} color="#2563EB" />
                          <Text
                            style={{
                              fontSize: 11,
                              color: "#2563EB",
                              fontWeight: "600",
                              marginLeft: 6,
                            }}
                          >
                            Sleep
                          </Text>
                        </View>
                        <Text
                          style={{
                            fontSize: 22,
                            fontWeight: "700",
                            color: "#111827",
                          }}
                        >
                          {latestVitals.hours_of_sleep}
                        </Text>
                        <Text style={{ fontSize: 11, color: "#6B7280" }}>
                          hours
                        </Text>
                      </View>
                    )}
                    {latestVitals.temperature != null && (
                      <View
                        style={{
                          flex: 1,
                          minWidth: "45%",
                          backgroundColor: "#FFF7ED",
                          borderRadius: 10,
                          padding: 14,
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginBottom: 6,
                          }}
                        >
                          <Thermometer size={16} color="#EA580C" />
                          <Text
                            style={{
                              fontSize: 11,
                              color: "#EA580C",
                              fontWeight: "600",
                              marginLeft: 6,
                            }}
                          >
                            Temperature
                          </Text>
                        </View>
                        <Text
                          style={{
                            fontSize: 22,
                            fontWeight: "700",
                            color: "#111827",
                          }}
                        >
                          {latestVitals.temperature}
                        </Text>
                        <Text style={{ fontSize: 11, color: "#6B7280" }}>
                          °C
                        </Text>
                      </View>
                    )}
                    {latestVitals.respiratory_rate != null && (
                      <View
                        style={{
                          flex: 1,
                          minWidth: "45%",
                          backgroundColor: "#F0FDF4",
                          borderRadius: 10,
                          padding: 14,
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginBottom: 6,
                          }}
                        >
                          <Wind size={16} color="#16A34A" />
                          <Text
                            style={{
                              fontSize: 11,
                              color: "#16A34A",
                              fontWeight: "600",
                              marginLeft: 6,
                            }}
                          >
                            Resp. Rate
                          </Text>
                        </View>
                        <Text
                          style={{
                            fontSize: 22,
                            fontWeight: "700",
                            color: "#111827",
                          }}
                        >
                          {latestVitals.respiratory_rate}
                        </Text>
                        <Text style={{ fontSize: 11, color: "#6B7280" }}>
                          br/min
                        </Text>
                      </View>
                    )}
                  </View>
                </>
              ) : (
                <View style={{ alignItems: "center", paddingVertical: 20 }}>
                  <Heart size={32} color="#E5E7EB" />
                  <Text
                    style={{ fontSize: 14, color: "#6B7280", marginTop: 12 }}
                  >
                    No vitals recorded yet.
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowVitalsModal(true)}
                    style={{
                      marginTop: 12,
                      backgroundColor: "#2563EB",
                      paddingHorizontal: 20,
                      paddingVertical: 10,
                      borderRadius: 999,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: "#FFFFFF",
                      }}
                    >
                      Log First Vitals
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Recent Diary */}
        <View style={{ paddingHorizontal: 24, marginBottom: 32 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "600", color: "#111827" }}>
              Recent Diary
            </Text>
            <TouchableOpacity onPress={handleWriteDiary}>
              <Text
                style={{ fontSize: 13, color: "#2563EB", fontWeight: "500" }}
              >
                See all
              </Text>
            </TouchableOpacity>
          </View>
          {recentDiary && recentDiary.length > 0 ? (
            <TouchableOpacity
              onPress={() => router.push(`/(tabs)/diary/${recentDiary[0].id}`)}
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 16,
                borderLeftWidth: 4,
                borderLeftColor: "#F59E0B",
                borderTopWidth: 1,
                borderRightWidth: 1,
                borderBottomWidth: 1,
                borderTopColor: "#FEF3C7",
                borderRightColor: "#FEF3C7",
                borderBottomColor: "#FEF3C7",
                padding: 16,
                shadowColor: "#F59E0B",
                shadowOpacity: 0.08,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 2 },
                elevation: 2,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <Calendar size={14} color="#6B7280" />
                <Text style={{ fontSize: 12, color: "#6B7280", marginLeft: 6 }}>
                  {new Date(recentDiary[0].date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </Text>
                {recentDiary[0].mood && (
                  <View
                    style={{
                      marginLeft: 10,
                      backgroundColor: "#F9FAFB",
                      borderWidth: 1,
                      borderColor: "#E5E7EB",
                      borderRadius: 999,
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                    }}
                  >
                    <Text style={{ fontSize: 10, color: "#6B7280" }}>
                      {recentDiary[0].mood}
                    </Text>
                  </View>
                )}
              </View>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: "#111827",
                  marginBottom: 4,
                }}
              >
                {recentDiary[0].title}
              </Text>
              <Text style={{ fontSize: 14, color: "#6B7280", lineHeight: 20 }}>
                {recentDiary[0].content.substring(0, 100)}
                {recentDiary[0].content.length > 100 ? "..." : ""}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 10,
                }}
              >
                <Text
                  style={{ fontSize: 12, color: "#2563EB", fontWeight: "500" }}
                >
                  Read more →
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View
              style={{
                backgroundColor: "#F9FAFB",
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#E5E7EB",
                padding: 24,
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 14, color: "#6B7280" }}>
                No entries yet.
              </Text>
              <TouchableOpacity
                onPress={handleWriteDiary}
                style={{
                  marginTop: 12,
                  backgroundColor: "#EFF6FF",
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 999,
                }}
              >
                <Text
                  style={{ fontSize: 13, fontWeight: "500", color: "#2563EB" }}
                >
                  Write your first entry
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Log Vitals Modal */}
      <Modal
        visible={showVitalsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowVitalsModal(false)}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
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
              <Text
                style={{ fontSize: 18, fontWeight: "600", color: "#111827" }}
              >
                Log Vitals for {selectedPet?.name}
              </Text>
              <TouchableOpacity onPress={() => setShowVitalsModal(false)}>
                <X size={24} color="#111827" />
              </TouchableOpacity>
            </View>
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {[
                {
                  label: "Heart Rate",
                  unit: "bpm",
                  value: heartRate,
                  setter: setHeartRate,
                  icon: "❤️",
                  keyboardType: "numeric",
                },
                {
                  label: "Hours of Sleep",
                  unit: "hrs",
                  value: hoursOfSleep,
                  setter: setHoursOfSleep,
                  icon: "🌙",
                  keyboardType: "decimal-pad",
                },
                {
                  label: "Temperature",
                  unit: "°C",
                  value: temperature,
                  setter: setTemperature,
                  icon: "🌡️",
                  keyboardType: "decimal-pad",
                },
                {
                  label: "Respiratory Rate",
                  unit: "br/min",
                  value: respiratoryRate,
                  setter: setRespiratoryRate,
                  icon: "💨",
                  keyboardType: "numeric",
                },
              ].map(({ label, unit, value, setter, icon, keyboardType }) => (
                <View key={label} style={{ marginBottom: 16 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "500",
                      color: "#374151",
                      marginBottom: 8,
                    }}
                  >
                    {icon} {label}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: "#E5E7EB",
                      borderRadius: 10,
                      overflow: "hidden",
                    }}
                  >
                    <TextInput
                      style={{
                        flex: 1,
                        paddingHorizontal: 12,
                        paddingVertical: Platform.OS === "android" ? 8 : 12,
                        fontSize: 15,
                        color: "#111827",
                      }}
                      placeholder={`e.g. ${label === "Heart Rate" ? "80" : label === "Hours of Sleep" ? "8" : label === "Temperature" ? "38.5" : "20"}`}
                      placeholderTextColor="#9CA3AF"
                      keyboardType={keyboardType}
                      value={value}
                      onChangeText={setter}
                      returnKeyType="next"
                    />
                    <View
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: Platform.OS === "android" ? 8 : 12,
                        backgroundColor: "#F9FAFB",
                        justifyContent: "center",
                        borderLeftWidth: 1,
                        borderLeftColor: "#E5E7EB",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          color: "#6B7280",
                          fontWeight: "500",
                        }}
                      >
                        {unit}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
              <TouchableOpacity
                onPress={handleSaveVitals}
                disabled={vitalsMutation.isPending}
                style={{
                  backgroundColor: "#2563EB",
                  paddingVertical: 14,
                  borderRadius: 999,
                  alignItems: "center",
                  marginTop: 8,
                  opacity: vitalsMutation.isPending ? 0.6 : 1,
                }}
              >
                <Text
                  style={{ fontSize: 16, fontWeight: "600", color: "#FFFFFF" }}
                >
                  {vitalsMutation.isPending ? "Saving..." : "Save Vitals"}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
