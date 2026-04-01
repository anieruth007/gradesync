import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard,
  BookOpen,
  Layers,
  FileText,
  TrendingUp,
  LogOut,
  GraduationCap,
  Settings,
  Moon,
  Sun
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
  ];

  if (user?.role === 'student') {
    navItems.push({ name: 'My Courses', icon: <BookOpen size={20} />, path: '/courses' });
  }

  navItems.push(
    { name: 'Course Materials', icon: <BookOpen size={20} />, path: '/materials' },
    { name: 'Flashcards', icon: <Layers size={20} />, path: '/flashcards' },
    { name: 'Mock Tests', icon: <FileText size={20} />, path: '/tests' },
  );

  if (user?.role === 'teacher') {
    navItems.push({ name: 'Teacher Insights', icon: <TrendingUp size={20} />, path: '/insights' });
  }

  navItems.push({ name: 'Settings', icon: <Settings size={20} />, path: '/settings' });

  return (
    <aside className="sidebar glass">
      <div className="sidebar-header">
        <GraduationCap size={32} color="#6366f1" />
        <span>GradeSync</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink 
            key={item.name} 
            to={item.path} 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="user-info">
            <p className="user-name">{user?.name}</p>
            <p className="user-role">{user?.role}</p>
          </div>
        </div>
        <div className="sidebar-actions">
          <button onClick={toggleTheme} className="theme-btn" title="Toggle theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <button onClick={logout} className="logout-btn">
            <LogOut size={18} />
          </button>
        </div>
      </div>

      <style jsx>{`
        .sidebar {
          width: 260px;
          height: 100vh;
          position: fixed;
          left: 0;
          top: 0;
          display: flex;
          flex-direction: column;
          padding: 24px;
          border-right: 1px solid var(--border);
          z-index: 100;
        }
        .sidebar-header {
          display: flex;
          align-items: center;
          gap: 12px;
          font-family: 'Outfit', sans-serif;
          font-weight: 700;
          font-size: 20px;
          margin-bottom: 48px;
        }
        .sidebar-nav {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: var(--radius-md);
          color: var(--text-muted);
          font-weight: 500;
          transition: var(--transition);
        }
        .nav-item:hover {
          background: var(--primary-light);
          color: var(--primary);
        }
        .nav-item.active {
          background: var(--primary);
          color: var(--text-white);
        }
        .sidebar-footer {
          margin-top: auto;
          padding-top: 24px;
          border-top: 1px solid var(--border);
        }
        .user-profile {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }
        .avatar {
          width: 40px;
          height: 40px;
          background: var(--primary);
          color: white;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }
        .user-name {
          font-weight: 600;
          font-size: 14px;
          color: var(--text-main);
        }
        .user-role {
          font-size: 12px;
          color: var(--text-muted);
          text-transform: capitalize;
        }
        .sidebar-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .theme-btn {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          border-radius: var(--radius-md);
          color: var(--text-muted);
          background: var(--primary-light);
          font-weight: 600;
          font-size: 13px;
          transition: var(--transition);
        }
        .theme-btn:hover {
          color: var(--primary);
          background: var(--primary-light);
        }
        .logout-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 10px;
          border-radius: var(--radius-md);
          color: var(--error);
          background: transparent;
          font-weight: 600;
        }
        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.1);
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
