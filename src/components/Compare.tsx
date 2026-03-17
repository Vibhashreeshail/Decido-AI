import React, { useState } from 'react';
import { Plus, Trash2, Sparkles, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { generateCompareOptions } from '../lib/ai';

interface Option {
  id: string;
  name: string;
  cost: number;
  time: number;
  effort: number;
  impact: number;
}

export const Compare = ({ problem }: { problem?: string }) => {
  const [options, setOptions] = useState<Option[]>([
    { id: '1', name: 'Option A', cost: 8, time: 5, effort: 3, impact: 9 },
    { id: '2', name: 'Option B', cost: 3, time: 8, effort: 8, impact: 5 }
  ]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!problem) return;
    setIsGenerating(true);
    try {
      const generatedOptions = await generateCompareOptions(problem);
      if (generatedOptions && generatedOptions.length > 0) {
        setOptions(generatedOptions.map((opt: any) => ({
          id: crypto.randomUUID(),
          name: opt.name,
          cost: opt.cost,
          time: opt.time,
          effort: opt.effort,
          impact: opt.impact
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
    setOptions([...options, { id: crypto.randomUUID(), name: `Option ${String.fromCharCode(65 + options.length)}`, cost: 5, time: 5, effort: 5, impact: 5 }]);
  };

  const updateOption = (id: string, field: keyof Option, value: string | number) => {
    setOptions(options.map(o => o.id === id ? { ...o, [field]: value } : o));
  };

  const removeOption = (id: string) => {
    setOptions(options.filter(o => o.id !== id));
  };

  const metrics = [
    { key: 'cost', label: 'Cost', color: 'bg-red-500' },
    { key: 'time', label: 'Time', color: 'bg-orange-500' },
    { key: 'effort', label: 'Effort', color: 'bg-yellow-500' },
    { key: 'impact', label: 'Long-term Impact', color: 'bg-green-500' },
  ] as const;

  const chartData = options.map(opt => ({
    name: opt.name,
    Cost: opt.cost,
    Time: opt.time,
    Effort: opt.effort,
    Impact: opt.impact
  }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Option Comparison</h2>
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

      <div className="overflow-x-auto pb-4">
        <div className="flex gap-6 min-w-max">
          {options.map((option) => (
            <div key={option.id} className="w-72 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
              <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <input
                  type="text"
                  value={option.name}
                  onChange={(e) => updateOption(option.id, 'name', e.target.value)}
                  className="font-bold text-lg bg-transparent border-none focus:ring-0 p-0 text-gray-900 dark:text-white w-full"
                />
                {options.length > 2 && (
                  <button onClick={() => removeOption(option.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
              <div className="p-4 space-y-5 flex-1">
                {metrics.map(metric => (
                  <div key={metric.key}>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{metric.label}</label>
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{option[metric.key]}/10</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" max="10" 
                      value={option[metric.key]} 
                      onChange={(e) => updateOption(option.id, metric.key, parseInt(e.target.value))} 
                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 mb-2" 
                    />
                    <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${metric.color} transition-all duration-300`}
                        style={{ width: `${(option[metric.key] as number) * 10}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {options.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mt-8">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Visual Comparison</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis stroke="#6B7280" domain={[0, 10]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6', borderRadius: '0.5rem' }}
                  itemStyle={{ color: '#F3F4F6' }}
                />
                <Legend />
                <Bar dataKey="Cost" fill="#EF4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Time" fill="#F97316" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Effort" fill="#EAB308" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Impact" fill="#22C55E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </motion.div>
  );
};;
