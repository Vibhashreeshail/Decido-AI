import React, { useEffect, useState } from 'react';
import { getHistory, Decision, updateDecision } from '../lib/store';
import { Calendar, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

export const History = () => {
  const [history, setHistory] = useState<Decision[]>([]);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const handleUpdateResult = (id: string, result: string) => {
    updateDecision(id, { resultLater: result });
    setHistory(getHistory());
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Decision History</h2>
      
      {history.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">No decisions recorded yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((decision) => (
            <div key={decision.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{decision.problem}</h3>
                <span className="flex items-center text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">
                  <Calendar size={12} className="mr-1" />
                  {new Date(decision.date).toLocaleDateString()}
                </span>
              </div>
              
              {decision.aiSuggestion && (
                <div className="mb-4 bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                  <p className="text-sm font-medium text-indigo-800 dark:text-indigo-300 mb-1">AI Suggestion:</p>
                  <p className="text-sm text-indigo-600 dark:text-indigo-400">{decision.aiSuggestion}</p>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                  <CheckCircle size={16} className="mr-2 text-green-500" /> Result / Outcome
                </label>
                <input
                  type="text"
                  value={decision.resultLater || ''}
                  onChange={(e) => handleUpdateResult(decision.id, e.target.value)}
                  placeholder="What was the actual outcome?"
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};
