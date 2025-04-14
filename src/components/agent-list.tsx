import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";

interface Props {
  agents: string[];
}

export function AgentList({ agents }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {agents.map((agent) => (
          <Card key={agent} className="flex items-center p-2 bg-muted/50">
            <Avatar className="h-8 w-8 mr-2">
              <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary font-medium">
                {agent[0]}
              </div>
            </Avatar>
            <CardContent className="p-0">
              <div className="font-medium">{agent}</div>
              <CardDescription className="text-xs">Expert Agent</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
