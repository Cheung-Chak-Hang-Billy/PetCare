import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { X, Upload, CheckCircle } from "lucide-react-native";
import * as DocumentPicker from "expo-document-picker";
import useUpload from "@/utils/useUpload";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";

export default function FileClaim() {
  const insets = useSafeAreaInsets();
  const { policyId, petId } = useLocalSearchParams();
  const queryClient = useQueryClient();
  const [upload, { loading: uploading }] = useUpload();

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [document, setDocument] = useState(null);
  const [success, setSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: (newClaim) =>
      fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newClaim),
      }).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["policies"] });
      setSuccess(true);
    },
  });

  const pickDocument = useCallback(async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "*/*",
      copyToCacheDirectory: true,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      const { url, error } = await upload({ reactNativeAsset: asset });
      if (!error) {
        setDocument(url);
      }
    }
  }, [upload]);

  const handleSubmit = () => {
    if (!description || !amount || !policyId) return;
    mutation.mutate({
      policy_id: parseInt(policyId),
      pet_id: parseInt(petId),
      description,
      amount: parseFloat(amount),
      document_url: document,
    });
  };

  if (success) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#FFFFFF",
          alignItems: "center",
          justifyContent: "center",
          padding: 40,
        }}
      >
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: "#EFF6FF",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 24,
          }}
        >
          <CheckCircle size={32} color="#2563EB" />
        </View>
        <Text
          style={{
            fontSize: 24,
            fontWeight: "600",
            color: "#111827",
            textAlign: "center",
            marginBottom: 12,
          }}
        >
          Claim Submitted
        </Text>
        <Text
          style={{
            fontSize: 16,
            color: "#6B7280",
            textAlign: "center",
            lineHeight: 24,
            marginBottom: 32,
          }}
        >
          Your claim is now being processed. You'll receive a notification once
          the review is complete.
        </Text>
        <TouchableOpacity
          onPress={() => router.replace("/(tabs)/insurance")}
          style={{
            backgroundColor: "#2563EB",
            paddingHorizontal: 32,
            paddingVertical: 14,
            borderRadius: 999,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "600", color: "#FFFFFF" }}>
            Back to Dashboard
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

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
          <TouchableOpacity onPress={() => router.back()}>
            <X size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={{ fontSize: 16, fontWeight: "600", color: "#111827" }}>
            File a Claim
          </Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      <KeyboardAvoidingAnimatedView style={{ flex: 1 }} behavior="padding">
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24 }}>
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: "#6B7280",
              textTransform: "uppercase",
              marginBottom: 20,
            }}
          >
            Claim Details
          </Text>

          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "500",
                color: "#374151",
                marginBottom: 8,
              }}
            >
              Description
            </Text>
            <TextInput
              placeholder="E.g. Routine checkup and vaccinations"
              placeholderTextColor="#9CA3AF"
              multiline
              style={{
                backgroundColor: "#FFFFFF",
                borderWidth: 1,
                borderColor: "#E5E7EB",
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                color: "#111827",
                minHeight: 100,
                textAlignVertical: "top",
              }}
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "500",
                color: "#374151",
                marginBottom: 8,
              }}
            >
              Amount Requested ($)
            </Text>
            <TextInput
              placeholder="0.00"
              placeholderTextColor="#9CA3AF"
              keyboardType="decimal-pad"
              style={{
                backgroundColor: "#FFFFFF",
                borderWidth: 1,
                borderColor: "#E5E7EB",
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                color: "#111827",
              }}
              value={amount}
              onChangeText={setAmount}
            />
          </View>

          <View style={{ marginBottom: 32 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "500",
                color: "#374151",
                marginBottom: 8,
              }}
            >
              Supporting Documents
            </Text>
            <TouchableOpacity
              onPress={pickDocument}
              disabled={uploading}
              style={{
                borderWidth: 1,
                borderColor: "#E5E7EB",
                borderStyle: "dashed",
                borderRadius: 8,
                padding: 24,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: document ? "#F9FBFF" : "#FFFFFF",
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
                  marginBottom: 12,
                }}
              >
                <Upload size={20} color="#6B7280" />
              </View>
              <Text
                style={{ fontSize: 14, fontWeight: "600", color: "#111827" }}
              >
                {document ? "Document Uploaded" : "Upload Invoice or Receipt"}
              </Text>
              <Text style={{ fontSize: 12, color: "#6B7280", marginTop: 4 }}>
                {uploading ? "Uploading..." : "Tap to select a file"}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!description || !amount || mutation.isPending}
            style={{
              backgroundColor: "#2563EB",
              borderRadius: 999,
              paddingVertical: 16,
              alignItems: "center",
              opacity: !description || !amount || mutation.isPending ? 0.5 : 1,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "600", color: "#FFFFFF" }}>
              {mutation.isPending ? "Submitting..." : "Submit Claim"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingAnimatedView>
    </View>
  );
}
