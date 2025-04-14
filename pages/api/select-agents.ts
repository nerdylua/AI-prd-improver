import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { prd } = req.body;

  if (!prd || typeof prd !== "string") {
    return res.status(400).json({ error: "PRD text is required" });
  }

  const prompt = `
Given the following Product Requirement Document (PRD), return a STRICT JSON array of roles that should debate it. 
ONLY use these roles: ["UX Lead", "Backend Engineer", "Data Scientist", "DevOps Engineer", "Security Specialist", "Finance Analyst", "Legal Advisor", "Marketing Strategist"].

PRD:
${prd}

Respond ONLY with valid JSON. Example:
["UX Lead", "Backend Engineer"]
`;

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-thinking-exp",  
      generationConfig: {
        temperature: 0.4
      }
    });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const cleanText = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleanText);

    res.status(200).json({ agents: parsed });
  } catch (error) {
    console.error("Gemini API error:", error);
    res.status(500).json({ 
      error: "Failed to fetch agents",
      details: error instanceof Error ? error.message : String(error)
    });
  }
}