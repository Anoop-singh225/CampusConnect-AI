import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 });
  }

  try {
    const headers: HeadersInit = process.env.GITHUB_TOKEN ? { Authorization: `token ${process.env.GITHUB_TOKEN}` } : {};
    
    // Fetch top repos
    const reposRes = await fetch(`https://api.github.com/users/${username}/repos?sort=stars&per_page=5`, { headers });
    if (!reposRes.ok) throw new Error('Failed to fetch repos from GitHub');
    const repos = await reposRes.json();

    const repoDetails = repos.map((r: any) => ({
      name: r.name,
      description: r.description,
      language: r.language,
      stars: r.stargazers_count
    }));

    const promptData = `
    You are an expert technical resume writer.
    Based on these top GitHub repositories for user '${username}', write 3-4 highly professional, impactful resume bullet points that the user can copy-paste into their resume. 
    Focus on action verbs (e.g., Architected, Developed, Engineered) and metrics if possible (based on stars or scope).
    
    Repositories:
    ${JSON.stringify(repoDetails, null, 2)}
    
    Output ONLY the resume bullet points, formatted clearly with bullet points (-). No introductory or concluding text.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: promptData,
    });
    
    let resumeText = response.text || "Failed to generate resume bullets.";
    
    // Remove markdown symbols as requested
    resumeText = resumeText.replace(/[#*`_]/g, '').trim();

    return NextResponse.json({ resume: resumeText });

  } catch (error: any) {
    console.error('Resume Generation Error:', error);
    const isQuotaError = error.message?.includes('429') || error.message?.toLowerCase().includes('quota');

    if (isQuotaError) {
      const skillSets = [
        `Architected high-performance AI solutions for ${username}'s top projects.`,
        `Led the development of scalable full-stack applications with an emphasis on UX.`,
        `Integrated IoT systems and real-time monitoring for sustainable tech solutions.`
      ];
      const randomSkill = skillSets[Math.floor(Math.random() * skillSets.length)];

      return NextResponse.json({ 
        resume: `- ${randomSkill}\n- Optimized system performance by 40% across ${username}'s repository ecosystem.\n- Implemented robust security protocols for data-sensitive applications.\n(Note: Demo Fallback)` 
      });
    }

    return NextResponse.json({ error: error.message || 'An error occurred during resume generation' }, { status: 500 });
  }
}
