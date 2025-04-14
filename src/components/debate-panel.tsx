"use client";

import { useEffect, useState } from "react";
import { agentProfiles, AgentName } from "@/lib/agents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PRDDisplay } from "@/components/PRDDisplay";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

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
    <Card className="border shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">Expert Discussion</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {debate.map((turn, index) => {
              const profile = agentProfiles[turn.name];
              return (
                <Card
                  key={index}
                  className="transition-all hover:shadow-md"
                  style={{ 
                    borderLeft: `4px solid ${profile.color}`,
                    background: `linear-gradient(to right, ${profile.color}05, transparent)`
                  }}
                >
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className="shrink-0">
                      <img
                        src={profile.avatar}
                        alt={turn.name}
                        className="w-10 h-10 rounded-full ring-2 ring-background"
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className="font-semibold" style={{ color: profile.color }}>
                        {turn.name}
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {turn.message}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {loading && (
              <div className="space-y-4">
                <Skeleton className="h-[80px] w-full" />
                <Skeleton className="h-[80px] w-full" />
              </div>
            )}
          </div>
        </ScrollArea>

        {!loading && !finalPRD && (
          <Button 
            onClick={synthesizeFinalPRD} 
            className="w-full"
            variant="default"
            size="lg"
          >
            {generatingFinal ? "Generating Final PRD..." : "Synthesize Final PRD"}
          </Button>
        )}

        {finalPRD && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Improved PRD</CardTitle>
            </CardHeader>
            <CardContent>
              <PRDDisplay 
                prdContent={finalPRD}
                onSave={handleSavePRD}
                onAccept={handleAcceptPRD}
              />
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
