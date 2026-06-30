import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ShieldCheck,
  Plus,
  X,
  CheckCircle2,
  XCircle,
} from "lucide-react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const PLANS = [
  {
    id: "basic",
    name: "Basic Care",
    price: 19,
    features: [
      "Annual wellness checkup",
      "Vaccinations",
      "Basic accident coverage",
    ],
    color: "#6B7280",
  },
  {
    id: "standard",
    name: "Standard Protection",
    price: 29,
    features: [
      "Routine checkups",
      "Emergency visits",
      "Accident coverage",
      "Dental cleaning",
    ],
    color: "#2563EB",
    popular: true,
  },
  {
    id: "premium",
    name: "Premium Plus",
    price: 59,
    features: [
      "Everything in Standard",
      "Specialist consultations",
      "Surgery coverage",
      "Alternative therapy",
    ],
    color: "#7C3AED",
  },
];

export default function InsuranceScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedPetId, setSelectedPetId] = useState(null);

  const { data: insurances = [], isLoading: insLoading } = useQuery({
    queryKey: ["insurances"],
    queryFn: async () => {
      const res = await fetch("/api/insurances");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: pets = [] } = useQuery({
    queryKey: ["pets"],
    queryFn: async () => {
      const res = await fetch("/api/pets");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const purchaseMutation = useMutation({
    mutationFn: async ({ pet_id, plan }) => {
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1);
      const res = await fetch("/api/insurances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pet_id,
          plan_name: plan.name,
          premium: plan.price,
          end_date: endDate.toISOString().split("T")[0],
        }),
      });
      if (!res.ok) throw new Error("Failed to purchase insurance");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insurances"] });
      setShowPlanModal(false);
      setSelectedPlan(null);
      setSelectedPetId(null);
      Alert.alert("Success", "Insurance policy activated!");
    },
    onError: () =>
      Alert.alert("Error", "Failed to purchase plan. Please try again."),
  });

  const cancelMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/insurances/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to cancel");
      return res.json();
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["insurances"] }),
    onError: () => Alert.alert("Error", "Failed to cancel insurance."),
  });

  const handleCancel = (ins) => {
    Alert.alert(
      "Cancel Insurance",
      `Cancel "${ins.plan_name}"? This action cannot be undone.`,
      [
        { text: "Keep Policy", style: "cancel" },
        {
          text: "Cancel Policy",
          style: "destructive",
          onPress: () => cancelMutation.mutate(ins.id),
        },
      ],
    );
  };

  const handlePurchase = () => {
    if (!selectedPlan) return Alert.alert("Select a plan first.");
    if (!selectedPetId)
      return Alert.alert("Required", "Please select a pet for this policy.");
    purchaseMutation.mutate({ pet_id: selectedPetId, plan: selectedPlan });
  };

  const activeInsurances = insurances.filter((i) => i.status === "active");
  const cancelledInsurances = insurances.filter(
    (i) => i.status === "cancelled",
  );

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
            Insurance
          </Text>
          <Text style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>
            Protect your pets
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowPlanModal(true)}
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
      >
        {/* Active Policies */}
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: "#111827",
            marginBottom: 12,
          }}
        >
          Active Policies
        </Text>
        {insLoading ? (
          <ActivityIndicator color="#2563EB" />
        ) : activeInsurances.length === 0 ? (
          <View
            style={{
              backgroundColor: "#F9FAFB",
              borderRadius: 16,
              borderWidth: 1,
              borderColor: "#E5E7EB",
              padding: 32,
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <ShieldCheck color="#D1D5DB" size={40} />
            <Text
              style={{
                fontSize: 14,
                color: "#6B7280",
                marginTop: 12,
                textAlign: "center",
              }}
            >
              No active policies yet. Tap + to get started.
            </Text>
          </View>
        ) : (
          activeInsurances.map((ins) => {
            const pet = pets.find((p) => p.id === ins.pet_id);
            return (
              <View
                key={ins.id}
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  padding: 16,
                  marginBottom: 12,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      gap: 12,
                      alignItems: "center",
                      flex: 1,
                    }}
                  >
                    <View
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 12,
                        backgroundColor: "#EFF6FF",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <ShieldCheck color="#2563EB" size={22} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: "600",
                          color: "#111827",
                        }}
                      >
                        {ins.plan_name}
                      </Text>
                      <Text
                        style={{ fontSize: 12, color: "#6B7280", marginTop: 1 }}
                      >
                        {pet
                          ? `For ${pet.name}`
                          : `Policy: ${ins.policy_number}`}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: "#ECFDF5",
                        borderRadius: 100,
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 10,
                          color: "#059669",
                          fontWeight: "600",
                        }}
                      >
                        Active
                      </Text>
                    </View>
                  </View>
                </View>
                <View
                  style={{
                    marginTop: 12,
                    paddingTop: 12,
                    borderTopWidth: 1,
                    borderTopColor: "#F3F4F6",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <View>
                    <Text style={{ fontSize: 11, color: "#9CA3AF" }}>
                      Monthly Premium
                    </Text>
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: "700",
                        color: "#111827",
                      }}
                    >
                      ${ins.premium}/mo
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleCancel(ins)}
                    style={{
                      backgroundColor: "#FEF2F2",
                      borderRadius: 8,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <XCircle size={14} color="#EF4444" />
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "500",
                        color: "#EF4444",
                      }}
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}

        {/* Cancelled Policies */}
        {cancelledInsurances.length > 0 && (
          <>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: "#9CA3AF",
                marginBottom: 12,
                marginTop: 8,
              }}
            >
              Cancelled Policies
            </Text>
            {cancelledInsurances.map((ins) => (
              <View
                key={ins.id}
                style={{
                  backgroundColor: "#F9FAFB",
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  padding: 16,
                  marginBottom: 12,
                  opacity: 0.7,
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
                      width: 42,
                      height: 42,
                      borderRadius: 12,
                      backgroundColor: "#F3F4F6",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <ShieldCheck color="#9CA3AF" size={22} />
                  </View>
                  <View>
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: "600",
                        color: "#6B7280",
                      }}
                    >
                      {ins.plan_name}
                    </Text>
                    <Text style={{ fontSize: 12, color: "#9CA3AF" }}>
                      Policy: {ins.policy_number}
                    </Text>
                  </View>
                  <View
                    style={{
                      marginLeft: "auto",
                      backgroundColor: "#F3F4F6",
                      borderRadius: 100,
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        color: "#6B7280",
                        fontWeight: "600",
                      }}
                    >
                      Cancelled
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      {/* Plan Selection Modal */}
      <Modal visible={showPlanModal} animationType="slide" transparent>
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}
          onPress={() => setShowPlanModal(false)}
        >
          <Pressable
            onPress={() => {}}
            style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}
          >
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                paddingBottom: insets.bottom + 24,
                maxHeight: "92%",
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
                  style={{ fontSize: 18, fontWeight: "600", color: "#111827" }}
                >
                  Choose a Plan
                </Text>
                <TouchableOpacity onPress={() => setShowPlanModal(false)}>
                  <X size={22} color="#6B7280" />
                </TouchableOpacity>
              </View>
              <ScrollView
                style={{ padding: 20 }}
                showsVerticalScrollIndicator={false}
              >
                {/* Pet selector */}
                {pets.length > 0 && (
                  <View style={{ marginBottom: 20 }}>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "500",
                        color: "#374151",
                        marginBottom: 10,
                      }}
                    >
                      Select Pet *
                    </Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={{ flexGrow: 0 }}
                    >
                      {pets.map((pet) => (
                        <TouchableOpacity
                          key={pet.id}
                          onPress={() => setSelectedPetId(pet.id)}
                          style={{
                            borderWidth: 1,
                            borderColor:
                              selectedPetId === pet.id ? "#2563EB" : "#E5E7EB",
                            borderRadius: 12,
                            paddingHorizontal: 16,
                            paddingVertical: 10,
                            marginRight: 10,
                            backgroundColor:
                              selectedPetId === pet.id ? "#EFF6FF" : "#FAFAFA",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 14,
                              fontWeight: "500",
                              color:
                                selectedPetId === pet.id
                                  ? "#1D4ED8"
                                  : "#374151",
                            }}
                          >
                            {pet.name}
                          </Text>
                          <Text
                            style={{
                              fontSize: 11,
                              color: "#9CA3AF",
                              textTransform: "capitalize",
                            }}
                          >
                            {pet.species}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

                {/* Plan cards */}
                {PLANS.map((plan) => (
                  <TouchableOpacity
                    key={plan.id}
                    onPress={() => setSelectedPlan(plan)}
                    style={{
                      borderWidth: 2,
                      borderColor:
                        selectedPlan?.id === plan.id ? plan.color : "#E5E7EB",
                      borderRadius: 16,
                      padding: 18,
                      marginBottom: 14,
                      backgroundColor:
                        selectedPlan?.id === plan.id ? "#F8F9FF" : "#FFFFFF",
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <View>
                        {plan.popular && (
                          <View
                            style={{
                              backgroundColor: "#EFF6FF",
                              borderRadius: 100,
                              paddingHorizontal: 8,
                              paddingVertical: 2,
                              marginBottom: 6,
                              alignSelf: "flex-start",
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 10,
                                color: "#2563EB",
                                fontWeight: "700",
                              }}
                            >
                              POPULAR
                            </Text>
                          </View>
                        )}
                        <Text
                          style={{
                            fontSize: 17,
                            fontWeight: "700",
                            color: "#111827",
                          }}
                        >
                          {plan.name}
                        </Text>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "baseline",
                            gap: 2,
                            marginTop: 4,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 24,
                              fontWeight: "700",
                              color: plan.color,
                            }}
                          >
                            ${plan.price}
                          </Text>
                          <Text style={{ fontSize: 13, color: "#6B7280" }}>
                            /mo
                          </Text>
                        </View>
                      </View>
                      {selectedPlan?.id === plan.id && (
                        <CheckCircle2 size={22} color={plan.color} />
                      )}
                    </View>
                    <View style={{ marginTop: 14, gap: 8 }}>
                      {plan.features.map((f) => (
                        <View
                          key={f}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <View
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: 3,
                              backgroundColor: plan.color,
                            }}
                          />
                          <Text style={{ fontSize: 13, color: "#4B5563" }}>
                            {f}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  onPress={handlePurchase}
                  disabled={
                    purchaseMutation.isPending ||
                    !selectedPlan ||
                    !selectedPetId
                  }
                  style={{
                    backgroundColor:
                      !selectedPlan || !selectedPetId ? "#D1D5DB" : "#2563EB",
                    borderRadius: 12,
                    paddingVertical: 14,
                    alignItems: "center",
                    marginTop: 4,
                    marginBottom: 8,
                  }}
                >
                  {purchaseMutation.isPending ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text
                      style={{
                        color: "white",
                        fontSize: 15,
                        fontWeight: "600",
                      }}
                    >
                      {selectedPlan
                        ? `Activate ${selectedPlan.name}`
                        : "Select a Plan"}
                    </Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
