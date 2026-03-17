import React, { useState } from 'react';
import { generateListOptions } from '../lib/ai';
import { motion } from 'motion/react';
import { Plus, Trash2, Dices, Loader2, Sparkles } from 'lucide-react';

export const DecisionLists = () => {
  const [lists, setLists] = useState(() => {
    const saved = localStorage.getItem('decido_lists');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      { id: '1', name: 'Food', items: ['Pizza', 'Sushi', 'Burgers', 'Salad'] },
      { id: '2', name: 'Music', items: ['Pop', 'Rock', 'Jazz', 'Classical'] }
    ];
  });
  
  // Save to localStorage whenever lists change
  React.useEffect(() => {
    localStorage.setItem('decido_lists', JSON.stringify(lists));
  }, [lists]);
  const [activeListId, setActiveListId] = useState('1');
  const [newItem, setNewItem] = useState('');
  const [newList, setNewList] = useState('');
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiTopic, setAiTopic] = useState('');

  const activeList = lists.find(l => l.id === activeListId) || lists[0];

  const handleAddList = () => {
    if (!newList.trim()) return;
    const id = crypto.randomUUID();
    setLists([...lists, { id, name: newList, items: [] }]);
    setActiveListId(id);
    setNewList('');
  };

  const handleAddItem = () => {
    if (!newItem.trim()) return;
    setLists(lists.map(l => l.id === activeListId ? { ...l, items: [...l.items, newItem] } : l));
    setNewItem('');
  };

  const handleRemoveItem = (index: number) => {
    setLists(lists.map(l => l.id === activeListId ? { ...l, items: l.items.filter((_, i) => i !== index) } : l));
  };

  const handleAISuggestions = async () => {
    setIsLoadingAI(true);
    try {
      const topicToUse = aiTopic.trim() || activeList.name;
      const suggestions = await generateListOptions(topicToUse);
      setLists(lists.map(l => l.id === activeListId ? { ...l, items: [...new Set([...l.items, ...suggestions])] } : l));
      setAiTopic('');
    } catch (error: any) {
      if (error?.message?.includes('quota') || error?.status === 429 || error?.message?.includes('429')) {
        alert("API quota exceeded. Please check your Gemini API plan and billing details, or try again later.");
      } else {
        console.error(error);
        alert("Failed to generate suggestions.");
      }
    } finally {
      setIsLoadingAI(false);
    }
  };

  const spin = () => {
    if (activeList.items.length === 0) return;
    setSpinning(true);
    setResult(null);
    let spins = 0;
    const maxSpins = 20;
    const interval = setInterval(() => {
      setHighlightIndex(Math.floor(Math.random() * activeList.items.length));
      spins++;
      if (spins >= maxSpins) {
        clearInterval(interval);
        const finalIndex = Math.floor(Math.random() * activeList.items.length);
        setHighlightIndex(finalIndex);
        setResult(activeList.items[finalIndex]);
        setSpinning(false);
      }
    }, 100);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col md:flex-row gap-6">
      {/* Sidebar for lists */}
      <div className="w-full md:w-64 bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 h-fit">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4">Your Lists</h3>
        <div className="space-y-2 mb-6">
          {lists.map(list => (
            <button
              key={list.id}
              onClick={() => { setActiveListId(list.id); setResult(null); setHighlightIndex(-1); }}
              className={`w-full text-left px-4 py-2 rounded-xl transition-colors ${activeListId === list.id ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
            >
              {list.name}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={newList} onChange={e => setNewList(e.target.value)} placeholder="New list..." className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
          <button onClick={handleAddList} className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg transition-colors"><Plus size={20} /></button>
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{activeList.name}</h2>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input 
              value={aiTopic}
              onChange={e => setAiTopic(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAISuggestions()}
              placeholder={`Topic (e.g. ${activeList.name})`}
              className="flex-1 sm:w-48 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <button onClick={handleAISuggestions} disabled={isLoadingAI} className="flex items-center text-sm bg-purple-50 hover:bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 dark:hover:bg-purple-900/50 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap">
              {isLoadingAI ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Sparkles size={16} className="mr-2" />}
              Suggest
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-8">
          <input value={newItem} onChange={e => setNewItem(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddItem()} placeholder="Add an option..." className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
          <button onClick={handleAddItem} className="bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white px-6 py-3 rounded-xl transition-colors font-medium">Add</button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          {activeList.items.map((item, i) => (
            <div key={i} className={`relative group flex items-center justify-between p-4 rounded-xl border-2 transition-all ${highlightIndex === i ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 scale-105 shadow-md' : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800'}`}>
              <span className={`font-medium ${highlightIndex === i ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'}`}>{item}</span>
              <button onClick={() => handleRemoveItem(i)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center border-t border-gray-100 dark:border-gray-700 pt-8">
          <button onClick={spin} disabled={spinning || activeList.items.length === 0} className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xl px-12 py-4 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center">
            <Dices size={28} className={`mr-3 ${spinning ? 'animate-spin' : ''}`} />
            {spinning ? 'Spinning...' : 'SPIN'}
          </button>

          {result && !spinning && (
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mt-8 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-2">The universe has spoken:</p>
              <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">{result}</div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
