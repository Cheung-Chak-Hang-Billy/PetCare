import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, Check, X, Info } from "lucide-react-native";
import { Image } from "expo-image";
import { router } from "expo-router";

const PLANS = [
  {
    id: "basic",
    name: "Basic Health",
    price: 25,
    features: ["Accident coverage", "Illness coverage", "24/7 Vet chat"],
  },
  {
    id: "premium",
    name: "Premium Care Plus",
    price: 45,
    features: [
      "All Basic features",
      "Wellness checks",
      "Dental coverage",
      "Behavioral therapy",
    ],
  },
  {
    id: "ultra",
    name: "Ultra Protection",
    price: 65,
    features: [
      "All Premium features",
      "Global travel coverage",
      "Boarding fees",
      "Loss & recovery",
    ],
  },
];

export default function BuyInsurance() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [selectedPet, setSelectedPet] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const { data: pets } = useQuery({
    queryKey: ["pets"],
    queryFn: () => fetch("/api/pets").then((res) => res.json()),
  });

  // Check if the selected pet already has an active policy for the selected plan
  const { data: existingPolicies } = useQuery({
    queryKey: ["policies", "check", selectedPet, selectedPlan?.name],
    queryFn: () =>
      fetch(
        `/api/insurance?petId=${selectedPet}&planName=${encodeURIComponent(selectedPlan.name)}`,
      ).then((res) => res.json()),
    enabled: !!selectedPet && !!selectedPlan,
  });

  const hasActivePolicy = existingPolicies && existingPolicies.length > 0;
  const activePolicyExpiry = hasActivePolicy
    ? new Date(existingPolicies[0].end_date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const mutation = useMutation({
    mutationFn: (newPolicy) =>
      fetch("/api/insurance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPolicy),
      }).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["policies"] });
      router.replace("/(tabs)/insurance");
    },
  });

  const handlePurchase = () => {
    if (!selectedPet || !selectedPlan) return;
    mutation.mutate({
      pet_id: selectedPet,
      plan_name: selectedPlan.name,
      premium: selectedPlan.price,
    });
  };

  return (
    <View
      style={{ flex: 1, backgroundColor: "#FFFFFF", paddingTop: insets.top }}
    >
      <View style={{ borderBottomWidth: 1, borderBottomColor: "#E5E7EB" }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 20,
            paddingVertical: 16,
          }}
        >
          <TouchableOpacity onPress={() => router.replace("/(tabs)/insurance")}>
            <X size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={{ fontSize: 16, fontWeight: "600", color: "#111827" }}>
            Select Plan
          </Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      >
        {/* Step 1: Pet Selector */}
        <View style={{ padding: 24 }}>
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: "#6B7280",
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            1. Select Companion
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ flexGrow: 0 }}
          >
            {pets?.map((pet) => (
              <TouchableOpacity
                key={pet.id}
                onPress={() => setSelectedPet(pet.id)}
                style={{
                  width: 100,
                  alignItems: "center",
                  marginRight: 16,
                  opacity: selectedPet && selectedPet !== pet.id ? 0.5 : 1,
                }}
              >
                <View
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    borderWidth: 2,
                    borderColor:
                      selectedPet === pet.id ? "#2563EB" : "transparent",
                    padding: 2,
                  }}
                >
                  <Image
                    source={{ uri: pet.image_url }}
                    style={{ width: "100%", height: "100%", borderRadius: 30 }}
                  />
                </View>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "500",
                    color: "#111827",
                    marginTop: 8,
                  }}
                >
                  {pet.name}
                </Text>
                {selectedPet === pet.id && (
                  <View
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 10,
                      backgroundColor: "#2563EB",
                      borderRadius: 10,
                      padding: 2,
                    }}
                  >
                    <Check size={12} color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Step 2: Plan Selector */}
        <View style={{ padding: 24, paddingTop: 0 }}>
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: "#6B7280",
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            2. Choose a Plan
          </Text>
          {PLANS.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              onPress={() => setSelectedPlan(plan)}
              style={{
                borderRadius: 12,
                borderWidth: 1,
                borderColor:
                  selectedPlan?.id === plan.id ? "#2563EB" : "#E5E7EB",
                padding: 20,
                marginBottom: 16,
                backgroundColor:
                  selectedPlan?.id === plan.id ? "#F9FBFF" : "#FFFFFF",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 12,
                }}
              >
                <View>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "600",
                      color: "#111827",
                    }}
                  >
                    {plan.name}
                  </Text>
                  <Text
                    style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}
                  >
                    Starting from ${plan.price}/mo
                  </Text>
                </View>
                {selectedPlan?.id === plan.id && (
                  <View
                    style={{
                      backgroundColor: "#2563EB",
                      borderRadius: 12,
                      padding: 4,
                    }}
                  >
                    <Check size={16} color="#FFFFFF" />
                  </View>
                )}
              </View>

              <View style={{ marginTop: 12 }}>
                {plan.features.map((feature, i) => (
                  <View
                    key={i}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 6,
                    }}
                  >
                    <Text style={{ color: "#9CA3AF", marginRight: 8 }}>-</Text>
                    <Text style={{ fontSize: 14, color: "#6B7280" }}>
                      {feature}
                    </Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Active Policy Warning */}
        {hasActivePolicy && (
          <View style={{ paddingHorizontal: 24, paddingBottom: 16 }}>
            <View
              style={{
                backgroundColor: "#EFF6FF",
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#BFDBFE",
                padding: 16,
                flexDirection: "row",
                alignItems: "flex-start",
              }}
            >
              <Info size={18} color="#2563EB" style={{ marginTop: 1 }} />
              <View style={{ marginLeft: 10, flex: 1 }}>
                <Text
                  style={{ fontSize: 14, fontWeight: "600", color: "#1D4ED8" }}
                >
                  Plan Already Active
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: "#3B82F6",
                    marginTop: 4,
                    lineHeight: 18,
                  }}
                >
                  This plan is active until {activePolicyExpiry}. You'll be able
                  to renew it once it expires.
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Action Footer */}
      <View
        style={{
          padding: 24,
          paddingBottom: insets.bottom + 16,
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",
        }}
      >
        <TouchableOpacity
          onPress={handlePurchase}
          disabled={
            !selectedPet ||
            !selectedPlan ||
            mutation.isPending ||
            hasActivePolicy
          }
          style={{
            backgroundColor: hasActivePolicy ? "#93C5FD" : "#2563EB",
            borderRadius: 999,
            paddingVertical: 16,
            alignItems: "center",
            opacity:
              !selectedPet || !selectedPlan || mutation.isPending ? 0.5 : 1,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "600", color: "#FFFFFF" }}>
            {mutation.isPending
              ? "Processing..."
              : hasActivePolicy
                ? "Plan Already Active"
                : "Confirm Purchase"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
