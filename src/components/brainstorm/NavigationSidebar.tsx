import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, X, Users, GripVertical, ChevronDown, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Bot {
  id: string;
  name: string;
  role: string;
  department: string;
  description: string;
}

interface Agent {
  id: string;
  role: string;
  description: string;
  designation: string;
  functionalPrompt: string;
  modulePrompt: string;
  softSkills: string;
  displayName: string;
  avatarUrl: string;
  tag: string;
}

interface NavigationSidebarProps {
  activeRoom: string;
  onRoomChange: (room: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  participants: Bot[];
  onAddParticipant: (bot: Bot) => void;
}

// Tag colors mapping
const tagColors = {
  "Technology": "bg-blue-500",
  "Product": "bg-purple-500",
  "Marketing": "bg-green-500",
  "Sales": "bg-red-500",
  "Growth": "bg-orange-500"
};

// API call function  
const fetchAgents = async (): Promise<Agent[]> => {
  try {
    console.log('🔄 Attempting to fetch agents from API...');
    
    // Try HTTPS first, then HTTP as fallback
    let response;
    try {
      response = await fetch('https://demo2018916.mockable.io/api/agents', {
        headers: { 'accept': '*/*' },
        mode: 'cors'
      });
    } catch (httpsError) {
      console.log('❌ HTTPS failed, trying HTTP:', httpsError);
      response = await fetch('http://demo2018916.mockable.io/api/agents', {
        headers: { 'accept': '*/*' },
        mode: 'cors'
      });
    }
    
    console.log('✅ API Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('📊 API Response data:', data);
    
    if (Array.isArray(data)) {
      console.log(`🎯 Found ${data.length} agents`);
      return data;
    } else if (data && typeof data === 'object') {
      console.log('📦 Single agent returned, wrapping in array');
      return [data];
    } else {
      console.warn('⚠️ Unexpected data format:', typeof data);
      return [];
    }
  } catch (error) {
    console.error('💥 Failed to fetch agents:', error);
    console.error('🔧 This might be a CORS issue. The API may need to allow cross-origin requests.');
    return [];
  }
};

const rooms = [
  { id: "general", name: "General Discussion", icon: "💬", category: "general" },
  { id: "ideas", name: "Ideas & Innovation", icon: "💡", category: "brainstorm" },
  { id: "strategy", name: "Strategy Planning", icon: "🎯", category: "planning" },
];

// Force refresh - departments removed and replaced with API agents
export function NavigationSidebar({ 
  activeRoom, 
  onRoomChange, 
  collapsed, 
  onToggleCollapse,
  participants,
  onAddParticipant 
}: NavigationSidebarProps) {
  const [expandedTags, setExpandedTags] = useState<string[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAgents = async () => {
    try {
      setLoading(true);
      setError(null);
      const agentData = await fetchAgents();
      setAgents(agentData);
      
      // Auto-expand first tag if agents are loaded
      if (agentData.length > 0) {
        const firstTag = Object.keys(groupAgentsByTag(agentData)).sort()[0];
        if (firstTag) {
          setExpandedTags([firstTag]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch agents:', error);
      setError('Couldn\'t load agents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgents();
  }, []);

  // Group agents by tag with sorting
  const groupAgentsByTag = (agents: Agent[]) => {
    const grouped = agents.reduce((acc, agent) => {
      if (!acc[agent.tag]) {
        acc[agent.tag] = [];
      }
      acc[agent.tag].push(agent);
      return acc;
    }, {} as Record<string, Agent[]>);

    // Sort tags alphabetically and agents within each tag by displayName
    const sortedGrouped: Record<string, Agent[]> = {};
    Object.keys(grouped)
      .sort()
      .forEach(tag => {
        sortedGrouped[tag] = grouped[tag].sort((a, b) => 
          a.displayName.localeCompare(b.displayName)
        );
      });

    return sortedGrouped;
  };

  const agentsByTag = groupAgentsByTag(agents);

  const toggleTag = (tag: string) => {
    setExpandedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleDragStart = (e: React.DragEvent, agent: Agent) => {
    const botData: Bot = {
      id: agent.id,
      name: agent.displayName,
      role: agent.designation,
      department: agent.tag,
      description: agent.description
    };
    e.dataTransfer.setData('application/json', JSON.stringify(botData));
  };

  const handleAgentClick = (agent: Agent) => {
    // Emit agent selection if needed
    console.log('Agent selected:', { 
      id: agent.id, 
      tag: agent.tag, 
      displayName: agent.displayName, 
      designation: agent.designation 
    });
  };

  if (collapsed) {
    return (
      <div className="w-16 bg-sidebar border-r border-sidebar-border flex flex-col">
        <div className="p-2 border-b border-sidebar-border">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="w-full h-10"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 flex flex-col items-center gap-2 p-2">
          {rooms.map((room) => (
            <Button
              key={room.id}
              variant={activeRoom === room.id ? "default" : "ghost"}
              size="icon"
              onClick={() => onRoomChange(room.id)}
              className="w-10 h-10 text-base"
            >
              {room.icon}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Header */}
      <div className="h-16 border-b border-sidebar-border px-4 flex items-center justify-between">
        <h2 className="font-semibold text-sidebar-foreground">AI Team Builder</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1" style={{ scrollbarWidth: "thin" }}>
        <div className="p-4 space-y-6">
          {/* Current Participants */}
          <div>
            <h3 className="text-sm font-medium text-sidebar-foreground mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Current Participants ({participants.length})
            </h3>
            <div className="space-y-2">
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center gap-3 p-2 rounded-lg bg-sidebar-accent/50 border border-sidebar-border"
                >
                  <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                    {participant.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-sidebar-foreground truncate">
                      {participant.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {participant.role} • {participant.department}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Available AI Agents */}
          <div>
            <h3 className="text-sm font-medium text-sidebar-foreground mb-3">
              Available AI Agents
            </h3>
            {loading ? (
              <div className="flex items-center justify-center p-4">
                <div className="text-sm text-muted-foreground">Loading agents...</div>
              </div>
            ) : error ? (
              <div className="text-center p-4 space-y-2">
                <p className="text-sm text-muted-foreground">{error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={loadAgents}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-3 w-3" />
                  Retry
                </Button>
              </div>
            ) : agents.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center p-4">
                No available AI agents.
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(agentsByTag).map(([tag, tagAgents]) => (
                  <div key={tag} className="space-y-2">
                    <button
                      onClick={() => toggleTag(tag)}
                      className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-sidebar-accent transition-colors text-left"
                    >
                      <div className={cn("h-3 w-3 rounded-sm", tagColors[tag as keyof typeof tagColors] || "bg-gray-500")} />
                      <span className="text-sm font-medium text-sidebar-foreground flex-1">
                        {tag} ({tagAgents.length})
                      </span>
                      <ChevronDown className={cn(
                        "h-3 w-3 text-muted-foreground transition-transform",
                        expandedTags.includes(tag) && "rotate-180"
                      )} />
                    </button>
                    
                    {expandedTags.includes(tag) && (
                      <div className="ml-4 space-y-2">
                        {tagAgents.map((agent) => (
                          <div
                            key={agent.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, agent)}
                            onClick={() => handleAgentClick(agent)}
                            className="group flex items-start gap-3 p-3 rounded-lg border border-sidebar-border hover:border-primary/50 bg-card cursor-grab active:cursor-grabbing transition-all hover:shadow-sm"
                          >
                            <GripVertical className="h-4 w-4 text-muted-foreground mt-0.5 group-hover:text-primary flex-shrink-0" />
                            <Avatar className="h-10 w-10 flex-shrink-0">
                              <AvatarImage 
                                src={agent.avatarUrl} 
                                alt={agent.displayName}
                              />
                              <AvatarFallback className="text-xs font-medium">
                                {agent.displayName.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-medium text-card-foreground truncate">
                                  {agent.displayName}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  · {agent.designation}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {agent.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Rooms */}
          <div>
            <h3 className="text-sm font-medium text-sidebar-foreground mb-3">
              Discussion Rooms
            </h3>
            <div className="space-y-1">
              {rooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => onRoomChange(room.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left",
                    activeRoom === room.id
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
                  )}
                >
                  <span className="text-base">{room.icon}</span>
                  <span className="text-sm font-medium">{room.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* User Profile Section */}
      <div className="p-4 border-t border-sidebar-border bg-sidebar">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
              A
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 border-2 border-sidebar rounded-full"></div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-sidebar-foreground truncate">Anshika</p>
            <p className="text-xs text-muted-foreground">Host</p>
          </div>
        </div>
      </div>

    </div>
  );
}