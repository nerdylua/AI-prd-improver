import type { NextApiRequest, NextApiResponse } from "next";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { agentProfiles, AgentName } from "@/lib/agents";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Rate limiting configuration
const REQUEST_DELAY_MS = 2500; 
const MAX_ROUNDS = 2; 

type AgentTurn = {
  name: AgentName;
  message: string;
};

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { prd, agents, rounds = MAX_ROUNDS } = req.body as {
    prd: string;
    agents: AgentName[];
    rounds: number;
  };

  if (!prd || !agents?.length) {
    return res.status(400).json({ error: "Missing PRD or agents" });
  }

  const debateHistory: AgentTurn[] = [];

  const systemPrompt = `You are simulating a multi-agent debate. Each agent has a defined personality and expertise. They will respond to the PRD and to each other in turns. Be direct, professional, and assertive. In the first round, provide your initial analysis of the PRD. In the second round, respond to other agents' points and refine your position. Reference specific points made by other agents when relevant. Limit each message to 3-4 sentences.`;

  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash-thinking-exp"  
  });

  try {
    for (let round = 0; round < Math.min(rounds, MAX_ROUNDS); round++) {
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

        // Add delay between requests to stay under rate limit
        if (round < rounds - 1 || agent !== agents[agents.length - 1]) {
          await delay(REQUEST_DELAY_MS);
        }
      }
    }

    res.status(200).json({ debate: debateHistory });
  } catch (error) {
    console.error("Debate error:", error);
    res.status(500).json({ 
      error: "Debate failed",
      details: error instanceof Error ? error.message : String(error)
    });
  }
}