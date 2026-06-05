import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get('/auth/me');
        setUser(data);
      } catch (err) {
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const loginUser = async (userId, password) => {
    setError(null);
    try {
      const { data } = await api.post('/auth/login', { userId, password });
      localStorage.setItem('token', data.token);
      setUser({ _id: data._id, name: data.name, userId: data.userId });
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      return false;
    }
  };

  const signupUser = async (name, userId, password) => {
    setError(null);
    try {
      const { data } = await api.post('/auth/signup', { name, userId, password });
      localStorage.setItem('token', data.token);
      setUser({ _id: data._id, name: data.name, userId: data.userId });
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
      return false;
    }
  };

  const logoutUser = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login: loginUser,
        signup: signupUser,
        logout: logoutUser,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
