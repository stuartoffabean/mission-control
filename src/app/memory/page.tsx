"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Calendar, Tag, Filter, Plus } from "lucide-react";

// Mock memory data
const memories = [
  {
    id: 1,
    title: "Polymarket Scanner Architecture",
    content: `# Scanner System Design

The polymarket scanner consists of three main components:
- **Data Collection**: Fetches market data via API every 5 minutes
- **Analysis Engine**: Calculates momentum, volume spikes, arbitrage opportunities
- **Alert System**: Sends notifications for high-confidence signals

## Key Insights
- Markets with >$10k volume in 30min often have follow-through
- News events drive 73% of major price moves
- Best opportunities in politics/sports categories`,
    tags: ["polymarket", "scanner", "architecture"],
    priority: "🔴" as const,
    createdAt: Date.now() - 604800000, // 7 days ago
    updatedAt: Date.now() - 86400000,
  },
  {
    id: 2,
    title: "TikTok Algorithm Insights for Aria Sole",
    content: `# Content Strategy Discoveries

## Optimal Posting Times
- **Peak engagement**: 7:30 AM and 6:30 PM PST
- **Best days**: Tuesday, Wednesday, Thursday
- **Avoid**: Sunday for important content

## Content Performance
- GRWM videos: 25% higher engagement
- Cozy home content: Most shareable
- Meta/AI content: Niche but loyal audience

## Technical Notes
- Use TikHub API for analytics tracking
- Monitor hashtag trends weekly
- A/B test posting schedules monthly`,
    tags: ["tiktok", "aria-sole", "content-strategy"],
    priority: "🟡" as const,
    createdAt: Date.now() - 1209600000, // 14 days ago
    updatedAt: Date.now() - 172800000,
  },
  {
    id: 3,
    title: "Trading Risk Management Rules",
    content: `# Risk Management Framework

## Position Sizing
- Maximum 5% of portfolio per position
- Never risk more than 2% on single trade
- Diversify across categories (politics, sports, economics)

## Entry/Exit Rules
- Enter positions with >60% confidence
- Set stop losses at -20%
- Take profits at +100% or when thesis invalidated

## Psychology
- Keep emotion log after each trade
- Review weekly P&L patterns
- Don't chase losses with bigger bets

*"The goal is to be right 55% of the time with proper position sizing"*`,
    tags: ["trading", "risk-management", "psychology"],
    priority: "🔴" as const,
    createdAt: Date.now() - 2419200000, // 28 days ago
    updatedAt: Date.now() - 259200000,
  },
  {
    id: 4,
    title: "OpenClaw Tool Integration Notes",
    content: `# Tool Usage Patterns

## Most Used Tools
- **web_search**: Research market news and trends
- **web_fetch**: Extract article content for analysis
- **exec**: Run scanner scripts and data analysis
- **message**: Coordinate with Micky and send updates

## Best Practices
- Always check tool availability first
- Use exec for long-running processes
- Batch similar operations together
- Store results in memory files for persistence

## Automation Ideas
- Auto-fetch news for active markets
- Schedule regular memory maintenance
- Integrate scanner alerts with messaging`,
    tags: ["openclaw", "tools", "automation"],
    priority: "🟢" as const,
    createdAt: Date.now() - 1814400000, // 21 days ago
    updatedAt: Date.now() - 432000000,
  },
  {
    id: 5,
    title: "Mission Control Dashboard Requirements",
    content: `# Dashboard Specifications

Based on Alex Finn's article, need 6 main screens:

## 1. Tasks Board
- Kanban-style with Backlog/In Progress/Done
- Real-time updates from Stuart
- Priority color coding

## 2. Trading Dashboard
- Portfolio overview with P&L
- Active positions table
- Recent trades history

## 3. Calendar View
- All cron jobs and scheduled tasks
- Next run times and status
- Easy scheduling interface

## 4. Memory System
- Beautiful document layout
- Full-text search capability
- Tag-based filtering

## 5. Team Structure
- Stuart + sub-agents (Builder, Scanner, Research, Nightwatch)
- Role definitions and responsibilities

## 6. Office View
- Digital office with avatars
- Visual status indicators
- Work area simulation`,
    tags: ["mission-control", "dashboard", "requirements"],
    priority: "🟡" as const,
    createdAt: Date.now() - 86400000, // 1 day ago
    updatedAt: Date.now() - 3600000,
  },
];

export default function MemoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("");

  // Get all unique tags
  const allTags = Array.from(new Set(memories.flatMap(m => m.tags))).sort();

  // Filter memories based on search and tags
  const filteredMemories = memories.filter(memory => {
    const matchesSearch = searchTerm === "" || 
      memory.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      memory.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTag = selectedTag === "" || memory.tags.includes(selectedTag);
    
    return matchesSearch && matchesTag;
  });

  return (
    <div className="h-full overflow-auto">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Memory System</h1>
            <p className="text-muted-foreground">
              Searchable knowledge base and documented insights
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Memory
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search memories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="bg-background border border-border rounded-md px-3 py-2 text-sm"
            >
              <option value="">All Tags</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Memory Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredMemories.map((memory) => (
            <Card key={memory.id} className="h-fit">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center space-x-2">
                      <span>{memory.title}</span>
                      <span className="text-lg">{memory.priority}</span>
                    </CardTitle>
                    <div className="flex items-center space-x-2 mt-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(memory.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>Updated {new Date(memory.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="prose prose-sm prose-invert max-w-none mb-4">
                  <div className="text-sm text-muted-foreground whitespace-pre-line line-clamp-8">
                    {memory.content}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Tag className="h-3 w-3 text-muted-foreground" />
                    <div className="flex flex-wrap gap-1">
                      {memory.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-muted text-muted-foreground hover:bg-accent cursor-pointer"
                          onClick={() => setSelectedTag(tag)}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredMemories.length === 0 && (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">No memories found matching your criteria</p>
            </CardContent>
          </Card>
        )}

        {/* Memory Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Memory Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{memories.length}</div>
                <div className="text-sm text-muted-foreground">Total Memories</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-400">
                  {memories.filter(m => m.priority === '🔴').length}
                </div>
                <div className="text-sm text-muted-foreground">High Priority</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400">
                  {memories.filter(m => m.priority === '🟡').length}
                </div>
                <div className="text-sm text-muted-foreground">Medium Priority</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{allTags.length}</div>
                <div className="text-sm text-muted-foreground">Unique Tags</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}