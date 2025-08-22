import { Hash, Plus, ChevronDown, MessageSquare, Lightbulb, Target, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NavigationSidebarProps {
  activeRoom: string;
  onRoomChange: (room: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const rooms = [
  { id: "general", name: "General Discussion", icon: MessageSquare, category: "chat" },
  { id: "product-ideas", name: "Product Ideas", icon: Lightbulb, category: "brainstorm" },
  { id: "strategy", name: "Strategy Planning", icon: Target, category: "brainstorm" },
  { id: "user-research", name: "User Research", icon: Users, category: "research" },
];

const categories = {
  chat: { name: "Discussions", color: "text-foreground" },
  brainstorm: { name: "Brainstorming", color: "text-accent" },
  research: { name: "Research", color: "text-primary" },
};

export function NavigationSidebar({ activeRoom, onRoomChange, collapsed, onToggleCollapse }: NavigationSidebarProps) {
  if (collapsed) {
    return (
      <div className="w-16 bg-sidebar border-r border-sidebar-border flex flex-col items-center py-4 gap-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onToggleCollapse}
          className="w-10 h-10"
        >
          <MessageSquare className="h-5 w-5" />
        </Button>
        {rooms.map((room) => (
          <Button
            key={room.id}
            variant="ghost"
            size="icon"
            onClick={() => onRoomChange(room.id)}
            className={cn(
              "w-10 h-10",
              activeRoom === room.id && "bg-sidebar-accent text-sidebar-accent-foreground"
            )}
          >
            <room.icon className="h-5 w-5" />
          </Button>
        ))}
      </div>
    );
  }

  return (
    <div className="w-72 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sidebar-foreground">BrainStorm AI</h2>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onToggleCollapse}
            className="h-8 w-8 p-0"
          >
            <ChevronDown className="h-4 w-4 rotate-90" />
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          {Object.entries(categories).map(([categoryId, category]) => (
            <div key={categoryId}>
              <div className="flex items-center justify-between mb-3">
                <h3 className={cn("text-sm font-medium", category.color)}>
                  {category.name}
                </h3>
                <Button variant="ghost" size="icon" className="h-4 w-4 p-0">
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <div className="space-y-1">
                {rooms
                  .filter(room => room.category === categoryId)
                  .map((room) => (
                    <button
                      key={room.id}
                      onClick={() => onRoomChange(room.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors text-sm",
                        activeRoom === room.id 
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                      )}
                    >
                      <room.icon className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{room.name}</span>
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-sidebar-accent/30">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-xs font-medium text-primary-foreground">You</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-sidebar-foreground">Your Name</p>
            <p className="text-xs text-muted-foreground">Online</p>
          </div>
        </div>
      </div>
    </div>
  );
}