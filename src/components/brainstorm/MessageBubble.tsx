import { MoreVertical, Pin, Reply } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: string;
  type: "human" | "ai";
  author: string;
  avatar: string;
  role?: "expert" | "moderator" | "companion";
  content: string;
  timestamp: string;
  reactions: Array<{ emoji: string; count: number }>;
}

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isAI = message.type === "ai";
  const isCurrentUser = message.author === "You";

  const getAIRoleStyles = (role: string) => {
    switch (role) {
      case "expert":
        return {
          bg: "bg-ai-expert-soft",
          border: "border-ai-expert/20",
          text: "text-ai-expert",
          badge: "Expert"
        };
      case "moderator":
        return {
          bg: "bg-ai-moderator-soft", 
          border: "border-ai-moderator/20",
          text: "text-ai-moderator",
          badge: "Moderator"
        };
      case "companion":
        return {
          bg: "bg-ai-companion-soft",
          border: "border-ai-companion/20", 
          text: "text-ai-companion",
          badge: "Companion"
        };
      default:
        return {
          bg: "bg-secondary",
          border: "border-border",
          text: "text-foreground",
          badge: "AI"
        };
    }
  };

  const roleStyles = isAI && message.role ? getAIRoleStyles(message.role) : null;

  return (
    <div className={cn("group flex gap-3", isCurrentUser && "flex-row-reverse")}>
      {/* Avatar */}
      <div className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0",
        isCurrentUser 
          ? "bg-primary text-primary-foreground"
          : isAI && roleStyles
          ? `${roleStyles.bg} ${roleStyles.text} border ${roleStyles.border}`
          : "bg-secondary text-secondary-foreground"
      )}>
        {message.avatar}
      </div>

      {/* Message Content */}
      <div className={cn("flex-1 min-w-0", isCurrentUser && "flex flex-col items-end")}>
        {/* Header */}
        <div className={cn("flex items-center gap-2 mb-1", isCurrentUser && "flex-row-reverse")}>
          <span className="font-medium text-sm text-foreground">
            {message.author}
          </span>
          {isAI && message.role && roleStyles && (
            <Badge 
              variant="secondary" 
              className={cn(
                "text-xs px-2 py-0 font-medium",
                roleStyles.bg,
                roleStyles.text,
                roleStyles.border
              )}
            >
              {roleStyles.badge}
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">
            {message.timestamp}
          </span>
        </div>

        {/* Message Bubble */}
        <div className={cn(
          "relative rounded-lg px-4 py-3 max-w-2xl",
          isCurrentUser
            ? "bg-primary text-primary-foreground"
            : isAI && roleStyles
            ? `${roleStyles.bg} border ${roleStyles.border}`
            : "bg-card border border-border"
        )}>
          <p className={cn(
            "text-sm leading-relaxed whitespace-pre-wrap",
            isCurrentUser 
              ? "text-primary-foreground"
              : "text-foreground"
          )}>
            {message.content}
          </p>

          {/* Message Actions - Show on Hover */}
          <div className={cn(
            "absolute top-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1",
            isCurrentUser ? "left-2" : "right-2"
          )}>
            <Button variant="ghost" size="icon" className="h-6 w-6 bg-background/80 hover:bg-background">
              <Reply className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 bg-background/80 hover:bg-background">
              <Pin className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 bg-background/80 hover:bg-background">
              <MoreVertical className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Reactions */}
        {message.reactions.length > 0 && (
          <div className={cn("flex items-center gap-1 mt-2", isCurrentUser && "flex-row-reverse")}>
            {message.reactions.map((reaction, index) => (
              <button
                key={index}
                className="flex items-center gap-1 px-2 py-1 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
              >
                <span className="text-sm">{reaction.emoji}</span>
                <span className="text-xs font-medium text-muted-foreground">
                  {reaction.count}
                </span>
              </button>
            ))}
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <span className="text-sm">+</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}