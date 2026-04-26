"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import html2canvas from "html2canvas";

type EvaluationData = {
  profile: {
    login: string;
    avatarUrl: string;
    name: string;
    bio: string;
  };
  evaluation: {
    strengthScore: number;
    summary: string;
    reposToHighlight: string[];
    reposToImprove: string[];
    actionableSteps: string[];
  };
  allRepos: any[];
};

function EvaluateContent() {
  const searchParams = useSearchParams();
  const username = searchParams.get("username");
  const lang = searchParams.get("lang") || "English";
  const router = useRouter();
  const scorecardRef = useRef<HTMLDivElement>(null);

  const [data, setData] = useState<EvaluationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeData, setResumeData] = useState<string | null>(null);

  useEffect(() => {
    if (!username) {
      router.push("/");
      return;
    }

    const fetchEvaluation = async () => {
      try {
        const res = await fetch(`/api/evaluate?username=${encodeURIComponent(username)}&lang=${encodeURIComponent(lang)}`);
        const json = await res.json();

        if (!res.ok) throw new Error(json.error || "Failed to evaluate profile");
        
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluation();
  }, [username, lang, router]);

  const handleShare = async () => {
    if (!scorecardRef.current) return;
    try {
      const canvas = await html2canvas(scorecardRef.current, {
        backgroundColor: "#09090b", // Match Deep Obsidian background
        scale: 2 // High quality
      });
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `${username}-github-scorecard.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to capture image", err);
    }
  };

  const handleGenerateResume = async () => {
    if (!username) return;
    setResumeLoading(true);
    try {
      const res = await fetch(`/api/resume?username=${encodeURIComponent(username)}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to generate resume");
      setResumeData(json.resume);
    } catch (err) {
      console.error("Failed to generate resume", err);
    } finally {
      setResumeLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="container flex-center" style={{ minHeight: "100vh" }}>
        <div className="glass-panel text-center animate-fade-in" style={{ padding: "48px" }}>
          <div className="spinner" style={{ 
            width: "50px", height: "50px", border: "4px solid rgba(255,255,255,0.1)", 
            borderTop: "4px solid var(--primary)", borderRadius: "50%", 
            animation: "spin 1s linear infinite", margin: "0 auto 24px" 
          }}></div>
          <h2>Analyzing <span className="gradient-text">{username}</span>'s Profile...</h2>
          <p style={{ color: "var(--text-secondary)", marginTop: "8px" }}>
            Fetching repositories and gathering AI insights.
          </p>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container flex-center" style={{ minHeight: "100vh" }}>
        <div className="glass-panel text-center animate-fade-in" style={{ padding: "48px" }}>
          <h2 style={{ color: "#ef4444", marginBottom: "16px" }}>Evaluation Failed</h2>
          <p>{error}</p>
          <button className="btn-secondary" style={{ marginTop: "24px" }} onClick={() => router.push("/")}>
            Try Again
          </button>
        </div>
      </main>
    );
  }

  if (!data) return null;

  return (
    <main className="container animate-fade-in" style={{ padding: "48px 24px", minHeight: "100vh" }}>
      
      {/* Downloadable Wrapper */}
      <div ref={scorecardRef} style={{ padding: "24px", margin: "-24px", marginBottom: "24px", borderRadius: "16px", background: "var(--background)" }}>
        {/* Header Profile Section */}
        <div className="glass-panel" style={{ padding: "32px", display: "flex", alignItems: "center", gap: "24px", marginBottom: "32px" }}>
          <img 
            src={data.profile.avatarUrl} 
            alt={data.profile.login} 
            style={{ width: "100px", height: "100px", borderRadius: "50%", border: "2px solid var(--primary)" }} 
            crossOrigin="anonymous" // needed for html2canvas to capture image
          />
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: "2rem", marginBottom: "8px" }}>{data.profile.name || data.profile.login}</h1>
            <p style={{ color: "var(--text-secondary)" }}>{data.profile.bio}</p>
            <span style={{ fontSize: "0.75rem", background: "rgba(139, 92, 246, 0.15)", color: "var(--primary)", padding: "4px 10px", borderRadius: "4px", marginTop: "8px", display: "inline-block" }}>
              Analysis Language: {lang}
            </span>
          </div>
          <div className="text-center">
            <div style={{ 
              fontSize: "3rem", fontWeight: "bold", color: "var(--accent)", 
              background: "rgba(16, 185, 129, 0.1)", padding: "16px 24px", borderRadius: "16px"
            }}>
              {data.evaluation.strengthScore}
            </div>
            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginTop: "8px" }}>Recruiter Score</p>
          </div>
        </div>

        {/* Summary Section */}
        <div className="glass-card delay-100 animate-fade-in" style={{ marginBottom: "32px" }}>
          <h3 style={{ color: "var(--primary)", marginBottom: "12px", fontSize: "1.2rem" }}>Recruiter Summary</h3>
          <p style={{ fontSize: "1.1rem", lineHeight: 1.6 }}>{data.evaluation.summary}</p>
        </div>

        <div className="grid-cols-3 delay-200 animate-fade-in" style={{ gap: "24px" }}>
          {/* Highlight */}
          <div className="glass-card">
            <h3 style={{ color: "var(--accent)", marginBottom: "16px" }}>⭐ Repos to Highlight</h3>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "12px" }}>
              {data.evaluation.reposToHighlight.map((repo, i) => (
                <li key={i} style={{ background: "rgba(255,255,255,0.05)", padding: "12px", borderRadius: "8px" }}>
                  {repo}
                </li>
              ))}
            </ul>
          </div>

          {/* Improve */}
          <div className="glass-card">
            <h3 style={{ color: "#f59e0b", marginBottom: "16px" }}>🛠️ Repos to Improve</h3>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "12px" }}>
              {data.evaluation.reposToImprove.map((repo, i) => (
                <li key={i} style={{ background: "rgba(255,255,255,0.05)", padding: "12px", borderRadius: "8px" }}>
                  {repo}
                </li>
              ))}
            </ul>
          </div>

          {/* Steps */}
          <div className="glass-card">
            <h3 style={{ color: "var(--primary)", marginBottom: "16px" }}>🚀 Next Steps</h3>
            <ul style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
              {data.evaluation.actionableSteps.map((step, i) => (
                <li key={i} style={{ lineHeight: 1.5 }}>{step}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Innovation Features (Resume + Sharing) */}
      <div className="glass-panel delay-300 animate-fade-in" style={{ padding: "32px", marginBottom: "32px" }}>
        <h2 style={{ marginBottom: "16px" }}>Power Tools</h2>
        <div style={{ display: "flex", gap: "16px" }}>
          <button className="btn-primary" onClick={handleShare} style={{ flex: 1, padding: "16px" }}>
            📸 Download LinkedIn Scorecard
          </button>
          <button className="btn-primary" onClick={handleGenerateResume} disabled={resumeLoading} style={{ flex: 1, padding: "16px", background: "var(--secondary)" }}>
            {resumeLoading ? "Generating AI Resume..." : "📝 Generate Recruiter-Ready Resume Bullets"}
          </button>
        </div>

        {resumeData && (
          <div className="animate-fade-in" style={{ marginTop: "24px", padding: "24px", background: "rgba(0,0,0,0.3)", borderRadius: "8px", border: "1px solid var(--card-border)" }}>
            <h3 style={{ marginBottom: "16px", color: "var(--accent)" }}>Your AI-Generated Resume Bullets:</h3>
            <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", lineHeight: 1.6, fontSize: "1rem" }}>
              {resumeData}
            </pre>
          </div>
        )}
      </div>

      <div className="text-center delay-300 animate-fade-in">
        <button className="btn-secondary" onClick={() => router.push("/")}>
          Evaluate Another Profile
        </button>
      </div>

      {/* Floating Mentor Chat */}
      <MentorChat username={username || ""} repos={data.allRepos} />
    </main>
  );
}

function MentorChat({ username, repos }: { username: string, repos: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState<{ role: string, text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [isResumeMode, setIsResumeMode] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const handleSend = async () => {
    if (!question.trim()) return;
    const currentQuestion = question;
    const userMsg = { role: "user", text: currentQuestion };
    setHistory(prev => [...prev, userMsg]);
    setQuestion("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          username, 
          repos, 
          question: currentQuestion, 
          history,
          isResume: isResumeMode
        })
      });
      const data = await res.json();
      setHistory(prev => [...prev, { role: "ai", text: data.reply }]);
      setIsResumeMode(false); // Reset after evaluation
    } catch (e) {
      setHistory(prev => [...prev, { role: "ai", text: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", bottom: "32px", right: "32px", zIndex: 1000, display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
      {isOpen && (
        <div className="glass-panel" style={{ width: "350px", height: "450px", marginBottom: "16px", display: "flex", flexDirection: "column", overflow: "hidden", border: "1px solid var(--primary)" }}>
          <div style={{ padding: "16px", background: "var(--primary)", color: "white", fontWeight: "bold", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span>AI Project Mentor</span>
              <span style={{ fontSize: "0.6rem", opacity: 0.8 }}>22 Indian Languages Supported 🇮🇳</span>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: "none", border: "none", color: "white", cursor: "pointer" }}>✕</button>
          </div>
          <div style={{ flex: 1, padding: "16px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
            {history.length === 0 && (
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", textAlign: "center" }}>
                Ask me anything about your projects or how to improve your score!
              </p>
            )}
            {history.map((msg, i) => (
              <div key={i} style={{ 
                alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                background: msg.role === "user" ? "var(--primary)" : "rgba(255,255,255,0.05)",
                padding: "10px 14px", borderRadius: "12px", maxWidth: "80%", fontSize: "0.9rem",
                lineHeight: 1.4
              }}>
                {msg.text}
              </div>
            ))}
            {loading && <div style={{ alignSelf: "flex-start", color: "var(--text-secondary)", fontSize: "0.8rem" }}>AI is thinking...</div>}
            <div ref={chatEndRef} />
          </div>
          <div style={{ padding: "12px", borderTop: "1px solid var(--card-border)", display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", gap: "8px" }}>
              <button 
                onClick={() => setIsResumeMode(!isResumeMode)}
                style={{ 
                  padding: "4px 10px", fontSize: "0.7rem", borderRadius: "4px", 
                  background: isResumeMode ? "var(--accent)" : "rgba(255,255,255,0.1)",
                  border: "none", color: "white", cursor: "pointer"
                }}
              >
                📄 {isResumeMode ? "Resume Mode ON" : "Evaluate Resume"}
              </button>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <input 
                type="text" 
                className="input-field" 
                placeholder={isResumeMode ? "Paste your resume text here..." : "Ask a question..."} 
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                style={{ padding: "10px", fontSize: "0.9rem" }}
              />
              <button className="btn-primary" onClick={handleSend} style={{ padding: "10px 16px" }}>
                ➤
              </button>
            </div>
          </div>
        </div>
      )}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          width: "60px", height: "60px", borderRadius: "50%", background: "var(--primary)", 
          color: "white", fontSize: "1.5rem", border: "none", cursor: "pointer",
          boxShadow: "0 8px 24px var(--primary-glow)", display: "flex", alignItems: "center", justifyContent: "center"
        }}
      >
        {isOpen ? "✕" : "💬"}
      </button>
    </div>
  );
}

export default function EvaluatePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EvaluateContent />
    </Suspense>
  );
}
