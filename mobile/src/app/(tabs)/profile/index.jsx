import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Settings, Plus, Camera, Trash2, X, User } from "lucide-react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import useUpload from "@/utils/useUpload";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";

export default function Profile() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [upload, { loading: uploading }] = useUpload();

  const [isAddingPet, setIsAddingPet] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // New Pet Form State
  const [name, setName] = useState("");
  const [species, setSpecies] = useState("Dog");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [imageUrl, setImageUrl] = useState(null);

  const { data: pets, isLoading } = useQuery({
    queryKey: ["pets"],
    queryFn: () => fetch("/api/pets").then((res) => res.json()),
  });

  const addMutation = useMutation({
    mutationFn: (newPet) =>
      fetch("/api/pets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPet),
      }).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pets"] });
      setIsAddingPet(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (petId) =>
      fetch(`/api/pets/${petId}`, { method: "DELETE" }).then((res) =>
        res.json(),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pets"] });
      queryClient.invalidateQueries({ queryKey: ["diary"] });
      queryClient.invalidateQueries({ queryKey: ["policies"] });
    },
    onError: (err) => {
      console.error("Delete pet error:", err);
    },
  });

  const resetForm = () => {
    setName("");
    setSpecies("Dog");
    setBreed("");
    setAge("");
    setWeight("");
    setImageUrl(null);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      const { url, error } = await upload({
        reactNativeAsset: result.assets[0],
      });
      if (!error) setImageUrl(url);
    }
  };

  const handleAddPet = () => {
    if (!name || !species) return;
    addMutation.mutate({
      name,
      species,
      breed,
      age: parseInt(age) || 0,
      weight: parseFloat(weight) || 0,
      image_url: imageUrl || "https://via.placeholder.com/150",
    });
  };

  const handleDeletePet = (pet) => {
    Alert.alert(
      "Remove Pet",
      `Are you sure you want to remove ${pet.name} from your app? This will also delete all diary entries and insurance policies for this pet.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => deleteMutation.mutate(pet.id),
        },
      ],
    );
  };

  return (
    <View
      style={{ flex: 1, backgroundColor: "#F4F7FF", paddingTop: insets.top }}
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
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <User size={26} color="#FFFFFF" />
            <Text style={{ fontSize: 26, fontWeight: "700", color: "#FFFFFF" }}>
              Profile
            </Text>
          </View>
          <Text style={{ fontSize: 13, color: "#BFDBFE", marginTop: 4 }}>
            Manage your pets and account
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowSettings(true)}
          style={{
            backgroundColor: "rgba(255,255,255,0.2)",
            padding: 10,
            borderRadius: 12,
          }}
        >
          <Settings size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ padding: 24 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: "#111827",
              marginBottom: 16,
            }}
          >
            My Companions
          </Text>
          {isLoading ? (
            <Text style={{ fontSize: 14, color: "#6B7280" }}>
              Loading pets...
            </Text>
          ) : (
            <View>
              {pets?.map((pet) => (
                <View
                  key={pet.id}
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 16,
                    borderLeftWidth: 4,
                    borderLeftColor: "#2563EB",
                    borderTopWidth: 1,
                    borderRightWidth: 1,
                    borderBottomWidth: 1,
                    borderTopColor: "#DBEAFE",
                    borderRightColor: "#DBEAFE",
                    borderBottomColor: "#DBEAFE",
                    padding: 16,
                    marginBottom: 16,
                    flexDirection: "row",
                    alignItems: "center",
                    shadowColor: "#2563EB",
                    shadowOpacity: 0.08,
                    shadowRadius: 6,
                    shadowOffset: { width: 0, height: 2 },
                    elevation: 2,
                  }}
                >
                  <Image
                    source={{ uri: pet.image_url }}
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 32,
                      backgroundColor: "#F9FAFB",
                    }}
                  />
                  <View style={{ marginLeft: 16, flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "600",
                        color: "#111827",
                      }}
                    >
                      {pet.name}
                    </Text>
                    <Text style={{ fontSize: 13, color: "#6B7280" }}>
                      {pet.breed || pet.species}
                    </Text>
                    <View
                      style={{ flexDirection: "row", marginTop: 8, gap: 6 }}
                    >
                      <View
                        style={{
                          backgroundColor: "#F9FAFB",
                          borderWidth: 1,
                          borderColor: "#E5E7EB",
                          borderRadius: 999,
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 10,
                            color: "#6B7280",
                            fontWeight: "500",
                          }}
                        >
                          {pet.age} yrs
                        </Text>
                      </View>
                      <View
                        style={{
                          backgroundColor: "#F9FAFB",
                          borderWidth: 1,
                          borderColor: "#E5E7EB",
                          borderRadius: 999,
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 10,
                            color: "#6B7280",
                            fontWeight: "500",
                          }}
                        >
                          {pet.weight} kg
                        </Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeletePet(pet)}
                    style={{ padding: 8 }}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}

              <TouchableOpacity
                onPress={() => setIsAddingPet(true)}
                style={{
                  backgroundColor: "#EEF4FF",
                  borderRadius: 12,
                  borderWidth: 1.5,
                  borderColor: "#BFDBFE",
                  borderStyle: "dashed",
                  padding: 24,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Plus size={24} color="#2563EB" />
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: "#2563EB",
                    marginTop: 8,
                  }}
                >
                  Add Companion
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Pet Modal */}
      {isAddingPet && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
        >
          <KeyboardAvoidingAnimatedView
            behavior="padding"
            style={{ width: "100%" }}
          >
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                padding: 24,
                paddingBottom: insets.bottom + 24,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 24,
                }}
              >
                <Text
                  style={{ fontSize: 20, fontWeight: "600", color: "#111827" }}
                >
                  Add New Companion
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setIsAddingPet(false);
                    resetForm();
                  }}
                >
                  <X size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                <TouchableOpacity
                  onPress={pickImage}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: "#F9FAFB",
                    borderWidth: 1,
                    borderColor: "#E5E7EB",
                    alignItems: "center",
                    justifyContent: "center",
                    alignSelf: "center",
                    marginBottom: 24,
                    overflow: "hidden",
                  }}
                >
                  {imageUrl ? (
                    <Image
                      source={{ uri: imageUrl }}
                      style={{ width: "100%", height: "100%" }}
                    />
                  ) : (
                    <Camera size={24} color="#9CA3AF" />
                  )}
                </TouchableOpacity>
                {[
                  {
                    label: "Name",
                    value: name,
                    setter: setName,
                    placeholder: "Pet Name",
                  },
                  {
                    label: "Species",
                    value: species,
                    setter: setSpecies,
                    placeholder: "Dog, Cat, etc.",
                  },
                  {
                    label: "Breed",
                    value: breed,
                    setter: setBreed,
                    placeholder: "e.g. Golden Retriever",
                  },
                ].map(({ label, value, setter, placeholder }) => (
                  <View key={label} style={{ marginBottom: 14 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "500",
                        color: "#374151",
                        marginBottom: 6,
                      }}
                    >
                      {label}
                    </Text>
                    <TextInput
                      style={{
                        borderWidth: 1,
                        borderColor: "#E5E7EB",
                        borderRadius: 8,
                        padding: 12,
                        fontSize: 16,
                      }}
                      placeholder={placeholder}
                      value={value}
                      onChangeText={setter}
                    />
                  </View>
                ))}
                <View
                  style={{ flexDirection: "row", gap: 14, marginBottom: 14 }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "500",
                        color: "#374151",
                        marginBottom: 6,
                      }}
                    >
                      Age (years)
                    </Text>
                    <TextInput
                      style={{
                        borderWidth: 1,
                        borderColor: "#E5E7EB",
                        borderRadius: 8,
                        padding: 12,
                        fontSize: 16,
                      }}
                      placeholder="0"
                      keyboardType="numeric"
                      value={age}
                      onChangeText={setAge}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "500",
                        color: "#374151",
                        marginBottom: 6,
                      }}
                    >
                      Weight (kg)
                    </Text>
                    <TextInput
                      style={{
                        borderWidth: 1,
                        borderColor: "#E5E7EB",
                        borderRadius: 8,
                        padding: 12,
                        fontSize: 16,
                      }}
                      placeholder="0"
                      keyboardType="decimal-pad"
                      value={weight}
                      onChangeText={setWeight}
                    />
                  </View>
                </View>
                <TouchableOpacity
                  onPress={handleAddPet}
                  disabled={addMutation.isPending || !name}
                  style={{
                    backgroundColor: "#2563EB",
                    paddingVertical: 16,
                    borderRadius: 999,
                    alignItems: "center",
                    marginTop: 12,
                    opacity: !name || addMutation.isPending ? 0.5 : 1,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: "#FFFFFF",
                    }}
                  >
                    {addMutation.isPending ? "Adding..." : "Add Pet"}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingAnimatedView>
        </View>
      )}

      {/* Settings Modal */}
      <Modal
        visible={showSettings}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSettings(false)}
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
            <Text style={{ fontSize: 20, fontWeight: "600", color: "#111827" }}>
              Settings
            </Text>
            <TouchableOpacity onPress={() => setShowSettings(false)}>
              <X size={24} color="#111827" />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: 24 }}>
            {/* App Info */}
            <View
              style={{
                backgroundColor: "#F9FAFB",
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#E5E7EB",
                padding: 16,
              }}
            >
              <Text
                style={{ fontSize: 14, color: "#111827", fontWeight: "600" }}
              >
                🐾 Pet Care
              </Text>
              <Text style={{ fontSize: 12, color: "#6B7280", marginTop: 4 }}>
                Version 1.0.0
              </Text>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
