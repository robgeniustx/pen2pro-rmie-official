import { useEffect, useState } from "react";

function App() {
  const [message, setMessage] = useState("Loading backend...");
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/")
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch(() => setMessage("Backend connection failed"));

    fetch("http://127.0.0.1:8000/api/pricing")
      .then((res) => res.json())
      .then((data) => setPlans(data.plans))
      .catch(() => setPlans([]));
  }, []);

  return (
    <div style={{ fontFamily: "Arial, sans-serif", background: "#f8fafc", minHeight: "100vh", color: "#111827" }}>
      <section style={{ padding: "72px 24px 40px", textAlign: "center", maxWidth: "1100px", margin: "0 auto" }}>
        <p style={{ letterSpacing: "2px", fontSize: "12px", fontWeight: "bold", color: "#2563eb" }}>
          PEN2PRO RMIE
        </p>
        <h1 style={{ fontSize: "48px", margin: "16px 0 12px", lineHeight: 1.1 }}>
          Turn Your Ideas into Income with PEN2PRO RMIE Business Builder
        </h1>
        <p style={{ fontSize: "18px", maxWidth: "750px", margin: "0 auto 20px", color: "#4b5563" }}>
          A business development platform designed to help regular people take their ideas from concept to cash,
          create offers, and monetize their passions with ease. Whether you're just starting out or looking to scale, PEN2PRO RMIE provides the tools and guidance you need to succeed.
        </p>
        <div
          style={{
            display: "inline-block",
            padding: "12px 18px",
            borderRadius: "12px",
            background: "#e0f2fe",
            color: "#0f172a",
            fontWeight: 600,
            marginTop: "10px",
          }}
        >
          Backend status: {message}
        </div>
      </section>

      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "20px 24px 80px" }}>
        <h2 style={{ textAlign: "center", fontSize: "32px", marginBottom: "32px" }}>Pricing Plans</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "24px",
          }}
        >
          {plans.map((plan) => (
            <div
              key={plan.name}
              style={{
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "18px",
                padding: "28px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
              }}
            >
              <h3 style={{ fontSize: "24px", marginBottom: "10px" }}>{plan.name}</h3>
              <p style={{ fontSize: "32px", fontWeight: "bold", margin: "0 0 18px" }}>
                ${plan.price}
                <span style={{ fontSize: "16px", fontWeight: "normal", color: "#6b7280" }}>/month</span>
              </p>
              <p style={{ color: "#4b5563", marginBottom: "20px" }}>
                {plan.name === "Starter" && "Basic access to get started and explore the platform."}
                {plan.name === "Pro" && "For builders ready to launch with structure and speed."}
                {plan.name === "Elite" && "For serious founders who want the full PEN2PRO experience."}
              </p>
              <button
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: "none",
                  background: "#111827",
                  color: "white",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Select Plan
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default App;