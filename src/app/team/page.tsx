"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, Users, Zap, Target, Shield } from "lucide-react";

// Team structure with Stuart and sub-agents
const teamMembers = [
  {
    id: 1,
    name: "Stuart",
    role: "Main Agent",
    description: "AI Trading Assistant and Mission Control Operator",
    status: "working" as const,
    avatar: "🤖",
    lastActive: Date.now() - 300000, // 5 minutes ago
    tasksCompleted: 247,
    specialties: ["Trading", "Research", "Coordination", "Strategy"],
    currentTask: "Building Mission Control Dashboard",
  },
  {
    id: 2,
    name: "Builder",
    role: "Development Agent",
    description: "Specialized in software development, deployment, and technical implementation",
    status: "idle" as const,
    avatar: "👨‍💻",
    lastActive: Date.now() - 3600000, // 1 hour ago
    tasksCompleted: 89,
    specialties: ["NextJS", "React", "Deployment", "APIs"],
    currentTask: null,
  },
  {
    id: 3,
    name: "Scanner",
    role: "Market Analysis Agent",
    description: "Monitors prediction markets, analyzes trends, and identifies opportunities",
    status: "working" as const,
    avatar: "📊",
    lastActive: Date.now() - 900000, // 15 minutes ago
    tasksCompleted: 156,
    specialties: ["Market Analysis", "Data Processing", "Pattern Recognition", "Alerts"],
    currentTask: "Analyzing NBA MVP odds movement",
  },
  {
    id: 4,
    name: "Research",
    role: "Information Specialist",
    description: "Conducts deep research, fact-checking, and information synthesis",
    status: "working" as const,
    avatar: "🔍",
    lastActive: Date.now() - 600000, // 10 minutes ago
    tasksCompleted: 203,
    specialties: ["Web Research", "Fact Checking", "News Analysis", "Content Synthesis"],
    currentTask: "Researching Polymarket orderbook API",
  },
  {
    id: 5,
    name: "Nightwatch",
    role: "Monitoring Agent",
    description: "Overnight monitoring, alert management, and system maintenance",
    status: "idle" as const,
    avatar: "🌙",
    lastActive: Date.now() - 28800000, // 8 hours ago
    tasksCompleted: 134,
    specialties: ["System Monitoring", "Alert Management", "Maintenance", "Reporting"],
    currentTask: null,
  },
  {
    id: 6,
    name: "Writer",
    role: "Content Agent",
    description: "Handles content creation, documentation, and communication",
    status: "idle" as const,
    avatar: "✍️",
    lastActive: Date.now() - 7200000, // 2 hours ago
    tasksCompleted: 78,
    specialties: ["Writing", "Documentation", "Communication", "Editing"],
    currentTask: null,
  },
];

const roleColors = {
  "Main Agent": "bg-blue-500/20 text-blue-400",
  "Development Agent": "bg-green-500/20 text-green-400",
  "Market Analysis Agent": "bg-purple-500/20 text-purple-400",
  "Information Specialist": "bg-orange-500/20 text-orange-400",
  "Monitoring Agent": "bg-indigo-500/20 text-indigo-400",
  "Content Agent": "bg-pink-500/20 text-pink-400",
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
  const activeMembers = teamMembers.filter(m => m.status === 'working').length;
  const totalTasks = teamMembers.reduce((sum, m) => sum + m.tasksCompleted, 0);

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
                  <div className="text-2xl font-bold">{teamMembers.length}</div>
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
                  <div className="text-2xl font-bold">{Math.round(totalTasks / teamMembers.length)}</div>
                  <div className="text-sm text-muted-foreground">Avg per Agent</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Team Members */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {teamMembers.map((member) => (
            <Card key={member.id} className="h-fit">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">{member.avatar}</div>
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <span>{member.name}</span>
                        {getStatusIcon(member.status)}
                      </CardTitle>
                      <Badge className={roleColors[member.role as keyof typeof roleColors]}>
                        {member.role}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {member.description}
                </p>

                {member.currentTask && (
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Current Task:</div>
                    <div className="text-sm">{member.currentTask}</div>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">Specialties:</div>
                  <div className="flex flex-wrap gap-1">
                    {member.specialties.map((specialty) => (
                      <span
                        key={specialty}
                        className="inline-flex items-center px-2 py-1 rounded text-xs bg-secondary text-secondary-foreground"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <span>Tasks: <span className="font-bold">{member.tasksCompleted}</span></span>
                    <span>Last: <span className="text-muted-foreground">{formatLastActive(member.lastActive)}</span></span>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs ${
                    member.status === 'working' ? 'bg-green-500/20 text-green-400' :
                    member.status === 'idle' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {member.status}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Role Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Team Composition</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(roleColors).map(([role, colorClass]) => {
                const count = teamMembers.filter(m => m.role === role).length;
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