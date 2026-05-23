// CodeGenerator.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import hljs from 'highlight.js';
import { 
  Copy, 
  Play, 
  Trash2, 
  FileText, 
  Sparkles, 
  Zap, 
  Terminal, 
  Code2,
  Download,
  Check,
  AlertCircle,
  Braces,
  Hash,
  Cpu,
  Database,
  Network,
  ZapIcon,
  FileJson,
  Type
} from 'lucide-react';
import CodeAnalyzer from './CodeAnalyzer';

const escapeHtml = (unsafe) => {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const highlightCodeSafely = (code, language) => {
  if (!code) return '';
  
  try {
    const escapedCode = escapeHtml(code);
    const result = hljs.highlight(escapedCode, { 
      language: language || 'plaintext',
      ignoreIllegals: true 
    });
    
    return result.value;
  } catch (error) {
    console.warn('Highlight.js error:', error);
    return escapeHtml(code);
  }
};

const CodeGenerator = ({ addToHistory }) => {
  const [formData, setFormData] = useState({
    language: 'python',
    devType: 'function',
    // complexity: 'medium',
    prompt: '',
    // testInput: '',
    // expectedOutput: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [progress, setProgress] = useState(0);
  const [isStreaming, setIsStreaming] = useState(false);
  const [highlightedCode, setHighlightedCode] = useState('');
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const eventSourceRef = useRef(null);
  const tokenCountRef = useRef(0);
  const codeContainerRef = useRef(null);

  const languages = [
    { value: 'python', label: '🐍 Python', color: 'text-green-400' },
    { value: 'javascript', label: '🟨 JavaScript', color: 'text-yellow-400' },
    { value: 'java', label: '☕ Java', color: 'text-red-400' },
    // { value: 'cpp', label: '⚙️ C++', color: 'text-blue-400' },
    // { value: 'php', label: '🐘 PHP', color: 'text-purple-400' },
    // { value: 'ruby', label: '💎 Ruby', color: 'text-pink-400' },
    // { value: 'go', label: '🐹 Go', color: 'text-cyan-400' }
  ];

  const devTypes = [
    { value: 'function', label: '⚡ Function', color: 'text-yellow-400' },
    { value: 'api', label: '🔌 API', color: 'text-green-400' },
    { value: 'database', label: '🗄️ Database', color: 'text-blue-400' },
    { value: 'algorithm', label: '🧠 Algorithm', color: 'text-purple-400' },
    // { value: 'utility', label: '🛠️ Utility', color: 'text-orange-400' }
  ];

  // const complexities = [
  //   { value: 'simple', label: '📗 Simple', color: 'text-green-400' },
  //   { value: 'medium', label: '📘 Medium', color: 'text-blue-400' },
  //   { value: 'complex', label: '📕 Complex', color: 'text-red-400' }
  // ];

  // Memoize the highlight function to prevent unnecessary re-renders
  const updateHighlightedCode = useCallback((code, language) => {
    if (code && code.trim()) {
      const highlighted = highlightCodeSafely(code, language);
      setHighlightedCode(highlighted);
    } else {
      setHighlightedCode('');
    }
  }, []);

  // Update highlighted code when language changes or when streaming completes
  useEffect(() => {
    if (generatedCode && !isStreaming) {
      updateHighlightedCode(generatedCode, formData.language);
    }
  }, [generatedCode, formData.language, isStreaming, updateHighlightedCode]);

  // Update highlighted code during streaming with a debounce
  useEffect(() => {
    if (!isStreaming || !generatedCode) return;

    const timeoutId = setTimeout(() => {
      updateHighlightedCode(generatedCode, formData.language);
    }, 500); // Debounce to avoid excessive updates during streaming

    return () => clearTimeout(timeoutId);
  }, [generatedCode, formData.language, isStreaming, updateHighlightedCode]);

  const loadExample = () => {
    setFormData({
      language: 'python',
      devType: 'algorithm',
      complexity: 'complex',
      prompt: 'sum of 2 numbers. Write a Python function that takes a list of integers and returns the list sorted in ascending order using the quicksort algorithm.',
      // testInput: ' {"numbers": [34567, 12345, 67890, 23456, 78901, 45678, 89012, 56789, 90123, 34568, 12346, 67891, 23457, 78902, 45679, 89013, 56780, 90124, 34569, 12347, 67892, 23458, 78903, 45680, 89014, 56781, 90125, 34570, 12348, 67893, 23459, 78904, 45681, 89015, 56782, 90126, 34571, 12349, 67894, 23460, 78905, 45682, 89016, 56783, 90127, 34572, 12350, 67895]}',
      // expectedOutput: '  [12345, 12346, 12347, 12348, 12349, 12350, 23456, 23457, 23458, 23459, 23460, 34567, 34568, 34569, 34570, 34571, 34572, 45678, 45679, 45680, 45681, 45682, 56789, 56780, 56781, 56782, 56783, 67890, 67891, 67892, 67893, 67894, 67895, 78901, 78902, 78903, 78904, 78905, 89012, 89013, 89014, 89015, 89016, 90123, 90124, 90125, 90126, 90127]'
    });
  };

  const clearAll = () => {
    setFormData({
      ...formData,
      prompt: '',
      // testInput: '',
      // expectedOutput: ''
    });
    setGeneratedCode('');
    setHighlightedCode('');
    setProgress(0);
    tokenCountRef.current = 0;
    setIsGenerating(false);
    setIsStreaming(false);
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setShowCopySuccess(true);
      setTimeout(() => setShowCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.prompt.trim()) {
      alert('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    setIsStreaming(true);
    setGeneratedCode('');
    setHighlightedCode('');
    setProgress(0);
    tokenCountRef.current = 0;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const params = new URLSearchParams({
      language: formData.language,
      devType: formData.devType,
      prompt: formData.prompt,
      complexity: formData.complexity
    });

    eventSourceRef.current = new EventSource(`/api/stream-generate?${params}`);

    eventSourceRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'token':
          setGeneratedCode(prev => {
            const newCode = prev + data.token;
            // Update highlighted code periodically during streaming
            if (tokenCountRef.current % 10 === 0) { // Update every 10 tokens
              setTimeout(() => {
                updateHighlightedCode(newCode, formData.language);
              }, 0);
            }
            return newCode;
          });
          setProgress(data.progress);
          tokenCountRef.current++;
          break;
        
        case 'complete':
          setIsGenerating(false);
          setIsStreaming(false);
          setProgress(100);
          if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
          }
          // Final highlight update
          updateHighlightedCode(generatedCode, formData.language);
          addToHistory({
            timestamp: new Date().toISOString(),
            language: formData.language,
            prompt: formData.prompt,
            code: generatedCode,
            metrics: null
          });
          break;
        
        case 'error':
          alert(`Error: ${data.message}`);
          setIsGenerating(false);
          setIsStreaming(false);
          if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
          }
          break;
      }
    };

    eventSourceRef.current.onerror = () => {
      console.error('EventSource failed');
      setIsGenerating(false);
      setIsStreaming(false);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  };

  return (
    <div className="space-y-10">
      <div className="glass-panel rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 bg-linear-to-br from-primary to-accent rounded-lg">
            <Terminal className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-text-primary" >Generate Code</h2>
            <p className="text-text-secondary text-sm">Describe what you need, AI will build it</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
                <Code2 className="w-4 h-4 text-primary" />
                Language
              </label>
              <select
                value={formData.language}
                onChange={(e) => setFormData({...formData, language: e.target.value})}
                className="select-field"
                required
              >
                {languages.map(lang => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
                <Hash className="w-4 h-4 text-green-400" />
                Type
              </label>
              <select
                value={formData.devType}
                onChange={(e) => setFormData({...formData, devType: e.target.value})}
                className="select-field"
                required
              >
                {devTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* <div className="space-y-3">
              <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-400" />
                Complexity
              </label>
              <select
                value={formData.complexity}
                onChange={(e) => setFormData({...formData, complexity: e.target.value})}
                className="select-field"
              >
                {complexities.map(comp => (
                  <option key={comp.value} value={comp.value}>
                    {comp.label}
                  </option>
                ))}
              </select>
            </div> */}
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Description / Prompt
            </label>
            <div className="relative">
              <textarea
                value={formData.prompt}
                onChange={(e) => setFormData({...formData, prompt: e.target.value})}
                rows="3"
                className="textarea-field"
                placeholder="Describe what code you want to generate. Be specific about requirements, inputs, and expected behavior..."
                required
              />
            </div>
          </div>
{/* 
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
                <Braces className="w-4 h-4 text-green-400" />
                Test Input (JSON)
              </label>
              <textarea
                value={formData.testInput}
                onChange={(e) => setFormData({...formData, testInput: e.target.value})}
                rows="2"
                className="textarea-field"
                placeholder='{"numbers": [1, 2, 3, 4, 5]}'
              />
              <p className="text-xs text-text-muted">Provide test data for real-time analysis</p>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
                <FileJson className="w-4 h-4 text-blue-400" />
                Expected Output
              </label>
              <input
                type="text"
                value={formData.expectedOutput}
                onChange={(e) => setFormData({...formData, expectedOutput: e.target.value})}
                className="input-field"
                placeholder="15 (for sum example)"
              />
              <p className="text-xs text-text-muted">Helps calculate accuracy more precisely</p>
            </div>
          </div> */}

          <div className="flex flex-wrap gap-3 pt-6">
            <button
              type="submit"
              disabled={isGenerating}
              className="btn-primary flex items-center gap-3"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Generate Code</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={loadExample}
              className="btn-secondary flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Load Example
            </button>

            <button
              type="button"
              onClick={clearAll}
              className="btn-secondary flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          </div>
        </form>
      </div>

      {isGenerating && (
        <div className="glass-subtle rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Sparkles className="w-4 h-4 text-primary animate-pulse-subtle" />
              </div>
              <div>
                <p className="font-medium text-text">Generating code...</p>
                <p className="text-xs text-text-muted mt-0.5">Streaming tokens from AI</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">{Math.round(progress)}%</p>
              <p className="text-xs text-text-muted mt-0.5">{tokenCountRef.current} tokens</p>
            </div>
          </div>
          <div className="progress-track">
            <div 
              className="progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {generatedCode && (
        <div className="elevation-2 rounded-2xl overflow-hidden">
          <div className="border-b border-border-light">
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-linear-to-br from-primary to-accent rounded-lg shadow-lg">
                  <Code2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary">Generated Code</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="badge-primary">{formData.language.toUpperCase()}</span>
                    <span className="text-xs text-text-muted">{tokenCountRef.current} tokens</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyToClipboard}
                  className="btn-secondary flex items-center gap-2 relative"
                >
                  {showCopySuccess ? (
                    <>
                      <Check className="w-4 h-4 text-success" />
                      <span className="text-success">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
                <button
                  className="btn-secondary flex items-center gap-2"
                  onClick={() => {
                    const blob = new Blob([generatedCode], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `generated_code.${formData.language}`;
                    a.click();
                  }}
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute top-4 right-4 z-20">
              <div className="glass-subtle px-3 py-1.5 rounded-lg">
                <span className="text-xs font-medium text-green-600">Live streaming</span>
              </div>
            </div>
            
            <div className="code-scroll-container">
              <div className="scroll-indicator"></div>
              <pre className="code-block p-5">
                <div 
                  ref={codeContainerRef}
                  id="generated-code"
                  className={`language-${formData.language}`}
                  style={{ counterReset: 'line' }}
                  dangerouslySetInnerHTML={{
                    __html: highlightedCode + (isStreaming ? '<span class="stream-cursor"></span>' : '')
                  }}
                />
              </pre>
            </div>
            
            <div className="absolute bottom-4 right-4 z-20">
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <span>{generatedCode.split('\n').length} lines</span>
                <span>•</span>
                <span>{generatedCode.length} characters</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {generatedCode && (
        <CodeAnalyzer 
          generatedCode={generatedCode}
          language={formData.language}
          prompt={formData.prompt}
          testInput={formData.testInput}
          expectedOutput={formData.expectedOutput}
          onAnalysisComplete={(metrics) => {
            addToHistory({
              timestamp: new Date().toISOString(),
              language: formData.language,
              prompt: formData.prompt,
              code: generatedCode,
              metrics: metrics
            });
          }}
        />
      )}
    </div>
  );
};

export default CodeGenerator;