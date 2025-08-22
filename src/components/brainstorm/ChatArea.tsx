import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Smile, AtSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "./MessageBubble";
import { cn } from "@/lib/utils";

interface ChatAreaProps {
  roomId: string;
  topic?: string;
}

// Mock messages data
const mockMessages = [
  {
    id: "1",
    type: "human" as const,
    author: "Anshika",
    avatar: "AN",
    content: "Hey everyone! I've been thinking about our user onboarding flow. What if we made it more interactive?",
    timestamp: "10:30 AM",
    reactions: [{ emoji: "👍", count: 3 }, { emoji: "💡", count: 1 }],
  },
  {
    id: "2", 
    type: "ai" as const,
    author: "AI Expert",
    avatar: "EX",
    role: "expert" as const,
    content: "That's a great direction, Anshika! Interactive onboarding can increase completion rates by up to 40%. I'd suggest starting with progressive disclosure - show users one feature at a time with hands-on tasks.",
    timestamp: "10:32 AM",
    reactions: [{ emoji: "🎯", count: 2 }],
  },
  {
    id: "3",
    type: "human" as const, 
    author: "Akash",
    avatar: "MR",
    content: "Love the progressive disclosure idea! We could also add gamification elements - maybe a progress bar or achievement badges?",
    timestamp: "10:34 AM",
    reactions: [{ emoji: "🚀", count: 4 }],
  },
  {
    id: "4",
    type: "ai" as const,
    author: "AI Moderator", 
    avatar: "MOD",
    role: "moderator" as const,
    content: "Excellent ideas flowing! Let me summarize what we have so far:\n\n• Interactive onboarding flow\n• Progressive disclosure approach\n• Gamification with progress tracking\n\nShall we dive deeper into any of these concepts?",
    timestamp: "10:36 AM",
    reactions: [{ emoji: "📝", count: 2 }],
  },
  {
    id: "5",
    type: "ai" as const,
    author: "AI Companion",
    avatar: "COM", 
    role: "companion" as const,
    content: "I love the energy in this discussion! 🌟 These ideas could really make the user experience delightful. What do you think about adding some micro-animations to make the onboarding feel more alive?",
    timestamp: "10:38 AM",
    reactions: [{ emoji: "✨", count: 5 }],
  },
];

export function ChatArea({ roomId, topic }: ChatAreaProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(mockMessages);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      type: "human" as const,
      author: "You",
      avatar: "You",
      content: message.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reactions: [],
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage("");
    
    // Simulate AI response after a delay
    setTimeout(() => {
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        type: "ai" as const,
        author: "AI Companion",
        avatar: "COM",
        role: "companion" as const,
        content: "That's an interesting perspective! Let me think about that and get back to you with some insights.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        reactions: [],
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDropParticipant = (e: React.DragEvent) => {
    e.preventDefault();
    try {
      const botData = JSON.parse(e.dataTransfer.getData('application/json'));
      if (botData && !messages.find(m => m.author === botData.name)) {
        // Add bot to participants through custom event
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
    <div className="flex-1 flex flex-col">
      {/* Topic Header */}
      {topic && (
        <div className="border-b border-border bg-card px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <h2 className="text-lg font-semibold text-foreground">
              {topic}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Active brainstorming session • {messages.length} messages
          </p>
        </div>
      )}

      {/* Messages Area */}
      <div 
        className="flex-1 overflow-hidden"
        onDrop={handleDropParticipant}
        onDragOver={handleDragOver}
      >
        <ScrollArea className="h-full" style={{ scrollbarWidth: "thin" }}>
          <div className="p-6 space-y-4">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative flex items-end gap-3">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Share your ideas... (Press Enter to send, Shift+Enter for new line)"
                className="resize-none min-h-[44px] max-h-32 pr-12 bg-card border-border"
                rows={1}
              />
              <div className="absolute right-3 bottom-3 flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Paperclip className="h-4 w-4 text-muted-foreground" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Smile className="h-4 w-4 text-muted-foreground" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <AtSign className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            </div>
            <Button 
              onClick={handleSendMessage}
              disabled={!message.trim()}
              size="icon"
              className="h-11 w-11 rounded-lg"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 ml-1">
            AI companions are ready to help brainstorm, moderate, and provide expertise
          </p>
        </div>
      </div>
    </div>
  );
}