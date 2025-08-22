import { useState } from "react";
import { 
  Pin, 
  Users, 
  Calendar, 
  Clock, 
  Edit3, 
  Save, 
  X,
  Trash2,
  ChevronDown,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Participant {
  id: string;
  name: string;
  role: string;
  department: string;
}

interface CollaborationSidebarProps {
  participants: Participant[];
  topic: string;
  onTopicChange: (topic: string) => void;
  onEditParticipant: (id: string, updates: Partial<Participant>) => void;
}

export function CollaborationSidebar({ 
  participants, 
  topic, 
  onTopicChange,
  onEditParticipant 
}: CollaborationSidebarProps) {
  const [editingTopic, setEditingTopic] = useState(false);
  const [tempTopic, setTempTopic] = useState(topic);
  const [editingParticipant, setEditingParticipant] = useState<string | null>(null);
  const [tempParticipantName, setTempParticipantName] = useState("");

  const pinnedIdeas = [
    { id: "1", content: "Interactive onboarding with progressive disclosure", author: "Sarah Chen", votes: 8 },
    { id: "2", content: "Gamification elements with achievement badges", author: "Mike Rodriguez", votes: 12 },
    { id: "3", content: "Micro-animations for delightful user experience", author: "AI Companion", votes: 6 },
  ];

  const upcomingSessions = [
    { id: "1", title: "Design Review", time: "2:00 PM", participants: 4 },
    { id: "2", title: "Sprint Planning", time: "4:30 PM", participants: 6 },
  ];

  const handleSaveTopic = () => {
    onTopicChange(tempTopic);
    setEditingTopic(false);
  };

  const handleCancelTopic = () => {
    setTempTopic(topic);
    setEditingTopic(false);
  };

  const handleEditParticipantName = (id: string) => {
    const participant = participants.find(p => p.id === id);
    if (participant) {
      setTempParticipantName(participant.name);
      setEditingParticipant(id);
    }
  };

  const handleSaveParticipantName = () => {
    if (editingParticipant) {
      onEditParticipant(editingParticipant, { name: tempParticipantName });
      setEditingParticipant(null);
      setTempParticipantName("");
    }
  };

  const handleCancelParticipantEdit = () => {
    setEditingParticipant(null);
    setTempParticipantName("");
  };

  const handleDropParticipant = (e: React.DragEvent) => {
    e.preventDefault();
    try {
      const botData = JSON.parse(e.dataTransfer.getData('application/json'));
      // Add the bot as a participant - this will be handled by parent
      if (botData && !participants.find(p => p.id === botData.id)) {
        // Trigger parent's onAddParticipant through a custom event or callback
        window.dispatchEvent(new CustomEvent('addParticipant', { detail: botData }));
      }
    } catch (error) {
      console.error('Error parsing dropped data:', error);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="w-80 bg-sidebar border-l border-sidebar-border flex flex-col">
      {/* Header */}
      <div className="h-16 border-b border-sidebar-border px-4 flex items-center justify-between">
        <h2 className="font-semibold text-sidebar-foreground">Session Details</h2>
      </div>

      <ScrollArea className="flex-1" style={{ scrollbarWidth: "thin" }}>
        <div className="p-4 space-y-6">
          {/* Current Topic */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-sidebar-foreground">Current Topic</h3>
              {!editingTopic && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditingTopic(true)}
                  className="h-6 w-6"
                >
                  <Edit3 className="h-3 w-3" />
                </Button>
              )}
            </div>
            
            {editingTopic ? (
              <div className="space-y-2">
                <Input
                  value={tempTopic}
                  onChange={(e) => setTempTopic(e.target.value)}
                  className="text-sm"
                  placeholder="Enter discussion topic..."
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSaveTopic}
                    className="h-7 px-2 text-xs"
                  >
                    <Save className="h-3 w-3 mr-1" />
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelTopic}
                    className="h-7 px-2 text-xs"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-card border border-border">
                <p className="text-sm text-card-foreground font-medium leading-relaxed">
                  {topic}
                </p>
              </div>
            )}
          </div>

          {/* Participants Drop Zone */}
          <div>
            <h3 className="text-sm font-medium text-sidebar-foreground mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Active Participants ({participants.length})
            </h3>
            <div
              onDrop={handleDropParticipant}
              onDragOver={handleDragOver}
              className="min-h-[100px] p-3 rounded-lg border-2 border-dashed border-border hover:border-primary/50 transition-colors"
            >
                <ScrollArea className="max-h-64" style={{ scrollbarWidth: "thin" }}>
                <div className="space-y-2 pr-2">
                  {participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="group flex items-center gap-3 p-2 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="relative">
                      <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                        {participant.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 border-2 border-card rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      {editingParticipant === participant.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={tempParticipantName}
                            onChange={(e) => setTempParticipantName(e.target.value)}
                            className="h-7 text-xs"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveParticipantName();
                              if (e.key === 'Escape') handleCancelParticipantEdit();
                            }}
                          />
                          <Button
                            size="icon"
                            onClick={handleSaveParticipantName}
                            className="h-6 w-6"
                          >
                            <Save className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={handleCancelParticipantEdit}
                            className="h-6 w-6"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-card-foreground truncate">
                              {participant.name}
                            </p>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditParticipantName(participant.id)}
                              className="h-5 w-5 opacity-0 group-hover:opacity-100"
                            >
                              <Edit3 className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {participant.role} • {participant.department}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                  ))}
                  
                  {participants.length === 0 && (
                    <div className="text-center py-6">
                      <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Drag AI agents from the left panel
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Build your dream team!
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* Pinned Ideas */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-sidebar-foreground flex items-center gap-2">
                <Pin className="h-4 w-4" />
                Pinned Ideas
              </h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <div className="space-y-2">
              {pinnedIdeas.map((idea) => (
                <div
                  key={idea.id}
                  className="p-3 rounded-lg bg-card border border-border hover:border-accent/50 transition-colors cursor-pointer"
                >
                  <p className="text-sm text-card-foreground mb-2 leading-relaxed">
                    {idea.content}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>by {idea.author}</span>
                    <span className="flex items-center gap-1">
                      👍 {idea.votes}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Sessions */}
          <div>
            <h3 className="text-sm font-medium text-sidebar-foreground mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Upcoming Sessions
            </h3>
            <div className="space-y-2">
              {upcomingSessions.map((session) => (
                <div
                  key={session.id}
                  className="p-3 rounded-lg bg-card border border-border"
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium text-card-foreground">
                      {session.title}
                    </h4>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {session.time}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {session.participants} participants
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Session Summary */}
          <div>
            <h3 className="text-sm font-medium text-sidebar-foreground mb-3">
              Session Summary
            </h3>
            <div className="p-3 rounded-lg bg-card border border-border">
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span>1h 23min</span>
                </div>
                <div className="flex justify-between">
                  <span>Messages:</span>
                  <span>47</span>
                </div>
                <div className="flex justify-between">
                  <span>Ideas generated:</span>
                  <span>12</span>
                </div>
                <div className="flex justify-between">
                  <span>Action items:</span>
                  <span>5</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}