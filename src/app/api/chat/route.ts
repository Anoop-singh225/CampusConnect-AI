import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'AIzaSyCjPZySJrukjHkJ3YAK33ad7Dor-9anVF8' });

export async function POST(request: Request) {
  try {
    const { username, repos, question, history, isResume } = await request.json();

    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    const repoContext = repos ? JSON.stringify(repos) : "unknown";

    const promptData = isResume ? `
    You are an "ATS Resume Evaluator". 
    A student named ${username} has provided their resume text below.
    
    Resume Text:
    ${question}
    
    INSTRUCTIONS:
    1. Evaluate the resume for ATS compatibility.
    2. Provide an "ATS Score" out of 100.
    3. List 3 critical improvements to make it recruiter-ready.
    4. Be critical and specific.
    5. Respond in the user's language (if detected).
    6. Remove markdown formatting characters like ** or ### from textual content.
    ` : `
    You are the "CampusConnect AI Project Mentor". 
    A student named ${username} is asking for advice about their projects.
    
    CRITICAL CONTEXT:
    You have access to the student's top 30 repositories:
    ${repoContext}
    
    INSTRUCTIONS:
    1. If the user asks about a project (e.g. "Nirvana-Browser" or "AMD-Ai"), SEARCH the repo list above first. 
    2. MULTI-LINGUAL SUPPORT: You are a polyglot mentor. Respond in the SAME LANGUAGE the user is using. You must fluently support all 22 constitutional languages of India (Assamese, Bengali, Bodo, Dogri, Gujarati, Hindi, Kannada, Kashmiri, Konkani, Maithili, Malayalam, Manipuri, Marathi, Nepali, Odia, Punjabi, Sanskrit, Santali, Sindhi, Tamil, Telugu, Urdu).
    3. Be HIGHLY SPECIFIC. Do not give general advice like "improve your readme". Instead, say "I see your project 'Nirvana-Browser' is written in C++. You should add a GitHub Action for automated testing to show recruiters you care about robustness."
    4. Be CRITICAL. Recruiter-level feedback means pointing out gaps (missing documentation, no tests, outdated dependencies, lack of a live demo link).
    5. If a project is truly missing from the list, acknowledge it specifically but offer to analyze it if they paste the description.
    6. Format with bold headers and bullet points. Use a professional yet mentoring tone.
    
    User Question: ${question}
    
    Previous Conversation History:
    ${JSON.stringify(history)}
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: promptData,
    });
    
    let reply = response.text || "I'm sorry, I couldn't process that request.";
    
    // Remove markdown symbols as requested
    reply = reply.replace(/[#*`_]/g, '');

    return NextResponse.json({ reply });

  } catch (error: any) {
    console.error('Chat Error:', error);
    const isQuotaError = error.message?.includes('429') || error.message?.toLowerCase().includes('quota');
    
    if (isQuotaError) {
      const chatResponses = [
        `That's a great question about your projects, ${username}! I'm currently in Offline Mode, but based on your repo list, your work in AI is top-notch!`,
        `Interesting point, ${username}. While I'm in Demo Mode right now, I can see you're passionate about Full-Stack development. Keep it up!`,
        `I'd love to dive deeper into that, ${username}, but my AI engine is currently resting (Quota Reached). You're doing great work though!`
      ];
      const randomReply = chatResponses[Math.floor(Math.random() * chatResponses.length)];
      return NextResponse.json({ reply: randomReply });
    }

    return NextResponse.json({ error: error.message || 'An error occurred during chat' }, { status: 500 });
  }
}
