"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("tasks");
  const [isLoaded, setIsLoaded] = useState(false);

  // Real-time State (persisted to localStorage)
  const [points, setPoints] = useState(1250);
  const [streak, setStreak] = useState(14);
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Promote Upcoming Hackathon",
      desc: "Share the registration link on LinkedIn and tag the organization.",
      points: 150,
      status: "open", // open, pending, completed
      proof: ""
    },
    {
      id: 2,
      title: "Host a Campus Session",
      desc: "Conduct a 30-min intro to GitHub at your college.",
      points: 300,
      status: "pending",
      proof: "photos.zip"
    }
  ]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedPoints = localStorage.getItem("cc_points");
    const savedStreak = localStorage.getItem("cc_streak");
    const savedTasks = localStorage.getItem("cc_tasks");

    if (savedPoints) setPoints(parseInt(savedPoints));
    if (savedStreak) setStreak(parseInt(savedStreak));
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    
    setIsLoaded(true);
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("cc_points", points.toString());
    localStorage.setItem("cc_streak", streak.toString());
    localStorage.setItem("cc_tasks", JSON.stringify(tasks));
  }, [points, streak, tasks, isLoaded]);

  const handleTaskApproved = (taskId: number, proofValue: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { ...t, status: "completed", proof: proofValue };
      }
      return t;
    }));

    const taskObj = tasks.find(t => t.id === taskId);
    if (taskObj) {
      setPoints(prev => prev + taskObj.points);
      
      // Update Admin ROI dynamically since this is auto-approved!
      const currentCompleted = parseInt(localStorage.getItem("cc_completed") || "8430");
      const currentReach = parseInt(localStorage.getItem("cc_reach") || "450000");
      localStorage.setItem("cc_completed", (currentCompleted + 1).toString());
      localStorage.setItem("cc_reach", (currentReach + taskObj.points * 10).toString());
    }
    
    // Confetti Animation
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#8b5cf6', '#3b82f6', '#10b981']
    });
  };

  if (!isLoaded) return null; // Avoid hydration mismatch

  return (
    <main className="container animate-fade-in" style={{ padding: "48px 24px", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "2.5rem" }}>Campus<span className="gradient-text">Connect</span> Dashboard</h1>
          <p style={{ color: "var(--text-secondary)" }}>Manage your ambassador tasks and track your rewards.</p>
        </div>
        <div style={{ display: "flex", gap: "16px" }}>
          <button className="btn-secondary" onClick={() => router.push("/admin")}>
            Admin Panel
          </button>
          <button className="btn-secondary" onClick={() => router.push("/")}>
            GitHub Evaluator
          </button>
        </div>
      </div>

      {/* Top Stats / Gamification Engine */}
      <div className="grid-cols-3" style={{ gap: "24px", marginBottom: "32px" }}>
        <div className="glass-card flex-center" style={{ flexDirection: "column" }}>
          <h3 style={{ color: "var(--text-secondary)", marginBottom: "8px" }}>Total Points</h3>
          <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "var(--accent)", transition: "all 0.5s" }}>
            {points.toLocaleString()}
          </div>
        </div>
        <div className="glass-card flex-center" style={{ flexDirection: "column" }}>
          <h3 style={{ color: "var(--text-secondary)", marginBottom: "8px" }}>Current Streak</h3>
          <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#f59e0b" }}>🔥 {streak} Days</div>
        </div>
        <div className="glass-card flex-center" style={{ flexDirection: "column" }}>
          <h3 style={{ color: "var(--text-secondary)", marginBottom: "8px" }}>Current Rank</h3>
          <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "var(--primary)" }}>#3</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "24px", borderBottom: "1px solid var(--card-border)", paddingBottom: "16px" }}>
        <button 
          onClick={() => setActiveTab("tasks")}
          style={{ 
            background: "none", border: "none", fontSize: "1.1rem", cursor: "pointer",
            color: activeTab === "tasks" ? "var(--primary)" : "var(--text-secondary)",
            fontWeight: activeTab === "tasks" ? "bold" : "normal",
            transition: "all 0.2s"
          }}
        >
          Automated Workflows (Tasks)
        </button>
        <button 
          onClick={() => setActiveTab("leaderboard")}
          style={{ 
            background: "none", border: "none", fontSize: "1.1rem", cursor: "pointer",
            color: activeTab === "leaderboard" ? "var(--primary)" : "var(--text-secondary)",
            fontWeight: activeTab === "leaderboard" ? "bold" : "normal",
            transition: "all 0.2s"
          }}
        >
          Leaderboard & Badges
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "tasks" && (
        <div className="grid-cols-3 animate-fade-in" style={{ gap: "24px" }}>
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} onSubmit={(proof) => handleTaskApproved(task.id, proof)} />
          ))}
        </div>
      )}

      {activeTab === "leaderboard" && (
        <div className="glass-panel animate-fade-in" style={{ padding: "32px" }}>
          <h2 style={{ marginBottom: "24px" }}>Top Ambassadors</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {[
              { name: "Alex Chen", points: 2450, badge: "🏆 Diamond" },
              { name: "Sarah Jenkins", points: 2100, badge: "🥇 Gold" },
              { name: "You (Anoop)", points: points, badge: "🥈 Silver" },
              { name: "David Kim", points: 900, badge: "🥉 Bronze" }
            ].sort((a,b) => b.points - a.points).map((user, i) => (
              <div key={i} style={{ 
                display: "flex", justifyContent: "space-between", alignItems: "center", 
                padding: "16px", background: user.name === "You (Anoop)" ? "rgba(139, 92, 246, 0.1)" : "rgba(255, 255, 255, 0.03)", 
                border: user.name === "You (Anoop)" ? "1px solid var(--primary)" : "1px solid transparent",
                borderRadius: "8px",
                transition: "all 0.3s ease"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{ fontWeight: "bold", color: "var(--text-secondary)", width: "24px" }}>#{i + 1}</div>
                  <div style={{ fontWeight: user.name === "You (Anoop)" ? "bold" : "normal" }}>{user.name}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                  <div style={{ color: "var(--text-secondary)" }}>{user.badge}</div>
                  <div style={{ fontWeight: "bold", color: "var(--accent)" }}>{user.points.toLocaleString()} pts</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}

function TaskCard({ task, onSubmit }: { task: any, onSubmit: (proof: string) => void }) {
  const [proof, setProof] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const isCompleted = task.status === "completed";
  const isPending = task.status === "pending";

  const handleVerify = async () => {
    if (!proof.trim()) return;
    setVerifying(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/verify-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskTitle: task.title, taskDesc: task.desc, proof })
      });
      const data = await res.json();
      if (data.isValid) {
        onSubmit(proof); // Auto-approve
      } else {
        setErrorMsg(`AI Rejected: ${data.reason}`);
      }
    } catch (e) {
      setErrorMsg("Failed to connect to AI Verifier");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: "24px", gridColumn: "span 2", opacity: (isCompleted || isPending) ? 0.7 : 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
        <div>
          <h3 style={{ fontSize: "1.2rem", marginBottom: "4px" }}>{task.title}</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>{task.desc}</p>
        </div>
        <span style={{ 
          background: isCompleted ? "rgba(16, 185, 129, 0.2)" : isPending ? "rgba(255, 255, 255, 0.1)" : "rgba(139, 92, 246, 0.2)", 
          color: isCompleted ? "var(--accent)" : isPending ? "var(--foreground)" : "var(--primary)", 
          padding: "4px 12px", borderRadius: "16px", fontSize: "0.8rem", fontWeight: "bold" 
        }}>
          {isCompleted ? "AI Verified ✓" : isPending ? "Pending Review" : `+${task.points} Points`}
        </span>
      </div>
      
      {task.status === "open" ? (
        <div style={{ marginTop: "24px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem" }}>Proof of Work (Link)</label>
          <div style={{ display: "flex", gap: "12px", marginBottom: "8px" }}>
            <input 
              type="text" 
              className="input-field" 
              placeholder="https://linkedin.com/post/..." 
              value={proof}
              onChange={(e) => setProof(e.target.value)}
              style={{ flex: 1 }} 
            />
            <button className="btn-primary" onClick={handleVerify} disabled={verifying}>
              {verifying ? "AI Verifying..." : "Submit"}
            </button>
          </div>
          {errorMsg && <p style={{ color: "#ef4444", fontSize: "0.85rem", marginTop: "4px" }}>{errorMsg}</p>}
        </div>
      ) : (
        <p style={{ fontSize: "0.9rem", color: isCompleted ? "var(--accent)" : "var(--primary)", marginTop: "16px" }}>
          ✓ Proof uploaded: {task.proof}
        </p>
      )}
    </div>
  );
}
