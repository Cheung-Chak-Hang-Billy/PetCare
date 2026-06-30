export default function Home() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F9FAFB",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          background: "#fff",
          border: "1px solid #E5E7EB",
          borderRadius: 20,
          padding: 40,
          textAlign: "center",
          maxWidth: 360,
          width: "100%",
        }}
      >
        <div style={{ fontSize: 56, marginBottom: 16 }}>🐾</div>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "#111827",
            margin: 0,
            marginBottom: 10,
          }}
        >
          Pet Care
        </h1>
        <p
          style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.6, margin: 0 }}
        >
          Open the mobile app to manage your pet's health and happiness.
        </p>
      </div>
    </div>
  );
}
