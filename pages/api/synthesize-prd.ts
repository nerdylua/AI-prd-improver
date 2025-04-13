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

Please generate a final improved PRD that:
- Incorporates the best points made during the debate
- Resolves contradictions or conflicts
- Presents the plan in a structured and clear format
- Uses bullet points or sections if needed

Final Improved PRD:
`;

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
  const result = await model.generateContent(prompt);
  const improvedPrd = result.response.text().trim();

  res.status(200).json({ improvedPrd });
}
