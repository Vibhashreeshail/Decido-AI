import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { generateDecisionTree, generateOutcomeForOption } from '../lib/ai';
import { Loader2, Plus, Trash2, Edit2, X, Save } from 'lucide-react';

export const Tree = ({ topic, initialData, setTreeData }: { topic?: string, initialData?: any, setTreeData?: (data: any) => void }) => {
  const [decision, setDecision] = useState(() => {
    const saved = localStorage.getItem('decido_tree_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.root) return parsed.root;
      } catch (e) {}
    }
    return initialData?.root || "Buy a new car?";
  });

  const [options, setOptions] = useState(() => {
    const saved = localStorage.getItem('decido_tree_data');
    let optsToUse = null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.options) optsToUse = parsed.options;
      } catch (e) {}
    }
    optsToUse = optsToUse || initialData?.options;

    if (optsToUse) {
      return optsToUse.map((opt: any) => ({
        ...opt,
        result: opt.result === "Generating..." ? `Outcome for ${opt.name}` : opt.result
      }));
    }
    return [
      { name: "Buy New", result: "Reliable, but expensive" },
      { name: "Buy Used", result: "Cheaper, but risky" }
    ];
  });

  const [loading, setLoading] = useState(() => {
    const saved = localStorage.getItem('decido_tree_data');
    return !saved && !initialData && !!topic;
  });
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDesc, setTemplateDesc] = useState('');
  
  const typingTimeouts = useRef<{ [key: number]: NodeJS.Timeout }>({});
  const topicInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      Object.values(typingTimeouts.current).forEach((timeout: any) => clearTimeout(timeout));
    };
  }, []);

  useEffect(() => {
    if (!initialData && topic && !localStorage.getItem('decido_tree_data')) {
      setLoading(true);
      generateDecisionTree(topic).then(data => {
        if (data.root) setDecision(data.root);
        if (data.options && data.options.length > 0) setOptions(data.options);
        setLoading(false);
      }).catch((error: any) => {
        if (error?.message?.includes('quota') || error?.status === 429 || error?.message?.includes('429')) {
          alert("API quota exceeded. Please check your Gemini API plan and billing details, or try again later.");
        } else {
          console.error(error);
          alert("Failed to generate decision tree.");
        }
        setLoading(false);
      });
    }
  }, []); // Only run on mount

  useEffect(() => {
    if (!loading) {
      const data = { root: decision, options };
      localStorage.setItem('decido_tree_data', JSON.stringify(data));
      if (setTreeData) {
        setTreeData(data);
      }
    }
  }, [decision, options, loading, setTreeData]);

  const addOption = () => {
    setOptions([...options, { name: "New Option", result: "Outcome for New Option" }]);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const saveTemplate = () => {
    if (!templateName.trim()) return;
    
    const customTemplates = JSON.parse(localStorage.getItem('decido_custom_templates') || '[]');
    const newTemplate = {
      id: 'custom_' + Date.now(),
      title: templateName,
      description: templateDesc || 'Custom template',
      icon: 'Star',
      color: 'bg-pink-500',
      guidedQuestions: [],
      treeData: { root: decision, options }
    };
    
    localStorage.setItem('decido_custom_templates', JSON.stringify([...customTemplates, newTemplate]));
    setIsSaveModalOpen(false);
    setTemplateName('');
    setTemplateDesc('');
    alert('Template saved successfully! You can find it on the Home page.');
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <Loader2 className="animate-spin text-indigo-500" size={48} />
        <p className="text-gray-500 dark:text-gray-400">Generating decision tree...</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Decision Tree</h2>
        <div className="flex gap-2">
          <button onClick={() => setIsSaveModalOpen(true)} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg flex items-center text-sm font-medium transition-colors">
            <Save size={16} className="mr-2" /> Save as Template
          </button>
          <button onClick={addOption} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium transition-colors">
            <Plus size={16} className="mr-2" /> Add Branch
          </button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-x-auto">
        <div className="min-w-max flex flex-col items-center">
          {/* Root */}
          <div className="mb-8 relative flex justify-center items-center">
            <div className="relative flex items-center">
              <input 
                ref={topicInputRef}
                value={decision} 
                onChange={e => setDecision(e.target.value)}
                className="text-center font-bold text-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 px-8 py-3 rounded-xl border border-indigo-200 dark:border-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[300px]"
              />
              <button 
                onClick={() => topicInputRef.current?.focus()}
                className="absolute right-3 text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 p-1 rounded-md hover:bg-indigo-200/50 dark:hover:bg-indigo-800/50 transition-colors"
                title="Edit Topic"
              >
                <Edit2 size={16} />
              </button>
            </div>
          </div>

          {/* Connecting Lines Container */}
          <div className="relative w-full flex justify-center h-8 mb-4">
            {/* Horizontal line connecting outer options */}
            <div className="absolute top-0 border-t-2 border-gray-300 dark:border-gray-600 w-[calc(100%-200px)]"></div>
            {/* Vertical line from root */}
            <div className="absolute top-0 left-1/2 w-0.5 h-full bg-gray-300 dark:bg-gray-600 -translate-y-full"></div>
            
            {/* Vertical lines to options */}
            <div className="flex w-full justify-between px-[100px]">
              {options.map((_, i) => (
                <div key={i} className="w-0.5 h-full bg-gray-300 dark:bg-gray-600"></div>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="flex gap-4 w-full justify-center mb-8">
            {options.map((opt, i) => (
              <div key={i} className="relative flex-1 min-w-[180px] max-w-[220px] flex justify-center">
                <input 
                  value={opt.name} 
                  onChange={e => {
                    const newOpts = [...options];
                    const oldName = newOpts[i].name;
                    const newName = e.target.value;
                    newOpts[i].name = newName;
                    
                    const currentResult = newOpts[i].result;
                    const isAutoGenerated = currentResult === "Outcome" || currentResult.startsWith("Outcome for ") || currentResult === "Generating...";
                    
                    if (isAutoGenerated) {
                      newOpts[i].result = newName ? `Outcome for ${newName}` : "Outcome";
                    }
                    
                    setOptions(newOpts);

                    if (typingTimeouts.current[i]) {
                      clearTimeout(typingTimeouts.current[i]);
                    }

                    if (newName && newName !== "New Option" && isAutoGenerated) {
                      typingTimeouts.current[i] = setTimeout(async () => {
                        setOptions(prev => {
                          const next = [...prev];
                          if (next[i].name === newName) {
                            next[i].result = "Generating...";
                          }
                          return next;
                        });
                        
                        try {
                          const outcome = await generateOutcomeForOption(newName, decision);
                          setOptions(prev => {
                            const next = [...prev];
                            if (next[i].name === newName && next[i].result === "Generating...") {
                              next[i].result = outcome;
                            }
                            return next;
                          });
                        } catch (error) {
                          console.error("Failed to generate outcome:", error);
                          setOptions(prev => {
                            const next = [...prev];
                            if (next[i].name === newName && next[i].result === "Generating...") {
                              next[i].result = `Outcome for ${newName}`;
                            }
                            return next;
                          });
                        }
                      }, 1000);
                    }
                  }}
                  className="w-full text-center font-medium bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {options.length > 2 && (
                  <button 
                    onClick={() => removeOption(i)}
                    className="absolute -top-2 -right-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-full p-1 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Lines to Results */}
          <div className="flex gap-4 w-full justify-center mb-4">
            {options.map((_, i) => (
              <div key={i} className="flex-1 min-w-[180px] max-w-[220px] flex justify-center">
                <div className="w-0.5 h-8 bg-gray-300 dark:bg-gray-600"></div>
              </div>
            ))}
          </div>

          {/* Results */}
          <div className="flex gap-4 w-full justify-center">
            {options.map((opt, i) => (
              <div key={i} className="relative flex-1 min-w-[180px] max-w-[220px] flex justify-center">
                <textarea 
                  value={opt.result} 
                  onChange={e => {
                    const newOpts = [...options];
                    newOpts[i].result = e.target.value;
                    setOptions(newOpts);
                  }}
                  className="w-full text-center text-sm bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 h-24 resize-none"
                />
                {opt.result && opt.result !== "Generating..." && (
                  <button
                    onClick={() => {
                      const newOpts = [...options];
                      newOpts[i].result = "";
                      setOptions(newOpts);
                    }}
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 bg-gray-100/80 dark:bg-gray-800/80 rounded-md transition-colors"
                    title="Clear outcome"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {isSaveModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-xl border border-gray-100 dark:border-gray-700"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Save as Template</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Template Name</label>
                <input 
                  value={templateName}
                  onChange={e => setTemplateName(e.target.value)}
                  placeholder="e.g., Buying a House"
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (Optional)</label>
                <textarea 
                  value={templateDesc}
                  onChange={e => setTemplateDesc(e.target.value)}
                  placeholder="What is this decision about?"
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none h-20"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setIsSaveModalOpen(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button 
                  onClick={saveTemplate}
                  disabled={!templateName.trim()}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-2 rounded-lg transition-colors font-medium"
                >
                  Save
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};
