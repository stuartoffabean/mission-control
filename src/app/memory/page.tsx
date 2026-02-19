"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, Calendar, Tag, Filter, Plus, Loader2 } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

function AddMemoryForm({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagString, setTagString] = useState("");
  const [priority, setPriority] = useState<"🔴" | "🟡" | "🟢">("🟡");

  const createMemory = useMutation(api.memories.create);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);

    await createMemory({
      title,
      content,
      tags,
      priority,
    });

    setTitle("");
    setContent("");
    setTagString("");
    onClose();
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Add New Memory</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Memory title..."
              autoFocus
            />
          </div>
          <div>
            <Label htmlFor="content">Content (Markdown supported)</Label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your memory content here..."
              className="w-full h-32 px-3 py-2 bg-background border border-input rounded-md text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                value={tagString}
                onChange={(e) => setTagString(e.target.value)}
                placeholder="tag1, tag2, tag3"
              />
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as "🔴" | "🟡" | "🟢")}
                className="w-full px-3 py-2 bg-background border border-input rounded-md"
              >
                <option value="🔴">🔴 High Priority</option>
                <option value="🟡">🟡 Medium Priority</option>
                <option value="🟢">🟢 Low Priority</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit">Add Memory</Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function MemoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const memories = useQuery(api.memories.list) || [];
  const searchResults = useQuery(
    api.memories.search, 
    searchTerm.trim() ? { query: searchTerm.trim() } : "skip"
  ) || [];

  const displayMemories = searchTerm.trim() ? searchResults : memories;

  // Get all unique tags
  const allTags = Array.from(new Set(memories.flatMap((m: any) => m.tags))).sort();

  // Filter memories based on selected tag (search is handled separately)
  const filteredMemories = selectedTag === "" 
    ? displayMemories 
    : displayMemories.filter((memory: any) => memory.tags.includes(selectedTag));

  if (memories === undefined) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading memories...</span>
        </div>
      </div>
    );
  }

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
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="h-4 w-4 mr-2" />
            New Memory
          </Button>
        </div>

        {showAddForm && <AddMemoryForm onClose={() => setShowAddForm(false)} />}

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
              {allTags.map((tag: string) => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Memory Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredMemories.map((memory: any) => (
            <Card key={memory._id} className="h-fit">
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
                      {memory.tags.map((tag: string) => (
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
                  {memories.filter((m: any) => m.priority === '🔴').length}
                </div>
                <div className="text-sm text-muted-foreground">High Priority</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400">
                  {memories.filter((m: any) => m.priority === '🟡').length}
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