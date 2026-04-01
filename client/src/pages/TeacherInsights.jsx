import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  TrendingUp, 
  Lightbulb, 
  Users, 
  BookOpen, 
  AlertTriangle,
  ChevronRight,
  Sparkles,
  BarChart3
} from 'lucide-react';

const TeacherInsights = () => {
  const { user } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ materialCount: 0, studentCount: 0, totalAttempts: 0 });

  useEffect(() => {
    fetchMaterials();
    fetchOverallStats();
  }, []);

  const fetchMaterials = async () => {
    try {
      const res = await axios.get('/api/materials');
      setMaterials(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOverallStats = async () => {
    try {
      const res = await axios.get('/api/insights/stats/all');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchInsights = async (materialId) => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/insights/${materialId}`);
      setInsights(res.data.insights);
      setSelectedMaterial(materials.find(m => m._id === materialId));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'teacher') return <DashboardLayout><h1>Access Denied</h1></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="section-header">
        <TrendingUp size={32} color="#6366f1" />
        <div>
          <h1>Teacher Insights</h1>
          <p>AI-driven analysis of student readiness and conceptual gaps</p>
        </div>
      </div>

      {/* Global Stats Overview */}
      <div className="global-stats">
        <div className="stat-pill">
           <BookOpen size={18} />
           <span>{stats.materialCount} Materials</span>
        </div>
        <div className="stat-pill">
           <Users size={18} />
           <span>{stats.studentCount} Students Active</span>
        </div>
        <div className="stat-pill">
           <BarChart3 size={18} />
           <span>{stats.totalAttempts} Quiz/Card Attempts</span>
        </div>
      </div>

      <div className="insights-container">
        {!selectedMaterial ? (
          <div className="selection-area card">
            <h2>Select a material to analyze</h2>
            <div className="material-list">
              {materials.map(m => (
                <div key={m._id} className="list-item clickable" onClick={() => fetchInsights(m._id)}>
                  <BookOpen size={20} color="#64748b" />
                  <span>{m.title}</span>
                  <ChevronRight size={18} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="analysis-view animate-fade-in">
            <div className="view-header">
               <button className="btn-back" onClick={() => setSelectedMaterial(null)}>Back to Overview</button>
               <h2>Analysis for: {selectedMaterial.title}</h2>
            </div>

            {loading ? (
              <div className="loading-insights">
                <Sparkles className="spinning" size={32} color="#8b5cf6" />
                <p>AI is analyzing student responses...</p>
              </div>
            ) : insights.length > 0 ? (
              <div className="insights-grid">
                <div className="insight-summary card alert-card">
                   <div className="alert-icon">
                     <AlertTriangle size={32} />
                   </div>
                   <div className="alert-text">
                     <h3>Focus Required</h3>
                     <p>AI has identified <strong>{insights.length}</strong> concepts where students are underperforming. Consider reteaching these topics.</p>
                   </div>
                </div>

                {insights.map((insight, idx) => (
                  <div key={idx} className="insight-card card">
                    <div className="insight-header">
                      <div className="concept-tag">{insight.concept}</div>
                      <div className="error-rate">Error Rate: {insight.errorRate}%</div>
                    </div>
                    <div className="insight-body">
                      <div className="suggestion-label">
                        <Lightbulb size={18} />
                        <span>AI Reteaching Suggestion:</span>
                      </div>
                      <p>{insight.suggestion}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-insights card">
                <h3>No data yet</h3>
                <p>Once students start using flashcards or taking mock tests for this material, AI analysis will appear here.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .section-header { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; }
        
        .global-stats { display: flex; gap: 16px; margin-bottom: 40px; }
        .stat-pill {
           background: white;
           padding: 10px 20px;
           border-radius: 30px;
           display: flex;
           align-items: center;
           gap: 10px;
           font-weight: 600;
           font-size: 14px;
           color: var(--text-main);
           box-shadow: var(--shadow-sm);
           border: 1px solid var(--border);
        }
        
        .selection-area h2 { font-size: 18px; margin-bottom: 24px; }
        .material-list { display: grid; gap: 12px; }
        .list-item {
           display: flex;
           align-items: center;
           gap: 16px;
           padding: 16px;
           border-radius: var(--radius-md);
           border: 1px solid var(--border);
           background: var(--bg-card);
           transition: var(--transition);
        }
        .list-item:hover { border-color: var(--primary); transform: translateX(4px); }
        .list-item span { flex: 1; font-weight: 600; color: var(--text-main); }
        
        .view-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
        .btn-back { background: transparent; color: var(--text-muted); font-weight: 600; }
        
        .loading-insights { text-align: center; padding: 60px; color: var(--primary); }
        .spinning { animation: spin 2s linear infinite; margin-bottom: 16px; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        .insights-grid { display: grid; gap: 24px; }
        .alert-card {
           display: flex;
           align-items: center;
           gap: 24px;
           background: #fffbeb;
           border: 1px solid #fde68a;
           padding: 32px;
        }
        .alert-icon {
           background: #f59e0b;
           color: white;
           padding: 16px;
           border-radius: 16px;
        }
        .alert-text h3 { color: #92400e; margin-bottom: 4px; }
        .alert-text p { color: #92400e; opacity: 0.8; }
        
        .insight-card { padding: 32px; }
        .insight-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; border-bottom: 1px solid var(--border); padding-bottom: 16px; }
        .concept-tag { background: var(--primary-light); color: var(--primary); padding: 6px 14px; border-radius: 8px; font-weight: 700; font-size: 14px; }
        .error-rate { color: var(--error); font-weight: 800; font-size: 14px; }
        
        .suggestion-label { display: flex; align-items: center; gap: 8px; color: var(--success); font-weight: 700; font-size: 14px; margin-bottom: 12px; }
        .insight-body p { color: var(--text-main); line-height: 1.6; font-size: 16px; }
        
        .empty-insights { text-align: center; padding: 60px; }
      `}</style>
    </DashboardLayout>
  );
};

export default TeacherInsights;
