"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ResumeBuilder() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [resume, setResume] = useState("");
  
  const [formData, setFormData] = useState({
    name: "Anoop Singh",
    email: "",
    phone: "",
    github: "",
    linkedin: "",
    portfolio: "",
    education: "",
    language: "English"
  });

  const handleGenerate = async () => {
    setLoading(true);
    try {
      // Fetch GitHub data if username provided
      let githubData = null;
      if (formData.github) {
        const res = await fetch(`/api/evaluate?username=${encodeURIComponent(formData.github)}`);
        githubData = await res.json();
      }

      const res = await fetch("/api/generate-ats-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          githubData: githubData?.evaluation || "No GitHub provided",
          linkedinData: formData.linkedin,
          portfolioData: formData.portfolio,
          personalInfo: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            education: formData.education
          },
          language: formData.language
        })
      });

      const data = await res.json();
      setResume(data.resume);
      setStep(4); // Move to preview step
    } catch (e) {
      alert("Generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <main className="container" style={{ paddingTop: "60px", paddingBottom: "100px", minHeight: "100vh" }}>
      <div className="animate-fade-in" style={{ textAlign: "center", marginBottom: "48px" }}>
        <h1 className="gradient-text" style={{ fontSize: "3rem", fontWeight: "800" }}>AI Resume Builder</h1>
        <p style={{ color: "var(--text-secondary)" }}>ATS-Friendly. Multi-Source. Recruiter-Ready.</p>
      </div>

      <div className="glass-panel" style={{ maxWidth: "800px", margin: "0 auto", padding: "40px" }}>
        
        {/* Step Indicator */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "40px" }}>
          {[1, 2, 3, 4].map(s => (
            <div key={s} style={{ 
              width: "40px", height: "40px", borderRadius: "50%", 
              background: step >= s ? "var(--primary)" : "rgba(255,255,255,0.05)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: "bold", border: step === s ? "2px solid white" : "none",
              transition: "all 0.3s ease"
            }}>
              {s === 4 ? "✨" : s}
            </div>
          ))}
        </div>

        {/* Form Steps */}
        {step === 1 && (
          <div className="animate-fade-in">
            <h2 style={{ marginBottom: "24px" }}>Personal Details</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <input type="text" className="input-field" placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <input type="email" className="input-field" placeholder="Email Address" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              <input type="text" className="input-field" placeholder="Phone Number" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              <button className="btn-primary" onClick={() => setStep(2)}>Next: Professional Links</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in">
            <h2 style={{ marginBottom: "24px" }}>Professional Profile</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <input type="text" className="input-field" placeholder="GitHub Username" value={formData.github} onChange={e => setFormData({...formData, github: e.target.value})} />
              <textarea className="input-field" placeholder="LinkedIn Summary / Experience (Paste here)" rows={4} value={formData.linkedin} onChange={e => setFormData({...formData, linkedin: e.target.value})} />
              <input type="text" className="input-field" placeholder="Portfolio URL (Optional)" value={formData.portfolio} onChange={e => setFormData({...formData, portfolio: e.target.value})} />
              <div style={{ display: "flex", gap: "12px" }}>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setStep(1)}>Back</button>
                <button className="btn-primary" style={{ flex: 2 }} onClick={() => setStep(3)}>Next: Education</button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in">
            <h2 style={{ marginBottom: "24px" }}>Almost There!</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <input type="text" className="input-field" placeholder="Education (Degree, College)" value={formData.education} onChange={e => setFormData({...formData, education: e.target.value})} />
              <select className="input-field" value={formData.language} onChange={e => setFormData({...formData, language: e.target.value})}>
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Marathi">Marathi</option>
                {/* Simplified list for brevity */}
              </select>
              <div style={{ display: "flex", gap: "12px" }}>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setStep(2)}>Back</button>
                <button className="btn-primary" style={{ flex: 2 }} onClick={handleGenerate} disabled={loading}>
                  {loading ? "AI is Crafting Your Resume..." : "Generate ATS Resume"}
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="animate-fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2>Your AI Resume</h2>
              <button className="btn-primary" onClick={handlePrint} style={{ padding: "8px 20px" }}>Download PDF</button>
            </div>
            <div id="resume-preview" className="glass-card" style={{ 
              background: "white", color: "black", padding: "40px", 
              borderRadius: "0", minHeight: "800px", fontSize: "0.9rem",
              lineHeight: "1.5", textAlign: "left", overflowY: "auto"
            }}>
              <pre style={{ whiteSpace: "pre-wrap", fontFamily: "'Times New Roman', serif" }}>
                {resume}
              </pre>
            </div>
            <button className="btn-secondary" style={{ marginTop: "24px", width: "100%" }} onClick={() => setStep(1)}>Start Over</button>
          </div>
        )}

      </div>

      <style jsx>{`
        @media print {
          body * { visibility: hidden; }
          #resume-preview, #resume-preview * { visibility: visible; }
          #resume-preview { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </main>
  );
}
