import type { NextApiRequest, NextApiResponse } from "next";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { agentProfiles, AgentName } from "@/lib/agents";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

type AgentTurn = {
  name: AgentName;
  message: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { prd, agents, rounds = 3 } = req.body as {
    prd: string;
    agents: AgentName[];
    rounds: number;
  };

  if (!prd || !agents?.length) {
    return res.status(400).json({ error: "Missing PRD or agents" });
  }

  const debateHistory: AgentTurn[] = [];

  const systemPrompt = `You are simulating a multi-agent debate. Each agent has a defined personality and expertise. They will respond to the PRD and to each other in turns. Be direct, professional, and assertive. Limit each message to 3 sentences.`;

  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-pro-latest"  
  });

  for (let round = 0; round < rounds; round++) {
    for (const agent of agents) {
      const previousTurns = debateHistory.map(
        (turn) => `${turn.name}: ${turn.message}`
      ).join("\n");

      const prompt = `
${systemPrompt}

Product Requirement Document:
${prd}

Agent: ${agent}
Persona: ${agentProfiles[agent].persona}

Previous Debate:
${previousTurns || "None"}

${agent}, what is your message in this round?
`;

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      const reply = result.response.text().trim();

      debateHistory.push({ name: agent, message: reply });
    }
  }

  res.status(200).json({ debate: debateHistory });
}
