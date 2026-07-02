import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import {
  Shield,
  Plus,
  FileText,
  ChevronRight,
  AlertCircle,
} from "lucide-react-native";
import { Image } from "expo-image";
import { router } from "expo-router";

export default function InsuranceDashboard() {
  const insets = useSafeAreaInsets();

  const { data: policies, isLoading } = useQuery({
    queryKey: ["policies"],
    queryFn: () => fetch("/api/insurance").then((res) => res.json()),
  });

  const { data: pets } = useQuery({
    queryKey: ["pets"],
    queryFn: () => fetch("/api/pets").then((res) => res.json()),
  });

  const handleBuyPolicy = () => {
    if (!pets || pets.length === 0) {
      Alert.alert(
        "No Companion Added",
        "Please add a companion in your Profile before purchasing an insurance plan.",
        [{ text: "OK" }],
      );
      return;
    }
    router.push("/(tabs)/insurance/buy");
  };

  const getPetInfo = (id) => pets?.find((p) => p.id === id);

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
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Shield size={26} color="#FFFFFF" />
          <Text style={{ fontSize: 26, fontWeight: "700", color: "#FFFFFF" }}>
            Pet Insurance
          </Text>
        </View>
        <Text style={{ fontSize: 14, color: "#BFDBFE", marginTop: 6 }}>
          Comprehensive protection for your loved ones.
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Active Policies */}
        <View style={{ padding: 24 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 17, fontWeight: "600", color: "#111827" }}>
              Active Policies
            </Text>
            <TouchableOpacity
              onPress={handleBuyPolicy}
              style={{
                backgroundColor: "#2563EB",
                paddingHorizontal: 14,
                paddingVertical: 6,
                borderRadius: 999,
              }}
            >
              <Text
                style={{ fontSize: 13, fontWeight: "600", color: "#FFFFFF" }}
              >
                Buy Policy
              </Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <Text style={{ fontSize: 14, color: "#6B7280" }}>
              Loading policies...
            </Text>
          ) : policies?.length > 0 ? (
            policies.map((policy) => {
              const pet = getPetInfo(policy.pet_id);
              return (
                <TouchableOpacity
                  key={policy.id}
                  onPress={() => router.push(`/(tabs)/insurance/${policy.id}`)}
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
                    shadowColor: "#2563EB",
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
                      marginBottom: 16,
                    }}
                  >
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: "#F3F4F6",
                        alignItems: "center",
                        justifyContent: "center",
                        borderWidth: 1,
                        borderColor: "#E5E7EB",
                      }}
                    >
                      <Shield size={20} color="#2563EB" />
                    </View>
                    <View style={{ marginLeft: 12, flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "600",
                          color: "#111827",
                        }}
                      >
                        {policy.plan_name}
                      </Text>
                      <Text style={{ fontSize: 13, color: "#6B7280" }}>
                        Covering {pet?.name || "Your Pet"}
                      </Text>
                    </View>
                    <View
                      style={{
                        backgroundColor: "#FFFFFF",
                        borderWidth: 1,
                        borderColor: "#E5E7EB",
                        borderRadius: 999,
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <View
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: "#10B981",
                          marginRight: 6,
                        }}
                      />
                      <Text
                        style={{
                          fontSize: 10,
                          color: "#6B7280",
                          fontWeight: "500",
                        }}
                      >
                        Active
                      </Text>
                    </View>
                  </View>

                  <View
                    style={{
                      borderTopWidth: 1,
                      borderTopColor: "#F3F4F6",
                      paddingTop: 16,
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <View>
                      <Text
                        style={{
                          fontSize: 11,
                          color: "#6B7280",
                          fontWeight: "500",
                          textTransform: "uppercase",
                        }}
                      >
                        Monthly Premium
                      </Text>
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: "600",
                          color: "#111827",
                        }}
                      >
                        ${policy.premium}
                      </Text>
                    </View>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <TouchableOpacity
                        onPress={() => {
                          router.push({
                            pathname: "/(tabs)/insurance/claim",
                            params: {
                              policyId: policy.id,
                              petId: policy.pet_id,
                            },
                          });
                        }}
                        style={{
                          backgroundColor: "#2563EB",
                          borderRadius: 999,
                          paddingHorizontal: 14,
                          paddingVertical: 8,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: "600",
                            color: "#FFFFFF",
                          }}
                        >
                          File Claim
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View
              style={{
                backgroundColor: "#F9FAFB",
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#E5E7EB",
                padding: 24,
                alignItems: "center",
                borderStyle: "dashed",
              }}
            >
              <Text
                style={{ fontSize: 14, color: "#6B7280", textAlign: "center" }}
              >
                Protect your pets today. Insurance plans starting from $15/mo.
              </Text>
              <TouchableOpacity
                onPress={handleBuyPolicy}
                style={{
                  marginTop: 16,
                  backgroundColor: "#2563EB",
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 999,
                }}
              >
                <Text
                  style={{ fontSize: 14, fontWeight: "600", color: "#FFFFFF" }}
                >
                  Explore Plans
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Claims History */}
          <View style={{ marginTop: 32 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: "#111827",
                marginBottom: 16,
              }}
            >
              Recent Claims
            </Text>
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#E5E7EB",
              }}
            >
              <TouchableOpacity
                style={{
                  padding: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  borderBottomWidth: 1,
                  borderBottomColor: "#F3F4F6",
                }}
              >
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    backgroundColor: "#F9FAFB",
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 1,
                    borderColor: "#E5E7EB",
                  }}
                >
                  <FileText size={16} color="#6B7280" />
                </View>
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: "#111827",
                    }}
                  >
                    Vaccination Reimbursement
                  </Text>
                  <Text style={{ fontSize: 12, color: "#6B7280" }}>
                    May 12, 2026 • $45.00
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: "#EFF6FF",
                    borderRadius: 999,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      color: "#2563EB",
                      fontWeight: "600",
                    }}
                  >
                    Paid
                  </Text>
                </View>
                <ChevronRight
                  size={16}
                  color="#E5E7EB"
                  style={{ marginLeft: 8 }}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  padding: 16,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    backgroundColor: "#F9FAFB",
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 1,
                    borderColor: "#E5E7EB",
                  }}
                >
                  <FileText size={16} color="#6B7280" />
                </View>
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: "#111827",
                    }}
                  >
                    Dental Checkup
                  </Text>
                  <Text style={{ fontSize: 12, color: "#6B7280" }}>
                    Apr 28, 2026 • $120.00
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: "#F3F4F6",
                    borderRadius: 999,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      color: "#6B7280",
                      fontWeight: "600",
                    }}
                  >
                    Processing
                  </Text>
                </View>
                <ChevronRight
                  size={16}
                  color="#E5E7EB"
                  style={{ marginLeft: 8 }}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Help Card */}
          <View
            style={{
              marginTop: 32,
              backgroundColor: "#F9FAFB",
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#E5E7EB",
              padding: 16,
              flexDirection: "row",
              alignItems: "flex-start",
            }}
          >
            <AlertCircle size={20} color="#6B7280" />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text
                style={{ fontSize: 14, fontWeight: "600", color: "#111827" }}
              >
                Need help with a claim?
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: "#6B7280",
                  marginTop: 2,
                  lineHeight: 18,
                }}
              >
                Our AI assistant can help you gather the right documents for a
                faster reimbursement.
              </Text>
              <TouchableOpacity style={{ marginTop: 8 }}>
                <Text
                  style={{ fontSize: 13, color: "#2563EB", fontWeight: "600" }}
                >
                  Start AI Review →
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
