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
You are the Opus Orchestrator, an expert product manager tasked with synthesizing the final improved version of a PRD after reviewing a heated, professional debate among multiple experts.

Original PRD:
${prd}

Debate Transcript:
${debateTranscript}

Please generate a final improved PRD in a clean, professional format. Present it as plain text with proper spacing and structure:

Final Improved PRD: [Project Name]

Overview
[content]

Key Features
[content]

The output should be clean and readable without any markdown symbols or formatting characters. Use proper spacing and line breaks to create a clear document structure.
`;

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-thinking-exp" });
  const result = await model.generateContent(prompt);
  const improvedPrd = result.response.text().trim();

  res.status(200).json({ improvedPrd });
}
