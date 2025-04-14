import type { NextApiRequest, NextApiResponse } from "next";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prdContent } = req.body;

  if (!prdContent) {
    return res.status(400).json({ error: 'Missing PRD content' });
  }

  try {
    const prompt = `
Create a concise deployment plan for this PRD. Write in plain text, no markdown or special formatting.

PRD:
${prdContent}

Structure your response with these sections:

Timeline and Phases
- List key phases with rough timeframes
- Include major milestones

Resources Needed
- Team composition
- Infrastructure requirements

Technical Setup
- Dependencies and prerequisites
- Integration points

Risk Management
- Key risks and mitigation
- Contingency measures

Testing & Rollout
- Testing approach
- Deployment strategy

Keep the response focused and practical. Use simple text formatting with clear headers and bullet points.`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-thinking-exp" });
    
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.3,
        topP: 0.7,
        topK: 20
      }
    });

    const deploymentPlan = result.response.text()
      .trim()
      // Remove any markdown code blocks or backticks
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`/g, '')
      // Remove any markdown headers
      .replace(/#{1,6}\s/g, '')
      // Clean up any excessive newlines
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    res.status(200).json({ deploymentPlan });
  } catch (error) {
    console.error('Deployment plan generation error:', error);
    res.status(500).json({ error: 'Failed to generate deployment plan' });
  }
} 