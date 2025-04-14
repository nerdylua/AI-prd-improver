import type { NextApiRequest, NextApiResponse } from "next";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { agentProfiles, AgentName } from "@/lib/agents";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const MAX_AGENTS = 5; 

type AgentTurn = {
  name: AgentName;
  message: string;
  round: number;  // Add round number to track turns
};

function validateDebateOrder(debate: AgentTurn[], expectedOrder: AgentName[], totalRounds: number): boolean {
  if (debate.length !== expectedOrder.length * totalRounds) return false;
  
  // Check each round separately
  for (let round = 0; round < totalRounds; round++) {
    const roundStart = round * expectedOrder.length;
    const roundEnd = roundStart + expectedOrder.length;
    const roundTurns = debate.slice(roundStart, roundEnd);
    
    // Verify each agent speaks once in the correct order within this round
    for (let i = 0; i < expectedOrder.length; i++) {
      if (roundTurns[i].name !== expectedOrder[i] || roundTurns[i].round !== round + 1) {
        return false;
      }
    }
  }
  return true;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { prd, agents, rounds = 1 } = req.body as {
    prd: string;
    agents: AgentName[];
    rounds: number;
  };

  if (!prd || !agents?.length) {
    return res.status(400).json({ error: "Missing PRD or agents" });
  }

  const selectedAgents = agents.slice(0, MAX_AGENTS);

  const systemPrompt = `You are simulating a structured debate between domain experts. Each expert will speak exactly once, in a specific order. The debate should flow naturally, with each expert building on or challenging previous points while maintaining their professional focus.`;

  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash-thinking-exp"  
  });

  try {
    // Construct a single prompt that includes all agents and their personas
    const agentsPrompt = selectedAgents.map(agent => 
      `${agent}:\nRole: ${agentProfiles[agent].persona}`
    ).join('\n\n');

    const prompt = `
${systemPrompt}

Product Requirement Document:
${prd}

Expert Panel:
${agentsPrompt}

This will be a ${rounds}-round debate.

IMPORTANT: In each round, experts MUST speak in exactly this order:
${selectedAgents.map((agent, i) => `${i + 1}. ${agent}`).join('\n')}

Debate Rules:
1. Each expert speaks exactly once per round in the specified order
2. Complete one full round before starting the next
3. Each expert should:
   - Reference points from current round (if not first speaker)
   - Build on previous rounds (if not first round)
   - Keep responses focused (50-60 words)

Format your response as a JSON array where each element has:
- name: the expert's name
- message: their contribution
- round: the round number (1 to ${rounds})

Example format for a 2-round debate:
[
  {"name": "${selectedAgents[0]}", "message": "Initial analysis...", "round": 1},
  {"name": "${selectedAgents[1] || 'Expert 2'}", "message": "Regarding the first point...", "round": 1},
  {"name": "${selectedAgents[0]}", "message": "Building on our discussion...", "round": 2},
  {"name": "${selectedAgents[1] || 'Expert 2'}", "message": "To conclude...", "round": 2}
]

Ensure each round is completed before starting the next round.`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const reply = result.response.text().trim();
    let debateHistory: AgentTurn[] = [];

    try {
      debateHistory = JSON.parse(reply);
      
      if (!validateDebateOrder(debateHistory, selectedAgents, rounds)) {
        throw new Error('Debate response did not follow the required round structure and speaking order');
      }
    } catch (e) {
      const jsonMatch = reply.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        debateHistory = JSON.parse(jsonMatch[0]);
        if (!validateDebateOrder(debateHistory, selectedAgents, rounds)) {
          throw new Error('Debate response did not follow the required round structure and speaking order');
        }
      } else {
        throw new Error('Failed to parse debate response');
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