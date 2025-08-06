import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { apiService } from '../services/api';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  login: async () => {},
  logout: () => {},
  error: null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Get CSRF token first
        const csrfResponse = await fetch('http://localhost:8050/api/users/csrf_token/', {
          credentials: 'include',
        });
        
        if (csrfResponse.ok) {
          const csrfData = await csrfResponse.json();
          // The CSRF token will be automatically set in cookies by Django
          console.log('CSRF token obtained successfully');
        } else {
          console.error('Failed to get CSRF token:', csrfResponse.status);
        }
      } catch (error) {
        console.error('Failed to get CSRF token:', error);
      }

      // Check if user is logged in from localStorage
      const storedUser = localStorage.getItem('aura_user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          // Validate that the stored data has the required User properties
          if (userData && typeof userData === 'object' && 
              'id' in userData && 'name' in userData && 'email' in userData && 'role' in userData &&
              typeof userData.id === 'string' && typeof userData.name === 'string' && 
              typeof userData.email === 'string' && typeof userData.role === 'string') {
            const validUser: User = {
              id: userData.id,
              name: userData.name,
              email: userData.email,
              role: userData.role as 'student' | 'teacher',
              avatar: userData.avatar || ''
            };
            setCurrentUser(validUser);
          } else {
            throw new Error('Invalid user data format');
          }
        } catch (error) {
          console.error('Failed to parse stored user data:', error);
          localStorage.removeItem('aura_user');
        }
      }
      setLoading(false);
    };

    initializeApp();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.login(email, password);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (response.data) {
        setCurrentUser(response.data as User);
        localStorage.setItem('aura_user', JSON.stringify(response.data));
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('aura_user');
  };

  const value = {
    currentUser,
    loading,
    login,
    logout,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
