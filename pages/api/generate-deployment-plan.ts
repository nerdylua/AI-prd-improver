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
As a technical project manager, analyze this PRD and create a detailed deployment suggestion plan. Include:

1. Timeline and Phases
2. Resource Requirements
3. Technical Dependencies
4. Risk Mitigation Steps
5. Testing Strategy
6. Rollout Strategy

PRD Content:
${prdContent}

Provide a structured, practical deployment plan that can be implemented by the development team.
`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-thinking-exp" });
    const result = await model.generateContent(prompt);
    const deploymentPlan = result.response.text().trim();

    res.status(200).json({ deploymentPlan });
  } catch (error) {
    console.error('Deployment plan generation error:', error);
    res.status(500).json({ error: 'Failed to generate deployment plan' });
  }
} 