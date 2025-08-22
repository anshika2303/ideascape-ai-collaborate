import { useState, useEffect } from "react";
import { MessageSquare, Users, Lightbulb, Hash, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatArea } from "./ChatArea";
import { NavigationSidebar } from "./NavigationSidebar";
import { CollaborationSidebar } from "./CollaborationSidebar";

export function BrainstormLayout() {
  const [activeRoom, setActiveRoom] = useState("general");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentTopic, setCurrentTopic] = useState("Product Roadmap Q1 2024 - Feature Prioritization");
  const [participants, setParticipants] = useState([
    { id: "2", name: "Akash", role: "human", department: "Tech", description: "Human participant" },
    { id: "1", name: "Anshika", role: "human", department: "Growth", description: "Human participant"}
  ]);

  // Listen for drag-and-drop events
  useEffect(() => {
    const handleAddParticipant = (e: any) => {
      const botData = e.detail;
      if (botData && !participants.find(p => p.id === botData.id)) {
        setParticipants(prev => [...prev, { ...botData, id: Date.now().toString() }]);
      }
    };
    
    window.addEventListener('addParticipant', handleAddParticipant);
    return () => window.removeEventListener('addParticipant', handleAddParticipant);
  }, [participants]);

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Left Navigation Sidebar */}
      <NavigationSidebar 
        activeRoom={activeRoom}
        onRoomChange={setActiveRoom}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        participants={participants}
        onAddParticipant={(bot) => setParticipants(prev => [...prev, { ...bot, id: Date.now().toString() }])}
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

        <ChatArea roomId={activeRoom} topic={currentTopic} />
      </div>

      {/* Right Collaboration Sidebar */}
      <CollaborationSidebar 
        participants={participants}
        topic={currentTopic}
        onTopicChange={setCurrentTopic}
        onEditParticipant={(id, updates) => {
          setParticipants(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
        }}
      />
    </div>
  );
}