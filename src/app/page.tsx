"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [username, setUsername] = useState("");
  const [lang, setLang] = useState("English");
  const router = useRouter();

  const indianLanguages = [
    "English", "Hindi", "Bengali", "Telugu", "Marathi", "Tamil", "Gujarati", "Urdu", "Kannada", "Odia", "Malayalam", "Punjabi", "Assamese", "Maithili", "Santhali", "Kashmiri", "Nepali", "Sindhi", "Konkani", "Dogri", "Manipuri", "Bodo", "Sanskrit"
  ];

  const handleEvaluate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    // Handle full URL if user pastes it
    let cleanUsername = username.trim();
    if (cleanUsername.includes("github.com/")) {
      cleanUsername = cleanUsername.split("github.com/").pop()?.split("/")[0] || cleanUsername;
    }

    router.push(`/evaluate?username=${encodeURIComponent(cleanUsername)}&lang=${encodeURIComponent(lang)}`);
  };

  return (
    <main style={{ minHeight: "100vh" }}>
      {/* Hero Section */}
      <div className="container" style={{ paddingTop: "100px", paddingBottom: "100px", textAlign: "center" }}>
        <div className="animate-fade-in">
          <span style={{ 
            background: "rgba(139, 92, 246, 0.1)", color: "var(--primary)", 
            padding: "8px 20px", borderRadius: "100px", fontSize: "0.9rem", 
            fontWeight: "bold", border: "1px solid var(--primary-glow)",
            marginBottom: "24px", display: "inline-block"
          }}>
            Automated Campus Ambassador Management
          </span>
          <h1 style={{ fontSize: "4.5rem", fontWeight: "800", marginBottom: "24px", lineHeight: "1.1" }}>
            Build a Winning <br /><span className="gradient-text">Campus Program</span>
          </h1>
          <p style={{ 
            fontSize: "1.25rem", color: "var(--text-secondary)", 
            maxWidth: "700px", margin: "0 auto 48px", lineHeight: "1.6" 
          }}>
            Empower your student ambassadors with AI-powered task verification, 
            gamified leaderboards, and recruiter-focused GitHub profile analysis.
          </p>
        </div>

        {/* Evaluation Input */}
        <div className="glass-panel animate-fade-in delay-100" style={{ 
          maxWidth: "600px", margin: "0 auto 100px", padding: "40px", 
          boxShadow: "0 25px 50px -12px rgba(139, 92, 246, 0.25)" 
        }}>
          <h2 style={{ marginBottom: "24px", fontSize: "1.5rem" }}>Evaluate Your GitHub Profile</h2>
          <form onSubmit={handleEvaluate} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Enter GitHub Username or URL" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <div style={{ textAlign: "left" }}>
              <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginLeft: "4px", marginBottom: "8px", display: "block" }}>
                Select Response Language
              </label>
              <select 
                className="input-field" 
                value={lang} 
                onChange={(e) => setLang(e.target.value)}
                style={{ cursor: "pointer", background: "rgba(0,0,0,0.6)" }}
              >
                {indianLanguages.map(l => (
                  <option key={l} value={l} style={{ background: "#18181b", color: "white" }}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn-primary" style={{ width: "100%", fontSize: "1.1rem" }}>
              Analyze My Profile & Projects
            </button>
          </form>
          <p style={{ marginTop: "16px", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            Get a recruiter-ready scorecard in under 60 seconds.
          </p>
        </div>

        {/* How It Works */}
        <div className="animate-fade-in delay-200">
          <h2 style={{ fontSize: "2.5rem", marginBottom: "64px" }}>How Campus<span className="gradient-text">Connect</span> Works</h2>
          <div className="grid-cols-3">
            <div className="glass-card">
              <div style={{ fontSize: "2.5rem", marginBottom: "20px" }}>⚡</div>
              <h3 style={{ marginBottom: "12px", fontSize: "1.25rem" }}>1. Evaluate</h3>
              <p style={{ color: "var(--text-secondary)", lineHeight: "1.5" }}>
                Ambassadors enter their GitHub profile. Our AI assesses repo quality, commit history, and technical depth.
              </p>
            </div>
            <div className="glass-card">
              <div style={{ fontSize: "2.5rem", marginBottom: "20px" }}>🧠</div>
              <h3 style={{ marginBottom: "12px", fontSize: "1.25rem" }}>2. Verify</h3>
              <p style={{ color: "var(--text-secondary)", lineHeight: "1.5" }}>
                AI automatically verifies proof-of-work for tasks, ensuring high-quality output without manual admin review.
              </p>
            </div>
            <div className="glass-card">
              <div style={{ fontSize: "2.5rem", marginBottom: "20px" }}>🏆</div>
              <h3 style={{ marginBottom: "12px", fontSize: "1.25rem" }}>3. Gamify</h3>
              <p style={{ color: "var(--text-secondary)", lineHeight: "1.5" }}>
                Ambassadors earn points, climb leaderboards, and unlock badges, driving consistent program engagement.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="animate-fade-in delay-300" style={{ marginTop: "100px", padding: "64px", borderTop: "1px solid var(--card-border)" }}>
          <h2 style={{ fontSize: "2rem", marginBottom: "24px" }}>Ready to scale your program?</h2>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
            <button className="btn-secondary" onClick={() => router.push("/dashboard")}>
              Ambassador Dashboard
            </button>
            <button className="btn-primary" onClick={() => router.push("/resume-builder")} style={{ background: "var(--accent)" }}>
              ✨ AI Resume Builder
            </button>
            <button className="btn-secondary" onClick={() => router.push("/admin")}>
              Admin ROI Portal
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
