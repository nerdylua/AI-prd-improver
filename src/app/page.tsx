"use client";

import { useState } from "react";
import { PRDInput } from "@/components/prd-input";
import { AgentList } from "@/components/agent-list";
import { DebatePanel } from "@/components/debate-panel";
import { AgentName } from "@/lib/agents";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sun, Moon, Laptop } from "lucide-react";
import { useTheme } from "next-themes";

export default function HomePage() {
  const [agents, setAgents] = useState<AgentName[]>([]);
  const [prd, setPrd] = useState("");
  const { theme, setTheme } = useTheme();

  return (
    <div className="fixed inset-0 overflow-auto bg-gradient-to-b from-background to-muted">
      {/* Theme Toggle Dropdown */}
      <div className="fixed top-4 right-4 z-50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              <Sun className="mr-2 h-4 w-4" />
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              <Moon className="mr-2 h-4 w-4" />
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              <Laptop className="mr-2 h-4 w-4" />
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <main className="container max-w-4xl mx-auto py-8 px-4 space-y-6 min-h-full">
        <Card className="border-none shadow-lg">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              DraftWise
            </CardTitle>
            <CardDescription className="text-2xl text-muted-foreground">
              AI-powered PRD Enhancement Platform
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-3xl">Product Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <PRDInput
                    onAgentsSelected={(newAgents) => {
                      setAgents(newAgents as AgentName[]);
                    }}
                    setPRD={setPrd}
                  />
                </CardContent>
              </Card>

              {agents.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Selected Experts</CardTitle>
                    <CardDescription>
                      Expert panel for your PRD review
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AgentList agents={agents} />
                  </CardContent>
                </Card>
              )}

              {agents.length > 0 && prd && (
                <>
                  <Separator className="my-4" />
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Expert Debate</CardTitle>
                      <CardDescription>
                        Live discussion and analysis of your PRD
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <DebatePanel prd={prd} agents={agents} />
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
