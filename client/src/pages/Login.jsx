import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, GraduationCap, School, LogIn } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (await login(email, password)) {
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
          <h1>Welcome Back</h1>
          <p>Login to your GradeSync account</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-with-icon">
              <Mail className="icon" size={20} />
              <input
                type="email"
                className="form-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-with-icon">
              <Lock className="icon" size={20} />
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full">
            <LogIn size={20} /> Login
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Create Account</Link>
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
          max-width: 420px;
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

export default Login;
