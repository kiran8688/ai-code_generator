// HistoryPanel.jsx
import React from 'react';
import { 
  Calendar, 
  Code2, 
  Trash2, 
  ArrowRight, 
  Clock, 
  FileCode, 
  Sparkles, 
  ExternalLink,
  FileText,
  Zap,
  CheckCircle,
  AlertCircle,
  Download,
  Eye
} from 'lucide-react';

const HistoryPanel = ({ history, clearHistory }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today, ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday, ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    }
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 90) return 'text-success';
    if (accuracy >= 75) return 'text-warning';
    return 'text-error';
  };

  const getAccuracyBadge = (accuracy) => {
    if (accuracy >= 90) return 'bg-success/10 text-success border-success/20';
    if (accuracy >= 75) return 'bg-warning/10 text-warning border-warning/20';
    return 'bg-error/10 text-error border-error/20';
  };

  const loadHistoryItem = (item) => {
    console.log('Load history item:', item);
    alert('History load functionality would be implemented here');
  };

  if (history.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="inline-flex p-6 bg-surface-elevated rounded-2xl mb-6">
          <Code2 className="w-12 h-12 text-text-muted" />
        </div>
        <h3 className="text-2xl font-semibold text-text-primary mb-3">No History Yet</h3>
        <p className="text-text-secondary max-w-md mx-auto">
          Generated code will appear here. Start by creating your first code generation.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-linear-to-br from-primary to-accent rounded-lg">
              <FileCode className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-text-primary">Generation History</h3>
          </div>
          <p className="text-text-secondary">{history.length} generated items</p>
        </div>
        <button
          onClick={clearHistory}
          className="btn-secondary flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Clear All
        </button>
      </div>

      <div className="space-y-4">
        {history.slice().reverse().map((item, index) => (
          <div
            key={index}
            onClick={() => loadHistoryItem(item)}
            className="group glass-subtle rounded-2xl p-6 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 cursor-pointer"
          >
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-4">
                  <span className="badge-primary flex items-center gap-2">
                    <Code2 className="w-3 h-3" />
                    {item.language.toUpperCase()}
                  </span>
                  {item.metrics && (
                    <span className={`badge ${getAccuracyBadge(item.metrics.accuracy)} flex items-center gap-2`}>
                      {item.metrics.accuracy >= 90 ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : item.metrics.accuracy >= 75 ? (
                        <AlertCircle className="w-3 h-3" />
                      ) : (
                        <AlertCircle className="w-3 h-3" />
                      )}
                      {item.metrics.accuracy}% accuracy
                    </span>
                  )}
                  <span className="text-xs text-text-muted bg-surface-elevated px-2 py-1 rounded flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    {item.code.length} chars
                  </span>
                </div>
                
                <p className="text-text-primary font-medium mb-3 line-clamp-2">
                  {item.prompt}
                </p>
                
                <div className="flex items-center gap-4 text-sm text-text-secondary">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {formatDate(item.timestamp)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {Math.ceil(item.code.length / 50)}s read
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="btn-ghost flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="btn-ghost flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500">
                  <Download className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-surface-elevated rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-500">
                  <ArrowRight className="w-5 h-5 text-text-muted" />
                </button>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-border-light/50">
              <div className="flex items-center gap-2 mb-3">
                <Code2 className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-text-secondary">Code Preview</span>
              </div>
              <div className="max-h-25 overflow-y-auto bg-surface-elevated rounded-lg border border-border-light/30">
                <pre className="text-sm text-text-secondary font-mono px-4 py-3">
                  <code className="line-clamp-3">
                    {item.code.substring(0, 180)}
                    {item.code.length > 180 ? '...' : ''}
                  </code>
                </pre>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryPanel;