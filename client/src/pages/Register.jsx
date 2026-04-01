import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, GraduationCap, School, LogIn, ChevronRight } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    subject: '',
  });
  const { register, error } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (role) => {
    setFormData({ ...formData, role });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (await register(formData)) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass animate-fade-in">
        <div className="auth-header">
          <div className="logo-icon">
            <GraduationCap size={40} color="#6366f1" />
          </div>
          <h1>Join GradeSync</h1>
          <p>Create your account and start learning</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="roles-grid">
            <div
              className={`role-card ${formData.role === 'student' ? 'active' : ''}`}
              onClick={() => handleRoleChange('student')}
            >
              <GraduationCap size={24} />
              <span>Student</span>
            </div>
            <div
              className={`role-card ${formData.role === 'teacher' ? 'active' : ''}`}
              onClick={() => handleRoleChange('teacher')}
            >
              <School size={24} />
              <span>Teacher</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="input-with-icon">
              <User className="icon" size={20} />
              <input
                name="name"
                type="text"
                className="form-input"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-with-icon">
              <Mail className="icon" size={20} />
              <input
                name="email"
                type="email"
                className="form-input"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {formData.role === 'teacher' && (
            <div className="form-group">
              <label className="form-label">Subject / Course Name</label>
              <div className="input-with-icon">
                <School className="icon" size={20} />
                <input
                  name="subject"
                  type="text"
                  className="form-input"
                  placeholder="e.g., Statistics, Cloud Computing"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-with-icon">
              <Lock className="icon" size={20} />
              <input
                name="password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full">
            Get Started <ChevronRight size={20} />
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>

      <style>{`
        .auth-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-main);
          padding: 20px;
        }
        .auth-card {
          width: 100%;
          max-width: 480px;
          padding: 40px;
          border-radius: var(--radius-lg);
        }
        .auth-header {
          text-align: center;
          margin-bottom: 32px;
        }
        .logo-icon {
          background: var(--primary-light);
          width: 64px;
          height: 64px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }
        .auth-header h1 {
          font-size: 24px;
          margin-bottom: 8px;
        }
        .auth-header p {
          color: var(--text-muted);
          font-size: 14px;
        }
        .roles-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 24px;
        }
        .role-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 16px;
          background: var(--bg-card);
          border: 2px solid var(--border);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: var(--transition);
          font-weight: 600;
        }
        .role-card.active {
          border-color: var(--primary);
          background: var(--primary-light);
          color: var(--primary);
        }
        .role-card:hover:not(.active) {
          border-color: var(--primary);
        }
        .input-with-icon {
          position: relative;
        }
        .input-with-icon .icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }
        .input-with-icon .form-input {
          padding-left: 44px;
        }
        .btn-full {
          width: 100%;
          margin-top: 10px;
        }
        .alert {
          padding: 12px;
          border-radius: var(--radius-md);
          margin-bottom: 20px;
          font-size: 14px;
          font-weight: 500;
        }
        .alert-error {
          background: #fee2e2;
          color: var(--error);
          border: 1px solid #fecaca;
        }
        .auth-footer {
          margin-top: 24px;
          text-align: center;
          font-size: 14px;
          color: var(--text-muted);
        }
        .auth-footer a {
          color: var(--primary);
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default Register;
