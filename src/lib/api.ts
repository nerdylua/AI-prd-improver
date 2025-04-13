import { AgentName } from "./agents";

export async function fetchAgents(prd: string): Promise<AgentName[]> {
    const res = await fetch('/api/select-agents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prd }),
    });
    const data = await res.json();
    return (data.agents || []) as AgentName[];
  }
  