import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Check, Loader2, RefreshCcw } from 'lucide-react';
import { motion } from 'motion/react';
import { analyzeDecision } from '../lib/ai';

export const Guided = ({ initialQuestions, problem }: { initialQuestions?: string[], problem?: string }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const defaultQuestions = [
    "What is your main goal in making this decision?",
    "What is the worst possible outcome if you make the wrong choice?",
    "What matters most to you right now? (e.g., Time, Money, Peace of mind)",
    "Which option aligns best with your long-term goals?"
  ];

  const questions = initialQuestions || defaultQuestions;

  useEffect(() => {
    setStep(0);
    setAnswers({});
    setIsFinished(false);
    setResult(null);
  }, [initialQuestions]);

  const handleNext = () => {
    if (step < questions.length - 1) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleFinish = async () => {
    setIsFinished(true);
    setIsAnalyzing(true);
    
    let prompt = "I am making a decision. Here are my guided thoughts:\n\n";
    if (problem) {
      prompt = `I am trying to decide: "${problem}". Here are my guided thoughts:\n\n`;
    }
    
    prompt += questions.map((q, i) => `Question: ${q}\nAnswer: ${answers[i] || 'No answer provided.'}`).join('\n\n');
      
    try {
      const analysis = await analyzeDecision(prompt, "Thoughtful");
      setResult(analysis);
    } catch (error: any) {
      if (error?.message?.includes('quota') || error?.status === 429 || error?.message?.includes('429')) {
        alert("API quota exceeded. Please check your Gemini API plan and billing details, or try again later.");
      } else {
        console.error(error);
        alert("Failed to analyze answers.");
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setStep(0);
    setAnswers({});
    setIsFinished(false);
    setResult(null);
  };

  if (isFinished) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">Your Guided Analysis</h2>
        
        {isAnalyzing ? (
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="animate-spin text-indigo-500" size={48} />
            <p className="text-gray-500 dark:text-gray-400 text-lg">Analyzing your thoughts...</p>
          </div>
        ) : result ? (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg border border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">AI Conclusion</h3>
              <p className="text-lg text-indigo-600 dark:text-indigo-400 font-medium mb-2">{result.suggestion}</p>
              <p className="text-gray-600 dark:text-gray-300 mb-8">{result.reasoning}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-6 border border-green-100 dark:border-green-900/30">
                  <h4 className="font-bold text-green-800 dark:text-green-400 mb-3">Pros</h4>
                  <ul className="space-y-2 text-sm text-green-700 dark:text-green-300">
                    {result.pros?.map((p: string, i: number) => <li key={i} className="flex"><span className="mr-2">•</span>{p}</li>)}
                  </ul>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-6 border border-red-100 dark:border-red-900/30">
                  <h4 className="font-bold text-red-800 dark:text-red-400 mb-3">Cons & Risks</h4>
                  <ul className="space-y-2 text-sm text-red-700 dark:text-red-300">
                    {result.cons?.map((c: string, i: number) => <li key={`c-${i}`} className="flex"><span className="mr-2">•</span>{c}</li>)}
                    {result.risks?.map((r: string, i: number) => <li key={`r-${i}`} className="flex text-orange-700 dark:text-orange-400"><span className="mr-2">⚠</span>{r}</li>)}
                  </ul>
                </div>
              </div>
              
              <div className="border-t border-gray-100 dark:border-gray-700 pt-8">
                <h4 className="font-bold text-gray-900 dark:text-white mb-4">Your Answers</h4>
                <div className="space-y-4">
                  {questions.map((q, i) => (
                    <div key={i} className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{q}</p>
                      <p className="text-gray-900 dark:text-white">{answers[i] || <span className="text-gray-400 italic">No answer provided</span>}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-center">
              <button onClick={handleReset} className="flex items-center px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors shadow-sm">
                <RefreshCcw size={18} className="mr-2" /> Start Over
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center text-red-500">Failed to load results.</div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">Guided Thinking</h2>
      
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 relative overflow-hidden">
        {/* Progress bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gray-100 dark:bg-gray-700">
          <div 
            className="h-full bg-indigo-500 transition-all duration-300" 
            style={{ width: `${((step + 1) / questions.length) * 100}%` }}
          />
        </div>

        <div className="mb-8 mt-4">
          <span className="text-sm font-medium text-indigo-500 dark:text-indigo-400 mb-2 block">Question {step + 1} of {questions.length}</span>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{questions[step]}</h3>
        </div>

        <textarea
          value={answers[step] || ''}
          onChange={(e) => setAnswers({ ...answers, [step]: e.target.value })}
          placeholder="Type your thoughts here..."
          className="w-full h-40 p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-gray-900 dark:text-white mb-8"
        />

        <div className="flex justify-between items-center">
          <button
            onClick={handlePrev}
            disabled={step === 0}
            className="flex items-center px-4 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={20} className="mr-1" /> Back
          </button>
          
          {step < questions.length - 1 ? (
            <button
              onClick={handleNext}
              className="flex items-center px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
            >
              Next <ChevronRight size={20} className="ml-1" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="flex items-center px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors"
            >
              Finish <Check size={20} className="ml-1" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
