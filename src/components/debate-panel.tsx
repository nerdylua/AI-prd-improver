"use client";

import { useEffect, useState } from "react";
import { agentProfiles, AgentName } from "@/lib/agents";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PRDDisplay } from "@/components/PRDDisplay";

interface Props {
  prd: string;
  agents: AgentName[];
}

type Turn = {
  name: AgentName;
  message: string;
};

export function DebatePanel({ prd, agents }: Props) {
  const [debate, setDebate] = useState<Turn[]>([]);
  const [loading, setLoading] = useState(false);
  const [finalPRD, setFinalPRD] = useState("");
  const [generatingFinal, setGeneratingFinal] = useState(false);

  useEffect(() => {
    const startDebate = async () => {
      setLoading(true);
      setFinalPRD("");
      setDebate([]);

      try {
        const res = await fetch("/api/debate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prd, agents }),
        });

        const data = await res.json();
        const debateTurns: Turn[] = data.debate;

        for (let i = 0; i < debateTurns.length; i++) {
          await new Promise((resolve) => setTimeout(resolve, 1200));
          setDebate((prev) => [...prev, debateTurns[i]]);
        }
      } catch (err) {
        toast.error("Failed to simulate debate.");
      } finally {
        setLoading(false);
      }
    };

    if (agents.length > 0) {
      startDebate();
    }
  }, [agents, prd]);

  const synthesizeFinalPRD = async () => {
    setGeneratingFinal(true);
    try {
      const res = await fetch("/api/synthesize-prd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prd, debate }),
      });
      const data = await res.json();
      setFinalPRD(data.improvedPrd);
    } catch (err) {
      toast.error("Failed to generate final PRD.");
    } finally {
      setGeneratingFinal(false);
    }
  };

  const handleSavePRD = async (content: string) => {
    try {
      const res = await fetch("/api/save-prd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prdContent: content }),
      });
      if (!res.ok) throw new Error("Failed to save PRD");
      toast.success("PRD saved successfully!");
    } catch (error) {
      toast.error("Failed to save PRD");
    }
  };

  const handleAcceptPRD = async (content: string) => {
    await handleSavePRD(content);
    toast.success("PRD accepted and saved!");
  };

  return (
    <div className="space-y-4 mt-8">
      <h2 className="text-lg font-semibold">Live Debate</h2>

      <div className="space-y-2">
        {debate.map((turn, index) => {
          const profile = agentProfiles[turn.name];
          return (
            <Card
              key={index}
              className="p-4 flex items-start gap-4"
              style={{ borderLeft: `6px solid ${profile.color}` }}
            >
              <img
                src={profile.avatar}
                alt={turn.name}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <div className="font-semibold" style={{ color: profile.color }}>
                  {turn.name}
                </div>
                <p className="mt-1 text-sm">{turn.message}</p>
              </div>
            </Card>
          );
        })}

        {loading && (
          <p className="text-muted-foreground italic">
            Agents are still debating...
          </p>
        )}
      </div>

      {!loading && !finalPRD && (
        <Button onClick={synthesizeFinalPRD}>
          {generatingFinal ? "Generating Final PRD..." : "Synthesize Final PRD"}
        </Button>
      )}

      {finalPRD && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Final Improved PRD</h3>
          <PRDDisplay 
            prdContent={finalPRD}
            onSave={handleSavePRD}
            onAccept={handleAcceptPRD}
          />
        </div>
      )}
    </div>
  );
}
