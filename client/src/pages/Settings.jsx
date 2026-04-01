import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun, Palette, User, Shield } from 'lucide-react';

const ACCENTS = [
  { id: 'indigo', label: 'Indigo', color: '#6366f1' },
  { id: 'violet', label: 'Violet', color: '#7c3aed' },
  { id: 'rose',   label: 'Rose',   color: '#e11d48' },
  { id: 'emerald',label: 'Emerald',color: '#059669' },
  { id: 'sky',    label: 'Sky',    color: '#0284c7' },
];

const Settings = () => {
  const { user } = useAuth();
  const { theme, toggleTheme, accent, setAccent } = useTheme();

  return (
    <DashboardLayout>
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage your preferences and account options</p>
      </div>

      {/* Appearance */}
      <div className="settings-section card">
        <div className="section-title">
          <Palette size={20} color="var(--primary)" />
          <h2>Appearance</h2>
        </div>

        {/* Dark mode toggle */}
        <div className="setting-row">
          <div className="setting-info">
            <p className="setting-name">Theme</p>
            <p className="setting-desc">Switch between light and dark mode</p>
          </div>
          <button className="theme-toggle" onClick={toggleTheme}>
            <div className={`toggle-track ${theme === 'dark' ? 'dark' : ''}`}>
              <div className="toggle-thumb">
                {theme === 'dark' ? <Moon size={12} /> : <Sun size={12} />}
              </div>
            </div>
            <span>{theme === 'dark' ? 'Dark' : 'Light'}</span>
          </button>
        </div>

        {/* Accent color */}
        <div className="setting-row">
          <div className="setting-info">
            <p className="setting-name">Accent Color</p>
            <p className="setting-desc">Choose your preferred highlight color</p>
          </div>
          <div className="accent-options">
            {ACCENTS.map(a => (
              <button
                key={a.id}
                className={`accent-btn ${accent === a.id ? 'selected' : ''}`}
                style={{ background: a.color }}
                title={a.label}
                onClick={() => setAccent(a.id)}
              >
                {accent === a.id && <span className="accent-check">✓</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Account Info */}
      <div className="settings-section card">
        <div className="section-title">
          <User size={20} color="var(--primary)" />
          <h2>Account</h2>
        </div>
        <div className="account-info-grid">
          <div className="info-item">
            <span className="info-label">Name</span>
            <span className="info-value">{user?.name}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Email</span>
            <span className="info-value">{user?.email}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Role</span>
            <span className="info-value role-badge">{user?.role}</span>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="settings-section card">
        <div className="section-title">
          <Shield size={20} color="var(--primary)" />
          <h2>About GradeSync</h2>
        </div>
        <div className="about-content">
          <p>GradeSync is an AI-powered cloud-based learning management system that helps teachers and students collaborate effectively through smart study tools.</p>
          <div className="version-badge">v1.0.0</div>
        </div>
      </div>

      <style>{`
        .settings-header { margin-bottom: 32px; }
        .settings-header h1 { font-size: 32px; margin-bottom: 8px; }
        .settings-header p { color: var(--text-muted); font-size: 16px; }
        .settings-section { margin-bottom: 24px; }
        .section-title {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 24px; padding-bottom: 16px;
          border-bottom: 1px solid var(--border);
        }
        .section-title h2 { font-size: 18px; }
        .setting-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 16px 0; border-bottom: 1px solid var(--border);
        }
        .setting-row:last-child { border-bottom: none; padding-bottom: 0; }
        .setting-name { font-weight: 600; font-size: 15px; margin-bottom: 4px; color: var(--text-main); }
        .setting-desc { font-size: 13px; color: var(--text-muted); }
        .theme-toggle {
          display: flex; align-items: center; gap: 10px;
          background: transparent; color: var(--text-main); font-weight: 600; font-size: 14px;
        }
        .toggle-track {
          width: 52px; height: 28px; border-radius: 14px;
          background: var(--border); position: relative;
          transition: background 0.3s ease;
        }
        .toggle-track.dark { background: var(--primary); }
        .toggle-thumb {
          position: absolute; top: 4px; left: 4px;
          width: 20px; height: 20px; border-radius: 50%;
          background: white; display: flex; align-items: center; justify-content: center;
          transition: transform 0.3s ease;
          box-shadow: 0 1px 4px rgba(0,0,0,0.3);
          color: #333;
        }
        .toggle-track.dark .toggle-thumb { transform: translateX(24px); color: var(--primary); }
        .accent-options { display: flex; gap: 10px; }
        .accent-btn {
          width: 32px; height: 32px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          transition: transform 0.2s, box-shadow 0.2s;
          border: 3px solid transparent;
        }
        .accent-btn:hover { transform: scale(1.15); }
        .accent-btn.selected { border-color: var(--text-main); box-shadow: 0 0 0 2px var(--bg-card); }
        .accent-check { color: white; font-size: 13px; font-weight: 700; }
        .account-info-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
        .info-item { display: flex; flex-direction: column; gap: 4px; }
        .info-label { font-size: 12px; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
        .info-value { font-size: 15px; font-weight: 600; color: var(--text-main); }
        .role-badge {
          display: inline-block; background: var(--primary-light); color: var(--primary);
          padding: 3px 10px; border-radius: 20px; font-size: 13px; text-transform: capitalize;
        }
        .about-content { display: flex; justify-content: space-between; align-items: center; gap: 16px; }
        .about-content p { color: var(--text-muted); font-size: 14px; line-height: 1.7; }
        .version-badge {
          background: var(--primary-light); color: var(--primary);
          padding: 4px 12px; border-radius: 20px; font-size: 12px;
          font-weight: 700; white-space: nowrap;
        }
      `}</style>
    </DashboardLayout>
  );
};

export default Settings;
