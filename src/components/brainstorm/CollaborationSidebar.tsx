import { Pin, Users, Brain, Calendar, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const pinnedIdeas = [
  {
    id: "1",
    content: "Implement real-time collaborative whiteboard feature",
    author: "AI Expert",
    timestamp: "2 mins ago",
    votes: 8,
  },
  {
    id: "2", 
    content: "Add voice-to-text for faster brainstorming sessions",
    author: "Sarah Chen",
    timestamp: "5 mins ago",
    votes: 12,
  },
  {
    id: "3",
    content: "Create templates for different meeting types",
    author: "AI Moderator",
    timestamp: "8 mins ago", 
    votes: 6,
  },
];

const participants = [
  { name: "You", role: "human", status: "active", avatar: "You" },
  { name: "Sarah Chen", role: "human", status: "active", avatar: "SC" },
  { name: "Mike Rodriguez", role: "human", status: "away", avatar: "MR" },
  { name: "AI Expert", role: "ai", type: "expert", status: "active", avatar: "EX" },
  { name: "AI Moderator", role: "ai", type: "moderator", status: "active", avatar: "MOD" },
  { name: "AI Companion", role: "ai", type: "companion", status: "active", avatar: "COM" },
];

const upcomingSessions = [
  {
    title: "Product Roadmap Review",
    time: "Tomorrow, 2:00 PM",
    participants: 6,
  },
  {
    title: "User Feedback Analysis", 
    time: "Friday, 10:00 AM",
    participants: 4,
  },
];

export function CollaborationSidebar() {
  return (
    <div className="w-80 bg-card border-l border-border flex flex-col">
      {/* Pinned Ideas */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Pin className="h-4 w-4" />
            Pinned Ideas
          </h3>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <MoreVertical className="h-3 w-3" />
          </Button>
        </div>
        <div className="space-y-3">
          {pinnedIdeas.map((idea) => (
            <div key={idea.id} className="p-3 rounded-lg bg-secondary/50 border border-border/50">
              <p className="text-sm text-foreground mb-2">{idea.content}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {idea.author} • {idea.timestamp}
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-accent font-medium">↑ {idea.votes}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Participants */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Users className="h-4 w-4" />
            Participants ({participants.length})
          </h3>
        </div>
        <div className="space-y-2">
          {participants.map((participant, index) => (
            <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/30 transition-colors">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium",
                participant.role === "human" 
                  ? "bg-secondary text-secondary-foreground"
                  : participant.type === "expert"
                  ? "bg-ai-expert-soft text-ai-expert border border-ai-expert/20"
                  : participant.type === "moderator"
                  ? "bg-ai-moderator-soft text-ai-moderator border border-ai-moderator/20"
                  : "bg-ai-companion-soft text-ai-companion border border-ai-companion/20"
              )}>
                {participant.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {participant.name}
                  </span>
                  {participant.role === "ai" && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0">
                      {participant.type}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    participant.status === "active" ? "bg-accent" : "bg-muted-foreground"
                  )} />
                  <span className="text-xs text-muted-foreground capitalize">
                    {participant.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Sessions */}
      <div className="p-4 flex-1">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Upcoming
          </h3>
        </div>
        <div className="space-y-3">
          {upcomingSessions.map((session, index) => (
            <div key={index} className="p-3 rounded-lg border border-border hover:bg-secondary/30 transition-colors cursor-pointer">
              <p className="text-sm font-medium text-foreground mb-1">
                {session.title}
              </p>
              <p className="text-xs text-muted-foreground mb-2">
                {session.time}
              </p>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {session.participants} participants
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}