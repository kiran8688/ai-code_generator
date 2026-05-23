// App.jsx
import React, { useState, useEffect } from 'react';
import CodeGenerator from './Components/codeGenerator';
import HistoryPanel from './components/HistoryPanel.jsx';
import { 
  Computer, 
  History, 
  Cloud, 
  Sparkles, 
  Bolt,
  Code,
  Terminal
} from 'lucide-react';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:5000';

function App() {
  const [activeTab, setActiveTab] = useState('generate');
  const [apiStatus, setApiStatus] = useState({ status: 'checking', apiKeyConfigured: false });
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('generationHistory');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await axios.get('/api/health');
        const data = response.data;
        
        setApiStatus({
          status: data.status,
          apiKeyConfigured: data.api_key_configured,
          openaiApiWorking: data.openai_api_working,
          openaiApiStatus: data.openai_api_status,
          openaiError: data.openai_error,
          apiResponseTime: data.api_response_time_ms,
          timestamp: new Date(data.timestamp * 1000).toLocaleTimeString(),
          serverTime: data.server_time
        });
        
        // console.log('API Health Status:', {
        //   configured: data.api_key_configured,
        //   working: data.openai_api_working,
        //   status: data.openai_api_status,
        //   responseTime: data.api_response_time_ms
        // });
        
      } catch (error) {
        console.error('API Health check failed:', error);
        setApiStatus({ 
          status: 'error', 
          apiKeyConfigured: false,
          openaiApiWorking: false,
          openaiApiStatus: 'connection_failed',
          openaiError: error.message,
          message: 'Cannot connect to backend server'
        });
      }
    };

    checkHealth();
    const intervalId = setInterval(checkHealth, 30000);
    return () => clearInterval(intervalId);
  }, [apiStatus.status]);

  const addToHistory = (item) => {
    const newHistory = [...history, item];
    setHistory(newHistory);
    localStorage.setItem('generationHistory', JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear all history?')) {
      setHistory([]);
      localStorage.removeItem('generationHistory');
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-surface-subtle/30 to-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-10">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-glow"></div>
                  <div className="relative p-3 bg-linear-to-br from-primary to-accent rounded-xl shadow-2xl">
                    <Computer className="w-7 h-7 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl font-bold tracking-tight text-text-primary">
                    <span className="bg-linear-to-r from-primary via-accent to-orange bg-clip-text text-transparent">
                      Code Studio <i className='font-thin'>// KIRAN KUMAR</i>
                    </span>
                  </h1>
                  <p className="text-text-secondary text-lg mt-2">
                    AI-powered code generation with real-time analysis
                  </p>
                </div>
              </div>
            </div>
            
            <div className=" flex items-center gap-4">
              <div className={`glass-subtle flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ${apiStatus.apiKeyConfigured ? 'hover:border-success/30' : 'hover:border-warning/30'}`}>
                <div className={`p-2 rounded-lg ${apiStatus.apiKeyConfigured ? 'bg-success/20' : 'bg-warning/20'}`}>
                  <Cloud className={`w-4 h-4 ${apiStatus.apiKeyConfigured ? 'text-success' : 'text-warning'}`} />
                </div>
                <div>
                  <p className={`text-sm font-medium ${apiStatus.apiKeyConfigured ? 'text-success' : 'text-warning'}`}>
                    {apiStatus.apiKeyConfigured ? 'API Connected' : 'API Key Required'}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {apiStatus.apiKeyConfigured ? 'Ready to generate' : 'Configure backend'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {!apiStatus.apiKeyConfigured && (
            <div className=" glass-panel rounded-2xl p-5 mb-8">
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-warning/20 rounded-xl">
                  <Sparkles className="w-5 h-5 text-warning" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-text">OpenAI API Setup Required</p>
                    <span className="text-xs text-warning font-medium px-2 py-1 bg-warning/10 rounded">Action Needed</span>
                  </div>
                  <p className="text-text-secondary text-sm">
                    Add your OpenAI API key to the backend/.env file to enable intelligent code generation
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className=" elevation-3 rounded-2xl overflow-hidden">
          <div className="border-b border-border-light">
            <div className="flex px-2">
              <button
                onClick={() => setActiveTab('generate')}
                className={`flex items-center gap-3 px-6 py-4 text-sm font-medium transition-all duration-300 ${activeTab === 'generate' ? 'text-primary' : 'text-text-muted hover:text-text'}`}
              >
                <div className={`p-2 rounded-lg transition-all duration-300 ${activeTab === 'generate' ? 'bg-primary/10' : 'bg-surface-elevated hover:bg-surface-card'}`}>
                  <Terminal className="w-4 h-4" />
                </div>
                <span>Generate</span>
                {activeTab === 'generate' && <div className="ml-2 w-1.5 h-1.5 bg-primary rounded-full animate-pulse-subtle"></div>}
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-3 px-6 py-4 text-sm font-medium transition-all duration-300 ${activeTab === 'history' ? 'text-primary' : 'text-text-muted hover:text-text'}`}
              >
                <div className={`p-2 rounded-lg transition-all duration-300 ${activeTab === 'history' ? 'bg-primary/10' : 'bg-surface-elevated hover:bg-surface-card'}`}>
                  <History className="w-4 h-4" />
                </div>
                <span>History</span>
                {activeTab === 'history' && <div className="ml-2 w-1.5 h-1.5 bg-primary rounded-full animate-pulse-subtle"></div>}
              </button>
            </div>
          </div>

          <div className="p-8">
            {activeTab === 'generate' ? (
              <CodeGenerator addToHistory={addToHistory} />
            ) : (
              <HistoryPanel history={history} clearHistory={clearHistory} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;