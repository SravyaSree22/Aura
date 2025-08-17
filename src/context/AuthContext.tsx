import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { apiService } from '../services/api';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, role: 'student' | 'teacher') => Promise<void>;
  logout: () => void;
  error: string | null;
  isStudent: () => boolean;
  isTeacher: () => boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
  error: null,
  isStudent: () => false,
  isTeacher: () => false,
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
          console.log('CSRF token obtained successfully:', csrfData.csrfToken ? 'Yes' : 'No');
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
            
            // Validate session by making a request to a protected endpoint
            try {
              const response = await fetch('http://localhost:8050/api/assignments/', {
                credentials: 'include',
              });
              
              if (response.status === 200) {
                // Session is valid
                const validUser: User = {
                  id: userData.id,
                  name: userData.name,
                  email: userData.email,
                  role: userData.role as 'student' | 'teacher',
                  avatar: userData.avatar || ''
                };
                setCurrentUser(validUser);
                console.log('Session validated successfully');
              } else {
                // Session is invalid, clear localStorage
                console.log('Session invalid, clearing stored user data');
                localStorage.removeItem('aura_user');
              }
            } catch (error) {
              console.error('Session validation failed:', error);
              localStorage.removeItem('aura_user');
            }
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
        
        // Validate session by making a request to a protected endpoint
        try {
          const sessionResponse = await fetch('http://localhost:8050/api/assignments/', {
            credentials: 'include',
          });
          
          if (sessionResponse.status !== 200) {
            console.warn('Session validation failed after login');
            // Don't throw error, just log warning
          } else {
            console.log('Session validated successfully after login');
          }
        } catch (error) {
          console.error('Session validation error after login:', error);
        }
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

  const signup = async (email: string, password: string, name: string, role: 'student' | 'teacher') => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.signup(email, password, name, role);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (response.data) {
        setCurrentUser(response.data as User);
        localStorage.setItem('aura_user', JSON.stringify(response.data));
      } else {
        throw new Error('Failed to create account');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call Django logout endpoint to clear session
      await fetch('http://localhost:8050/api/auth/logout/', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    setCurrentUser(null);
    localStorage.removeItem('aura_user');
  };

  const isStudent = () => {
    return currentUser?.role === 'student';
  };

  const isTeacher = () => {
    return currentUser?.role === 'teacher';
  };

  const value = {
    currentUser,
    loading,
    login,
    signup,
    logout,
    error,
    isStudent,
    isTeacher,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
