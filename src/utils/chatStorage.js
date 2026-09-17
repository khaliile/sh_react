// Chat History Persistence Utility
const CHAT_HISTORY_KEY = 'study_hub_chat_history';
const MAX_HISTORY_LENGTH = 50; // Keep last 50 messages to prevent storage bloat

export const saveChatHistory = (history, characterName) => {
  try {
    const chatData = {
      character: characterName,
      messages: history.slice(-MAX_HISTORY_LENGTH), // Keep only recent messages
      timestamp: Date.now(),
      version: '1.0'
    };
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(chatData));
  } catch (error) {
    console.warn('[ChatStorage] Failed to save chat history:', error);
  }
};

export const loadChatHistory = (characterName) => {
  try {
    const stored = localStorage.getItem(CHAT_HISTORY_KEY);
    if (!stored) return [];
    
    const chatData = JSON.parse(stored);
    
    // Return history only if it's from the same character
    if (chatData.character === characterName && Array.isArray(chatData.messages)) {
      return chatData.messages;
    }
    
    return [];
  } catch (error) {
    console.warn('[ChatStorage] Failed to load chat history:', error);
    return [];
  }
};

export const clearChatHistory = () => {
  try {
    localStorage.removeItem(CHAT_HISTORY_KEY);
    return true;
  } catch (error) {
    console.warn('[ChatStorage] Failed to clear chat history:', error);
    return false;
  }
};

export const getChatStats = () => {
  try {
    const stored = localStorage.getItem(CHAT_HISTORY_KEY);
    if (!stored) return { messageCount: 0, character: null, lastActivity: null };
    
    const chatData = JSON.parse(stored);
    return {
      messageCount: chatData.messages?.length || 0,
      character: chatData.character,
      lastActivity: new Date(chatData.timestamp)
    };
  } catch (error) {
    return { messageCount: 0, character: null, lastActivity: null };
  }
};