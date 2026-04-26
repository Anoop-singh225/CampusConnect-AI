"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);

  // Real-time ROI State
  const [totalAmbassadors, setTotalAmbassadors] = useState(142);
  const [tasksCompleted, setTasksCompleted] = useState(8430);
  const [estReach, setEstReach] = useState(450000);

  useEffect(() => {
    const savedTasks = localStorage.getItem("cc_tasks");
    const savedCompleted = localStorage.getItem("cc_completed");
    const savedReach = localStorage.getItem("cc_reach");

    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedCompleted) setTasksCompleted(parseInt(savedCompleted));
    if (savedReach) setEstReach(parseInt(savedReach));
    
    setIsLoaded(true);
  }, []);

  // Save ROI updates to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("cc_completed", tasksCompleted.toString());
    localStorage.setItem("cc_reach", estReach.toString());
  }, [tasksCompleted, estReach, isLoaded]);

  const handleApprove = (taskId: number) => {
    const updatedTasks = tasks.map(t => {
      if (t.id === taskId) return { ...t, status: "completed" };
      return t;
    });
    setTasks(updatedTasks);
    localStorage.setItem("cc_tasks", JSON.stringify(updatedTasks));
    
    // Also add points to the user
    const taskObj = tasks.find(t => t.id === taskId);
    if (taskObj) {
        const currentPoints = parseInt(localStorage.getItem("cc_points") || "1250");
        localStorage.setItem("cc_points", (currentPoints + taskObj.points).toString());
        
        // Update ROI metrics dynamically
        setTasksCompleted(prev => prev + 1);
        setEstReach(prev => prev + (taskObj.points * 10)); // Arbitrary ROI math based on points
    }
  };

  const handleReject = (taskId: number) => {
    const updatedTasks = tasks.map(t => {
      if (t.id === taskId) return { ...t, status: "open", proof: "" };
      return t;
    });
    setTasks(updatedTasks);
    localStorage.setItem("cc_tasks", JSON.stringify(updatedTasks));
  };

  if (!isLoaded) return null;

  const pendingTasks = tasks.filter(t => t.status === "pending");

  return (
    <main className="container animate-fade-in" style={{ padding: "48px 24px", minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "2.5rem" }}>Admin <span className="gradient-text">Portal</span></h1>
          <p style={{ color: "var(--text-secondary)" }}>Manage ambassador submissions and track program ROI.</p>
        </div>
        <button className="btn-secondary" onClick={() => router.push("/dashboard")}>
          Back to Ambassador View
        </button>
      </div>

      {/* ROI Stats */}
      <div className="grid-cols-3" style={{ gap: "24px", marginBottom: "32px" }}>
        <div className="glass-card flex-center" style={{ flexDirection: "column" }}>
          <h3 style={{ color: "var(--text-secondary)", marginBottom: "8px" }}>Total Ambassadors</h3>
          <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "var(--primary)" }}>{totalAmbassadors}</div>
        </div>
        <div className="glass-card flex-center" style={{ flexDirection: "column" }}>
          <h3 style={{ color: "var(--text-secondary)", marginBottom: "8px" }}>Tasks Completed</h3>
          <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "var(--accent)" }}>{tasksCompleted.toLocaleString()}</div>
        </div>
        <div className="glass-card flex-center" style={{ flexDirection: "column" }}>
          <h3 style={{ color: "var(--text-secondary)", marginBottom: "8px" }}>Est. Reach (ROI)</h3>
          <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#f59e0b" }}>~{(estReach / 1000).toFixed(1)}k</div>
        </div>
      </div>

      {/* Create Task Form */}
      <div className="glass-panel" style={{ padding: "32px", marginBottom: "32px", border: "1px solid var(--accent)" }}>
        <h2 style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
          <span>📢 Announce New Task</span>
          <span style={{ fontSize: "0.8rem", background: "rgba(16, 185, 129, 0.2)", color: "var(--accent)", padding: "4px 10px", borderRadius: "4px" }}>AI Verification Enabled</span>
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "16px", alignItems: "end" }}>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem" }}>Task Title</label>
            <input type="text" id="newTaskTitle" className="input-field" placeholder="e.g. Write a Technical Blog" />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem" }}>Description</label>
            <input type="text" id="newTaskDesc" className="input-field" placeholder="What should they do?" />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem" }}>Points</label>
            <input type="number" id="newTaskPoints" className="input-field" defaultValue={200} style={{ width: "100px" }} />
          </div>
          <button 
            className="btn-primary" 
            style={{ gridColumn: "span 3", background: "var(--accent)" }}
            onClick={() => {
              const title = (document.getElementById("newTaskTitle") as HTMLInputElement).value;
              const desc = (document.getElementById("newTaskDesc") as HTMLInputElement).value;
              const points = parseInt((document.getElementById("newTaskPoints") as HTMLInputElement).value);
              
              if (!title || !desc) return alert("Please fill all fields");

              const newTask = {
                id: Date.now(),
                title,
                desc,
                points,
                status: "open",
                proof: ""
              };

              const updatedTasks = [...tasks, newTask];
              setTasks(updatedTasks);
              localStorage.setItem("cc_tasks", JSON.stringify(updatedTasks));
              alert("Task announced to all ambassadors!");
              
              // Clear fields
              (document.getElementById("newTaskTitle") as HTMLInputElement).value = "";
              (document.getElementById("newTaskDesc") as HTMLInputElement).value = "";
            }}
          >
            Deploy Task to Dashboard
          </button>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: "32px" }}>
        <h2 style={{ marginBottom: "24px" }}>Pending Submissions ({pendingTasks.length})</h2>
        
        {pendingTasks.length === 0 ? (
          <p style={{ color: "var(--text-secondary)" }}>No pending tasks to review.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {pendingTasks.map(task => (
              <div key={task.id} style={{ 
                display: "flex", justifyContent: "space-between", alignItems: "center", 
                padding: "24px", background: "rgba(255, 255, 255, 0.03)", borderRadius: "8px", border: "1px solid var(--card-border)"
              }}>
                <div>
                  <div style={{ color: "var(--primary)", fontSize: "0.9rem", marginBottom: "4px" }}>Submitted by: You (Anoop)</div>
                  <h3 style={{ fontSize: "1.2rem", marginBottom: "8px" }}>{task.title}</h3>
                  <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                    <strong>Proof:</strong> <a href="#" style={{ color: "var(--secondary)", textDecoration: "underline" }}>{task.proof}</a>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "12px" }}>
                  <button className="btn-secondary" style={{ borderColor: "#ef4444", color: "#ef4444" }} onClick={() => handleReject(task.id)}>Reject</button>
                  <button className="btn-primary" style={{ background: "var(--accent)" }} onClick={() => handleApprove(task.id)}>Approve (+{task.points} pts)</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
