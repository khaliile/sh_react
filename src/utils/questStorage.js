/**
 * Quest Log Storage Utility
 * Handles persistent storage of RPG-style quests/tasks with localStorage
 */

const QUEST_STORAGE_KEY = 'study_hub_quest_log';
const QUEST_STORAGE_VERSION = '1.0';

// Default quest difficulties with XP rewards
export const QUEST_DIFFICULTIES = {
  EASY: { name: 'Easy', xp: 25, color: '#10B981', badge: '★' },
  MEDIUM: { name: 'Medium', xp: 50, color: '#F59E0B', badge: '★★' },
  HARD: { name: 'Hard', xp: 100, color: '#EF4444', badge: '★★★' },
  LEGENDARY: { name: 'Legendary', xp: 200, color: '#8B5CF6', badge: 'LEGENDARY' }
};

// Default sample quests for new users
const DEFAULT_QUESTS = [
  {
    id: 'sample-1',
    title: 'Complete 25-min Pomodoro',
    description: 'Focus deeply for a full study session',
    difficulty: 'MEDIUM',
    xp: QUEST_DIFFICULTIES.MEDIUM.xp,
    completed: false,
    createdAt: Date.now(),
    category: 'Study'
  },
  {
    id: 'sample-2', 
    title: 'Chat with 3 different mascots',
    description: 'Explore different character personalities',
    difficulty: 'EASY',
    xp: QUEST_DIFFICULTIES.EASY.xp,
    completed: false,
    createdAt: Date.now(),
    category: 'Social'
  },
  {
    id: 'sample-3',
    title: 'Reach Level 5',
    description: 'Gain enough XP to advance your character',
    difficulty: 'HARD',
    xp: QUEST_DIFFICULTIES.HARD.xp,
    completed: false,
    createdAt: Date.now(),
    category: 'Progression'
  }
];

/**
 * Load all quests from localStorage
 */
export function loadQuests() {
  try {
    const stored = localStorage.getItem(QUEST_STORAGE_KEY);
    if (!stored) {
      // First time - create default quests
      saveQuests(DEFAULT_QUESTS);
      return DEFAULT_QUESTS;
    }

    const data = JSON.parse(stored);
    
    // Version check and migration if needed
    if (data.version !== QUEST_STORAGE_VERSION) {
      console.log('Quest storage version mismatch, migrating...');
      return migrateQuestStorage(data);
    }

    return data.quests || [];
  } catch (error) {
    console.error('Error loading quests:', error);
    return DEFAULT_QUESTS;
  }
}

/**
 * Save quests array to localStorage
 */
export function saveQuests(quests) {
  try {
    const data = {
      version: QUEST_STORAGE_VERSION,
      quests: quests,
      lastModified: Date.now()
    };
    localStorage.setItem(QUEST_STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving quests:', error);
    return false;
  }
}

/**
 * Add a new quest
 */
export function addQuest(questData) {
  const newQuest = {
    id: `quest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: questData.title || 'Untitled Quest',
    description: questData.description || 'No description',
    difficulty: questData.difficulty || 'MEDIUM',
    xp: questData.xp || QUEST_DIFFICULTIES[questData.difficulty || 'MEDIUM'].xp,
    completed: false,
    createdAt: Date.now(),
    category: questData.category || 'General',
    ...questData
  };

  const quests = loadQuests();
  quests.push(newQuest);
  saveQuests(quests);
  return newQuest;
}

/**
 * Update an existing quest
 */
export function updateQuest(questId, updates) {
  const quests = loadQuests();
  const questIndex = quests.findIndex(q => q.id === questId);
  
  if (questIndex === -1) {
    console.error('Quest not found:', questId);
    return null;
  }

  quests[questIndex] = { 
    ...quests[questIndex], 
    ...updates,
    lastModified: Date.now()
  };
  
  saveQuests(quests);
  return quests[questIndex];
}

/**
 * Mark quest as completed
 */
export function completeQuest(questId) {
  return updateQuest(questId, { 
    completed: true, 
    completedAt: Date.now() 
  });
}

/**
 * Delete a quest
 */
export function deleteQuest(questId) {
  const quests = loadQuests();
  const filteredQuests = quests.filter(q => q.id !== questId);
  saveQuests(filteredQuests);
  return filteredQuests;
}

/**
 * Get quest statistics
 */
export function getQuestStats() {
  const quests = loadQuests();
  const completed = quests.filter(q => q.completed);
  const pending = quests.filter(q => !q.completed);
  
  const totalXP = completed.reduce((sum, quest) => sum + (quest.xp || 0), 0);
  const pendingXP = pending.reduce((sum, quest) => sum + (quest.xp || 0), 0);

  return {
    total: quests.length,
    completed: completed.length,
    pending: pending.length,
    completionRate: quests.length > 0 ? Math.round((completed.length / quests.length) * 100) : 0,
    totalXP,
    pendingXP,
    categories: [...new Set(quests.map(q => q.category))]
  };
}

/**
 * Clear all quest data (for reset functionality)
 */
export function clearQuests() {
  localStorage.removeItem(QUEST_STORAGE_KEY);
  return DEFAULT_QUESTS;
}

/**
 * Migration helper for future storage format changes
 */
function migrateQuestStorage(oldData) {
  console.log('Migrating quest storage from version:', oldData.version);
  
  // For now, just return default quests
  // In the future, add migration logic here
  saveQuests(DEFAULT_QUESTS);
  return DEFAULT_QUESTS;
}

/**
 * Get quests by category
 */
export function getQuestsByCategory(category) {
  const quests = loadQuests();
  return quests.filter(q => q.category === category);
}

/**
 * Get quests by completion status
 */
export function getQuestsByStatus(completed = false) {
  const quests = loadQuests();
  return quests.filter(q => q.completed === completed);
}

/**
 * Search quests by title or description
 */
export function searchQuests(searchTerm) {
  const quests = loadQuests();
  const term = searchTerm.toLowerCase();
  return quests.filter(q => 
    q.title.toLowerCase().includes(term) || 
    q.description.toLowerCase().includes(term)
  );
}