"use client";

import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AgentName } from "@/lib/agents";

interface Props {
  prd: string;
  debate: { name: AgentName; message: string }[];
  onAccept: (finalPrd: string) => void;
}

export function FinalPRD({ prd, debate, onAccept }: Props) {
  const [finalPrd, setFinalPrd] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const generate = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/synthesize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prd, debate }),
        });
        const data = await res.json();
        setFinalPrd(data.prd);
      } catch {
        toast.error("Failed to generate final PRD.");
      } finally {
        setLoading(false);
      }
    };

    generate();
  }, [prd, debate]);

  return (
    <div className="space-y-4 mt-8">
      <h2 className="text-lg font-semibold">📄 Final PRD</h2>
      {loading ? (
        <p className="text-muted-foreground italic">Synthesizing final PRD...</p>
      ) : (
        <>
          <Textarea
            className="h-64"
            value={finalPrd}
            onChange={(e) => setFinalPrd(e.target.value)}
          />
          <Button onClick={() => onAccept(finalPrd)}>Accept Final PRD</Button>
        </>
      )}
    </div>
  );
}
