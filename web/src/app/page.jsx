"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  Plus,
  BookOpen,
  ShieldCheck,
  FileText,
  Search,
  ChevronRight,
  Heart,
  Calendar,
  Activity,
  User,
  MoreVertical,
  Filter,
  Camera,
} from "lucide-react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

const queryClient = new QueryClient();

function Dashboard() {
  const [activeTab, setActiveTab] = useState("Pets");
  const [selectedPet, setSelectedPet] = useState(null);
  const qClient = useQueryClient();

  const { data: pets = [], isLoading: petsLoading } = useQuery({
    queryKey: ["pets"],
    queryFn: async () => {
      const res = await fetch("/api/pets");
      if (!res.ok) throw new Error("Failed to fetch pets");
      return res.json();
    },
  });

  const { data: insurances = [] } = useQuery({
    queryKey: ["insurances"],
    queryFn: async () => {
      const res = await fetch("/api/insurances");
      if (!res.ok) throw new Error("Failed to fetch insurances");
      return res.json();
    },
  });

  const tabs = ["Pets", "Insurance", "Claims"];

  const renderContent = () => {
    switch (activeTab) {
      case "Pets":
        return (
          <PetSection
            pets={pets}
            loading={petsLoading}
            onSelectPet={setSelectedPet}
          />
        );
      case "Insurance":
        return <InsuranceSection insurances={insurances} pets={pets} />;
      case "Claims":
        return <ClaimsSection insurances={insurances} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-inter antialiased">
      {/* Header */}
      <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                <Heart size={20} fill="currentColor" />
              </div>
              <span className="font-semibold text-gray-900 tracking-tight text-lg">
                PetCare
              </span>
            </div>

            <nav className="flex items-center gap-6">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setSelectedPet(null);
                  }}
                  className={`relative py-5 text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? "text-gray-900"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600 -mb-[1px]"
                    />
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-white border border-[#E5E7EB] rounded-full px-3 py-1 text-xs text-gray-500 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              Connected
            </div>
            <button className="w-9 h-9 rounded-full border border-[#E5E7EB] flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
              <User size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {selectedPet ? (
            <PetDetail pet={selectedPet} onBack={() => setSelectedPet(null)} />
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function PetSection({ pets, loading, onSelectPet }) {
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
            Your Pets
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and view information for all your registered pets.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          Add Pet
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array(3)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="bg-white border border-[#E5E7EB] rounded-xl p-6 animate-pulse"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-full mb-4" />
                <div className="h-4 bg-gray-100 rounded w-1/2 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/3" />
              </div>
            ))
        ) : pets.length === 0 ? (
          <div className="col-span-full bg-white border border-[#E5E7EB] rounded-xl p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <Plus size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No pets yet</h3>
            <p className="text-sm text-gray-500 mt-2 max-w-xs">
              Register your first pet to start tracking their diary and managing
              insurance.
            </p>
          </div>
        ) : (
          pets.map((pet) => (
            <div
              key={pet.id}
              onClick={() => onSelectPet(pet)}
              className="bg-white border border-[#E5E7EB] rounded-xl p-6 hover:border-gray-300 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-[#E5E7EB]">
                  {pet.photo_url ? (
                    <img
                      src={pet.photo_url}
                      alt={pet.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-gray-300">
                      {pet.name[0]}
                    </span>
                  )}
                </div>
                <div className="bg-white border border-[#E5E7EB] rounded-full px-3 py-1 text-xs text-gray-700 flex items-center gap-1.5 capitalize">
                  {pet.species}
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {pet.name}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {pet.breed || "Unknown breed"}
              </p>

              <div className="mt-6 pt-6 border-t border-[#E5E7EB] flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Activity size={14} className="text-gray-400" />{" "}
                    {pet.weight || "--"} kg
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={14} className="text-gray-400" />{" "}
                    {pet.birth_date
                      ? new Date(pet.birth_date).toLocaleDateString()
                      : "--"}
                  </span>
                </div>
                <ChevronRight
                  size={16}
                  className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all"
                />
              </div>
            </div>
          ))
        )}
      </div>

      {showAddModal && <AddPetModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
}

function PetDetail({ pet, onBack }) {
  const [activeTab, setActiveTab] = useState("Overview");
  const queryClient = useQueryClient();

  const { data: diaries = [], isLoading: diariesLoading } = useQuery({
    queryKey: ["diaries", pet.id],
    queryFn: async () => {
      const res = await fetch(`/api/diaries?petId=${pet.id}`);
      return res.json();
    },
  });

  const { data: insurance } = useQuery({
    queryKey: ["insurance", pet.id],
    queryFn: async () => {
      const res = await fetch(`/api/insurances?petId=${pet.id}`);
      const data = await res.json();
      return data[0] || null;
    },
  });

  return (
    <div className="space-y-8">
      {/* Detail Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-2 text-sm"
        >
          <ChevronRight size={16} className="rotate-180" />
          Back to list
        </button>
      </div>

      <div className="bg-white border border-[#E5E7EB] rounded-xl p-8">
        <div className="flex flex-col md:flex-row items-start gap-8">
          <div className="w-32 h-32 rounded-3xl bg-gray-100 border border-[#E5E7EB] flex items-center justify-center overflow-hidden flex-shrink-0">
            {pet.photo_url ? (
              <img
                src={pet.photo_url}
                alt={pet.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-4xl font-bold text-gray-300">
                {pet.name[0]}
              </span>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
                {pet.name}
              </h1>
              <div className="bg-blue-50 text-blue-600 rounded-full px-3 py-1 text-xs font-medium inline-flex items-center gap-1.5 capitalize">
                {pet.species}
              </div>
            </div>
            <p className="text-gray-500 mt-2">
              {pet.breed || "Unknown breed"} • {pet.gender || "Unknown gender"}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg p-4">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">
                  Weight
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {pet.weight || "--"} kg
                </p>
              </div>
              <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg p-4">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">
                  Birth Date
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {pet.birth_date
                    ? new Date(pet.birth_date).toLocaleDateString()
                    : "--"}
                </p>
              </div>
              <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg p-4">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">
                  Insurance
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {insurance ? "Protected" : "No Cover"}
                </p>
              </div>
              <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg p-4">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">
                  Status
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <p className="text-lg font-semibold text-gray-900">Healthy</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#E5E7EB]">
        <div className="flex gap-8">
          {["Overview", "Diary", "Insurance"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative pb-3 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div
                  layoutId="petTab"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600 -mb-[1px]"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="py-4">
        {activeTab === "Overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Recent Diary Entries
                  </h3>
                  <p className="text-sm text-gray-500">
                    The latest moments with {pet.name}
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("Diary")}
                  className="text-blue-600 text-sm font-medium hover:underline"
                >
                  View all
                </button>
              </div>
              <div className="space-y-4">
                {diaries.slice(0, 3).map((entry) => (
                  <div
                    key={entry.id}
                    className="border-b border-[#E5E7EB] pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900 text-sm">
                        {entry.title}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(entry.entry_date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-1">
                      {entry.content}
                    </p>
                  </div>
                ))}
                {diaries.length === 0 && (
                  <p className="text-sm text-gray-500 italic text-center py-4">
                    No diary entries yet.
                  </p>
                )}
              </div>
            </div>

            <div className="bg-white border border-[#E5E7EB] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Quick Stats
              </h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-2">
                    <span>Health Score</span>
                    <span className="font-semibold text-gray-900">92%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-[92%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-2">
                    <span>Activity Levels</span>
                    <span className="font-semibold text-gray-900">78%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[78%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Diary" && <DiaryView pet={pet} diaries={diaries} />}

        {activeTab === "Insurance" && (
          <div className="max-w-2xl">
            {insurance ? (
              <div className="bg-white border border-[#E5E7EB] rounded-xl p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                    <ShieldCheck size={28} />
                  </div>
                  <div className="bg-green-50 text-green-700 rounded-full px-3 py-1 text-xs font-medium flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-600 rounded-full" />
                    Active Policy
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {insurance.plan_name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Policy: {insurance.policy_number}
                </p>

                <div className="grid grid-cols-2 gap-8 mt-10 pt-10 border-t border-[#E5E7EB]">
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">
                      Premium
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      ${insurance.premium}/mo
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">
                      Next Renewal
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {insurance.end_date
                        ? new Date(insurance.end_date).toLocaleDateString()
                        : "Continuous"}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-[#E5E7EB] rounded-xl p-12 text-center">
                <ShieldCheck size={48} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900">
                  {pet.name} is not covered yet
                </h3>
                <p className="text-sm text-gray-500 mt-2">
                  Protect your furry friend with our customized insurance plans.
                </p>
                <button
                  onClick={() => {
                    /* Navigate to Insurance section */
                  }}
                  className="mt-6 bg-blue-600 text-white rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                >
                  Explore Plans
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function DiaryView({ pet, diaries }) {
  const [showAdd, setShowAdd] = useState(false);
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: async (formData) => {
      const res = await fetch("/api/diaries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, pet_id: pet.id }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diaries", pet.id] });
      setShowAdd(false);
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 tracking-tight">
          Diary
        </h2>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-white border border-[#E5E7EB] rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          New Entry
        </button>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 mb-8">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  addMutation.mutate({
                    title: formData.get("title"),
                    content: formData.get("content"),
                    mood: formData.get("mood"),
                    entry_date: formData.get("entry_date"),
                  });
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-500">
                      Title
                    </label>
                    <input
                      name="title"
                      required
                      className="w-full bg-white border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                      placeholder="E.g. Afternoon walk"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-500">
                      Date
                    </label>
                    <input
                      type="date"
                      name="entry_date"
                      defaultValue={new Date().toISOString().split("T")[0]}
                      className="w-full bg-white border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500">
                    Mood
                  </label>
                  <select
                    name="mood"
                    className="w-full bg-white border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                  >
                    <option value="happy">Happy 😃</option>
                    <option value="playful">Playful 🎾</option>
                    <option value="tired">Tired 😴</option>
                    <option value="sick">Sick 🤒</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500">
                    Content
                  </label>
                  <textarea
                    name="content"
                    required
                    rows={4}
                    className="w-full bg-white border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                    placeholder="What happened today?"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAdd(false)}
                    className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addMutation.isLoading}
                    className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    Save Entry
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {diaries.length === 0 ? (
          <div className="text-center py-12 bg-white border border-[#E5E7EB] rounded-xl">
            <BookOpen size={32} className="text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              Capture your first memory with {pet.name}
            </p>
          </div>
        ) : (
          diaries.map((entry) => (
            <div
              key={entry.id}
              className="bg-white border border-[#E5E7EB] rounded-xl p-6 flex gap-6 items-start"
            >
              <div className="bg-blue-50 text-blue-600 rounded-full w-10 h-10 flex-shrink-0 flex items-center justify-center font-semibold text-xs">
                {new Date(entry.entry_date).getDate()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-gray-900 truncate">
                    {entry.title}
                  </h4>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {new Date(entry.entry_date).toLocaleDateString(undefined, {
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-white border border-[#E5E7EB] rounded-full px-2 py-0.5 text-[10px] text-gray-500 flex items-center gap-1">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${entry.mood === "sick" ? "bg-red-500" : entry.mood === "tired" ? "bg-yellow-500" : "bg-green-500"}`}
                    />
                    {entry.mood || "neutral"}
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {entry.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function InsuranceSection({ insurances, pets }) {
  const [buyingFor, setBuyingFor] = useState(null);
  const queryClient = useQueryClient();

  const plans = [
    {
      name: "Standard Protection",
      price: 29,
      features: [
        "Routine checkups",
        "Emergency visits",
        "Common medications",
        "Accident coverage",
      ],
    },
    {
      name: "Premium Care",
      price: 54,
      features: [
        "All standard features",
        "Specialist visits",
        "Dental cleaning",
        "Behavioral therapy",
        "Travel cover",
      ],
    },
  ];

  const purchaseMutation = useMutation({
    mutationFn: async ({ petId, plan }) => {
      const res = await fetch("/api/insurances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pet_id: petId,
          plan_name: plan.name,
          premium: plan.price,
          end_date: new Date(
            Date.now() + 365 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insurances"] });
      queryClient.invalidateQueries({ queryKey: ["pets"] });
      setBuyingFor(null);
    },
  });

  const petsWithoutInsurance = pets.filter(
    (p) => !insurances.find((i) => i.pet_id === p.id),
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
            Pet Insurance
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Compare plans and protect your pets from unexpected costs.
          </p>
        </div>
      </div>

      {buyingFor ? (
        <div className="space-y-6">
          <button
            onClick={() => setBuyingFor(null)}
            className="text-gray-500 hover:text-gray-900 flex items-center gap-2 text-sm"
          >
            <ChevronRight size={16} className="rotate-180" /> Back to plans
          </button>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white border border-blue-100 flex items-center justify-center font-bold text-blue-600">
              {buyingFor.name[0]}
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-900">
                Buying coverage for {buyingFor.name}
              </p>
              <p className="text-xs text-blue-700">
                Choose a plan that fits {buyingFor.name}'s needs.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className="bg-white border border-[#E5E7EB] rounded-xl p-8 flex flex-col"
              >
                <h3 className="text-xl font-semibold text-gray-900">
                  {plan.name}
                </h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-gray-900">
                    ${plan.price}
                  </span>
                  <span className="text-sm text-gray-500">/ month</span>
                </div>
                <div className="mt-8 space-y-4 flex-1">
                  {plan.features.map((f) => (
                    <div
                      key={f}
                      className="flex items-center gap-3 text-sm text-gray-600"
                    >
                      <span className="text-gray-400 font-mono">-</span>
                      {f}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() =>
                    purchaseMutation.mutate({ petId: buyingFor.id, plan })
                  }
                  disabled={purchaseMutation.isLoading}
                  className="mt-10 w-full bg-blue-600 text-white rounded-lg py-3 text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  Purchase Plan
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Active Policies
              </h3>
              {insurances.length === 0 ? (
                <div className="bg-white border border-[#E5E7EB] rounded-xl p-12 text-center">
                  <ShieldCheck
                    size={48}
                    className="text-gray-300 mx-auto mb-4"
                  />
                  <p className="text-sm text-gray-500">
                    You don't have any active insurance policies yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {insurances.map((ins) => {
                    const pet = pets.find((p) => p.id === ins.pet_id);
                    return (
                      <div
                        key={ins.id}
                        className="bg-white border border-[#E5E7EB] rounded-xl p-6 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-400 border border-[#E5E7EB]">
                            {pet?.name[0] || "P"}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {ins.plan_name}
                            </h4>
                            <p className="text-xs text-gray-500 mt-0.5">
                              Policy: {ins.policy_number} • For{" "}
                              {pet?.name || "Pet"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">
                            ${ins.premium}/mo
                          </p>
                          <div className="bg-green-50 text-green-600 rounded-full px-2 py-0.5 text-[10px] font-medium inline-block mt-1">
                            Active
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Coverage Needed
              </h3>
              {petsWithoutInsurance.length === 0 ? (
                <div className="bg-[#F9FAFB] border border-dashed border-[#E5E7EB] rounded-xl p-8 text-center text-sm text-gray-500">
                  All your pets are currently covered.
                </div>
              ) : (
                <div className="space-y-4">
                  {petsWithoutInsurance.map((pet) => (
                    <div
                      key={pet.id}
                      className="bg-white border border-[#E5E7EB] rounded-xl p-5"
                    >
                      <p className="text-sm font-semibold text-gray-900">
                        {pet.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        No active protection found.
                      </p>
                      <button
                        onClick={() => setBuyingFor(pet)}
                        className="mt-4 w-full bg-white border border-[#E5E7EB] text-gray-700 py-2 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors"
                      >
                        Buy Insurance
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ClaimsSection({ insurances }) {
  const [showFile, setShowFile] = useState(false);
  const queryClient = useQueryClient();

  const { data: claims = [] } = useQuery({
    queryKey: ["claims"],
    queryFn: async () => {
      const res = await fetch("/api/claims");
      return res.json();
    },
  });

  const fileMutation = useMutation({
    mutationFn: async (formData) => {
      const res = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["claims"] });
      setShowFile(false);
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
            Claims
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track and file claims for your pet's medical expenses.
          </p>
        </div>
        <button
          onClick={() => setShowFile(true)}
          className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <FileText size={16} />
          File Claim
        </button>
      </div>

      {showFile && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl border border-[#E5E7EB] w-full max-w-lg overflow-hidden"
          >
            <div className="p-6 border-b border-[#E5E7EB] flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                File a New Claim
              </h3>
              <button
                onClick={() => setShowFile(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                fileMutation.mutate({
                  insurance_id: formData.get("insurance_id"),
                  type: formData.get("type"),
                  amount: parseFloat(formData.get("amount")),
                  description: formData.get("description"),
                });
              }}
              className="p-6 space-y-4"
            >
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500">
                  Select Policy
                </label>
                <select
                  name="insurance_id"
                  required
                  className="w-full bg-white border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm"
                >
                  {insurances.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.plan_name} ({i.policy_number})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500">
                    Claim Type
                  </label>
                  <select
                    name="type"
                    required
                    className="w-full bg-white border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="Medical">Medical</option>
                    <option value="Accident">Accident</option>
                    <option value="Checkup">Checkup</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500">
                    Amount ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="amount"
                    required
                    className="w-full bg-white border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  className="w-full bg-white border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm"
                  placeholder="Describe the reason for this claim..."
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowFile(false)}
                  className="flex-1 px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={fileMutation.isLoading}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
                >
                  Submit Claim
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Date Filed
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {claims.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-12 text-center text-sm text-gray-500 italic"
                >
                  No claims filed yet.
                </td>
              </tr>
            ) : (
              claims.map((claim) => (
                <tr
                  key={claim.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                    {new Date(claim.date_filed).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-gray-700 bg-white border border-[#E5E7EB] rounded-full px-2.5 py-0.5">
                      {claim.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                    ${claim.amount}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${claim.status === "approved" ? "bg-green-500" : claim.status === "rejected" ? "bg-red-500" : "bg-orange-500"}`}
                      />
                      <span className="text-xs font-medium text-gray-700 capitalize">
                        {claim.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AddPetModal({ onClose }) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (pet) => {
      const res = await fetch("/api/pets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pet),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pets"] });
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl border border-[#E5E7EB] w-full max-w-md overflow-hidden shadow-2xl"
      >
        <div className="p-6 border-b border-[#E5E7EB] flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Add New Pet</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            mutation.mutate({
              name: formData.get("name"),
              species: formData.get("species"),
              breed: formData.get("breed"),
              gender: formData.get("gender"),
              birth_date: formData.get("birth_date"),
              weight: parseFloat(formData.get("weight")),
            });
          }}
          className="p-6 space-y-4"
        >
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500">
              Pet Name
            </label>
            <input
              name="name"
              required
              className="w-full bg-white border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none"
              placeholder="E.g. Buddy"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500">
                Species
              </label>
              <select
                name="species"
                required
                className="w-full bg-white border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm outline-none"
              >
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
                <option value="bird">Bird</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500">
                Gender
              </label>
              <select
                name="gender"
                className="w-full bg-white border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm outline-none"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500">Breed</label>
            <input
              name="breed"
              className="w-full bg-white border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm outline-none"
              placeholder="E.g. Golden Retriever"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500">
                Birth Date
              </label>
              <input
                type="date"
                name="birth_date"
                className="w-full bg-white border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500">
                Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                name="weight"
                className="w-full bg-white border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm outline-none"
                placeholder="0.0"
              />
            </div>
          </div>
          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isLoading}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
            >
              Add Pet
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function PetCareApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        .font-inter {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        .tracking-tight {
          letter-spacing: -0.025em;
        }

        input::placeholder, textarea::placeholder {
          color: #9CA3AF;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .animate-fade-in {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
    </QueryClientProvider>
  );
}
