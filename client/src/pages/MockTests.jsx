import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  FileText,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  X,
  Trophy,
  BrainCircuit,
  Timer
} from 'lucide-react';

const MockTests = () => {
  const { user } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(600);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('all');

  useEffect(() => {
    fetchMaterials();
    if (user?.role === 'student') fetchEnrolledCourses();
  }, []);

  useEffect(() => {
    if (!selectedMaterial || isFinished) return;
    setTimeLeft(600);
  }, [selectedMaterial]);

  useEffect(() => {
    if (!selectedMaterial || isFinished) return;
    if (timeLeft <= 0) { setIsFinished(true); return; }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [selectedMaterial, isFinished, timeLeft]);

  const fetchEnrolledCourses = async () => {
    try {
      const res = await axios.get('/api/courses');
      setEnrolledCourses(res.data.filter(c => c.isEnrolled));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMaterials = async () => {
    try {
      const res = await axios.get('/api/materials');
      setMaterials(res.data.filter(m => m.quiz && m.quiz.length > 0));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getTeacherId = (teacher) => {
    if (!teacher) return null;
    if (typeof teacher === 'object') return teacher._id?.toString();
    return teacher.toString();
  };

  const getCourseLabel = (teacher) => {
    const id = getTeacherId(teacher);
    const course = enrolledCourses.find(c => c._id?.toString() === id);
    return course ? (course.subject || course.teacherName) : null;
  };

  const filteredMaterials = (user?.role === 'student' && selectedCourse !== 'all')
    ? materials.filter(m => getTeacherId(m.teacher) === selectedCourse)
    : materials;

  const handleAnswerSubmit = async () => {
    const question = selectedMaterial.quiz[currentQuestion];
    const normalize = (s) => s?.trim().toLowerCase().replace(/[.,"']+$/, '');

    // Handle both letter-based answers ("B") and full-text answers
    let correctText = question.correctAnswer;
    if (/^[A-Da-d]$/.test(question.correctAnswer?.trim())) {
      const idx = question.correctAnswer.trim().toUpperCase().charCodeAt(0) - 65;
      correctText = question.options[idx] ?? question.correctAnswer;
    }
    const isCorrect = normalize(selectedOption) === normalize(correctText);
    
    if (isCorrect) setScore(prev => prev + 1);

    try {
      await axios.post('/api/attempts/record', {
        materialId: selectedMaterial._id,
        type: 'quiz',
        concept: question.concept || 'General',
        isCorrect
      });
    } catch (err) {
      console.error('Failed to record attempt:', err);
      toast.error('Progress not saved — check your connection');
    }

    if (currentQuestion < selectedMaterial.quiz.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
    } else {
      setIsFinished(true);
    }
  };

  const resetTest = () => {
    setSelectedMaterial(null);
    setCurrentQuestion(0);
    setSelectedOption(null);
    setScore(0);
    setIsFinished(false);
    setTimeLeft(600);
  };

  if (loading) return <DashboardLayout><div className="loading">Loading tests...</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="section-header">
        <BrainCircuit size={32} color="#6366f1" />
        <div>
          <h1>AI-Driven Mock Tests</h1>
          <p>Assess your readiness with generated assessments</p>
        </div>
      </div>

      {!selectedMaterial ? (
        <div>
          {user?.role === 'student' && enrolledCourses.length > 0 && (
            <div className="filter-bar">
              <label className="filter-label">Filter by Course:</label>
              <select
                className="filter-select"
                value={selectedCourse}
                onChange={e => setSelectedCourse(e.target.value)}
              >
                <option value="all">All Courses</option>
                {enrolledCourses.map(c => (
                  <option key={c._id} value={c._id}>{c.subject} — {c.teacherName}</option>
                ))}
              </select>
            </div>
          )}
          <div className="selection-grid">
          {filteredMaterials.length > 0 ? (
            filteredMaterials.map(m => (
              <div key={m._id} className="selection-card card clickable" onClick={() => setSelectedMaterial(m)}>
                <div className="selection-info">
                  {user?.role === 'student' && getCourseLabel(m.teacher) && (
                    <span className="course-badge">{getCourseLabel(m.teacher)}</span>
                  )}
                  <h3>{m.title}</h3>
                  <p>{m.quiz.length} Questions</p>
                </div>
                <button className="btn btn-primary btn-sm">Start Test</button>
              </div>
            ))
          ) : (
            <div className="empty-state-full card">
              <BrainCircuit size={48} color="#8b5cf6" />
              <h3>No Mock Tests Available</h3>
              {user?.role === 'teacher' ? (
                <p>Upload materials in the 'Course Materials' section and our AI will automatically generate quizes for your students.</p>
              ) : (
                <p>Once your teacher uploads content and generates quizes, they will appear here for you to practice.</p>
              )}
            </div>
          )}
        </div>
        </div>
      ) : isFinished ? (
        <div className="results-card card animate-fade-in">
          <Trophy size={64} color="#f59e0b" />
          <h2>Test Completed!</h2>
          <div className="score-badge">
            {score} / {selectedMaterial.quiz.length}
          </div>
          <p>Great effort! Your results have been analyzed to help your teacher focus on key concepts.</p>
          <button className="btn btn-primary" onClick={resetTest}>Back to Library</button>
        </div>
      ) : (
        <div className="quiz-container animate-fade-in">
          <div className="quiz-header">
            <div className="quiz-info">
               <span className="quiz-tag">{selectedMaterial.title}</span>
               <span className="question-count">Question {currentQuestion + 1} of {selectedMaterial.quiz.length}</span>
            </div>
            <div className={`timer-badge ${timeLeft <= 60 ? 'urgent' : ''}`}>
               <Timer size={16} /> {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
            </div>
          </div>

          <div className="question-card card">
            <h2>{selectedMaterial.quiz[currentQuestion].question}</h2>
            <div className="options-grid">
              {selectedMaterial.quiz[currentQuestion].options.map((option, idx) => (
                <div 
                  key={idx} 
                  className={`option-item ${selectedOption === option ? 'selected' : ''}`}
                  onClick={() => setSelectedOption(option)}
                >
                  <div className="option-letter">{String.fromCharCode(65 + idx)}</div>
                  <div className="option-text">{option}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="quiz-footer">
             <button className="btn btn-outline" onClick={resetTest}>Cancel</button>
             <button 
                className="btn btn-primary" 
                disabled={!selectedOption} 
                onClick={handleAnswerSubmit}
              >
                {currentQuestion === selectedMaterial.quiz.length - 1 ? 'Finish Test' : 'Next Question'}
                <ChevronRight size={18} />
             </button>
          </div>
        </div>
      )}

      <style>{`
        .section-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 40px;
        }
        .filter-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }
        .filter-label {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-muted);
          white-space: nowrap;
        }
        .filter-select {
          padding: 10px 16px;
          border: 1.5px solid var(--border);
          border-radius: var(--radius-md);
          background: var(--bg-card);
          color: var(--text-main);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          min-width: 260px;
        }
        .filter-select:focus { outline: none; border-color: var(--primary); }
        .course-badge {
          display: inline-block;
          background: var(--primary-light);
          color: var(--primary);
          font-size: 11px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          margin-bottom: 4px;
        }
        .selection-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }
        .selection-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px;
        }
        .selection-info h3 { font-size: 18px; margin-bottom: 4px; }
        .selection-info p { font-size: 14px; color: var(--text-muted); margin-top: 4px; }
        .btn-sm { padding: 8px 16px; font-size: 13px; }
        
        .quiz-container { max-width: 700px; margin: 0 auto; }
        .quiz-header { 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          margin-bottom: 24px; 
        }
        .quiz-info { display: flex; gap: 12px; align-items: center; }
        .quiz-tag { 
          background: var(--primary-light); 
          color: var(--primary); 
          padding: 4px 12px; 
          border-radius: 20px; 
          font-size: 13px; 
          font-weight: 600; 
        }
        .question-count { font-size: 14px; color: var(--text-muted); font-weight: 500; }
        .timer-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 700;
          color: var(--text-main);
          background: var(--bg-main);
          padding: 6px 14px;
          border-radius: 20px;
        }
        .timer-badge.urgent {
          color: #e11d48;
          background: rgba(239,68,68,0.1);
          animation: pulse 1s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        
        .question-card h2 { font-size: 20px; margin-bottom: 32px; line-height: 1.4; }
        .options-grid { display: grid; gap: 12px; }
        .option-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 20px;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: var(--transition);
        }
        .option-item:hover { border-color: var(--primary); background: var(--primary-light); }
        .option-item.selected { 
          border-color: var(--primary); 
          background: var(--primary-light); 
          border-width: 2px;
        }
        .option-letter {
          width: 32px;
          height: 32px;
          background: var(--bg-main);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: var(--text-muted);
        }
        .selected .option-letter { background: var(--primary); color: white; }
        .option-text { font-weight: 500; color: var(--text-main); }
        
        .quiz-footer { 
          display: flex; 
          justify-content: space-between; 
          margin-top: 32px; 
        }
        
        .results-card {
           text-align: center;
           padding: 60px;
           max-width: 500px;
           margin: 0 auto;
           display: flex;
           flex-direction: column;
           align-items: center;
           gap: 20px;
        }
        .score-badge {
           font-size: 48px;
           font-weight: 800;
           color: var(--primary);
           font-family: 'Outfit', sans-serif;
           margin: 10px 0;
        }
        .results-card p { color: var(--text-muted); line-height: 1.6; margin-bottom: 20px; }

        .empty-state-full {
          grid-column: 1 / -1;
          text-align: center;
          padding: 64px 32px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        .empty-state-full h3 { font-size: 24px; color: var(--secondary); }
        .empty-state-full p { color: var(--text-muted); font-size: 16px; max-width: 450px; }
      `}</style>
    </DashboardLayout>
  );
};

export default MockTests;
