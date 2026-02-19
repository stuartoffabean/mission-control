"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Play, Pause, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

// Keep some mock upcoming events since they're not in the schema yet
const upcomingEvents = [
  {
    id: 1,
    name: "Market Analysis: NBA MVP Odds",
    time: Date.now() + 3600000,
    type: "Research",
  },
  {
    id: 2,
    name: "Deploy Mission Control v2",
    time: Date.now() + 7200000,
    type: "Development",
  },
  {
    id: 3,
    name: "Review Polymarket Positions",
    time: Date.now() + 10800000,
    type: "Trading",
  },
];

function getStatusIcon(status: string) {
  switch (status) {
    case "active": return <CheckCircle className="h-4 w-4 text-green-400" />;
    case "paused": return <Pause className="h-4 w-4 text-yellow-400" />;
    case "error": return <AlertCircle className="h-4 w-4 text-red-400" />;
    default: return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
}

function formatTimeUntil(timestamp: number): string {
  const diff = timestamp - Date.now();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (diff > 0) {
    return `${minutes}m`;
  } else {
    return "overdue";
  }
}

export default function CalendarPage() {
  const cronJobs = useQuery(api.cronJobs.list) || [];

  if (cronJobs === undefined) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading cron jobs...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Calendar & Cron Jobs</h1>
          <p className="text-muted-foreground">
            Scheduled tasks, cron jobs, and upcoming events
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cron Jobs */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Cron Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                {cronJobs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No cron jobs found
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cronJobs.map((job: any) => (
                      <div key={job._id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(job.status)}
                            <h3 className="font-medium">{job.name}</h3>
                          </div>
                          <span className="text-xs text-muted-foreground">{job.schedule}</span>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">{job.description}</p>
                        
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-4">
                            <span>
                              Last: {job.lastRun ? new Date(job.lastRun).toLocaleString() : 'Never'}
                            </span>
                            <span>
                              Next: {job.nextRun ? formatTimeUntil(job.nextRun) : 'Not scheduled'}
                            </span>
                          </div>
                          <span className={`px-2 py-1 rounded-full ${
                            job.status === 'active' ? 'bg-green-500/20 text-green-400' :
                            job.status === 'paused' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {job.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Events */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="p-3 border rounded">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-medium">{event.name}</h4>
                        <span className="text-xs bg-muted px-2 py-1 rounded">{event.type}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatTimeUntil(event.time)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active Jobs</span>
                    <span className="font-bold text-green-400">
                      {cronJobs.filter((job: any) => job.status === 'active').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Paused</span>
                    <span className="font-bold text-yellow-400">
                      {cronJobs.filter((job: any) => job.status === 'paused').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Errors</span>
                    <span className="font-bold text-red-400">
                      {cronJobs.filter((job: any) => job.status === 'error').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm">Next Job</span>
                    <span className="font-bold">
                      {cronJobs.length > 0 && cronJobs.some((job: any) => job.nextRun) 
                        ? formatTimeUntil(Math.min(...cronJobs.filter((job: any) => job.nextRun).map((job: any) => job.nextRun)))
                        : 'None scheduled'
                      }
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}