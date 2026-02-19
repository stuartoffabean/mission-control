"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, Users, Zap, Target, Loader2 } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

const roleColors = {
  "Main AI": "bg-blue-500/20 text-blue-400",
  "Sub-agent": "bg-green-500/20 text-green-400",
};

function getStatusIcon(status: string) {
  switch (status) {
    case "working": return <Zap className="h-4 w-4 text-green-400 animate-pulse" />;
    case "idle": return <Clock className="h-4 w-4 text-muted-foreground" />;
    case "offline": return <div className="h-4 w-4 rounded-full bg-red-500" />;
    default: return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
}

function formatLastActive(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
}

export default function TeamPage() {
  const agents = useQuery(api.agents.list) || [];

  if (agents === undefined) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading team...</span>
        </div>
      </div>
    );
  }

  const activeMembers = agents.filter((a: any) => a.status === 'working').length;
  const totalTasks = agents.reduce((sum: number, a: any) => sum + a.tasksCompleted, 0);

  return (
    <div className="h-full overflow-auto">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Team Structure</h1>
          <p className="text-muted-foreground">
            Stuart and specialized sub-agents organized by roles and responsibilities
          </p>
        </div>

        {/* Team Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-2xl font-bold">{agents.length}</div>
                  <div className="text-sm text-muted-foreground">Total Agents</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-green-400" />
                <div>
                  <div className="text-2xl font-bold text-green-400">{activeMembers}</div>
                  <div className="text-sm text-muted-foreground">Active Now</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-2xl font-bold">{totalTasks}</div>
                  <div className="text-sm text-muted-foreground">Total Tasks</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-2xl font-bold">
                    {agents.length > 0 ? Math.round(totalTasks / agents.length) : 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Avg per Agent</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Team Members */}
        {agents.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">No agents found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {agents.map((agent: any) => (
              <Card key={agent._id} className="h-fit">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl">{agent.avatar}</div>
                      <div>
                        <CardTitle className="flex items-center space-x-2">
                          <span>{agent.name}</span>
                          {getStatusIcon(agent.status)}
                        </CardTitle>
                        <Badge className={roleColors[agent.role as keyof typeof roleColors] || "bg-gray-500/20 text-gray-400"}>
                          {agent.role}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {agent.description}
                  </p>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <span>Tasks: <span className="font-bold">{agent.tasksCompleted}</span></span>
                      <span>Last: <span className="text-muted-foreground">{formatLastActive(agent.lastActive)}</span></span>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs ${
                      agent.status === 'working' ? 'bg-green-500/20 text-green-400' :
                      agent.status === 'idle' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {agent.status}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Role Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Team Composition</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(roleColors).map(([role, colorClass]) => {
                const count = agents.filter((a: any) => a.role === role).length;
                return (
                  <div key={role} className="flex items-center justify-between p-3 border rounded">
                    <span className="text-sm">{role}</span>
                    <Badge className={colorClass}>{count}</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}