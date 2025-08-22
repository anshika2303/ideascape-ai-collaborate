import axios from 'axios';

const API_BASE_URL = 'http://localhost:9696/api';

// Types for API responses
export interface Agent {
  id: string;
  role: string;
  description: string;
  designation: string;
  tag: string;
  functionalPrompt: string;
  modulePrompt: string;
  softSkills: string;
  displayName: string;
  avatarUrl: string;
  canDirectOthers: boolean;
}

export interface Message {
  discussionId: string;
  msgId: string;
  agentId: string;
  agentRole: string;
  message: string;
  timestamp: number;
  agent?: Agent;
}

export interface Discussion {
  id: string;
  description: string;
  title: string;
  agentParticipants: string[];
  humanParticipants: string[];
  moderatorId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface DiscussionResponse {
  discussion: Discussion;
  messages: Message[];
}

// API response types for sending messages
export interface SendMessageResponse {
  responseMessage: string;
  responseAgent: Agent;
}

// API service functions
export const fetchDiscussion = async (discussionId: string): Promise<DiscussionResponse> => {
  try {
    const response = await axios.get<DiscussionResponse>(`${API_BASE_URL}/discussions/full/${discussionId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching discussion:', error);
    throw error;
  }
};

// Function to send a message to the conversation
export const sendMessage = async (discussionId: string, userId: string, message: string): Promise<SendMessageResponse> => {
  try {
    const response = await axios.post<SendMessageResponse>(`${API_BASE_URL}/conversation/message`, {
      discussionId,
      userId,
      message
    });
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Function to format timestamp to readable time
export const formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Function to convert API Message to UI Message format
export const convertApiMessageToUiFormat = (apiMessage: Message) => {
  const isAI = apiMessage.agentRole !== 'HUMAN';
  
  // Map API agent roles to UI roles
  const mapAgentRoleToUiRole = (role: string): 'expert' | 'moderator' | 'companion' | undefined => {
    const roleMap: Record<string, 'expert' | 'moderator' | 'companion'> = {
      'MODERATOR': 'moderator',
      'EXPERT': 'expert',
      'COMPANION': 'companion',
      // Add more mappings as needed
    };
    
    return roleMap[role];
  };
  
  // Generate avatar text from display name or agent role
  const getAvatarText = (): string => {
    if (!isAI) return 'HU';
    
    if (apiMessage.agent?.displayName) {
      // Get first 2-3 characters of display name
      return apiMessage.agent.displayName.substring(0, 3).toUpperCase();
    }
    
    // Fallback to role abbreviation
    const roleAbbreviations: Record<string, string> = {
      'MODERATOR': 'MOD',
      'EXPERT': 'EXP',
      'COMPANION': 'COM',
    };
    
    return roleAbbreviations[apiMessage.agentRole] || 'AI';
  };
  
  return {
    id: apiMessage.msgId,
    type: isAI ? 'ai' as const : 'human' as const,
    author: isAI ? apiMessage.agent?.displayName || 'AI' : 'Human',
    avatar: getAvatarText(),
    role: isAI ? mapAgentRoleToUiRole(apiMessage.agentRole) : undefined,
    content: apiMessage.message,
    timestamp: formatTimestamp(apiMessage.timestamp),
    reactions: [], // API doesn't provide reactions yet
  };
};
