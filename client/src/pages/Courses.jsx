import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { BookOpen, Users, CheckCircle2, PlusCircle, XCircle, Sparkles, KeyRound, X } from 'lucide-react';

const Courses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrollTarget, setEnrollTarget] = useState(null); // course to enroll in
  const [keyInput, setKeyInput] = useState('');
  const [keyError, setKeyError] = useState('');
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await axios.get('/api/courses');
      setCourses(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openEnrollModal = (course) => {
    setEnrollTarget(course);
    setKeyInput('');
    setKeyError('');
  };

  const closeEnrollModal = () => {
    setEnrollTarget(null);
    setKeyInput('');
    setKeyError('');
  };

  const handleEnroll = async () => {
    if (!keyInput.trim()) { setKeyError('Please enter the enrollment key.'); return; }
    try {
      setEnrolling(true);
      setKeyError('');
      await axios.post(`/api/courses/enroll/${enrollTarget._id}`, {
        enrollmentKey: keyInput.trim().toUpperCase()
      });
      closeEnrollModal();
      fetchCourses();
    } catch (err) {
      setKeyError(err.response?.data?.msg || 'Invalid enrollment key.');
    } finally {
      setEnrolling(false);
    }
  };

  const handleUnenroll = async (teacherId) => {
    if (!window.confirm('Unenroll from this course?')) return;
    try {
      await axios.post(`/api/courses/unenroll/${teacherId}`);
      fetchCourses();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <DashboardLayout><div className="loading">Loading courses...</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="section-header">
        <BookOpen size={32} color="#6366f1" />
        <div>
          <h1>Available Courses</h1>
          <p>Enroll in courses to access materials, flashcards and mock tests</p>
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="empty-state card">
          <Sparkles size={48} color="#8b5cf6" />
          <h3>No Courses Available Yet</h3>
          <p>Teachers haven't set up any courses yet. Check back later!</p>
        </div>
      ) : (
        <div className="courses-grid">
          {courses.map(course => (
            <div key={course._id} className={`course-card card ${course.isEnrolled ? 'enrolled' : ''}`}>
              <div className="course-icon">
                <BookOpen size={28} color={course.isEnrolled ? '#10b981' : '#6366f1'} />
              </div>
              <div className="course-info">
                <h3>{course.subject}</h3>
                <p className="teacher-name">by {course.teacherName}</p>
                <div className="course-meta">
                  <span><Users size={14} /> {course.enrolledCount} enrolled</span>
                  {course.isEnrolled && (
                    <span className="enrolled-badge"><CheckCircle2 size={14} /> Enrolled</span>
                  )}
                </div>
              </div>
              {user?.role === 'student' && (
                course.isEnrolled ? (
                  <button className="btn-unenroll" onClick={() => handleUnenroll(course._id)}>
                    <XCircle size={18} /> Unenroll
                  </button>
                ) : (
                  <button className="btn-enroll" onClick={() => openEnrollModal(course)}>
                    <PlusCircle size={18} /> Enroll
                  </button>
                )
              )}
            </div>
          ))}
        </div>
      )}

      {/* Enrollment Key Modal */}
      {enrollTarget && (
        <div className="modal-overlay">
          <div className="modal-box animate-fade-in">
            <div className="modal-top">
              <div className="modal-icon"><KeyRound size={28} color="#6366f1" /></div>
              <button className="modal-close" onClick={closeEnrollModal}><X size={20} /></button>
            </div>
            <h2>Enter Enrollment Key</h2>
            <p className="modal-subtitle">
              Ask your teacher for the key to join <strong>{enrollTarget.subject}</strong>
            </p>
            <input
              className="key-input"
              placeholder="e.g. AB12CD"
              value={keyInput}
              onChange={e => { setKeyInput(e.target.value.toUpperCase()); setKeyError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleEnroll()}
              maxLength={6}
              autoFocus
            />
            {keyError && <p className="key-error">{keyError}</p>}
            <button className="btn btn-primary btn-full" onClick={handleEnroll} disabled={enrolling}>
              {enrolling ? 'Verifying...' : 'Confirm Enrollment'}
            </button>
          </div>
        </div>
      )}

      <style>{`
        .section-header { display: flex; align-items: center; gap: 16px; margin-bottom: 40px; }
        .courses-grid { display: grid; gap: 20px; }
        .course-card {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 24px;
          transition: var(--transition);
        }
        .course-card.enrolled {
          border-color: #10b981;
          background: rgba(16,185,129,0.12);
        }
        .course-card:hover { transform: translateX(6px); }
        .course-icon {
          background: var(--primary-light);
          padding: 14px;
          border-radius: 14px;
          flex-shrink: 0;
        }
        .course-card.enrolled .course-icon { background: #d1fae5; }
        .course-info { flex: 1; }
        .course-info h3 { font-size: 20px; margin-bottom: 4px; }
        .teacher-name { color: var(--text-muted); font-size: 14px; margin-bottom: 10px; }
        .course-meta { display: flex; align-items: center; gap: 16px; font-size: 13px; color: var(--text-muted); }
        .course-meta span { display: flex; align-items: center; gap: 4px; }
        .enrolled-badge { color: #10b981; font-weight: 600; }
        .btn-enroll {
          display: flex; align-items: center; gap: 8px;
          background: var(--primary); color: white;
          padding: 10px 20px; border-radius: var(--radius-md);
          font-weight: 600; white-space: nowrap;
          transition: var(--transition);
        }
        .btn-enroll:hover { opacity: 0.9; transform: translateY(-1px); }
        .btn-unenroll {
          display: flex; align-items: center; gap: 8px;
          background: transparent; color: #e11d48;
          border: 1px solid rgba(239,68,68,0.25);
          padding: 10px 20px; border-radius: var(--radius-md);
          font-weight: 600; white-space: nowrap;
          transition: var(--transition);
        }
        .btn-unenroll:hover { background: rgba(239,68,68,0.1); }
        .modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5); display: flex;
          align-items: center; justify-content: center; z-index: 1000; padding: 20px;
        }
        .modal-box {
          background: var(--bg-card); border-radius: var(--radius-lg);
          padding: 32px; width: 100%; max-width: 420px;
          box-shadow: var(--shadow-lg);
        }
        .modal-top {
          display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;
        }
        .modal-icon {
          background: var(--primary-light); padding: 12px; border-radius: 12px;
        }
        .modal-close {
          background: transparent; color: var(--text-muted); padding: 4px;
        }
        .modal-box h2 { font-size: 22px; margin-bottom: 8px; }
        .modal-subtitle { color: var(--text-muted); font-size: 14px; margin-bottom: 24px; line-height: 1.5; }
        .key-input {
          width: 100%; padding: 14px 18px; font-size: 24px; font-weight: 800;
          letter-spacing: 8px; text-align: center; text-transform: uppercase;
          border: 2px solid var(--border); border-radius: var(--radius-md);
          margin-bottom: 12px; font-family: 'Courier New', monospace;
          outline: none; transition: border-color 0.2s;
        }
        .key-input:focus { border-color: var(--primary); }
        .key-error { color: #e11d48; font-size: 13px; font-weight: 500; margin-bottom: 12px; }
        .btn-full { width: 100%; margin-top: 4px; }
        .empty-state {
          text-align: center; padding: 64px 32px;
          display: flex; flex-direction: column;
          align-items: center; gap: 16px;
        }
        .empty-state h3 { font-size: 24px; color: var(--secondary); }
        .empty-state p { color: var(--text-muted); font-size: 16px; }
      `}</style>
    </DashboardLayout>
  );
};

export default Courses;
