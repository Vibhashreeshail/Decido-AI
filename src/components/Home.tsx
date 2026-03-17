import React, { useEffect, useState } from 'react';
import { getDailyQuote } from '../lib/ai';
import { BrainCircuit, ListTodo, GitMerge, Laptop, Plane, Briefcase, Star, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';

export const Home = ({ 
  setActiveTab, 
  setTreeTopic,
  setTreeData,
  treeData,
  setGuidedQuestions,
  setAnalyzerSubTab
}: { 
  setActiveTab: (tab: string) => void, 
  setTreeTopic: (topic: string) => void,
  setTreeData: (data: any) => void,
  treeData?: any,
  setGuidedQuestions: (questions: string[]) => void,
  setAnalyzerSubTab: (tab: string) => void
}) => {
  const [quote, setQuote] = useState("Small daily choices shape your future.");
  const [treeInput, setTreeInput] = useState('');
  const [customTemplates, setCustomTemplates] = useState<any[]>([]);
  const [userLists, setUserLists] = useState<any[]>([]);

  useEffect(() => {
    const savedTemplates = localStorage.getItem('decido_custom_templates');
    if (savedTemplates) {
      try {
        setCustomTemplates(JSON.parse(savedTemplates));
      } catch (e) {}
    }
    
    const savedLists = localStorage.getItem('decido_lists');
    if (savedLists) {
      try {
        setUserLists(JSON.parse(savedLists));
      } catch (e) {}
    } else {
      setUserLists([
        { id: '1', name: 'Food', items: ['Pizza', 'Sushi', 'Burgers', 'Salad'] },
        { id: '2', name: 'Music', items: ['Pop', 'Rock', 'Jazz', 'Classical'] }
      ]);
    }
    
    getDailyQuote().then(setQuote).catch((error: any) => {
      if (error?.message?.includes('quota') || error?.status === 429 || error?.message?.includes('429')) {
        setQuote("Small daily choices shape your future. (API Quota Exceeded)");
      } else {
        console.error(error);
      }
    });
  }, []);

  const tools = [
    { id: 'analyzer', title: 'AI Analyzer', desc: 'Get AI-powered pros, cons, and suggestions.', icon: BrainCircuit, color: 'bg-blue-500' },
    { id: 'lists', title: 'Decision Lists', desc: 'Spin the wheel to make fun, quick choices.', icon: ListTodo, color: 'bg-purple-500' },
    { id: 'tree', title: 'Decision Tree', desc: 'Visualize your options and outcomes.', icon: GitMerge, color: 'bg-emerald-500' },
  ];

  const handleGenerateTree = () => {
    if (treeInput.trim()) {
      localStorage.removeItem('decido_tree_data');
      setTreeTopic(treeInput);
      setTreeData(null);
      setActiveTab('tree');
    }
  };

  const templates = [
    {
      id: 'laptop',
      title: 'Choosing a New Laptop',
      description: 'Find the perfect machine for your needs.',
      icon: Laptop,
      color: 'bg-blue-500',
      guidedQuestions: [
        "What is your primary use case? (e.g., Gaming, Programming, Browsing)",
        "What is your absolute maximum budget?",
        "How important is portability (weight and battery life) to you?",
        "Mac or Windows, and why?"
      ],
      treeData: {
        root: "Which laptop should I buy?",
        options: [
          { name: "MacBook Air", result: "Great battery, lightweight, macOS" },
          { name: "Gaming PC", result: "High performance, heavy, Windows" },
          { name: "Chromebook", result: "Cheap, basic tasks only" }
        ]
      }
    },
    {
      id: 'vacation',
      title: 'Planning a Vacation',
      description: 'Decide on your next getaway destination.',
      icon: Plane,
      color: 'bg-orange-500',
      guidedQuestions: [
        "What type of climate are you looking for?",
        "Are you looking for relaxation or adventure?",
        "What is your budget per person?",
        "How many days can you take off?"
      ],
      treeData: {
        root: "Where should we go?",
        options: [
          { name: "Beach Resort", result: "Relaxing, warm, potentially expensive" },
          { name: "Mountain Cabin", result: "Quiet, nature, hiking" },
          { name: "City Break", result: "Culture, food, busy" }
        ]
      }
    },
    {
      id: 'career',
      title: 'Selecting a Career Path',
      description: 'Navigate your professional future.',
      icon: Briefcase,
      color: 'bg-teal-500',
      guidedQuestions: [
        "What activities make you lose track of time?",
        "What are your non-negotiables? (e.g., Remote work, Salary, Work-life balance)",
        "Where do you see yourself in 5 years?",
        "What skills do you currently have versus what you want to learn?"
      ],
      treeData: {
        root: "Which career path?",
        options: [
          { name: "Corporate Job", result: "Stable income, clear progression" },
          { name: "Startup", result: "High risk, high reward, fast-paced" },
          { name: "Freelance", result: "Flexible, unpredictable income" }
        ]
      }
    }
  ];

  const allTemplates = [...templates, ...customTemplates];

  const deleteCustomTemplate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customTemplates.filter(t => t.id !== id);
    setCustomTemplates(updated);
    localStorage.setItem('decido_custom_templates', JSON.stringify(updated));
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-8 text-white shadow-xl">
        <h1 className="text-3xl font-bold mb-4">Welcome to Decido AI</h1>
        <p className="text-indigo-100 text-lg mb-6">Your intelligent assistant for making better, structured decisions.</p>
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <p className="text-xl font-medium italic">"{quote}"</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Quick Tools</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tools.map(tool => {
          const Icon = tool.icon;
          
          if (tool.id === 'lists') {
            return (
              <div key={tool.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
                <button
                  onClick={() => setActiveTab(tool.id)}
                  className="text-left group flex flex-col h-full"
                >
                  <div className={`${tool.color} w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{tool.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 flex-1">{tool.desc}</p>
                </button>
                
                <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 block">Your Lists:</span>
                  <div className="flex flex-wrap gap-2">
                    {userLists.slice(0, 4).map(list => (
                      <button
                        key={list.id}
                        onClick={() => {
                          // We don't have a direct way to set active list from Home yet, 
                          // but we can just navigate to the tab for now. 
                          // To make it perfect, we'd need to pass a state up to App.tsx, 
                          // but just navigating is fine for this quick access.
                          setActiveTab('lists');
                        }}
                        className="text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-2.5 py-1.5 rounded-md transition-colors"
                      >
                        {list.name}
                      </button>
                    ))}
                    {userLists.length > 4 && (
                      <button
                        onClick={() => setActiveTab('lists')}
                        className="text-xs text-indigo-600 dark:text-indigo-400 font-medium px-1 py-1.5 hover:underline"
                      >
                        +{userLists.length - 4} more
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          }

          if (tool.id === 'tree') {
            return (
              <div key={tool.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
                <div className={`${tool.color} w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4`}>
                  <Icon size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{tool.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 flex-1">{tool.desc}</p>
                
                <div className="mt-auto space-y-3">
                  <input 
                    value={treeInput} 
                    onChange={e => setTreeInput(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && handleGenerateTree()}
                    placeholder="Topic (e.g. buy or rent?)" 
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent" 
                  />
                  <div className="flex gap-2">
                    {treeData && (
                      <button 
                        onClick={() => setActiveTab('tree')}
                        className="flex-1 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 py-2 rounded-lg transition-colors text-sm font-medium"
                      >
                        Resume
                      </button>
                    )}
                    <button 
                      onClick={handleGenerateTree} 
                      disabled={!treeInput.trim()}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-2 rounded-lg transition-colors text-sm font-medium"
                    >
                      Generate
                    </button>
                    <button 
                      onClick={() => { 
                        localStorage.removeItem('decido_tree_data');
                        setTreeTopic(''); 
                        setTreeData(null); 
                        setActiveTab('tree'); 
                      }}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg transition-colors text-sm font-medium"
                    >
                      Blank
                    </button>
                  </div>
                  
                  <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 block">Or use a template:</span>
                    <div className="flex flex-wrap gap-2">
                      {allTemplates.map(template => (
                        <div key={template.id} className="relative group/template">
                          <button
                            onClick={() => {
                              localStorage.setItem('decido_tree_data', JSON.stringify(template.treeData));
                              setTreeData(template.treeData);
                              setTreeTopic('');
                              setGuidedQuestions(template.guidedQuestions || []);
                              setActiveTab('tree');
                            }}
                            className="text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-2.5 py-1.5 rounded-md transition-colors flex items-center pr-6"
                          >
                            {template.icon === 'Star' && <Star size={12} className="mr-1.5 text-pink-500" />}
                            {template.title}
                          </button>
                          {template.id.startsWith('custom_') && (
                            <button
                              onClick={(e) => deleteCustomTemplate(template.id, e)}
                              className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 opacity-0 group-hover/template:opacity-100 transition-opacity p-0.5"
                              title="Delete template"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          if (tool.id === 'analyzer') {
            return (
              <div key={tool.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
                <button
                  onClick={() => setActiveTab(tool.id)}
                  className="text-left group flex flex-col h-full"
                >
                  <div className={`${tool.color} w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{tool.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 flex-1">{tool.desc}</p>
                </button>
                
                <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 block">Tools included:</span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => { setActiveTab('analyzer'); setAnalyzerSubTab('compare'); }}
                      className="text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-2.5 py-1.5 rounded-md transition-colors"
                    >
                      Compare Options
                    </button>
                    <button
                      onClick={() => { setActiveTab('analyzer'); setAnalyzerSubTab('score'); }}
                      className="text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-2.5 py-1.5 rounded-md transition-colors"
                    >
                      Priority Score
                    </button>
                    <button
                      onClick={() => { setActiveTab('analyzer'); setAnalyzerSubTab('guided'); }}
                      className="text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-2.5 py-1.5 rounded-md transition-colors"
                    >
                      Guided Questions
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <button
              key={tool.id}
              onClick={() => setActiveTab(tool.id)}
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all text-left border border-gray-100 dark:border-gray-700 group flex flex-col"
            >
              <div className={`${tool.color} w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                <Icon size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{tool.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm flex-1">{tool.desc}</p>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
};
