import React, { useState } from 'react';
import { analyzeDecision } from '../lib/ai';
import { saveDecision } from '../lib/store';
import { Mic, Send, Smile, Frown, Meh, Loader2, Volume2, Square, BrainCircuit, GitCompare, Calculator, HelpCircle, SquareSquare } from 'lucide-react';
import { motion } from 'motion/react';
import { Compare } from './Compare';
import { Score } from './Score';
import { Guided } from './Guided';

export const Analyzer = ({ guidedQuestions, activeSubTab, setActiveSubTab }: { guidedQuestions?: string[], activeSubTab: string, setActiveSubTab: (tab: string) => void }) => {
  const [problem, setProblem] = useState('');
  const [mood, setMood] = useState('Neutral');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);

  const moods = [
    { label: 'Happy', icon: Smile, value: 'Happy', color: 'text-green-500' },
    { label: 'Neutral', icon: Meh, value: 'Neutral', color: 'text-gray-500' },
    { label: 'Stressed', icon: Frown, value: 'Stressed', color: 'text-red-500' },
  ];

  const subTabs = [
    { id: 'ai', label: 'AI Analysis', icon: BrainCircuit },
    { id: 'compare', label: 'Compare Options', icon: GitCompare },
    { id: 'score', label: 'Priority Score', icon: Calculator },
    { id: 'guided', label: 'Guided Questions', icon: HelpCircle },
  ];

  const handleAnalyze = async () => {
    if (!problem.trim()) return;
    setIsAnalyzing(true);
    try {
      const analysis = await analyzeDecision(problem, mood);
      setResult(analysis);
      saveDecision({
        id: crypto.randomUUID(),
        problem,
        options: [],
        aiSuggestion: analysis.suggestion,
        date: new Date().toISOString(),
        analysis
      });
    } catch (error: any) {
      if (error?.message?.includes('quota') || error?.status === 429 || error?.message?.includes('429')) {
        alert("API quota exceeded. Please check your Gemini API plan and billing details, or try again later.");
      } else {
        console.error(error);
        alert("Failed to analyze decision. Please try again.");
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleListen = async () => {
    if (isRecording) {
      if (recognition) recognition.stop();
      setIsRecording(false);
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("Speech recognition is not supported in this browser.");
        return;
      }

      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;

      rec.onstart = () => setIsRecording(true);
      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setProblem(prev => prev + (prev ? ' ' : '') + transcript);
        setIsRecording(false);
      };
      rec.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
      };
      rec.onend = () => setIsRecording(false);

      rec.start();
      setRecognition(rec);
    } catch (err) {
      console.error(err);
      alert("Microphone access denied or not available.");
    }
  };

  const playSuggestion = async (text: string) => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }
    
    setIsPlaying(true);
    try {
      if ('speechSynthesis' in window) {
        // Cancel any ongoing speech before starting new
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);
        window.speechSynthesis.speak(utterance);
      } else {
        alert("Text-to-speech is not supported in your browser.");
        setIsPlaying(false);
      }
    } catch (error: any) {
      console.error(error);
      setIsPlaying(false);
      alert("Failed to generate speech.");
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI Decision Analyzer</h2>
        
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl overflow-x-auto max-w-full">
          {subTabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  activeSubTab === tab.id 
                    ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700/50'
                }`}
              >
                <Icon size={16} className="mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
      
      {activeSubTab === 'ai' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              What are you trying to decide?
            </label>
            <div className="relative">
              <textarea
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                placeholder="e.g., Should I choose job A or job B?"
                className={`w-full h-32 p-4 bg-gray-50 dark:bg-gray-900 border ${isRecording ? 'border-red-300 dark:border-red-700 ring-2 ring-red-100 dark:ring-red-900/30' : 'border-gray-200 dark:border-gray-700'} rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-gray-900 dark:text-white transition-all`}
              />
              <div className="absolute bottom-4 right-4 flex items-center gap-2">
                {isRecording && (
                  <span className="text-xs font-medium text-red-500 animate-pulse bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded-md">
                    Listening...
                  </span>
                )}
                <button
                  onClick={toggleListen}
                  title={isRecording ? "Stop recording" : "Use microphone"}
                  className={`p-2 rounded-full transition-colors ${isRecording ? 'bg-red-100 text-red-600 animate-pulse shadow-sm' : 'bg-white dark:bg-gray-800 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:text-gray-400 dark:hover:text-indigo-400 dark:hover:bg-indigo-900/30 border border-gray-200 dark:border-gray-700 shadow-sm'}`}
                >
                  {isRecording ? <Square size={18} className="fill-current" /> : <Mic size={18} />}
                </button>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                How are you feeling right now?
              </label>
              <div className="flex gap-4">
                {moods.map(m => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.value}
                      onClick={() => setMood(m.value)}
                      className={`flex items-center px-4 py-2 rounded-full border transition-all ${mood === m.value ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                    >
                      <Icon size={18} className={`mr-2 ${m.color}`} />
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !problem.trim()}
              className="mt-8 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? <Loader2 className="animate-spin mr-2" size={20} /> : <Send className="mr-2" size={20} />}
              {isAnalyzing ? 'Analyzing...' : 'Analyze Decision'}
            </button>
          </div>

          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">AI Suggestion</h3>
                  <button 
                    onClick={() => playSuggestion(result.suggestion)}
                    title={isPlaying ? "Stop reading" : "Read aloud"}
                    className={`p-2 rounded-full transition-colors ${isPlaying ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50'}`}
                  >
                    {isPlaying ? <Square size={18} className="fill-current" /> : <Volume2 size={18} />}
                  </button>
                </div>
                <p className="text-lg text-indigo-600 dark:text-indigo-400 font-medium mb-2">{result.suggestion}</p>
                <p className="text-gray-600 dark:text-gray-300">{result.reasoning}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-6 border border-green-100 dark:border-green-900/30">
                  <h4 className="text-lg font-bold text-green-800 dark:text-green-400 mb-4">Pros</h4>
                  <ul className="space-y-2">
                    {result.pros?.map((pro: string, i: number) => (
                      <li key={i} className="flex items-start text-green-700 dark:text-green-300">
                        <span className="mr-2">•</span> {pro}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-6 border border-red-100 dark:border-red-900/30">
                  <h4 className="text-lg font-bold text-red-800 dark:text-red-400 mb-4">Cons & Risks</h4>
                  <ul className="space-y-2">
                    {result.cons?.map((con: string, i: number) => (
                      <li key={`con-${i}`} className="flex items-start text-red-700 dark:text-red-300">
                        <span className="mr-2">•</span> {con}
                      </li>
                    ))}
                    {result.risks?.map((risk: string, i: number) => (
                      <li key={`risk-${i}`} className="flex items-start text-orange-700 dark:text-orange-300">
                        <span className="mr-2">⚠</span> {risk}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-900/30">
                <h4 className="text-lg font-bold text-blue-800 dark:text-blue-400 mb-4">Smart Suggestions</h4>
                <div className="flex flex-wrap gap-3">
                  {result.smartSuggestions?.map((sug: string, i: number) => (
                    <span key={i} className="bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium shadow-sm">
                      {sug}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {activeSubTab === 'compare' && <Compare problem={problem} />}
      {activeSubTab === 'score' && <Score problem={problem} />}
      {activeSubTab === 'guided' && <Guided initialQuestions={guidedQuestions} problem={problem} />}
    </motion.div>
  );
};
