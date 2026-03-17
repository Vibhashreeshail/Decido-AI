// src/lib/ai.ts
// Fully Manual/Local implementations - NO API USED

export const generateOutcomeForOption = async (optionName: string, topic: string) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const outcomes = [
    "High potential, moderate risk",
    "Safe choice, steady growth",
    "Requires effort, big reward",
    "Quick win, short-term benefit",
    "Creative path, unpredictable"
  ];
  return outcomes[Math.floor(Math.random() * outcomes.length)];
};

export const analyzeDecision = async (problem: string, mood: string) => {
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate thinking

  return {
    pros: [
      "Taking action builds momentum",
      "Clarifies your priorities",
      "Opens up new opportunities"
    ],
    cons: [
      "Requires time and energy commitment",
      "May cause temporary discomfort or stress"
    ],
    risks: [
      "Opportunity cost of alternative choices",
      "Unforeseen external factors"
    ],
    suggestion: "Take a balanced approach: start with a small, reversible step to test the waters.",
    reasoning: `Given that you are feeling ${mood} about "${problem}", it's best not to rush. A measured approach minimizes risk while still moving you forward.`,
    smartSuggestions: [
      "Sleep on it for 24 hours",
      "Discuss with a trusted friend",
      "Write down your worst-case scenario"
    ]
  };
};

const quotes = [
  "Small daily choices shape your future.",
  "Whenever you see a successful business, someone once made a courageous decision. - Peter Drucker",
  "In any moment of decision, the best thing you can do is the right thing. - Theodore Roosevelt",
  "The hardest thing to learn in life is which bridge to cross and which to burn. - David Russell",
  "Stay committed to your decisions, but stay flexible in your approach. - Tony Robbins"
];

export const getDailyQuote = async () => {
  return quotes[Math.floor(Math.random() * quotes.length)];
};

export const transcribeAudio = async (base64Audio: string, mimeType: string) => {
  return "Audio transcription requires native browser support in manual mode.";
};

export const generateSpeech = async (text: string) => {
  return null;
};

const extractOptions = (text: string): string[] => {
  if (!text) return ["Option A", "Option B"];
  
  const lowerText = text.toLowerCase();
  
  const cleanPart = (part: string) => {
    return part.replace(/^(should i|do i|can i|will i)\s+(choose|buy|go to|take|do|get)?\s*/i, '')
               .replace(/\?.*$/, '')
               .trim();
  };

  if (lowerText.includes(" or ")) {
    const parts = text.split(/\s+or\s+/i);
    return parts.map(p => {
      const cleaned = cleanPart(p);
      return cleaned ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1) : "";
    }).filter(Boolean);
  } else if (lowerText.includes(" vs ")) {
    const parts = text.split(/\s+vs\.?\s+/i);
    return parts.map(p => {
      const cleaned = cleanPart(p);
      return cleaned ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1) : "";
    }).filter(Boolean);
  } else {
    const cleaned = cleanPart(text);
    if (cleaned) {
      return [cleaned.charAt(0).toUpperCase() + cleaned.slice(1), "Alternative / Do nothing"];
    }
    return ["Option A", "Option B"];
  }
};

export const generateDecisionTree = async (topic: string) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const names = extractOptions(topic);
  
  return {
    root: topic || "Make a choice",
    options: names.map(name => ({
      name: name,
      result: `Outcome for ${name}`
    }))
  };
};

export const generateCompareOptions = async (problem: string) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const names = extractOptions(problem);
  
  return names.map(name => ({
    name: name,
    cost: Math.floor(Math.random() * 8) + 2,
    time: Math.floor(Math.random() * 8) + 2,
    effort: Math.floor(Math.random() * 8) + 2,
    impact: Math.floor(Math.random() * 8) + 2
  }));
};

export const generateScoreOptions = async (problem: string) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const names = extractOptions(problem);
  
  return names.map(name => ({
    name: name,
    importance: Math.floor(Math.random() * 8) + 2,
    cost: Math.floor(Math.random() * 8) + 2,
    time: Math.floor(Math.random() * 8) + 2,
    risk: Math.floor(Math.random() * 8) + 2
  }));
};

export const generateListOptions = async (topic: string) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const base = topic ? topic.split(' ')[0] : 'Item';
  return [
    `Popular ${base}`,
    `Budget ${base}`,
    `Premium ${base}`,
    `Alternative ${base}`,
    `Safe ${base}`
  ];
};
