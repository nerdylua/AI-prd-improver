import type { NextApiRequest, NextApiResponse } from "next";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AgentName } from "@/lib/agents";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

type Turn = {
  name: AgentName;
  message: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { prd, debate }: { prd: string; debate: Turn[] } = req.body;

  if (!prd || !debate?.length) {
    return res.status(400).json({ error: "Missing PRD or debate history" });
  }

  const debateTranscript = debate.map(
    (turn) => `${turn.name}: ${turn.message}`
  ).join("\n");

  const prompt = `
As a product manager, synthesize a comprehensive improved PRD incorporating expert feedback.

Original PRD:
${prd}

Expert Feedback:
${debateTranscript}

Write in plain text, no markdown or special formatting, generate an improved PRD with this structure:

[Project Name]

1. Overview
- Product vision and goals
- Target audience and user personas
- Market positioning and value proposition
- Success metrics and KPIs

2. Features and Requirements
- Core functionality and capabilities
- Technical specifications and architecture
- User experience and interface requirements
- Performance and scalability considerations
- Security and compliance needs

3. Implementation
- Development priorities
- Technical constraints
- Risk mitigation
- Integration requirements

Ensure the PRD is detailed yet concise, incorporating key points from the expert debate.`;

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-thinking-exp" });
  
  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      maxOutputTokens: 1500,
      temperature: 0.3,  // Lower temperature for more focused output
      topP: 0.7,        // More focused token selection
      topK: 20          // More concentrated sampling
    }
  });

  const improvedPrd = result.response.text().trim();
  res.status(200).json({ improvedPrd });
}
