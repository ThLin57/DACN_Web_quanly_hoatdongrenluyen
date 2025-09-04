import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        try {
          const response = await authService.getProfile();
          // Backend trả về dữ liệu theo định dạng { success, message, data }
          const profile = response.data?.data || response.data;
          setUser(profile);
          localStorage.setItem('user', JSON.stringify(profile));
        } catch (error) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    const response = await authService.login(credentials);
    // Chuẩn hóa: lấy token/người dùng từ response.data.data
    const payload = response.data?.data || response.data;
    const token = payload?.token;
    const userData = payload?.user;

    if (!token || !userData) {
      throw new Error('Phản hồi đăng nhập không hợp lệ');
    }
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    
    return payload;
  };

  const register = async (userDataInput) => {
    const response = await authService.register(userDataInput);
    const payload = response.data?.data || response.data;
    const token = payload?.token;
    const newUser = payload?.user;

    if (!token || !newUser) {
      throw new Error('Phản hồi đăng ký không hợp lệ');
    }
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(newUser));
    setUser(newUser);
    
    return payload;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const updateProfile = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
