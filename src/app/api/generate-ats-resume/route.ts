import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export async function POST(request: Request) {
  try {
    const { githubData, linkedinData, portfolioData, personalInfo, language } = await request.json();

    const promptData = `
    You are an "ATS Expert Resume Writer". 
    Create a highly professional, ATS-optimized resume in Markdown format for ${personalInfo.name}.
    
    SOURCES:
    - GitHub Analysis: ${JSON.stringify(githubData)}
    - LinkedIn/Experience: ${linkedinData}
    - Portfolio: ${portfolioData}
    - Personal Info: ${JSON.stringify(personalInfo)}
    
    INSTRUCTIONS:
    1. Language: Use ${language || 'English'}.
    2. Format: Use a clean, standard resume structure (Contact, Summary, Experience, Projects, Skills, Education).
    3. ATS Optimization: Use standard section headers and bullet points. Avoid complex tables or images.
    4. Projects: Leverage the GitHub data to write impact-focused bullet points (e.g., "Built X using Y, resulting in Z").
    5. Formatting: Output ONLY the markdown resume content. No conversational text.
    6. Remove all markdown marks like ** or ## from the final output text if it's meant to be plain text, BUT keep them for the markdown structure if we are rendering it. (User wants it clean, so let's stick to simple markdown).
    
    Strictly follow the user's request: Remove all formatting characters like ** or * from the TEXT values, but you can use simple headings like ### or # for structure.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: promptData,
    });
    
    let resumeContent = response.text || "Failed to generate resume.";
    
    // Clean up markdown markers as requested by user
    resumeContent = resumeContent.replace(/[#*`_]/g, '');

    return NextResponse.json({ resume: resumeContent });

  } catch (error: any) {
    console.error('Resume API Error:', error);
    const isQuotaError = error.message?.includes('429') || error.message?.toLowerCase().includes('quota');

    if (isQuotaError) {
      return NextResponse.json({ 
        resume: "ATS RESUME (DEMO FALLBACK)\n\nName: Anoop Singh\nEmail: sanoop6027@gmail.com\n\nExperience:\n- Lead Developer at NextMatrix Tech\n- Spearheaded AI-driven campus program management\n- Developed cross-platform IoT solutions\n\nProjects:\n- CampusConnect (AI Platform)\n- Llama-3.1 Reasoning Trainer\n\nEducation:\n- B.Tech in Computer Science\n\n(Note: This is a demo fallback due to AI rate limits. AI will resume once quota resets.)" 
      });
    }

    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 });
  }
}
