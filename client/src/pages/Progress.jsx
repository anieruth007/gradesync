import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { BarChart2, BookOpen, CheckCircle2, XCircle, Sparkles, FileText, Layers } from 'lucide-react';

const MetricRow = ({ icon, label, correct, total, score, color }) => (
  <div className="metric-block">
    <div className="metric-header">
      <span className="metric-icon" style={{ color }}>{icon}</span>
      <span className="metric-label">{label}</span>
      {total > 0 ? (
        <span className="metric-stat">
          {correct}/{total} correct &nbsp;·&nbsp; <strong style={{ color }}>{score}%</strong>
        </span>
      ) : (
        <span className="metric-stat muted">No attempts yet</span>
      )}
    </div>
    <div className="bar-track">
      <div
        className="bar-fill"
        style={{ width: total > 0 ? `${score}%` : '0%', background: color }}
      />
    </div>
  </div>
);

const Progress = () => {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/progress')
      .then(res => setData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (user?.role !== 'student') {
    return <DashboardLayout><h1>Access Denied</h1></DashboardLayout>;
  }

  const totalQuizAttempts  = data.reduce((s, d) => s + d.quiz.total, 0);
  const totalFlashAttempts = data.reduce((s, d) => s + d.flashcard.total, 0);
  const totalCorrect  = data.reduce((s, d) => s + d.quiz.correct + d.flashcard.correct, 0);
  const totalAttempts = totalQuizAttempts + totalFlashAttempts;
  const overallScore  = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : null;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="section-header">
          <BarChart2 size={32} color="#6366f1" />
          <div><h1>My Progress</h1><p>Loading your stats...</p></div>
        </div>
        <div className="skeleton-grid">
          {[1, 2, 3].map(i => <div key={i} className="skeleton-card" />)}
        </div>
        <style>{skeletonCss}</style>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="section-header">
        <BarChart2 size={32} color="#6366f1" />
        <div>
          <h1>My Progress</h1>
          <p>Track your quiz scores and flashcard accuracy per material</p>
        </div>
      </div>

      {/* Overview pills */}
      <div className="overview-row">
        <div className="stat-pill">
          <FileText size={20} color="#6366f1" />
          <div>
            <span className="pill-value">{totalQuizAttempts}</span>
            <span className="pill-label">Quiz Answers</span>
          </div>
        </div>
        <div className="stat-pill">
          <Layers size={20} color="#8b5cf6" />
          <div>
            <span className="pill-value">{totalFlashAttempts}</span>
            <span className="pill-label">Flashcards Done</span>
          </div>
        </div>
        <div className="stat-pill">
          <CheckCircle2 size={20} color="#10b981" />
          <div>
            <span className="pill-value">{overallScore !== null ? `${overallScore}%` : '—'}</span>
            <span className="pill-label">Overall Accuracy</span>
          </div>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="empty-state card">
          <Sparkles size={48} color="#8b5cf6" />
          <h3>No activity yet</h3>
          <p>Complete flashcards or mock tests to start tracking your progress here.</p>
        </div>
      ) : (
        <div className="progress-list">
          {data.map(item => {
            const total   = item.quiz.total + item.flashcard.total;
            const correct = item.quiz.correct + item.flashcard.correct;
            const pct     = total > 0 ? Math.round((correct / total) * 100) : 0;
            const badgeColor = pct >= 80 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#e11d48';
            const badgeText  = pct >= 80 ? 'Excellent!' : pct >= 50 ? 'Keep going!' : 'Needs review';

            return (
              <div key={item.materialId} className="progress-card card">
                {/* Card header */}
                <div className="card-top">
                  <div className="card-icon">
                    <BookOpen size={22} color="#6366f1" />
                  </div>
                  <div className="card-title-block">
                    <h3>{item.title}</h3>
                    <span className="last-attempt">
                      Last activity: {new Date(item.lastAttempt).toLocaleDateString()}
                    </span>
                  </div>
                  {total > 0 && (
                    <div
                      className="overall-badge"
                      style={{ background: `${badgeColor}18`, borderColor: `${badgeColor}40`, color: badgeColor }}
                    >
                      {pct >= 50 ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                      {pct}% — {badgeText}
                    </div>
                  )}
                </div>

                {/* Metric rows */}
                <div className="metrics">
                  <MetricRow
                    icon={<FileText size={14} />}
                    label="Quiz"
                    correct={item.quiz.correct}
                    total={item.quiz.total}
                    score={item.quiz.score ?? 0}
                    color="#6366f1"
                  />
                  <MetricRow
                    icon={<Layers size={14} />}
                    label="Flashcards"
                    correct={item.flashcard.correct}
                    total={item.flashcard.total}
                    score={item.flashcard.score ?? 0}
                    color="#8b5cf6"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .section-header { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; }
        .section-header h1 { font-size: 28px; margin: 0 0 4px; }
        .section-header p  { color: var(--text-muted); margin: 0; font-size: 15px; }

        .overview-row { display: flex; gap: 16px; margin-bottom: 40px; flex-wrap: wrap; }
        .stat-pill {
          display: flex; align-items: center; gap: 14px;
          background: var(--bg-card); border: 1px solid var(--border);
          border-radius: var(--radius-lg); padding: 16px 24px;
          flex: 1; min-width: 150px; box-shadow: var(--shadow-sm);
        }
        .stat-pill > div { display: flex; flex-direction: column; gap: 2px; }
        .pill-value { font-size: 24px; font-weight: 800; color: var(--text-main); }
        .pill-label { font-size: 11px; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }

        .progress-list { display: flex; flex-direction: column; gap: 20px; }

        .progress-card { padding: 24px 28px; }

        .card-top {
          display: flex; align-items: center; gap: 14px; margin-bottom: 20px;
        }
        .card-icon {
          background: var(--primary-light); padding: 10px;
          border-radius: 12px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .card-title-block { flex: 1; min-width: 0; }
        .card-title-block h3 { font-size: 17px; margin: 0 0 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .last-attempt { font-size: 12px; color: var(--text-muted); }

        .overall-badge {
          display: inline-flex; align-items: center; gap: 5px; flex-shrink: 0;
          padding: 5px 12px; border-radius: 99px; border: 1px solid;
          font-size: 12px; font-weight: 700; white-space: nowrap;
        }

        .metrics { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        @media (max-width: 580px) { .metrics { grid-template-columns: 1fr; } }

        .metric-block { display: flex; flex-direction: column; gap: 8px; }

        .metric-header {
          display: flex; align-items: center; gap: 6px;
          font-size: 13px; font-weight: 600; color: var(--text-muted);
        }
        .metric-icon { display: flex; align-items: center; flex-shrink: 0; }
        .metric-label { flex: 1; }
        .metric-stat { font-size: 12px; color: var(--text-muted); white-space: nowrap; }
        .metric-stat.muted { font-style: italic; }

        .bar-track {
          height: 8px; background: var(--bg-main);
          border-radius: 99px; overflow: hidden;
        }
        .bar-fill {
          height: 100%; border-radius: 99px;
          transition: width 0.6s cubic-bezier(.4,0,.2,1);
        }

        .empty-state {
          text-align: center; padding: 64px 32px;
          display: flex; flex-direction: column; align-items: center; gap: 16px;
        }
        .empty-state h3 { font-size: 22px; }
        .empty-state p  { color: var(--text-muted); }

        ${skeletonCss}
      `}</style>
    </DashboardLayout>
  );
};

const skeletonCss = `
  .skeleton-grid { display: flex; flex-direction: column; gap: 16px; }
  .skeleton-card {
    height: 160px; border-radius: var(--radius-lg);
    background: linear-gradient(90deg, var(--bg-card) 25%, var(--bg-main) 50%, var(--bg-card) 75%);
    background-size: 200% 100%; animation: shimmer 1.4s infinite;
  }
  @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
`;

export default Progress;
