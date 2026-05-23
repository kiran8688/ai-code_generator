// CodeAnalyzer.jsx
import React, { useState } from 'react';
import { 
  BarChart3, 
  AlertTriangle, 
  Lightbulb, 
  Search, 
  CheckCircle2, 
  Gauge, 
  Target, 
  Shield, 
  TrendingUp,
  Zap,
  Cpu,
  GitBranch,
  Code2,
  ShieldCheck,
  Rocket,
  Sparkles
} from 'lucide-react';
import axios from 'axios';

const CodeAnalyzer = ({ generatedCode, language, prompt, testInput, expectedOutput, onAnalysisComplete }) => {
  const [metrics, setMetrics] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  const analyzeCode = async () => {
    if (!generatedCode || generatedCode.trim() === '') {
      setError('No code to analyze!');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await axios.post('/api/analyze-code', {
        code: generatedCode,
        prompt: prompt || '',
        testInput: testInput || 'N/A',
        expectedOutput: expectedOutput || 'N/A',
        language: language || 'python'
      });

      if (response.data.success) {
        const analysisMetrics = response.data.metrics;
        setMetrics(analysisMetrics);
        
        if (onAnalysisComplete) {
          onAnalysisComplete(analysisMetrics);
        }
      } else {
        setError('Analysis failed: ' + response.data.error);
        setMetrics(null);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      setError('Error analyzing code: ' + (error.message || 'Unknown error'));
      setMetrics(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 90) return 'text-success';
    if (accuracy >= 75) return 'text-warning';
    return 'text-error';
  };

  const getAccuracyBg = (accuracy) => {
    if (accuracy >= 90) return 'bg-success/10';
    if (accuracy >= 75) return 'bg-warning/10';
    return 'bg-error/10';
  };

  if (!metrics && !isAnalyzing && !error) {
    return (
      <div className="elevation-2 rounded-2xl p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-linear-to-br from-primary to-accent rounded-xl shadow-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-text-primary">Code Analysis</h3>
              <p className="text-text-secondary">Check quality, accuracy, and efficiency</p>
            </div>
          </div>
          <button
            onClick={analyzeCode}
            className="btn-primary flex items-center gap-3 disabled:opacity-50"
            disabled={!generatedCode || isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Analyze Code</span>
              </>
            )}
          </button>
        </div>
        <div className="text-center py-12">
          <div className="inline-flex p-6 bg-surface-elevated rounded-2xl mb-6">
            <BarChart3 className="w-12 h-12 text-text-muted" />
          </div>
          <p className="text-text-secondary max-w-md mx-auto">
            Run analysis to get detailed insights on code quality, accuracy metrics, and optimization suggestions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="elevation-2 rounded-2xl p-8">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-linear-to-br from-primary to-accent rounded-xl shadow-lg">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-text-primary">Analysis Results</h3>
            <p className="text-text-secondary">Real-time quality metrics</p>
          </div>
        </div>
        <button
          onClick={analyzeCode}
          className="btn-secondary flex items-center gap-2 text-sm disabled:opacity-50"
          disabled={!generatedCode || isAnalyzing}
        >
          {isAnalyzing ? (
            <>
              <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-primary border-t-transparent"></div>
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>Re-analyze</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-8 bg-error/10 border border-error/20 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-error shrink-0" />
            <div>
              <p className="font-medium text-text">Analysis Error</p>
              <p className="text-sm text-text-secondary mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {isAnalyzing && (
        <div className="text-center py-16">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
            <div className="relative animate-spin rounded-full h-16 w-16 border-[3px] border-primary border-t-transparent"></div>
          </div>
          <p className="text-text-secondary">Analyzing code quality, accuracy, and efficiency...</p>
        </div>
      )}

      {metrics && !isAnalyzing && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="metric-card">
              <div className={`p-3 rounded-xl ${getAccuracyBg(metrics.accuracy)} w-fit mb-4`}>
                <Target className={`w-6 h-6 ${getAccuracyColor(metrics.accuracy)}`} />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-text-secondary">Accuracy</p>
                <p className={`text-3xl font-bold ${getAccuracyColor(metrics.accuracy)}`}>
                  {typeof metrics.accuracy === 'number' ? metrics.accuracy : 0}%
                </p>
                <div className="progress-track">
                  <div 
                    className="progress-fill"
                    style={{ width: `${metrics.accuracy || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="metric-card">
              <div className="p-3 rounded-xl bg-primary/10 w-fit mb-4">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-text-secondary">Coverage</p>
                <p className="text-3xl font-bold text-text">
                  {typeof metrics.coverage === 'string' ? metrics.coverage : '0%'}
                </p>
                <div className="progress-track">
                  <div 
                    className="progress-fill"
                    style={{ width: `${parseInt(metrics.coverage) || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="metric-card">
              <div className="p-3 rounded-xl bg-accent/10 w-fit mb-4">
                <CheckCircle2 className="w-6 h-6 text-accent" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-text-secondary">Completeness</p>
                <p className="text-3xl font-bold text-text">
                  {typeof metrics.completeness === 'string' ? metrics.completeness : '0%'}
                </p>
                <div className="progress-track">
                  <div 
                    className="progress-fill"
                    style={{ width: `${parseInt(metrics.completeness) || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="metric-card">
              <div className="p-3 rounded-xl bg-warning/10 w-fit mb-4">
                <Rocket className="w-6 h-6 text-warning" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-text-secondary">Efficiency</p>
                <p className="text-3xl font-bold text-text">
                  {typeof metrics.efficiency === 'number' ? metrics.efficiency : 0}/10
                </p>
                <div className="progress-track">
                  <div 
                    className="progress-fill"
                    style={{ width: `${(metrics.efficiency || 0) * 10}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {metrics.issues && Array.isArray(metrics.issues) && metrics.issues.length > 0 && (
              <div className="glass-subtle rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-error/10 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-error" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-text-primary">Issues Found</h4>
                    <p className="text-sm text-text-secondary">Potential problems in the code</p>
                  </div>
                  <span className="ml-auto badge-error">{metrics.issues.length} issues</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {metrics.issues.map((issue, index) => (
                    <span key={index} className="tag-error">{issue}</span>
                  ))}
                </div>
              </div>
            )}

            {metrics.suggestions && Array.isArray(metrics.suggestions) && metrics.suggestions.length > 0 && (
              <div className="glass-subtle rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-success/10 rounded-lg">
                    <Lightbulb className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-text-primary">Optimization Suggestions</h4>
                    <p className="text-sm text-text-secondary">Ways to improve the code</p>
                  </div>
                  <span className="ml-auto badge-success">{metrics.suggestions.length} suggestions</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {metrics.suggestions.map((suggestion, index) => (
                    <span key={index} className="tag-success">{suggestion}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {(!metrics.issues || !Array.isArray(metrics.issues) || metrics.issues.length === 0) &&
           (!metrics.suggestions || !Array.isArray(metrics.suggestions) || metrics.suggestions.length === 0) && (
            <div className="glass-subtle rounded-xl p-8 text-center">
              <div className="inline-flex p-4 bg-success/10 rounded-2xl mb-4">
                <CheckCircle2 className="w-8 h-8 text-success" />
              </div>
              <p className="text-text-primary font-medium">Code Analysis Complete</p>
              <p className="text-text-secondary text-sm mt-2">No specific issues or optimization suggestions identified.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CodeAnalyzer;