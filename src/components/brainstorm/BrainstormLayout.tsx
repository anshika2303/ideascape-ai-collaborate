import { useState } from "react";
import { MessageSquare, Users, Lightbulb, Hash, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatArea } from "./ChatArea";
import { NavigationSidebar } from "./NavigationSidebar";
import { CollaborationSidebar } from "./CollaborationSidebar";

export function BrainstormLayout() {
  const [activeRoom, setActiveRoom] = useState("general");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Left Navigation Sidebar */}
      <NavigationSidebar 
        activeRoom={activeRoom}
        onRoomChange={setActiveRoom}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <Hash className="h-5 w-5 text-muted-foreground" />
            <h1 className="font-semibold text-lg capitalize">{activeRoom}</h1>
            <span className="text-sm text-muted-foreground">
              • 5 humans, 3 AI companions
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <Settings className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </header>

        <ChatArea roomId={activeRoom} />
      </div>

      {/* Right Collaboration Sidebar */}
      <CollaborationSidebar />
    </div>
  );
}