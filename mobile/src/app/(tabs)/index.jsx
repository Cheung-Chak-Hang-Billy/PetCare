import React, { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Plus,
  Heart,
  Calendar,
  Activity,
  Trash2,
  Camera,
  X,
} from "lucide-react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import useUpload from "@/utils/useUpload";

export default function PetsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    species: "",
    breed: "",
    birth_date: "",
    gender: "",
    weight: "",
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [upload, { loading: uploading }] = useUpload();

  const { data: pets = [], isLoading } = useQuery({
    queryKey: ["pets"],
    queryFn: async () => {
      const res = await fetch("/api/pets");
      if (!res.ok) throw new Error("Failed to fetch pets");
      return res.json();
    },
  });

  const addPetMutation = useMutation({
    mutationFn: async (petData) => {
      const res = await fetch("/api/pets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(petData),
      });
      if (!res.ok) throw new Error("Failed to create pet");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pets"] });
      setShowModal(false);
      setForm({
        name: "",
        species: "",
        breed: "",
        birth_date: "",
        gender: "",
        weight: "",
      });
      setSelectedImage(null);
    },
    onError: () => Alert.alert("Error", "Failed to add pet. Please try again."),
  });

  const deletePetMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/pets/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete pet");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pets"] }),
    onError: () => Alert.alert("Error", "Failed to delete pet."),
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
    if (!form.name || !form.species) {
      Alert.alert("Required", "Please fill in Name and Species.");
      return;
    }
    let photo_url = null;
    if (selectedImage) {
      const { url, error } = await upload({ reactNativeAsset: selectedImage });
      if (error) {
        Alert.alert("Upload Error", "Could not upload photo.");
        return;
      }
      photo_url = url;
    }
    addPetMutation.mutate({ ...form, photo_url });
  };

  const handleDelete = (pet) => {
    Alert.alert("Delete Pet", `Remove ${pet.name}? This cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deletePetMutation.mutate(pet.id),
      },
    ]);
  };

  return (
    <View
      style={{ flex: 1, backgroundColor: "#FFFFFF", paddingTop: insets.top }}
    >
      {/* Header */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingVertical: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View>
          <Text
            style={{
              fontSize: 24,
              fontWeight: "600",
              color: "#111827",
              letterSpacing: -0.5,
            }}
          >
            Your Pets
          </Text>
          <Text style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>
            Manage your pet care
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowModal(true)}
          style={{
            backgroundColor: "#2563EB",
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Plus color="white" size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: insets.bottom + 80,
        }}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <ActivityIndicator color="#2563EB" style={{ marginTop: 40 }} />
        ) : pets.length === 0 ? (
          <View
            style={{
              backgroundColor: "#F9FAFB",
              borderRadius: 16,
              borderStyle: "dashed",
              borderWidth: 1,
              borderColor: "#E5E7EB",
              padding: 40,
              alignItems: "center",
            }}
          >
            <View
              style={{
                backgroundColor: "#EFF6FF",
                width: 56,
                height: 56,
                borderRadius: 28,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <Heart color="#2563EB" size={28} />
            </View>
            <Text style={{ fontSize: 16, fontWeight: "600", color: "#111827" }}>
              No pets yet
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: "#6B7280",
                textAlign: "center",
                marginTop: 8,
              }}
            >
              Register your first pet to start tracking their wellness.
            </Text>
          </View>
        ) : (
          pets.map((pet) => (
            <View
              key={pet.id}
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 16,
                borderWidth: 1,
                borderColor: "#E5E7EB",
                padding: 16,
                marginBottom: 16,
              }}
            >
              <TouchableOpacity
                onPress={() => router.push(`/pet/${pet.id}`)}
                activeOpacity={0.7}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 16,
                  }}
                >
                  <View
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 32,
                      backgroundColor: "#F3F4F6",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      borderWidth: 1,
                      borderColor: "#E5E7EB",
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
                      <Text
                        style={{
                          fontSize: 20,
                          fontWeight: "700",
                          color: "#D1D5DB",
                        }}
                      >
                        {pet.name[0]}
                      </Text>
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 17,
                        fontWeight: "600",
                        color: "#111827",
                      }}
                    >
                      {pet.name}
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        color: "#6B7280",
                        marginTop: 2,
                        textTransform: "capitalize",
                      }}
                    >
                      {pet.species} · {pet.breed || "Mixed Breed"}
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    marginTop: 16,
                    paddingTop: 16,
                    borderTopWidth: 1,
                    borderTopColor: "#F3F4F6",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Activity size={14} color="#9CA3AF" />
                      <Text style={{ fontSize: 12, color: "#6B7280" }}>
                        {pet.weight || "--"}kg
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Calendar size={14} color="#9CA3AF" />
                      <Text style={{ fontSize: 12, color: "#6B7280" }}>
                        {pet.birth_date
                          ? new Date(pet.birth_date).getFullYear()
                          : "--"}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDelete(pet)}
                    style={{
                      backgroundColor: "#FEF2F2",
                      borderRadius: 8,
                      padding: 8,
                    }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Trash2 size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Pet Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}
          onPress={() => setShowModal(false)}
        >
          <Pressable
            onPress={() => {}}
            style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
              <View
                style={{
                  backgroundColor: "#FFFFFF",
                  borderTopLeftRadius: 24,
                  borderTopRightRadius: 24,
                  paddingBottom: insets.bottom + 24,
                  maxHeight: "90%",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: 20,
                    borderBottomWidth: 1,
                    borderBottomColor: "#F3F4F6",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "600",
                      color: "#111827",
                    }}
                  >
                    Add New Pet
                  </Text>
                  <TouchableOpacity onPress={() => setShowModal(false)}>
                    <X size={22} color="#6B7280" />
                  </TouchableOpacity>
                </View>
                <ScrollView
                  style={{ padding: 20 }}
                  showsVerticalScrollIndicator={false}
                >
                  {/* Photo Picker */}
                  <TouchableOpacity
                    onPress={pickImage}
                    style={{ alignItems: "center", marginBottom: 24 }}
                  >
                    <View
                      style={{
                        width: 88,
                        height: 88,
                        borderRadius: 44,
                        backgroundColor: "#F3F4F6",
                        borderWidth: 2,
                        borderColor: "#E5E7EB",
                        borderStyle: "dashed",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                      }}
                    >
                      {selectedImage ? (
                        <Image
                          source={{ uri: selectedImage.uri }}
                          style={{ width: "100%", height: "100%" }}
                          contentFit="cover"
                        />
                      ) : (
                        <View style={{ alignItems: "center" }}>
                          <Camera size={24} color="#9CA3AF" />
                          <Text
                            style={{
                              fontSize: 11,
                              color: "#9CA3AF",
                              marginTop: 4,
                            }}
                          >
                            Add Photo
                          </Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>

                  {[
                    { label: "Name *", key: "name", placeholder: "e.g. Buddy" },
                    {
                      label: "Species *",
                      key: "species",
                      placeholder: "e.g. Dog, Cat, Bird",
                    },
                    {
                      label: "Breed",
                      key: "breed",
                      placeholder: "e.g. Golden Retriever",
                    },
                    {
                      label: "Birth Date",
                      key: "birth_date",
                      placeholder: "YYYY-MM-DD",
                    },
                    {
                      label: "Gender",
                      key: "gender",
                      placeholder: "Male / Female",
                    },
                    {
                      label: "Weight (kg)",
                      key: "weight",
                      placeholder: "e.g. 8.5",
                      keyboardType: "decimal-pad",
                    },
                  ].map(({ label, key, placeholder, keyboardType }) => (
                    <View key={key} style={{ marginBottom: 16 }}>
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "500",
                          color: "#374151",
                          marginBottom: 6,
                        }}
                      >
                        {label}
                      </Text>
                      <TextInput
                        value={form[key]}
                        onChangeText={(v) =>
                          setForm((f) => ({ ...f, [key]: v }))
                        }
                        placeholder={placeholder}
                        placeholderTextColor="#9CA3AF"
                        keyboardType={keyboardType || "default"}
                        style={{
                          borderWidth: 1,
                          borderColor: "#E5E7EB",
                          borderRadius: 10,
                          paddingHorizontal: 14,
                          paddingVertical: 12,
                          fontSize: 14,
                          color: "#111827",
                          backgroundColor: "#FAFAFA",
                        }}
                      />
                    </View>
                  ))}

                  <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={addPetMutation.isPending || uploading}
                    style={{
                      backgroundColor:
                        addPetMutation.isPending || uploading
                          ? "#93C5FD"
                          : "#2563EB",
                      borderRadius: 12,
                      paddingVertical: 14,
                      alignItems: "center",
                      marginTop: 8,
                      marginBottom: 8,
                    }}
                  >
                    {addPetMutation.isPending || uploading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text
                        style={{
                          color: "white",
                          fontSize: 15,
                          fontWeight: "600",
                        }}
                      >
                        Add Pet
                      </Text>
                    )}
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </KeyboardAvoidingView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
