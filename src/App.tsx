/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { Analyzer } from './components/Analyzer';
import { History } from './components/History';
import { Tree } from './components/Tree';
import { DecisionLists } from './components/DecisionLists';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [analyzerSubTab, setAnalyzerSubTab] = useState('ai');
  const [isDark, setIsDark] = useState(false);
  const [treeTopic, setTreeTopic] = useState(() => {
    const saved = localStorage.getItem('decido_tree_topic');
    return saved || '';
  });
  const [treeData, setTreeData] = useState<any>(() => {
    const saved = localStorage.getItem('decido_tree_data');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem('decido_tree_topic', treeTopic);
  }, [treeTopic]);

  useEffect(() => {
    if (treeData) {
      localStorage.setItem('decido_tree_data', JSON.stringify(treeData));
    } else {
      localStorage.removeItem('decido_tree_data');
    }
  }, [treeData]);
  const [guidedQuestions, setGuidedQuestions] = useState<string[] | undefined>(undefined);

  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => setIsDark(!isDark);

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <Home 
        setActiveTab={setActiveTab} 
        setTreeTopic={setTreeTopic} 
        setTreeData={setTreeData}
        treeData={treeData}
        setGuidedQuestions={setGuidedQuestions}
        setAnalyzerSubTab={setAnalyzerSubTab}
      />;
      case 'analyzer': return <Analyzer 
        guidedQuestions={guidedQuestions} 
        activeSubTab={analyzerSubTab}
        setActiveSubTab={setAnalyzerSubTab}
      />;
      case 'lists': return <DecisionLists />;
      case 'history': return <History />;
      case 'tree': return <Tree topic={treeTopic} initialData={treeData} setTreeData={setTreeData} />;
      default: return <Home 
        setActiveTab={setActiveTab} 
        setTreeTopic={setTreeTopic} 
        setTreeData={setTreeData}
        treeData={treeData}
        setGuidedQuestions={setGuidedQuestions}
        setAnalyzerSubTab={setAnalyzerSubTab}
      />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} toggleTheme={toggleTheme} isDark={isDark}>
      {renderContent()}
    </Layout>
  );
}
