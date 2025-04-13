"use client";

import { useState } from "react";
import { PRDInput } from "@/components/prd-input";
import { AgentList } from "@/components/agent-list";
import { DebatePanel } from "@/components/debate-panel";
import { AgentName } from "@/lib/agents";

export default function HomePage() {
  const [agents, setAgents] = useState<AgentName[]>([]);
  const [prd, setPrd] = useState("");

  return (
    <main className="max-w-3xl mx-auto py-10 px-4 space-y-6">
      <h1 className="text-3xl font-bold">AI PRD Improver</h1>
      <PRDInput
        onAgentsSelected={(newAgents) => {
          setAgents(newAgents as AgentName[]);
        }}
        setPRD={setPrd}
      />
      {agents.length > 0 && <AgentList agents={agents} />}
      {agents.length > 0 && prd && <DebatePanel prd={prd} agents={agents} />}
    </main>
  );
}
