import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = '/api/auth';

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      axios.defaults.headers.common['x-auth-token'] = token;
    }
    setLoading(false);
  }, []);

  const register = async (userData) => {
    try {
      setError(null);
      const res = await axios.post(`${API_URL}/register`, userData);
      const { token, user: newUser } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);
      axios.defaults.headers.common['x-auth-token'] = token;
      return true;
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed');
      return false;
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const res = await axios.post(`${API_URL}/login`, { email, password });
      const { token, user: loggedInUser } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      axios.defaults.headers.common['x-auth-token'] = token;
      return true;
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    delete axios.defaults.headers.common['x-auth-token'];
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
