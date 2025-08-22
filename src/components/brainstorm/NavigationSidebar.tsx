import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, X, Users, GripVertical, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Bot {
  id: string;
  name: string;
  role: string;
  department: string;
  description?: string;
}

interface NavigationSidebarProps {
  activeRoom: string;
  onRoomChange: (room: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  participants: Bot[];
  onAddParticipant: (bot: Bot) => void;
}

// Available departments and their bots
const departments = {
  "Tech": {
    name: "Technology",
    color: "bg-blue-500",
    bots: [
      { id: "tech-1", name: "Rishi", role: "Tech Head", description: "Full-stack architecture expert" },
      { id: "tech-2", name: "DevBot", role: "Senior Developer", description: "Code optimization specialist" },
      { id: "tech-3", name: "QABot", role: "Quality Engineer", description: "Testing and quality assurance" }
    ]
  },
  "Product": {
    name: "Product Management", 
    color: "bg-purple-500",
    bots: [
      { id: "product-1", name: "ProductBot", role: "Product Manager", description: "Feature prioritization expert" },
      { id: "product-2", name: "UXBot", role: "UX Designer", description: "User experience specialist" },
      { id: "product-3", name: "ResearchBot", role: "User Research", description: "Market analysis expert" }
    ]
  },
  "Marketing": {
    name: "Marketing",
    color: "bg-green-500", 
    bots: [
      { id: "marketing-1", name: "Himani", role: "Marketing Head", description: "Growth strategy expert" },
      { id: "marketing-2", name: "ContentBot", role: "Content Specialist", description: "Brand storytelling expert" },
      { id: "marketing-3", name: "SEOBot", role: "SEO Expert", description: "Search optimization specialist" }
    ]
  },
  "Growth": {
    name: "Growth",
    color: "bg-orange-500",
    bots: [
      { id: "growth-1", name: "GrowthBot", role: "Growth Hacker", description: "User acquisition expert" },
      { id: "growth-2", name: "AnalyticsBot", role: "Data Analyst", description: "Performance metrics expert" },
      { id: "growth-3", name: "ConversionBot", role: "CRO Specialist", description: "Conversion optimization" }
    ]
  },
  "Sales": {
    name: "Sales",
    color: "bg-red-500",
    bots: [
      { id: "sales-1", name: "Kumar", role: "Sales Agent", description: "Deal closing expert" },
      { id: "sales-2", name: "CRMBot", role: "Sales Manager", description: "Pipeline management expert" },
      { id: "sales-3", name: "LeadBot", role: "Lead Qualifier", description: "Prospect qualification" }
    ]
  },
  "Service": {
    name: "Customer Service",
    color: "bg-cyan-500",
    bots: [
      { id: "service-1", name: "SupportBot", role: "Support Manager", description: "Customer satisfaction expert" },
      { id: "service-2", name: "ChatBot", role: "Chat Support", description: "Real-time assistance" },
      { id: "service-3", name: "RetentionBot", role: "Success Manager", description: "Customer retention expert" }
    ]
  },
  "Finance": {
    name: "Finance",
    color: "bg-yellow-500",
    bots: [
      { id: "finance-1", name: "FinanceBot", role: "CFO", description: "Financial planning expert" },
      { id: "finance-2", name: "BudgetBot", role: "Budget Analyst", description: "Cost optimization specialist" },
      { id: "finance-3", name: "RevenueBot", role: "Revenue Analyst", description: "Revenue forecasting expert" }
    ]
  },
  "Legal": {
    name: "Legal",
    color: "bg-indigo-500",
    bots: [
      { id: "legal-1", name: "LegalBot", role: "Legal Counsel", description: "Compliance expert" },
      { id: "legal-2", name: "ContractBot", role: "Contract Specialist", description: "Agreement drafting expert" },
      { id: "legal-3", name: "ComplianceBot", role: "Compliance Officer", description: "Regulatory compliance" }
    ]
  }
};

const rooms = [
  { id: "general", name: "General Discussion", icon: "💬", category: "general" },
  { id: "ideas", name: "Ideas & Innovation", icon: "💡", category: "brainstorm" },
  { id: "strategy", name: "Strategy Planning", icon: "🎯", category: "planning" },
];

export function NavigationSidebar({ 
  activeRoom, 
  onRoomChange, 
  collapsed, 
  onToggleCollapse,
  participants,
  onAddParticipant 
}: NavigationSidebarProps) {
  const [expandedDepartments, setExpandedDepartments] = useState<string[]>(["Tech"]);
  const [editingBots, setEditingBots] = useState<{[key: string]: {name: string, description: string}}>({});

  const toggleDepartment = (dept: string) => {
    setExpandedDepartments(prev => 
      prev.includes(dept) 
        ? prev.filter(d => d !== dept)
        : [...prev, dept]
    );
  };

  const handleEditBot = (botId: string, field: 'name' | 'description', value: string) => {
    setEditingBots(prev => ({
      ...prev,
      [botId]: {
        ...prev[botId],
        [field]: value
      }
    }));
  };

  const handleDragStart = (e: React.DragEvent, bot: any, department: string) => {
    const botData = {
      ...bot,
      department,
      name: editingBots[bot.id]?.name || bot.name,
      description: editingBots[bot.id]?.description || bot.description
    };
    e.dataTransfer.setData('application/json', JSON.stringify(botData));
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

          {/* Available Bots by Department */}
          <div>
            <h3 className="text-sm font-medium text-sidebar-foreground mb-3">
              Available AI Agents
            </h3>
            <div className="space-y-3">
              {Object.entries(departments).map(([deptKey, dept]) => (
                <div key={deptKey} className="space-y-2">
                  <button
                    onClick={() => toggleDepartment(deptKey)}
                    className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-sidebar-accent transition-colors text-left"
                  >
                    <div className={cn("h-3 w-3 rounded-sm", dept.color)} />
                    <span className="text-sm font-medium text-sidebar-foreground flex-1">
                      {dept.name}
                    </span>
                    <ChevronDown className={cn(
                      "h-3 w-3 text-muted-foreground transition-transform",
                      expandedDepartments.includes(deptKey) && "rotate-180"
                    )} />
                  </button>
                  
                  {expandedDepartments.includes(deptKey) && (
                    <div className="ml-4 space-y-2">
                      {dept.bots.map((bot) => (
                        <div
                          key={bot.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, bot, deptKey)}
                          className="group flex items-start gap-3 p-3 rounded-lg border border-sidebar-border hover:border-primary/50 bg-card cursor-grab active:cursor-grabbing transition-all hover:shadow-sm"
                        >
                          <GripVertical className="h-4 w-4 text-muted-foreground mt-0.5 group-hover:text-primary" />
                          <div className="flex-1 min-w-0 space-y-2">
                            <input
                              type="text"
                              value={editingBots[bot.id]?.name || bot.name}
                              onChange={(e) => handleEditBot(bot.id, 'name', e.target.value)}
                              className="w-full text-sm font-medium bg-transparent border-none outline-none text-card-foreground hover:bg-muted/50 rounded px-1 py-0.5"
                              placeholder="Bot name"
                            />
                            <input
                              type="text"
                              value={editingBots[bot.id]?.description || bot.description}
                              onChange={(e) => handleEditBot(bot.id, 'description', e.target.value)}
                              className="w-full text-xs text-muted-foreground bg-transparent border-none outline-none hover:bg-muted/50 rounded px-1 py-0.5"
                              placeholder="Bot description"
                            />
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {bot.role}
                              </span>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                {deptKey}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
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