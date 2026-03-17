import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Loader2, Plus, Trash2 } from 'lucide-react';
import { generateScoreOptions } from '../lib/ai';

export const Score = ({ problem }: { problem?: string }) => {
  const [options, setOptions] = useState([
    { id: crypto.randomUUID(), name: 'Option A', importance: 5, cost: 5, time: 5, risk: 5 },
    { id: crypto.randomUUID(), name: 'Option B', importance: 5, cost: 5, time: 5, risk: 5 },
  ]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!problem) return;
    setIsGenerating(true);
    try {
      const generatedOptions = await generateScoreOptions(problem);
      if (generatedOptions && generatedOptions.length > 0) {
        setOptions(generatedOptions.map((opt: any) => ({
          id: crypto.randomUUID(),
          name: opt.name,
          importance: opt.importance,
          cost: opt.cost,
          time: opt.time,
          risk: opt.risk
        })));
      }
    } catch (error: any) {
      if (error?.message?.includes('quota') || error?.status === 429 || error?.message?.includes('429')) {
        alert("API quota exceeded. Please check your Gemini API plan and billing details, or try again later.");
      } else {
        console.error(error);
        alert("Failed to generate options.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const addOption = () => {
    setOptions([...options, { id: crypto.randomUUID(), name: `Option ${String.fromCharCode(65 + options.length)}`, importance: 5, cost: 5, time: 5, risk: 5 }]);
  };

  const removeOption = (id: string) => {
    setOptions(options.filter(o => o.id !== id));
  };

  const updateScore = (id: string, field: string, value: number | string) => {
    setOptions(options.map(o => o.id === id ? { ...o, [field]: value } : o));
  };

  // Score calculation: Importance is positive, others are negative factors
  // Formula: (Importance * 2) - (Cost * 0.5) - (Time * 0.5) - (Risk * 1)
  const calculateScore = (opt: any) => {
    const score = (opt.importance * 2) - (opt.cost * 0.5) - (opt.time * 0.5) - (opt.risk * 1);
    // Normalize to 0-100 roughly
    return Math.max(0, Math.min(100, Math.round((score + 10) * 5)));
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Priority Score Calculator</h2>
        <div className="flex gap-2">
          {problem && (
            <button 
              onClick={handleGenerate} 
              disabled={isGenerating}
              className="bg-purple-50 hover:bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 dark:hover:bg-purple-900/50 px-4 py-2 rounded-lg flex items-center text-sm font-medium transition-colors disabled:opacity-50"
            >
              {isGenerating ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Sparkles size={16} className="mr-2" />}
              Auto-Generate
            </button>
          )}
          <button onClick={addOption} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium transition-colors">
            <Plus size={16} className="mr-2" /> Add Option
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {options.map((opt) => (
          <div key={opt.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative">
            {options.length > 2 && (
              <button 
                onClick={() => removeOption(opt.id)}
                className="absolute top-6 right-6 text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            )}
            <input 
              value={opt.name}
              onChange={e => updateScore(opt.id, 'name', e.target.value)}
              className="text-xl font-bold bg-transparent border-none focus:ring-0 p-0 mb-6 text-gray-900 dark:text-white w-[calc(100%-30px)]"
            />
            
            <div className="space-y-4">
              {[
                { key: 'importance', label: 'Importance (1-10)', color: 'bg-green-500' },
                { key: 'cost', label: 'Cost (1-10)', color: 'bg-red-500' },
                { key: 'time', label: 'Time (1-10)', color: 'bg-orange-500' },
                { key: 'risk', label: 'Risk (1-10)', color: 'bg-purple-500' },
              ].map(metric => (
                <div key={metric.key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">{metric.label}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{(opt as any)[metric.key]}</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" max="10" 
                    value={(opt as any)[metric.key]}
                    onChange={e => updateScore(opt.id, metric.key, parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-end mb-3">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Score</span>
                <span className="text-4xl font-black text-gray-900 dark:text-white">
                  {calculateScore(opt)}
                  <span className="text-lg text-gray-400 dark:text-gray-500 font-medium ml-1">/100</span>
                </span>
              </div>
              <div className="w-full h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${calculateScore(opt)}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className={`h-full rounded-full ${
                    calculateScore(opt) >= 80 ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' :
                    calculateScore(opt) >= 50 ? 'bg-gradient-to-r from-amber-400 to-amber-600' :
                    'bg-gradient-to-r from-red-400 to-red-600'
                  }`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
