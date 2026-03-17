export interface Decision {
  id: string;
  problem: string;
  options: string[];
  selectedChoice?: string;
  aiSuggestion?: string;
  date: string;
  resultLater?: string;
  analysis?: any;
}

export const getHistory = (): Decision[] => {
  const data = localStorage.getItem('decido_history');
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error("Failed to parse decido_history from localStorage:", e);
    // If it's corrupted, we might want to clear it or just return empty array
    return [];
  }
};

export const saveDecision = (decision: Decision) => {
  const history = getHistory();
  history.unshift(decision);
  localStorage.setItem('decido_history', JSON.stringify(history));
};

export const updateDecision = (id: string, updates: Partial<Decision>) => {
  const history = getHistory();
  const index = history.findIndex(d => d.id === id);
  if (index !== -1) {
    history[index] = { ...history[index], ...updates };
    localStorage.setItem('decido_history', JSON.stringify(history));
  }
};
