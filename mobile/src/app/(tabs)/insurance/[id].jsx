import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Shield, CheckCircle, FileText } from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";

const PLAN_DETAILS = {
  Basic: {
    color: "#6B7280",
    bg: "#F9FAFB",
    coverage: [
      "Annual wellness exams",
      "Core vaccinations",
      "Flea & tick prevention",
      "Basic accident coverage",
    ],
    notCovered: [
      "Specialist consultations",
      "Dental procedures",
      "Hereditary conditions",
    ],
    maxPayout: "$5,000 / year",
    deductible: "$250",
    waitingPeriod: "14 days",
  },
  Premium: {
    color: "#2563EB",
    bg: "#EFF6FF",
    coverage: [
      "Everything in Basic",
      "Specialist consultations",
      "Dental cleanings",
      "Prescription medications",
      "Emergency hospitalization",
      "Lab tests & diagnostics",
    ],
    notCovered: ["Cosmetic procedures", "Pre-existing conditions"],
    maxPayout: "$15,000 / year",
    deductible: "$100",
    waitingPeriod: "7 days",
  },
  Ultra: {
    color: "#7C3AED",
    bg: "#F5F3FF",
    coverage: [
      "Everything in Premium",
      "Hereditary & congenital conditions",
      "Behavioral therapy",
      "Alternative therapies",
      "Cancer treatment",
      "Chronic disease management",
      "Unlimited specialist visits",
    ],
    notCovered: ["Cosmetic procedures only"],
    maxPayout: "Unlimited",
    deductible: "$0",
    waitingPeriod: "3 days",
  },
};

export default function PolicyDetail() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();

  const { data: policies, isLoading: policiesLoading } = useQuery({
    queryKey: ["policies"],
    queryFn: () => fetch("/api/insurance").then((res) => res.json()),
  });

  const { data: pets } = useQuery({
    queryKey: ["pets"],
    queryFn: () => fetch("/api/pets").then((res) => res.json()),
  });

  const policy = policies?.find((p) => p.id === parseInt(id));
  const pet = pets?.find((p) => p.id === policy?.pet_id);

  const planKey = policy?.plan_name?.split(" ")[0]; // e.g. "Basic Plan" → "Basic"
  const details = PLAN_DETAILS[planKey] || PLAN_DETAILS.Basic;

  const startDate = policy?.start_date ? new Date(policy.start_date) : null;
  const endDate = startDate
    ? new Date(new Date(startDate).setFullYear(startDate.getFullYear() + 1))
    : null;

  if (policiesLoading) {
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

  if (!policy) {
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
        <Text style={{ fontSize: 14, color: "#6B7280" }}>
          Policy not found.
        </Text>
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
    <View
      style={{ flex: 1, backgroundColor: "#FFFFFF", paddingTop: insets.top }}
    >
      {/* Header */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: "#E5E7EB",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 18,
            fontWeight: "600",
            color: "#111827",
            marginLeft: 16,
          }}
        >
          Policy Details
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 24,
          paddingBottom: insets.bottom + 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Plan header */}
        <View
          style={{
            backgroundColor: details.bg,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "#E5E7EB",
            padding: 20,
            marginBottom: 24,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: "#FFFFFF",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: "#E5E7EB",
              }}
            >
              <Shield size={24} color={details.color} />
            </View>
            <View style={{ marginLeft: 14 }}>
              <Text
                style={{ fontSize: 20, fontWeight: "700", color: "#111827" }}
              >
                {policy.plan_name}
              </Text>
              <Text style={{ fontSize: 13, color: "#6B7280" }}>
                Covering {pet?.name || "your pet"}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: "#10B981",
                marginRight: 8,
              }}
            />
            <Text style={{ fontSize: 13, color: "#10B981", fontWeight: "600" }}>
              Active
            </Text>
          </View>
        </View>

        {/* Key Stats */}
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
          <View
            style={{
              flex: 1,
              backgroundColor: "#F9FAFB",
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#E5E7EB",
              padding: 16,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                color: "#6B7280",
                fontWeight: "500",
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              Monthly Premium
            </Text>
            <Text style={{ fontSize: 22, fontWeight: "700", color: "#111827" }}>
              ${policy.premium}
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              backgroundColor: "#F9FAFB",
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#E5E7EB",
              padding: 16,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                color: "#6B7280",
                fontWeight: "500",
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              Max Payout
            </Text>
            <Text style={{ fontSize: 18, fontWeight: "700", color: "#111827" }}>
              {details.maxPayout}
            </Text>
          </View>
        </View>

        {/* Dates */}
        <View
          style={{
            backgroundColor: "#F9FAFB",
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#E5E7EB",
            padding: 16,
            marginBottom: 24,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: "#111827",
              marginBottom: 12,
            }}
          >
            Coverage Period
          </Text>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <View>
              <Text
                style={{
                  fontSize: 11,
                  color: "#6B7280",
                  fontWeight: "500",
                  marginBottom: 4,
                }}
              >
                Start Date
              </Text>
              <Text
                style={{ fontSize: 14, fontWeight: "600", color: "#111827" }}
              >
                {startDate
                  ? startDate.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "N/A"}
              </Text>
            </View>
            <View style={{ width: 1, backgroundColor: "#E5E7EB" }} />
            <View>
              <Text
                style={{
                  fontSize: 11,
                  color: "#6B7280",
                  fontWeight: "500",
                  marginBottom: 4,
                }}
              >
                End Date
              </Text>
              <Text
                style={{ fontSize: 14, fontWeight: "600", color: "#111827" }}
              >
                {endDate
                  ? endDate.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "N/A"}
              </Text>
            </View>
            <View>
              <Text
                style={{
                  fontSize: 11,
                  color: "#6B7280",
                  fontWeight: "500",
                  marginBottom: 4,
                }}
              >
                Deductible
              </Text>
              <Text
                style={{ fontSize: 14, fontWeight: "600", color: "#111827" }}
              >
                {details.deductible}
              </Text>
            </View>
          </View>
        </View>

        {/* What's Covered */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: "#111827",
              marginBottom: 14,
            }}
          >
            What's Covered ✅
          </Text>
          {details.coverage.map((item, i) => (
            <View
              key={i}
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                marginBottom: 10,
              }}
            >
              <CheckCircle size={18} color="#10B981" style={{ marginTop: 1 }} />
              <Text
                style={{
                  fontSize: 14,
                  color: "#374151",
                  marginLeft: 10,
                  flex: 1,
                  lineHeight: 22,
                }}
              >
                {item}
              </Text>
            </View>
          ))}
        </View>

        {/* Not Covered */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: "#111827",
              marginBottom: 14,
            }}
          >
            Not Covered ❌
          </Text>
          {details.notCovered.map((item, i) => (
            <View
              key={i}
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                marginBottom: 10,
              }}
            >
              <View
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 9,
                  backgroundColor: "#FEE2E2",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 1,
                }}
              >
                <Text
                  style={{ fontSize: 10, color: "#EF4444", fontWeight: "700" }}
                >
                  ✕
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 14,
                  color: "#6B7280",
                  marginLeft: 10,
                  flex: 1,
                  lineHeight: 22,
                }}
              >
                {item}
              </Text>
            </View>
          ))}
        </View>

        {/* File a Claim Button */}
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/(tabs)/insurance/claim",
              params: { policyId: policy.id, petId: policy.pet_id },
            })
          }
          style={{
            backgroundColor: "#2563EB",
            paddingVertical: 16,
            borderRadius: 999,
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "600", color: "#FFFFFF" }}>
            File a Claim
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
