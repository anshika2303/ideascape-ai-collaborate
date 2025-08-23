import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { 
  fetchDiscussion, 
  sendMessage as apiSendMessage, 
  convertApiMessageToUiFormat, 
  type DiscussionResponse, 
  type SendMessageResponse 
} from '@/services/api';

const API_BASE_URL = 'http://localhost:9696/api';

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
  userId: string;
  setUserId: (userId: string) => void;
}

/**
 * Custom hook to fetch and manage discussion data
 * @param discussionId - The ID of the discussion to fetch
 * @param fallbackMessages - Optional fallback messages to use if no discussion ID is provided
 */
export function useDiscussion(
  discussionId?: string,
  fallbackMessages: UIMessage[] = [],
  autoFetchAfterInactivity: boolean = true
): UseDiscussionResult {
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [discussion, setDiscussion] = useState<DiscussionResponse['discussion'] | null>(null);
  const [userId, setUserId] = useState<string>("human_user_001"); // Default userId
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [inactivityTimer, setInactivityTimer] = useState<NodeJS.Timeout | null>(null);
  const [isTyping, setIsTyping] = useState<boolean>(false);

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

  // Auto-fetch response after inactivity
  useEffect(() => {
    if (!autoFetchAfterInactivity || !discussionId) return;
    
    // Clear any existing timer
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
    }
    
    // Set a new timer if user is not currently typing
    if (!isTyping) {
      const timer = setTimeout(() => {
        // Only fetch if we haven't had activity in the last 5 seconds
        const currentTime = Date.now();
        if (currentTime - lastActivity >= 50000) {
          console.log('User inactive for 5 seconds, auto-fetching response...');
          // Auto-fetch response from API
          fetchAutoResponse();
        }
      }, 5000);
      
      setInactivityTimer(timer);
    }
    
    // Cleanup function
    return () => {
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
    };
  }, [lastActivity, isTyping, discussionId, autoFetchAfterInactivity]);
  
  // Function to fetch auto-response from API
  const fetchAutoResponse = async () => {
    if (!discussionId) return;
    
    try {
      // Show typing indicator
      const typingIndicatorId = `typing-auto-${Date.now()}`;
      setMessages(prev => [...prev, {
        id: typingIndicatorId,
        type: "ai",
        author: "AI",
        avatar: "AI",
        content: "...", // Typing indicator
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        reactions: [],
        isTyping: true,
      }]);
      
      // Call API with just the discussionId
      const response = await axios.post(`${API_BASE_URL}/conversation/message`, {
        discussionId
      });
      
      // Remove typing indicator and add response
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== typingIndicatorId);
        
        if (response.data && response.data.responseMessage) {
          // Create response message from API
          const responseMessage: UIMessage = {
            id: Date.now().toString(),
            type: "ai",
            author: response.data.responseAgent?.displayName || "AI",
            avatar: response.data.responseAgent?.tag?.substring(0, 3) || "AI",
            role: response.data.responseAgent?.role?.toLowerCase() as "expert" | "moderator" | "companion",
            content: response.data.responseMessage,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            reactions: [],
          };
          
          return [...filtered, responseMessage];
        }
        
        return filtered;
      });
    } catch (error) {
      console.error('Error auto-fetching response:', error);
    }
    
    // Reset activity timer after auto-fetch
    setLastActivity(Date.now());
  };

  // Function to send a new message
  const sendMessage = async (content: string) => {
    // Update last activity timestamp and set typing state
    setLastActivity(Date.now());
    setIsTyping(true);
    
    // Clear typing state after a short delay
    setTimeout(() => setIsTyping(false), 100);
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
