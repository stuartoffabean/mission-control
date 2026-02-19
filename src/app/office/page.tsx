"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Monitor, Coffee, Wifi, Zap, Clock } from "lucide-react";

// Office layout with workstations
const workstations = [
  {
    id: 1,
    agent: "Stuart",
    avatar: "🤖",
    position: { x: 20, y: 20 },
    status: "working" as const,
    currentTask: "Building Mission Control Dashboard",
    workstation: "main-desk",
    lastActivity: Date.now() - 300000,
    tools: ["Terminal", "Browser", "Code Editor"],
  },
  {
    id: 2,
    agent: "Builder",
    avatar: "👨‍💻",
    position: { x: 60, y: 25 },
    status: "idle" as const,
    currentTask: null,
    workstation: "dev-station",
    lastActivity: Date.now() - 3600000,
    tools: ["VS Code", "Docker", "Git"],
  },
  {
    id: 3,
    agent: "Scanner",
    avatar: "📊",
    position: { x: 15, y: 60 },
    status: "working" as const,
    currentTask: "Analyzing NBA MVP odds",
    workstation: "analytics-hub",
    lastActivity: Date.now() - 900000,
    tools: ["Jupyter", "Python", "APIs"],
  },
  {
    id: 4,
    agent: "Research",
    avatar: "🔍",
    position: { x: 75, y: 65 },
    status: "working" as const,
    currentTask: "Investigating Polymarket API",
    workstation: "research-station",
    lastActivity: Date.now() - 600000,
    tools: ["Browser", "Notes", "Archive"],
  },
  {
    id: 5,
    agent: "Nightwatch",
    avatar: "🌙",
    position: { x: 45, y: 75 },
    status: "idle" as const,
    currentTask: null,
    workstation: "monitoring-center",
    lastActivity: Date.now() - 28800000,
    tools: ["Logs", "Alerts", "Dashboards"],
  },
  {
    id: 6,
    agent: "Writer",
    avatar: "✍️",
    position: { x: 35, y: 40 },
    status: "idle" as const,
    currentTask: null,
    workstation: "creative-corner",
    lastActivity: Date.now() - 7200000,
    tools: ["Editor", "Docs", "References"],
  },
];

// Office furniture and elements
const officeElements = [
  { type: "coffee", icon: "☕", position: { x: 85, y: 15 }, label: "Coffee Machine" },
  { type: "meeting", icon: "🪑", position: { x: 50, y: 10 }, label: "Meeting Area" },
  { type: "printer", icon: "🖨️", position: { x: 10, y: 85 }, label: "Printer" },
  { type: "plant", icon: "🪴", position: { x: 90, y: 40 }, label: "Office Plant" },
  { type: "whiteboard", icon: "📋", position: { x: 5, y: 5 }, label: "Whiteboard" },
];

function getStatusAnimation(status: string) {
  switch (status) {
    case "working": return "animate-bounce";
    case "idle": return "opacity-60";
    case "offline": return "opacity-30 grayscale";
    default: return "";
  }
}

function getWorkstationColor(status: string) {
  switch (status) {
    case "working": return "border-green-400 bg-green-400/10";
    case "idle": return "border-yellow-400 bg-yellow-400/5";
    case "offline": return "border-gray-600 bg-gray-600/5";
    default: return "border-muted";
  }
}

function formatLastActivity(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "active";
}

export default function OfficePage() {
  const activeAgents = workstations.filter(w => w.status === 'working').length;

  return (
    <div className="h-full overflow-auto">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Digital Office</h1>
            <p className="text-muted-foreground">
              Live view of agent activities and workstations
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-green-400" />
              <span className="text-sm">{activeAgents} agents working</span>
            </div>
            <div className="flex items-center space-x-2">
              <Wifi className="h-4 w-4 text-green-400" />
              <span className="text-sm">All systems online</span>
            </div>
          </div>
        </div>

        {/* Office Layout */}
        <Card className="min-h-[600px] relative bg-gradient-to-br from-muted/20 to-muted/5">
          <CardContent className="p-8 relative h-[600px]">
            {/* Grid lines for office feel */}
            <div className="absolute inset-0 opacity-10">
              <svg width="100%" height="100%">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>

            {/* Office Elements (furniture) */}
            {officeElements.map((element, index) => (
              <div
                key={index}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 opacity-40"
                style={{
                  left: `${element.position.x}%`,
                  top: `${element.position.y}%`,
                }}
              >
                <div className="text-2xl" title={element.label}>
                  {element.icon}
                </div>
              </div>
            ))}

            {/* Agent Workstations */}
            {workstations.map((station) => (
              <div
                key={station.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${station.position.x}%`,
                  top: `${station.position.y}%`,
                }}
              >
                {/* Workstation Area */}
                <div className={`
                  relative p-4 rounded-lg border-2 min-w-[120px] text-center
                  ${getWorkstationColor(station.status)}
                `}>
                  {/* Computer Monitor */}
                  <div className="mb-2">
                    <Monitor className={`h-6 w-6 mx-auto ${
                      station.status === 'working' ? 'text-green-400' : 'text-muted-foreground'
                    }`} />
                  </div>

                  {/* Agent Avatar */}
                  <div className={`text-3xl mb-2 ${getStatusAnimation(station.status)}`}>
                    {station.avatar}
                  </div>

                  {/* Agent Info */}
                  <div className="space-y-1">
                    <div className="font-medium text-sm">{station.agent}</div>
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      station.status === 'working' ? 'bg-green-500/20 text-green-400' :
                      station.status === 'idle' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {station.status}
                    </div>
                  </div>

                  {/* Current Task */}
                  {station.currentTask && (
                    <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                      {station.currentTask}
                    </div>
                  )}

                  {/* Activity Indicator */}
                  <div className="absolute -top-1 -right-1">
                    {station.status === 'working' && (
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Office Status Info */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-card/80 backdrop-blur-sm border rounded-lg p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{new Date().toLocaleTimeString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-green-400" />
                    <span>{activeAgents} Active</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Monitor className="h-4 w-4 text-muted-foreground" />
                    <span>{workstations.length} Workstations</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Coffee className="h-4 w-4 text-muted-foreground" />
                    <span>Break Time Available</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Agent Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workstations.map((station) => (
            <Card key={station.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{station.avatar}</span>
                    <span className="font-medium">{station.agent}</span>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs ${
                    station.status === 'working' ? 'bg-green-500/20 text-green-400' :
                    station.status === 'idle' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {station.status}
                  </div>
                </div>

                {station.currentTask && (
                  <div className="text-sm mb-2">
                    <span className="text-muted-foreground">Task: </span>
                    {station.currentTask}
                  </div>
                )}

                <div className="text-xs text-muted-foreground mb-2">
                  Last activity: {formatLastActivity(station.lastActivity)}
                </div>

                <div className="flex flex-wrap gap-1">
                  {station.tools.map((tool) => (
                    <span
                      key={tool}
                      className="inline-flex items-center px-2 py-1 rounded text-xs bg-secondary"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}