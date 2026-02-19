"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, User, AlertTriangle, Clock, CheckCircle } from "lucide-react";

// Mock data - in real app this would come from Convex
const mockTasks = [
  {
    id: 1,
    title: "Set up Polymarket scanner alerts",
    description: "Configure real-time alerts for high-volume markets with unusual price movements",
    assignee: "Stuart" as const,
    priority: "high" as const,
    status: "in-progress" as const,
    createdAt: Date.now() - 86400000,
  },
  {
    id: 2,
    title: "Research TikTok engagement patterns",
    description: "Analyze best posting times and content types for Aria Sole",
    assignee: "Micky" as const,
    priority: "medium" as const,
    status: "backlog" as const,
    createdAt: Date.now() - 172800000,
  },
  {
    id: 3,
    title: "Deploy Mission Control dashboard",
    description: "Build and deploy the NextJS + Convex mission control system",
    assignee: "Stuart" as const,
    priority: "critical" as const,
    status: "in-progress" as const,
    createdAt: Date.now() - 7200000,
  },
  {
    id: 4,
    title: "Review daily market positions",
    description: "Check P&L and adjust position sizes based on risk metrics",
    assignee: "Stuart" as const,
    priority: "medium" as const,
    status: "done" as const,
    createdAt: Date.now() - 259200000,
  },
];

const columns = [
  { id: "backlog", title: "Backlog", icon: Clock },
  { id: "in-progress", title: "In Progress", icon: AlertTriangle },
  { id: "done", title: "Done", icon: CheckCircle },
];

function getPriorityColor(priority: string) {
  switch (priority) {
    case "critical": return "border-red-500 bg-red-500/10";
    case "high": return "border-orange-500 bg-orange-500/10";
    case "medium": return "border-yellow-500 bg-yellow-500/10";
    case "low": return "border-green-500 bg-green-500/10";
    default: return "border-muted";
  }
}

function TaskCard({ task }: { task: typeof mockTasks[0] }) {
  return (
    <Card className={`mb-4 ${getPriorityColor(task.priority)}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-medium">{task.title}</CardTitle>
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <User className="h-3 w-3" />
            <span>{task.assignee}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-xs text-muted-foreground mb-2">{task.description}</p>
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
            ${task.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
              task.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
              task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-green-500/20 text-green-400'}`}>
            {task.priority}
          </span>
          <span className="text-xs text-muted-foreground">
            {new Date(task.createdAt).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function TasksPage() {
  return (
    <div className="h-full overflow-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Tasks Board</h1>
            <p className="text-muted-foreground">
              Track all tasks, assignments, and progress in real-time
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {columns.map((column) => {
            const Icon = column.icon;
            const tasksInColumn = mockTasks.filter(task => task.status === column.id);
            
            return (
              <div key={column.id} className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <h2 className="font-semibold">{column.title}</h2>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                    {tasksInColumn.length}
                  </span>
                </div>
                
                <div className="space-y-2">
                  {tasksInColumn.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
                
                {tasksInColumn.length === 0 && (
                  <Card className="border-dashed">
                    <CardContent className="flex items-center justify-center h-24">
                      <p className="text-muted-foreground text-sm">No tasks</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}