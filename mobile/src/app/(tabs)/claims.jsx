import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  FileText,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Upload,
  X,
  Paperclip,
} from "lucide-react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as DocumentPicker from "expo-document-picker";
import useUpload from "@/utils/useUpload";

export default function ClaimsScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ type: "", amount: "", description: "" });
  const [selectedInsuranceId, setSelectedInsuranceId] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [upload, { loading: uploading }] = useUpload();

  const { data: claims = [], isLoading } = useQuery({
    queryKey: ["claims"],
    queryFn: async () => {
      const res = await fetch("/api/claims");
      if (!res.ok) throw new Error("Failed to fetch claims");
      return res.json();
    },
  });

  const { data: insurances = [] } = useQuery({
    queryKey: ["insurances"],
    queryFn: async () => {
      const res = await fetch("/api/insurances");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const activeInsurances = insurances.filter((i) => i.status === "active");

  const addClaimMutation = useMutation({
    mutationFn: async (claimData) => {
      const res = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(claimData),
      });
      if (!res.ok) throw new Error("Failed to file claim");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["claims"] });
      setShowModal(false);
      setForm({ type: "", amount: "", description: "" });
      setSelectedInsuranceId(null);
      setSelectedDoc(null);
    },
    onError: () =>
      Alert.alert("Error", "Failed to file claim. Please try again."),
  });

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "*/*",
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets?.[0]) {
      setSelectedDoc(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
    if (!form.type || !form.amount) {
      Alert.alert("Required", "Please fill in Claim Type and Amount.");
      return;
    }
    if (!selectedInsuranceId) {
      Alert.alert("Required", "Please select an insurance policy.");
      return;
    }

    let document_url = null;
    if (selectedDoc) {
      const { url, error } = await upload({ url: selectedDoc.uri });
      if (error) {
        Alert.alert(
          "Upload Error",
          "Could not upload document. Proceeding without it.",
        );
      } else {
        document_url = url;
      }
    }

    addClaimMutation.mutate({
      insurance_id: selectedInsuranceId,
      type: form.type,
      amount: parseFloat(form.amount),
      description: form.description,
      document_url,
    });
  };

  const openModal = () => {
    if (activeInsurances.length === 0) {
      Alert.alert(
        "No Insurance",
        "You need an active insurance policy before filing a claim.",
      );
      return;
    }
    if (activeInsurances.length === 1)
      setSelectedInsuranceId(activeInsurances[0].id);
    setShowModal(true);
  };

  const statusConfig = {
    approved: {
      icon: <CheckCircle2 size={14} color="#10B981" />,
      color: "#10B981",
      bg: "#ECFDF5",
    },
    rejected: {
      icon: <AlertCircle size={14} color="#EF4444" />,
      color: "#EF4444",
      bg: "#FEF2F2",
    },
    pending: {
      icon: <Clock size={14} color="#F59E0B" />,
      color: "#F59E0B",
      bg: "#FFFBEB",
    },
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
            Claims
          </Text>
          <Text style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>
            Track your reimbursements
          </Text>
        </View>
        <TouchableOpacity
          onPress={openModal}
          style={{
            backgroundColor: "#2563EB",
            borderRadius: 10,
            paddingHorizontal: 16,
            paddingVertical: 10,
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Plus color="white" size={16} />
          <Text style={{ color: "white", fontSize: 13, fontWeight: "600" }}>
            New Claim
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: insets.bottom + 80,
        }}
      >
        {isLoading ? (
          <ActivityIndicator color="#2563EB" style={{ marginTop: 40 }} />
        ) : claims.length === 0 ? (
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              marginTop: 60,
            }}
          >
            <FileText color="#D1D5DB" size={48} />
            <Text style={{ fontSize: 14, color: "#6B7280", marginTop: 12 }}>
              No claims filed yet
            </Text>
          </View>
        ) : (
          claims.map((claim) => {
            const cfg = statusConfig[claim.status] || statusConfig.pending;
            return (
              <View
                key={claim.id}
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
                    justifyContent: "space-between",
                    marginBottom: 12,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: "600",
                        color: "#111827",
                      }}
                    >
                      {claim.type}
                    </Text>
                    <Text
                      style={{ fontSize: 12, color: "#6B7280", marginTop: 1 }}
                    >
                      {new Date(claim.date_filed).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "700",
                      color: "#111827",
                    }}
                  >
                    ${parseFloat(claim.amount).toFixed(2)}
                  </Text>
                </View>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                      backgroundColor: cfg.bg,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 100,
                    }}
                  >
                    {cfg.icon}
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "500",
                        color: cfg.color,
                        textTransform: "capitalize",
                      }}
                    >
                      {claim.status}
                    </Text>
                  </View>
                  {claim.document_url && (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Paperclip size={12} color="#9CA3AF" />
                      <Text style={{ fontSize: 11, color: "#9CA3AF" }}>
                        Document attached
                      </Text>
                    </View>
                  )}
                </View>
                {claim.description ? (
                  <Text
                    style={{
                      fontSize: 13,
                      color: "#6B7280",
                      marginTop: 10,
                      lineHeight: 18,
                    }}
                  >
                    {claim.description}
                  </Text>
                ) : null}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* New Claim Modal */}
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
                    File New Claim
                  </Text>
                  <TouchableOpacity onPress={() => setShowModal(false)}>
                    <X size={22} color="#6B7280" />
                  </TouchableOpacity>
                </View>
                <ScrollView
                  style={{ padding: 20 }}
                  showsVerticalScrollIndicator={false}
                >
                  {/* Insurance selector */}
                  {activeInsurances.length > 1 && (
                    <View style={{ marginBottom: 16 }}>
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "500",
                          color: "#374151",
                          marginBottom: 8,
                        }}
                      >
                        Insurance Policy *
                      </Text>
                      {activeInsurances.map((ins) => (
                        <TouchableOpacity
                          key={ins.id}
                          onPress={() => setSelectedInsuranceId(ins.id)}
                          style={{
                            borderWidth: 1,
                            borderColor:
                              selectedInsuranceId === ins.id
                                ? "#2563EB"
                                : "#E5E7EB",
                            borderRadius: 10,
                            padding: 12,
                            marginBottom: 8,
                            backgroundColor:
                              selectedInsuranceId === ins.id
                                ? "#EFF6FF"
                                : "#FAFAFA",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 14,
                              fontWeight: "500",
                              color:
                                selectedInsuranceId === ins.id
                                  ? "#1D4ED8"
                                  : "#111827",
                            }}
                          >
                            {ins.plan_name}
                          </Text>
                          <Text style={{ fontSize: 12, color: "#6B7280" }}>
                            {ins.policy_number}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {[
                    {
                      label: "Claim Type *",
                      key: "type",
                      placeholder: "e.g. Vet Visit, Medication, Surgery",
                    },
                    {
                      label: "Amount ($) *",
                      key: "amount",
                      placeholder: "e.g. 250.00",
                      keyboardType: "decimal-pad",
                    },
                    {
                      label: "Description",
                      key: "description",
                      placeholder: "Brief description of the claim...",
                      multiline: true,
                    },
                  ].map(
                    ({ label, key, placeholder, keyboardType, multiline }) => (
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
                          multiline={multiline}
                          numberOfLines={multiline ? 3 : 1}
                          style={{
                            borderWidth: 1,
                            borderColor: "#E5E7EB",
                            borderRadius: 10,
                            paddingHorizontal: 14,
                            paddingVertical: 12,
                            fontSize: 14,
                            color: "#111827",
                            backgroundColor: "#FAFAFA",
                            textAlignVertical: multiline ? "top" : "auto",
                            minHeight: multiline ? 80 : undefined,
                          }}
                        />
                      </View>
                    ),
                  )}

                  {/* Document Upload */}
                  <View style={{ marginBottom: 20 }}>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "500",
                        color: "#374151",
                        marginBottom: 8,
                      }}
                    >
                      Supporting Document
                    </Text>
                    <TouchableOpacity
                      onPress={pickDocument}
                      style={{
                        borderWidth: 1,
                        borderColor: "#E5E7EB",
                        borderRadius: 10,
                        borderStyle: "dashed",
                        padding: 16,
                        alignItems: "center",
                        backgroundColor: "#FAFAFA",
                      }}
                    >
                      <Upload size={20} color="#9CA3AF" />
                      {selectedDoc ? (
                        <Text
                          style={{
                            fontSize: 13,
                            color: "#2563EB",
                            fontWeight: "500",
                            marginTop: 6,
                          }}
                          numberOfLines={1}
                        >
                          {selectedDoc.name}
                        </Text>
                      ) : (
                        <Text
                          style={{
                            fontSize: 13,
                            color: "#9CA3AF",
                            marginTop: 6,
                          }}
                        >
                          Tap to attach receipt or document
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={addClaimMutation.isPending || uploading}
                    style={{
                      backgroundColor:
                        addClaimMutation.isPending || uploading
                          ? "#93C5FD"
                          : "#2563EB",
                      borderRadius: 12,
                      paddingVertical: 14,
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    {addClaimMutation.isPending || uploading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text
                        style={{
                          color: "white",
                          fontSize: 15,
                          fontWeight: "600",
                        }}
                      >
                        Submit Claim
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
