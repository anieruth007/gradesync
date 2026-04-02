import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  FilePlus,
  FileText,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Upload,
  X,
  Trash2
} from 'lucide-react';

const Materials = () => {
  const { user } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [uploadData, setUploadData] = useState({ title: '', file: null });
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('all');

  useEffect(() => {
    fetchMaterials();
    if (user?.role === 'student') fetchEnrolledCourses();
  }, []);

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
      setMaterials(res.data);
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

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this material?')) return;
    try {
      await axios.delete(`/api/materials/${id}`);
      fetchMaterials();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', uploadData.title);
    formData.append('file', uploadData.file);

    try {
      setUploading(true);
      await axios.post('/api/materials/upload', formData);
      setShowUpload(false);
      setUploadData({ title: '', file: null });
      fetchMaterials();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || 'Error uploading material. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="materials-header">
        <div>
          <h1>Course Materials</h1>
          <p>Access your study documents and AI-generated insights</p>
        </div>
        {user?.role === 'teacher' && (
          <button className="btn btn-primary" onClick={() => setShowUpload(true)}>
            <FilePlus size={20} />
            Upload New
          </button>
        )}
      </div>

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

      {loading && (
        <div className="skeleton-list">
          {[1,2,3,4].map(i => (
            <div key={i} className="skeleton-card">
              <div className="sk-icon" />
              <div className="sk-lines"><div className="sk-line" /><div className="sk-line short" /></div>
            </div>
          ))}
        </div>
      )}

      {!loading && <div className="materials-grid">
        {filteredMaterials.length > 0 ? filteredMaterials.map((material) => (
          <div key={material._id} className="material-card card clickable" onClick={() => setSelectedMaterial(material)}>
            <div className="material-icon">
              <FileText size={24} color="#6366f1" />
            </div>
            <div className="material-info">
              {user?.role === 'student' && getCourseLabel(material.teacher) && (
                <span className="course-tag">{getCourseLabel(material.teacher)}</span>
              )}
              <h3>{material.title}</h3>
              <p>Uploaded on {new Date(material.createdAt).toLocaleDateString()}</p>
            </div>
            {user?.role === 'teacher' && (
              <button className="delete-btn" onClick={(e) => handleDelete(e, material._id)}>
                <Trash2 size={18} />
              </button>
            )}
            <ChevronRight className="arrow" size={20} />
          </div>
        )) : !loading && (
          <div className="empty-state card">
            <Sparkles size={48} color="#8b5cf6" />
            <h3>No Course Materials Yet</h3>
            {user?.role === 'teacher' ? (
              <p>Upload your first PDF or document to generate AI summaries and study aids.</p>
            ) : selectedCourse !== 'all' ? (
              <p>No materials uploaded for this course yet. Check back later!</p>
            ) : (
              <p>Your teacher hasn't uploaded any documents yet. Check back later!</p>
            )}
          </div>
        )}
      </div>}

      {/* Upload Modal */}
      {showUpload && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in">
            <div className="modal-header">
              <h2>Upload Material</h2>
              <button onClick={() => setShowUpload(false)} className="close-btn"><X /></button>
            </div>
            <form onSubmit={handleUpload}>
              <div className="form-group">
                <label className="form-label">Material Title</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g., Introduction to Cloud Systems"
                  value={uploadData.title}
                  onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Choose File (PDF, DOCX, or TXT)</label>
                <div className="file-dropzone">
                  <Upload size={32} />
                  <input 
                    type="file" 
                    onChange={(e) => setUploadData({ ...uploadData, file: e.target.files[0] })}
                    required
                  />
                  <span>{uploadData.file ? uploadData.file.name : "Click to select a file"}</span>
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={uploading}>
                {uploading ? "Processing with AI..." : "Start AI Extraction"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Material Detail Modal */}
      {selectedMaterial && (
        <div className="modal-overlay">
          <div className="modal-content wide animate-fade-in">
            <div className="modal-header">
              <div className="header-title">
                <Sparkles size={24} color="#8b5cf6" />
                <h2>{selectedMaterial.title}</h2>
              </div>
              <button onClick={() => setSelectedMaterial(null)} className="close-btn"><X /></button>
            </div>
            <div className="material-detail-body">
              <section className="summary-section">
                <h3>AI Summary</h3>
                <p>{selectedMaterial.summary}</p>
              </section>
              <section className="notes-section">
                <h3>Key Learning Points</h3>
                <div className="notes-grid">
                  {selectedMaterial.notes.map((note, idx) => (
                    <div key={idx} className="note-item">
                      <CheckCircle2 size={18} color="#10b981" />
                      <span>{note}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

      <style>{`
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
        .filter-select:focus {
          outline: none;
          border-color: var(--primary);
        }
        .materials-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
        }
        .materials-header p {
          color: var(--text-muted);
        }
        .materials-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        .material-card {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 20px;
          transition: var(--transition);
        }
        .material-card:hover {
          transform: translateX(8px);
          border-color: var(--primary);
        }
        .material-icon {
          background: var(--primary-light);
          padding: 12px;
          border-radius: 12px;
        }
        .material-info {
          flex: 1;
        }
        .material-info h3 {
          margin-bottom: 4px;
          font-size: 18px;
        }
        .material-info p {
          font-size: 14px;
          color: var(--text-muted);
        }
        .course-tag {
          display: inline-block;
          background: var(--primary-light);
          color: var(--primary);
          font-size: 11px;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
        }
        .clickable {
          cursor: pointer;
        }
        .delete-btn {
          background: transparent;
          color: #e11d48;
          padding: 8px;
          border-radius: 8px;
          transition: var(--transition);
        }
        .delete-btn:hover {
          background: rgba(239,68,68,0.1);
        }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }
        .modal-content {
          width: 100%;
          max-width: 500px;
          background: var(--bg-card) !important;
          color: var(--text-main);
          padding: 32px;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border);
          box-shadow: var(--shadow-lg);
          position: relative;
        }
        .modal-content.wide {
          max-width: 800px;
          max-height: 85vh;
          overflow-y: auto;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .header-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .close-btn {
          background: transparent;
          color: var(--text-muted);
        }
        .file-dropzone {
          border: 2px dashed var(--border);
          border-radius: var(--radius-md);
          padding: 32px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          position: relative;
          color: var(--text-muted);
        }
        .file-dropzone input {
          position: absolute;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
        }
        .material-detail-body {
          display: grid;
          gap: 32px;
        }
        .summary-section p {
          color: var(--text-main);
          font-size: 16px;
          line-height: 1.6;
          background: var(--bg-main);
          padding: 20px;
          border-radius: var(--radius-md);
        }
        .notes-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          margin-top: 16px;
        }
        .note-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px;
          background: rgba(16,185,129,0.12);
          border: 1px solid rgba(16,185,129,0.25);
          border-radius: var(--radius-md);
          font-weight: 500;
          color: var(--text-main);
        }
        .skeleton-list { display: flex; flex-direction: column; gap: 12px; }
        .skeleton-card {
          display: flex; align-items: center; gap: 16px;
          padding: 20px; border-radius: var(--radius-lg);
          background: var(--bg-card); border: 1px solid var(--border);
        }
        .sk-icon {
          width: 48px; height: 48px; border-radius: 12px; flex-shrink: 0;
          background: linear-gradient(90deg,var(--bg-main) 25%,var(--border) 50%,var(--bg-main) 75%);
          background-size: 200% 100%; animation: shimmer 1.4s infinite;
        }
        .sk-lines { flex: 1; display: flex; flex-direction: column; gap: 8px; }
        .sk-line {
          height: 13px; border-radius: 6px;
          background: linear-gradient(90deg,var(--bg-main) 25%,var(--border) 50%,var(--bg-main) 75%);
          background-size: 200% 100%; animation: shimmer 1.4s infinite;
        }
        .sk-line.short { width: 45%; }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .btn-full {
          width: 100%;
          margin-top: 10px;
        }
        .empty-state {
          text-align: center;
          padding: 64px 32px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        .empty-state h3 { font-size: 24px; color: var(--secondary); }
        .empty-state p { color: var(--text-muted); font-size: 16px; max-width: 400px; }
      `}</style>
    </DashboardLayout>
  );
};

export default Materials;
