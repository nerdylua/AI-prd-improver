import type { NextApiRequest, NextApiResponse } from "next";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AgentName } from "@/lib/agents";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { prd, debate } = req.body as {
    prd: string;
    debate: { name: AgentName; message: string }[];
  };

  if (!prd || !debate) {
    return res.status(400).json({ error: "Missing data" });
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

  const conversation = debate.map((turn) => `${turn.name}: ${turn.message}`).join("\n");

  const prompt = `
Given the following product requirement document (PRD):

${prd}

And the following debate among experts:

${conversation}

Generate an improved and finalized PRD incorporating the best ideas and addressing any conflicts. Make it clear, actionable, and professionally structured.
`;

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  const improved = result.response.text().trim();

  res.status(200).json({ prd: improved });
}
