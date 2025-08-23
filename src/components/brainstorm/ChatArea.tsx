import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Smile, AtSign, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "./MessageBubble";
import { cn } from "@/lib/utils";
import { useDiscussion, type UIMessage } from "@/hooks/useDiscussion";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ChatAreaProps {
  roomId: string;
  topic?: string;
  discussionId?: string;
}

// Fallback mock messages data (used when API fails or no discussionId provided)
const mockMessages: UIMessage[] = [
  {
    id: "1",
    type: "human",
    author: "Anshika",
    avatar: "AN",
    content: "Hey everyone! I've been thinking about our user onboarding flow. What if we made it more interactive?",
    timestamp: "10:30 AM",
    reactions: [{ emoji: "👍", count: 3 }, { emoji: "💡", count: 1 }],
  },
  {
    id: "2", 
    type: "ai",
    author: "AI Expert",
    avatar: "EX",
    role: "expert",
    content: "That's a great direction, Anshika! Interactive onboarding can increase completion rates by up to 40%. I'd suggest starting with progressive disclosure - show users one feature at a time with hands-on tasks.",
    timestamp: "10:32 AM",
    reactions: [{ emoji: "🎯", count: 2 }],
  },
  {
    id: "3",
    type: "human", 
    author: "Akash",
    avatar: "MR",
    content: "Love the progressive disclosure idea! We could also add gamification elements - maybe a progress bar or achievement badges?",
    timestamp: "10:34 AM",
    reactions: [{ emoji: "🚀", count: 4 }],
  },
  {
    id: "4",
    type: "ai",
    author: "AI Moderator", 
    avatar: "MOD",
    role: "moderator",
    content: "Excellent ideas flowing! Let me summarize what we have so far:\n\n• Interactive onboarding flow\n• Progressive disclosure approach\n• Gamification with progress tracking\n\nShall we dive deeper into any of these concepts?",
    timestamp: "10:36 AM",
    reactions: [{ emoji: "📝", count: 2 }],
  },
  {
    id: "5",
    type: "ai",
    author: "AI Companion",
    avatar: "COM", 
    role: "companion",
    content: "I love the energy in this discussion! 🌟 These ideas could really make the user experience delightful. What do you think about adding some micro-animations to make the onboarding feel more alive?",
    timestamp: "10:38 AM",
    reactions: [{ emoji: "✨", count: 5 }],
  },
];

export function ChatArea({ roomId, topic, discussionId = "68a8f559ed219d2108e2f487" }: ChatAreaProps) {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Use our custom hook to fetch and manage discussion data
  const { 
    discussion, 
    messages, 
    isLoading, 
    error, 
    sendMessage: sendMessageToDiscussion,
    userId,
    setUserId
  } = useDiscussion(discussionId, mockMessages);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    // Use the sendMessage function from our custom hook
    sendMessageToDiscussion(message.trim());
    setMessage("");
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
      {(topic || discussion?.title) && (
        <div className="border-b border-border bg-card px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <h2 className="text-lg font-semibold text-foreground">
              {discussion?.title || topic}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {discussion?.description || "Active brainstorming session"} • {messages.length} messages
          </p>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full" type="always">
          <div className="p-6 space-y-4 pr-2">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-pulse text-muted-foreground">Loading messages...</div>
              </div>
            ) : error ? (
              <div className="flex justify-center py-8">
                <div className="text-destructive">Error loading messages. Please try again.</div>
              </div>
            ) : messages.length > 0 ? (
              messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))
            ) : (
              <div className="flex justify-center py-8">
                <div className="text-muted-foreground">No messages yet. Start the conversation!</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="flex items-center gap-2 p-4 border-t border-border bg-card">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="text-muted-foreground relative">
              <User className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full text-xs w-4 h-4 flex items-center justify-center">
                {userId.slice(-1)}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-2">
              <h4 className="font-medium">User ID</h4>
              <p className="text-sm text-muted-foreground">Change your user ID for this conversation</p>
              <div className="flex gap-2">
                <Input 
                  value={userId} 
                  onChange={(e) => setUserId(e.target.value)} 
                  placeholder="Enter user ID"
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Paperclip className="h-5 w-5" />
        </Button>
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            className="min-h-10 resize-none py-3 pr-12 pl-3"
            rows={1}
          />
          <div className="absolute right-3 top-3 flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
              <AtSign className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
              <Smile className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Button onClick={handleSendMessage} disabled={!message.trim()} size="icon">
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}