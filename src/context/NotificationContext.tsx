import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo, useRef } from 'react';
import { Notification } from '../types';
import { apiService } from '../services/api';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  fetchNotifications: async () => {},
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  fetchUnreadCount: async () => {},
});

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { currentUser, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initializedRef = useRef(false);
  const loadingRef = useRef(false);

  const fetchNotifications = useCallback(async () => {
    if (loadingRef.current) return;
    
    loadingRef.current = true;
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getNotifications();
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (response.data) {
        setNotifications(response.data as Notification[]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await apiService.markNotificationAsRead(notificationId);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true, readAt: new Date().toISOString() }
            : notification
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await apiService.markAllNotificationsAsRead();
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      setNotifications(prev => 
        prev.map(notification => ({
          ...notification,
          isRead: true,
          readAt: new Date().toISOString()
        }))
      );
      
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await apiService.getUnreadNotificationCount();
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (response.data && typeof response.data === 'object' && 'count' in response.data) {
        setUnreadCount(response.data.count as number);
      }
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  }, []);

  // Initialize when user is authenticated
  useEffect(() => {
    // Don't fetch notifications while auth is still loading
    if (authLoading) {
      return;
    }
    
    // Only fetch notifications if user is authenticated
    if (!currentUser) {
      setNotifications([]);
      setUnreadCount(0);
      initializedRef.current = false;
      return;
    }

    if (!initializedRef.current) {
      initializedRef.current = true;
      // Use setTimeout to ensure this runs after the component is fully mounted
      setTimeout(() => {
        fetchNotifications();
        fetchUnreadCount();
      }, 0);
    }
  }, [currentUser, authLoading]); // Depend on authentication state

  // Refresh notifications every 30 seconds when user is authenticated
  useEffect(() => {
    if (!currentUser || authLoading) {
      return;
    }

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [fetchUnreadCount, currentUser, authLoading]);

  const value = useMemo(() => ({
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    fetchUnreadCount,
  }), [notifications, unreadCount, loading, error, fetchNotifications, markAsRead, markAllAsRead, fetchUnreadCount]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
