import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  fetchDiscussion, 
  sendMessage as apiSendMessage, 
  convertApiMessageToUiFormat, 
  type DiscussionResponse, 
  type SendMessageResponse 
} from '@/services/api';

// Define the UI message type
export interface UIMessage {
  id: string;
  type: "human" | "ai";
  author: string;
  avatar: string;
  role?: "expert" | "moderator" | "companion";
  content: string;
  timestamp: string;
  reactions: Array<{ emoji: string; count: number }>;
  isTyping?: boolean;
}

interface UseDiscussionResult {
  discussion: DiscussionResponse['discussion'] | null;
  messages: UIMessage[];
  isLoading: boolean;
  error: unknown;
  sendMessage: (content: string) => void;
  refetch: () => void;
}

/**
 * Custom hook to fetch and manage discussion data
 * @param discussionId - The ID of the discussion to fetch
 * @param fallbackMessages - Optional fallback messages to use if no discussion ID is provided
 */
export function useDiscussion(
  discussionId?: string,
  fallbackMessages: UIMessage[] = []
): UseDiscussionResult {
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [discussion, setDiscussion] = useState<DiscussionResponse['discussion'] | null>(null);
  const [userId, setUserId] = useState<string>("user_123"); // Default userId

  // Fetch discussion data using React Query
  const {
    data: discussionData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['discussion', discussionId],
    queryFn: () => fetchDiscussion(discussionId || ''),
    enabled: !!discussionId,
    staleTime: 30000, // Consider data fresh for 30 seconds
    retry: 2, // Retry failed requests twice
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
  });

  // Process API data when it arrives
  useEffect(() => {
    if (discussionData) {
      // Convert API messages to UI format
      const uiMessages = discussionData.messages.map(convertApiMessageToUiFormat);
      setMessages(uiMessages);
      setDiscussion(discussionData.discussion);
    } else if (!discussionId) {
      // Use fallback messages if no discussionId provided
      setMessages(fallbackMessages);
    }
  }, [discussionData, discussionId, fallbackMessages]);

  // Function to send a new message
  const sendMessage = async (content: string) => {
    if (!content.trim() || !discussionId) return;

    // Create a new message from the user
    const newMessage: UIMessage = {
      id: Date.now().toString(),
      type: "human",
      author: "You",
      avatar: "You",
      content: content.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reactions: [],
    };

    // Add user message to the UI
    setMessages(prev => [...prev, newMessage]);
    
    // Show typing indicator
    const typingIndicatorId = `typing-${Date.now()}`;
    setMessages(prev => [...prev, {
      id: typingIndicatorId,
      type: "ai",
      author: "Moderator",
      avatar: "MOD",
      role: "moderator",
      content: "...", // Typing indicator
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reactions: [],
      isTyping: true,
    }]);
    
    try {
      // Send message to API with userId
      const response = await apiSendMessage(discussionId, userId, content.trim());
      
      // Remove typing indicator
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== typingIndicatorId);
        
        // Create response message from API
        const responseMessage: UIMessage = {
          id: Date.now().toString(),
          type: "ai",
          author: response.responseAgent.displayName || "AI",
          avatar: response.responseAgent.tag?.substring(0, 3) || "AI",
          role: response.responseAgent.role.toLowerCase() as "expert" | "moderator" | "companion",
          content: response.responseMessage,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          reactions: [],
        };
        
        return [...filtered, responseMessage];
      });
    } catch (error) {
      // Handle error - remove typing indicator and show error message
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== typingIndicatorId);
        return [...filtered, {
          id: Date.now().toString(),
          type: "ai",
          author: "System",
          avatar: "SYS",
          content: "Sorry, there was an error sending your message. Please try again.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          reactions: [],
        }];
      });
      console.error('Error sending message:', error);
    }
  };

  return {
    discussion,
    messages,
    isLoading,
    error,
    sendMessage,
    refetch,
    userId,
    setUserId,
  };
}
