"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, User, AlertTriangle, Clock, CheckCircle, Loader2 } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";

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

function TaskCard({ task, onStatusChange }: { 
  task: any, 
  onStatusChange: (taskId: any, newStatus: string) => void 
}) {
  return (
    <Card className={`mb-4 ${getPriorityColor(task.priority)} cursor-pointer hover:shadow-md transition-shadow`}>
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
          <button
            onClick={() => {
              const statusOrder = ["backlog", "in-progress", "done"];
              const currentIndex = statusOrder.indexOf(task.status);
              const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
              onStatusChange(task._id, nextStatus);
            }}
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium hover:opacity-80
            ${task.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
              task.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
              task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-green-500/20 text-green-400'}`}
          >
            {task.priority}
          </button>
          <span className="text-xs text-muted-foreground">
            {new Date(task.createdAt).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function AddTaskForm({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignee, setAssignee] = useState<"Stuart" | "Micky">("Stuart");
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "critical">("medium");
  
  const createTask = useMutation(api.tasks.create);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    await createTask({
      title,
      description,
      assignee,
      priority,
    });
    
    setTitle("");
    setDescription("");
    onClose();
  };

  return (
    <Card className="mb-4 border-dashed">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title..."
              autoFocus
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description..."
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="assignee">Assignee</Label>
              <select
                id="assignee"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value as "Stuart" | "Micky")}
                className="w-full px-3 py-2 bg-background border border-input rounded-md"
              >
                <option value="Stuart">Stuart</option>
                <option value="Micky">Micky</option>
              </select>
            </div>
            <div className="flex-1">
              <Label htmlFor="priority">Priority</Label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 bg-background border border-input rounded-md"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit">Add Task</Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function TasksPage() {
  const tasks = useQuery(api.tasks.get) || [];
  const updateStatus = useMutation(api.tasks.updateStatus);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleStatusChange = async (taskId: any, newStatus: string) => {
    await updateStatus({
      id: taskId,
      status: newStatus as "backlog" | "in-progress" | "done",
    });
  };

  if (tasks === undefined) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading tasks...</span>
        </div>
      </div>
    );
  }

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
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {columns.map((column) => {
            const Icon = column.icon;
            const tasksInColumn = tasks.filter((task: any) => task.status === column.id);
            
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
                  {column.id === "backlog" && showAddForm && (
                    <AddTaskForm onClose={() => setShowAddForm(false)} />
                  )}
                  
                  {tasksInColumn.map((task: any) => (
                    <TaskCard 
                      key={task._id} 
                      task={task} 
                      onStatusChange={handleStatusChange}
                    />
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