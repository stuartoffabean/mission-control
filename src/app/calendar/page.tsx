"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Pause, AlertCircle, CheckCircle, Loader2, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

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
  if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (diff > 0) return `${minutes}m`;
  return "overdue";
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function formatDate(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const TAG_COLORS: Record<string, string> = {
  "scanner": "bg-blue-500/20 text-blue-400",
  "post-mortem": "bg-red-500/20 text-red-400",
  "ensemble": "bg-purple-500/20 text-purple-400",
  "infrastructure": "bg-yellow-500/20 text-yellow-400",
  "trading": "bg-green-500/20 text-green-400",
  "strategy": "bg-cyan-500/20 text-cyan-400",
  "bugfix": "bg-orange-500/20 text-orange-400",
};

export default function CalendarPage() {
  const cronJobs = useQuery(api.cronJobs.list) || [];
  const dailyLogs = useQuery(api.dailyLogs.list, { limit: 60 }) || [];
  
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<string>(formatDate(now.getFullYear(), now.getMonth(), now.getDate()));

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  
  // Build set of dates with logs
  const logDates = new Set((dailyLogs || []).map((l: any) => l.date));
  
  // Find selected log
  const selectedLog = (dailyLogs || []).find((l: any) => l.date === selectedDate);
  
  const today = formatDate(now.getFullYear(), now.getMonth(), now.getDate());

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(viewYear - 1); setViewMonth(11); }
    else setViewMonth(viewMonth - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(viewYear + 1); setViewMonth(0); }
    else setViewMonth(viewMonth + 1);
  }

  return (
    <div className="h-full overflow-auto">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Calendar</h1>
          <p className="text-muted-foreground">Daily logs, session summaries, and scheduled jobs</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Grid */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <button onClick={prevMonth} className="p-1 hover:bg-muted rounded">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <CardTitle>{MONTH_NAMES[viewMonth]} {viewYear}</CardTitle>
                  <button onClick={nextMonth} className="p-1 hover:bg-muted rounded">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1 mb-1">
                  {DAY_NAMES.map((d) => (
                    <div key={d} className="text-center text-xs text-muted-foreground font-medium py-1">{d}</div>
                  ))}
                </div>
                {/* Day cells */}
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-14" />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const date = formatDate(viewYear, viewMonth, day);
                    const hasLog = logDates.has(date);
                    const isToday = date === today;
                    const isSelected = date === selectedDate;
                    
                    return (
                      <button
                        key={day}
                        onClick={() => setSelectedDate(date)}
                        className={`h-14 rounded-lg border text-sm relative flex flex-col items-center justify-center transition-colors
                          ${isSelected ? "border-primary bg-primary/10 text-primary font-bold" : "border-transparent hover:bg-muted/50"}
                          ${isToday && !isSelected ? "border-muted-foreground/30" : ""}
                        `}
                      >
                        <span className={isToday ? "font-bold" : ""}>{day}</span>
                        {hasLog && (
                          <div className="absolute bottom-1 flex gap-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Selected Day Log */}
            {selectedLog ? (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{selectedLog.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{selectedDate}</p>
                    </div>
                    <div className="flex gap-1.5 flex-wrap justify-end">
                      {(selectedLog.tags || []).map((tag: string) => (
                        <span key={tag} className={`text-xs px-2 py-0.5 rounded-full ${TAG_COLORS[tag] || "bg-muted text-muted-foreground"}`}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{selectedLog.summary}</p>
                  <div className="space-y-4">
                    {(selectedLog.sections || []).map((section: any, i: number) => (
                      <div key={i}>
                        <h4 className="font-medium text-sm mb-2">{section.heading}</h4>
                        <ul className="space-y-1">
                          {(section.bullets || []).map((bullet: string, j: number) => (
                            <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-primary mt-1.5 shrink-0">•</span>
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-8">
                  <div className="text-center text-muted-foreground">
                    <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No log entry for {selectedDate}</p>
                    <p className="text-xs mt-1">Ask Stuart to summarize the day and push it here</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar: Cron Jobs */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cron Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                {cronJobs.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground text-sm">No cron jobs</div>
                ) : (
                  <div className="space-y-3">
                    {cronJobs.map((job: any) => (
                      <div key={job._id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(job.status)}
                            <h3 className="text-sm font-medium">{job.name}</h3>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{job.description}</p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            {job.schedule}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                            job.status === "active" ? "bg-green-500/20 text-green-400" :
                            job.status === "paused" ? "bg-yellow-500/20 text-yellow-400" :
                            "bg-red-500/20 text-red-400"
                          }`}>
                            {job.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1.5 pt-1.5 border-t">
                          <span>Last: {job.lastRun ? new Date(job.lastRun).toLocaleString() : "Never"}</span>
                          <span>Next: {job.nextRun ? formatTimeUntil(job.nextRun) : "—"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Logs */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Logs</CardTitle>
              </CardHeader>
              <CardContent>
                {(dailyLogs || []).length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground text-sm">No logs yet</div>
                ) : (
                  <div className="space-y-2">
                    {(dailyLogs || []).slice(0, 7).map((log: any) => (
                      <button
                        key={log._id}
                        onClick={() => {
                          setSelectedDate(log.date);
                          const [y, m] = log.date.split("-").map(Number);
                          setViewYear(y);
                          setViewMonth(m - 1);
                        }}
                        className={`w-full text-left p-2 rounded border transition-colors ${
                          selectedDate === log.date ? "border-primary bg-primary/5" : "border-transparent hover:bg-muted/50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium">{log.date}</span>
                          <div className="flex gap-1">
                            {(log.tags || []).slice(0, 2).map((tag: string) => (
                              <span key={tag} className={`text-[10px] px-1.5 py-0.5 rounded-full ${TAG_COLORS[tag] || "bg-muted text-muted-foreground"}`}>
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{log.title}</p>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
