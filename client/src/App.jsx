import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import axios from 'axios';
import Login from './pages/Login';
import Register from './pages/Register';
import Materials from './pages/Materials';
import Flashcards from './pages/Flashcards';
import MockTests from './pages/MockTests';
import TeacherInsights from './pages/TeacherInsights';
import Courses from './pages/Courses';
import Settings from './pages/Settings';
import DashboardLayout from './components/DashboardLayout';
import './index.css';
import { BookOpen, Layers, FileText, Megaphone, MessageCircle, Trash2, Send, CheckCircle2, X, ChevronDown, ChevronUp } from 'lucide-react';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState([]);
  const [subject, setSubject] = useState(user?.subject || '');
  const [editingSubject, setEditingSubject] = useState(false);
  const [subjectInput, setSubjectInput] = useState(user?.subject || '');
  const [enrollmentKey, setEnrollmentKey] = useState(user?.enrollmentKey || '');
  const [keyCopied, setKeyCopied] = useState(false);

  // Announcements
  const [announcements, setAnnouncements] = useState([]);
  const [showAnnForm, setShowAnnForm] = useState(false);
  const [annData, setAnnData] = useState({ title: '', content: '' });

  // Queries
  const [queries, setQueries] = useState([]);
  const [enrolledTeachers, setEnrolledTeachers] = useState([]);
  const [showQueryForm, setShowQueryForm] = useState(false);
  const [queryData, setQueryData] = useState({ teacherId: '', subject: '', message: '' });
  const [queryError, setQueryError] = useState('');
  const [expandedQuery, setExpandedQuery] = useState(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    fetchAnnouncements();
    fetchQueries();
    if (user?.role === 'student') fetchEnrolledTeachers();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await axios.get('/api/announcements');
      setAnnouncements(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchQueries = async () => {
    try {
      const res = await axios.get('/api/queries');
      setQueries(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchEnrolledTeachers = async () => {
    try {
      const res = await axios.get('/api/courses');
      setEnrolledTeachers(res.data.filter(c => c.isEnrolled));
    } catch (err) { console.error(err); }
  };

  const handlePostAnnouncement = async () => {
    if (!annData.title.trim() || !annData.content.trim()) return;
    try {
      await axios.post('/api/announcements', annData);
      setAnnData({ title: '', content: '' });
      setShowAnnForm(false);
      fetchAnnouncements();
    } catch (err) { console.error(err); }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await axios.delete(`/api/announcements/${id}`);
      fetchAnnouncements();
    } catch (err) { console.error(err); }
  };

  const handleSubmitQuery = async () => {
    if (!queryData.teacherId) { setQueryError('Please select a teacher.'); return; }
    if (!queryData.subject.trim()) { setQueryError('Please enter a subject.'); return; }
    if (!queryData.message.trim()) { setQueryError('Please enter a message.'); return; }
    try {
      setQueryError('');
      await axios.post('/api/queries', queryData);
      setQueryData({ teacherId: '', subject: '', message: '' });
      setShowQueryForm(false);
      fetchQueries();
    } catch (err) {
      console.error('Query error:', err.response?.status, err.response?.data);
      setQueryError(err.response?.data?.msg || err.message || `Error ${err.response?.status}: Failed to send query.`);
    }
  };

  const handleReply = async (queryId) => {
    if (!replyText.trim()) return;
    try {
      await axios.post(`/api/queries/${queryId}/reply`, { message: replyText });
      setReplyText('');
      fetchQueries();
    } catch (err) { console.error(err); }
  };

  const handleResolve = async (queryId) => {
    try {
      await axios.put(`/api/queries/${queryId}/resolve`);
      fetchQueries();
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (user?.role === 'teacher' && !enrollmentKey) {
      axios.post('/api/courses/regenerate-key')
        .then(res => setEnrollmentKey(res.data.enrollmentKey))
        .catch(err => console.error(err));
    }
  }, [user]);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(enrollmentKey);
    setKeyCopied(true);
    setTimeout(() => setKeyCopied(false), 2000);
  };

  const handleRegenerateKey = async () => {
    if (!window.confirm('Regenerate enrollment key? Students with the old key will no longer be able to enroll.')) return;
    try {
      const res = await axios.post('/api/courses/regenerate-key');
      setEnrollmentKey(res.data.enrollmentKey);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSubject = async () => {
    if (!subjectInput.trim()) return;
    try {
      await axios.put('/api/courses/my-subject', { subject: subjectInput });
      setSubject(subjectInput);
      setEditingSubject(false);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user?.role === 'student') {
      axios.get('/api/courses/stats/student')
        .then(res => {
          const { enrolledCount, totalFlashcards, testsTaken } = res.data;
          setStats([
            { label: 'Enrolled Courses', value: enrolledCount, icon: <BookOpen className="icon" size={24} />, color: '#6366f1' },
            { label: 'Flashcards Available', value: totalFlashcards, icon: <Layers className="icon" size={24} />, color: '#8b5cf6' },
            { label: 'Tests Taken', value: testsTaken, icon: <FileText className="icon" size={24} />, color: '#10b981' },
          ]);
        })
        .catch(() => setStats([]));
    } else if (user?.role === 'teacher') {
      axios.get('/api/insights/stats/all')
        .then(res => {
          const { materialCount, studentCount, totalAttempts } = res.data;
          setStats([
            { label: 'Materials Uploaded', value: materialCount, icon: <BookOpen className="icon" size={24} />, color: '#6366f1' },
            { label: 'Students Enrolled', value: studentCount, icon: <Layers className="icon" size={24} />, color: '#8b5cf6' },
            { label: 'Total Attempts', value: totalAttempts, icon: <FileText className="icon" size={24} />, color: '#10b981' },
          ]);
        })
        .catch(() => setStats([]));
    }
  }, [user]);

  return (
    <DashboardLayout>
      <div className="dashboard-header">
        <h1>Hello, {user?.name.split(' ')[0]}! 👋</h1>
        <p>Here's what's happening with your learning today.</p>
      </div>

      {user?.role === 'teacher' && (
        <>
          <div className="course-name-card card">
            <div className="course-name-info">
              <p className="course-label">Your Course Name (visible to students)</p>
              {editingSubject ? (
                <div className="course-edit-row">
                  <input
                    className="form-input course-input"
                    value={subjectInput}
                    onChange={e => setSubjectInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSaveSubject()}
                    autoFocus
                  />
                  <button className="btn btn-primary btn-sm" onClick={handleSaveSubject}>Save</button>
                  <button className="btn btn-outline btn-sm" onClick={() => { setEditingSubject(false); setSubjectInput(subject); }}>Cancel</button>
                </div>
              ) : (
                <div className="course-edit-row">
                  <span className="course-name-display">{subject || 'No course name set'}</span>
                  <button className="btn btn-outline btn-sm" onClick={() => setEditingSubject(true)}>Edit</button>
                </div>
              )}
            </div>
          </div>

          <div className="enrollment-key-card card">
            <p className="course-label">Enrollment Key — share this with your students</p>
            <div className="key-row">
              <span className="key-display">{enrollmentKey || '——'}</span>
              <button className="btn btn-outline btn-sm" onClick={handleCopyKey}>
                {keyCopied ? 'Copied!' : 'Copy'}
              </button>
              <button className="btn btn-outline btn-sm" onClick={handleRegenerateKey}>
                Regenerate
              </button>
            </div>
          </div>
        </>
      )}

      <div className="stats-grid">
        {stats.map((stat, idx) => (
          <div key={idx} className="stat-card card">
            <div className="stat-icon" style={{ background: `${stat.color}15`, color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-info">
              <h3>{stat.value}</h3>
              <p>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-bottom">
        {/* ── ANNOUNCEMENTS PANEL ── */}
        <div className="panel card">
          <div className="panel-header">
            <div className="panel-title">
              <Megaphone size={20} color="#6366f1" />
              <h2>Announcements</h2>
            </div>
            {user?.role === 'teacher' && (
              <button className="btn btn-primary btn-sm" onClick={() => setShowAnnForm(!showAnnForm)}>
                {showAnnForm ? <X size={16} /> : '+ New'}
              </button>
            )}
          </div>

          {showAnnForm && (
            <div className="ann-form">
              <input
                className="form-input"
                placeholder="Title (e.g. Assignment 3 Due Friday)"
                value={annData.title}
                onChange={e => setAnnData({ ...annData, title: e.target.value })}
              />
              <textarea
                className="form-input ann-textarea"
                placeholder="Write your announcement here..."
                value={annData.content}
                onChange={e => setAnnData({ ...annData, content: e.target.value })}
              />
              <div className="ann-form-actions">
                <button className="btn btn-primary btn-sm" onClick={handlePostAnnouncement}>Post</button>
                <button className="btn btn-outline btn-sm" onClick={() => { setShowAnnForm(false); setAnnData({ title: '', content: '' }); }}>Cancel</button>
              </div>
            </div>
          )}

          <div className="ann-list">
            {announcements.length === 0 ? (
              <div className="panel-empty">No announcements yet.</div>
            ) : announcements.map(a => (
              <div key={a._id} className="ann-item">
                <div className="ann-item-header">
                  <div>
                    <span className="ann-title">{a.title}</span>
                    {user?.role === 'student' && a.teacher && (
                      <span className="ann-teacher">{a.teacher.subject || a.teacher.name}</span>
                    )}
                  </div>
                  <div className="ann-meta">
                    <span className="ann-date">{new Date(a.createdAt).toLocaleDateString()}</span>
                    {user?.role === 'teacher' && (
                      <button className="icon-btn danger" onClick={() => handleDeleteAnnouncement(a._id)}>
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
                <p className="ann-content">{a.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── QUERIES PANEL ── */}
        <div className="panel card">
          <div className="panel-header">
            <div className="panel-title">
              <MessageCircle size={20} color="#8b5cf6" />
              <h2>{user?.role === 'student' ? 'My Queries' : 'Student Queries'}</h2>
            </div>
            {user?.role === 'student' && (
              <button className="btn btn-primary btn-sm" onClick={() => setShowQueryForm(!showQueryForm)}>
                {showQueryForm ? <X size={16} /> : '+ Ask'}
              </button>
            )}
          </div>

          {showQueryForm && (
            <div className="ann-form">
              <select
                className="form-input"
                value={queryData.teacherId}
                onChange={e => setQueryData({ ...queryData, teacherId: e.target.value })}
              >
                <option value="">Select a teacher</option>
                {enrolledTeachers.map(t => (
                  <option key={t._id} value={t._id}>{t.subject} — {t.teacherName}</option>
                ))}
              </select>
              <input
                className="form-input"
                placeholder="Subject (e.g. Question about Module 3)"
                value={queryData.subject}
                onChange={e => setQueryData({ ...queryData, subject: e.target.value })}
              />
              <textarea
                className="form-input ann-textarea"
                placeholder="Describe your question..."
                value={queryData.message}
                onChange={e => setQueryData({ ...queryData, message: e.target.value })}
              />
              {queryError && <p style={{ color: '#e11d48', fontSize: '13px', margin: '0' }}>{queryError}</p>}
              <div className="ann-form-actions">
                <button className="btn btn-primary btn-sm" onClick={handleSubmitQuery}>Send</button>
                <button className="btn btn-outline btn-sm" onClick={() => { setShowQueryForm(false); setQueryData({ teacherId: '', subject: '', message: '' }); setQueryError(''); }}>Cancel</button>
              </div>
            </div>
          )}

          <div className="ann-list">
            {queries.length === 0 ? (
              <div className="panel-empty">{user?.role === 'student' ? 'No queries sent yet.' : 'No queries from students yet.'}</div>
            ) : queries.map(q => (
              <div key={q._id} className={`query-item ${q.status === 'resolved' ? 'resolved' : ''}`}>
                <div className="ann-item-header" onClick={() => setExpandedQuery(expandedQuery === q._id ? null : q._id)} style={{ cursor: 'pointer' }}>
                  <div>
                    <span className="ann-title">{q.subject}</span>
                    <span className="ann-teacher">
                      {user?.role === 'student' ? (q.teacher?.subject || q.teacher?.name) : q.student?.name}
                    </span>
                  </div>
                  <div className="ann-meta">
                    <span className={`status-badge ${q.status}`}>{q.status}</span>
                    {expandedQuery === q._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                {expandedQuery === q._id && (
                  <div className="query-thread">
                    {q.replies.map((r, i) => (
                      <div key={i} className={`reply-bubble ${r.senderRole}`}>
                        <span className="reply-name">{r.senderName}</span>
                        <p>{r.message}</p>
                        <span className="reply-time">{new Date(r.createdAt).toLocaleString()}</span>
                      </div>
                    ))}
                    {q.status !== 'resolved' && (
                      <div className="reply-input-row">
                        <input
                          className="form-input"
                          placeholder="Type a reply..."
                          value={replyText}
                          onChange={e => setReplyText(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleReply(q._id)}
                        />
                        <button className="btn btn-primary btn-sm" onClick={() => handleReply(q._id)}><Send size={15} /></button>
                        {user?.role === 'teacher' && (
                          <button className="btn btn-outline btn-sm" onClick={() => handleResolve(q._id)}>
                            <CheckCircle2 size={15} /> Resolve
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .dashboard-header { margin-bottom: 40px; }
        .dashboard-header h1 { font-size: 32px; margin-bottom: 8px; }
        .dashboard-header p { color: var(--text-muted); font-size: 16px; }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 24px;
        }
        .stat-card { display: flex; align-items: center; gap: 20px; padding: 24px; }
        .stat-icon {
          width: 56px; height: 56px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
        }
        .stat-info h3 { font-size: 28px; margin-bottom: 2px; }
        .stat-info p { color: var(--text-muted); font-size: 14px; font-weight: 500; }
        .dashboard-bottom {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-top: 32px;
        }
        @media (max-width: 900px) { .dashboard-bottom { grid-template-columns: 1fr; } }
        .panel { padding: 24px; display: flex; flex-direction: column; gap: 16px; }
        .panel-header { display: flex; justify-content: space-between; align-items: center; }
        .panel-title { display: flex; align-items: center; gap: 10px; }
        .panel-title h2 { font-size: 18px; margin: 0; }
        .panel-empty { color: var(--text-muted); font-size: 14px; text-align: center; padding: 24px 0; }
        .ann-list { display: flex; flex-direction: column; gap: 12px; max-height: 400px; overflow-y: auto; }
        .ann-item, .query-item {
          background: var(--bg-main); border-radius: var(--radius-md);
          padding: 14px 16px; border: 1px solid var(--border);
        }
        .query-item.resolved { opacity: 0.65; }
        .ann-item-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
        .ann-title { font-weight: 700; font-size: 15px; display: block; margin-bottom: 2px; }
        .ann-teacher {
          font-size: 11px; font-weight: 700; color: var(--primary);
          background: var(--primary-light); padding: 2px 8px; border-radius: 20px;
          display: inline-block; margin-top: 4px; text-transform: uppercase;
        }
        .ann-meta { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        .ann-date { font-size: 12px; color: var(--text-muted); }
        .ann-content { font-size: 14px; color: var(--text-muted); line-height: 1.6; margin: 0; }
        .icon-btn { background: transparent; padding: 4px; border-radius: 6px; }
        .icon-btn.danger { color: #e11d48; }
        .icon-btn.danger:hover { background: rgba(239,68,68,0.1); }
        .ann-form { display: flex; flex-direction: column; gap: 10px; background: var(--bg-main); padding: 16px; border-radius: var(--radius-md); }
        .ann-textarea { min-height: 90px; resize: vertical; }
        .ann-form-actions { display: flex; gap: 8px; }
        .status-badge { font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 20px; text-transform: uppercase; }
        .status-badge.open { background: rgba(245,158,11,0.15); color: #d97706; }
        .status-badge.resolved { background: rgba(16,185,129,0.15); color: #16a34a; }
        .query-thread { display: flex; flex-direction: column; gap: 10px; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border); }
        .reply-bubble { padding: 10px 14px; border-radius: 10px; max-width: 85%; }
        .reply-bubble.student { background: var(--primary-light); align-self: flex-start; }
        .reply-bubble.teacher { background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.25); align-self: flex-end; }
        .reply-name { font-size: 11px; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 4px; }
        .reply-bubble p { margin: 0; font-size: 14px; color: var(--text-main); }
        .reply-time { font-size: 11px; color: var(--text-muted); margin-top: 4px; display: block; }
        .reply-input-row { display: flex; gap: 8px; align-items: center; }
        .reply-input-row .form-input { flex: 1; padding: 8px 12px; font-size: 14px; }
        .course-name-card { padding: 24px; margin-bottom: 16px; border-left: 4px solid var(--primary); }
        .enrollment-key-card { padding: 24px; margin-bottom: 32px; border-left: 4px solid #10b981; }
        .key-row { display: flex; align-items: center; gap: 12px; }
        .key-display {
          font-size: 28px; font-weight: 800; letter-spacing: 6px;
          color: var(--text-main); font-family: 'Courier New', monospace;
          background: var(--bg-main); padding: 8px 20px; border-radius: var(--radius-md);
          border: 2px dashed #10b981;
        }
        .course-label { font-size: 13px; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px; }
        .course-edit-row { display: flex; align-items: center; gap: 12px; }
        .course-name-display { font-size: 22px; font-weight: 700; color: var(--text-main); }
        .course-input { max-width: 320px; padding: 8px 14px; font-size: 16px; }
        .btn-sm { padding: 8px 16px; font-size: 13px; }
      `}</style>
    </DashboardLayout>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/materials" 
            element={
              <ProtectedRoute>
                <Materials />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/flashcards" 
            element={
              <ProtectedRoute>
                <Flashcards />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/tests" 
            element={
              <ProtectedRoute>
                <MockTests />
              </ProtectedRoute>
            } 
          />
          <Route
            path="/insights"
            element={
              <ProtectedRoute>
                <TeacherInsights />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses"
            element={
              <ProtectedRoute>
                <Courses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
