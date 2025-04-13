import { Badge } from "@/components/ui/badge";

interface Props {
  agents: string[];
}

export function AgentList({ agents }: Props) {
  return (
    <div className="mt-6 space-y-2">
      <h2 className="text-lg font-semibold">Selected Agents:</h2>
      <div className="flex flex-wrap gap-2">
        {agents.map((agent) => (
          <Badge key={agent} variant="outline" className="text-base">
            {agent}
          </Badge>
        ))}
      </div>
    </div>
  );
}
