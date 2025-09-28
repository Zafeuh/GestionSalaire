import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { jwtDecode } from 'jwt-decode';
import AuthContext from './AuthContext';
import { loginUser, logoutUser } from '../config/api';

const DASHBOARD_ROUTES = {
  'SUPER_ADMIN': '/dashboard-super-admin',
  'ADMIN': '/dashboard-admin',
  'CAISSIER': '/dashboard-caissier'
};

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const handleAuthError = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('accessToken');
      if (storedToken) {
        try {
          const decoded = jwtDecode(storedToken);
          if (decoded.exp * 1000 < Date.now()) {
            throw new Error('Token expiré');
          }
          setUser({ 
            id: decoded.userId, 
            role: decoded.role || 'Unknown',
            entrepriseId: decoded.entrepriseId || null 
          });
          setToken(storedToken);

          if (DASHBOARD_ROUTES[decoded.role]) {
            navigate(DASHBOARD_ROUTES[decoded.role]);
          }
        } catch (error) {
          console.error('Erreur d\'authentification:', error);
          handleAuthError();
          navigate('/');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, [navigate]);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const result = await loginUser(email, password);
      
      if (!result || !result.accessToken) {
        throw new Error('Identifiants incorrects');
      }
      
      localStorage.setItem('accessToken', result.accessToken);
      if (result.refreshToken) {
        localStorage.setItem('refreshToken', result.refreshToken);
      }
      
      const decoded = jwtDecode(result.accessToken);
      
      if (!decoded.userId || !decoded.role) {
        throw new Error('Token invalide');
      }
      
      const userData = { 
        id: decoded.userId, 
        role: decoded.role,
        entrepriseId: decoded.entrepriseId || null 
      };
      setUser(userData);
      setToken(result.accessToken);
      
      if (DASHBOARD_ROUTES[userData.role]) {
        navigate(DASHBOARD_ROUTES[userData.role]);
        return true;
      } else {
        throw new Error('Rôle utilisateur non valide');
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      toast.error(error.message || 'Échec de la connexion');
      handleAuthError();
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await logoutUser(token);
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      handleAuthError();
      toast.success('Vous avez été déconnecté');
      navigate('/');
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}