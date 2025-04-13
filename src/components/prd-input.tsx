"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { fetchAgents } from "@/lib/api";
import { toast } from "sonner";
import { AgentName } from "@/lib/agents"; 

interface Props {
  onAgentsSelected: (agents: AgentName[]) => void;
  setPRD: (prd: string) => void;
}

export function PRDInput({ onAgentsSelected, setPRD }: Props) {
  const [prdText, setPrdText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!prdText.trim()) return;
    setLoading(true);

    try {
      const agents = await fetchAgents(prdText);
      onAgentsSelected(agents);    
      setPRD(prdText);              
    } catch (error) {
      toast.error("Failed to fetch agents.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Textarea
        placeholder="Paste your PRD or abstract here..."
        value={prdText}
        onChange={(e) => setPrdText(e.target.value)}
        className="h-40"
      />
      <Button onClick={handleSubmit} disabled={loading}>
        {loading ? "Analyzing..." : "Start Agent Selection"}
      </Button>
    </div>
  );
}
