import React, { useState } from 'react';
import Card, { CardHeader, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Calendar, Check, Clock, FileText, MessageCircle, EllipsisVertical, User } from 'lucide-react';

const NotificationsPage = () => {
  // Notifications data from API
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'assignment',
      title: 'New Assignment Added',
      message: 'Calculus Problem Set has been added to Mathematics.',
      date: '2025-07-17T10:15:00',
      read: false,
    },
    {
      id: 2,
      type: 'grade',
      title: 'New Grade Posted',
      message: 'Your grade for Algorithm Assignment has been posted.',
      date: '2025-07-16T14:30:00',
      read: true,
    },
    {
      id: 3,
      type: 'message',
      title: 'New Message',
      message: 'Dr. Sarah Chen replied to your question about integration by parts.',
      date: '2025-07-16T11:45:00',
      read: false,
    },
    {
      id: 4,
      type: 'schedule',
      title: 'Class Rescheduled',
      message: 'Physics class on Friday has been moved to 3:30 PM.',
      date: '2025-07-15T09:20:00',
      read: true,
    },
    {
      id: 5,
      type: 'assignment',
      title: 'Assignment Due Soon',
      message: 'Mechanics Lab Report is due in 2 days.',
      date: '2025-07-15T08:00:00',
      read: false,
    },
    {
      id: 6,
      type: 'message',
      title: 'New Message',
      message: 'Prof. Michael Rodriguez posted an announcement in Computer Science.',
      date: '2025-07-14T16:10:00',
      read: true,
    },
    {
      id: 7,
      type: 'grade',
      title: 'New Grade Posted',
      message: 'Your grade for Essay Submission has been posted.',
      date: '2025-07-14T13:25:00',
      read: true,
    },
  ]);
  
  const [filter, setFilter] = useState('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  
  // Handle mark as read
  const markAsRead = (id: number) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };
  
  // Handle mark all as read
  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
  };
  
  // Filter notifications
  const filteredNotifications = notifications
    .filter(notification => {
      if (showUnreadOnly && notification.read) return false;
      if (filter === 'all') return true;
      return notification.type === filter;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffInDays === 1) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
  // Get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'assignment':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'grade':
        return <FileText className="w-5 h-5 text-green-500" />;
      case 'message':
        return <MessageCircle className="w-5 h-5 text-purple-500" />;
      case 'schedule':
        return <Calendar className="w-5 h-5 text-amber-500" />;
      default:
        return <User className="w-5 h-5 text-gray-500" />;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={markAllAsRead}
            disabled={!notifications.some(n => !n.read)}
          >
            <Check className="w-4 h-4 mr-1" />
            Mark All as Read
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="border-b border-gray-200">
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={filter === 'all' ? 'primary' : 'outline'} 
              size="sm"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button 
              variant={filter === 'assignment' ? 'primary' : 'outline'} 
              size="sm"
              onClick={() => setFilter('assignment')}
            >
              Assignments
            </Button>
            <Button 
              variant={filter === 'grade' ? 'primary' : 'outline'} 
              size="sm"
              onClick={() => setFilter('grade')}
            >
              Grades
            </Button>
            <Button 
              variant={filter === 'message' ? 'primary' : 'outline'} 
              size="sm"
              onClick={() => setFilter('message')}
            >
              Messages
            </Button>
            <Button 
              variant={filter === 'schedule' ? 'primary' : 'outline'} 
              size="sm"
              onClick={() => setFilter('schedule')}
            >
              Schedule
            </Button>
            
            <div className="ml-auto">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showUnreadOnly}
                  onChange={() => setShowUnreadOnly(!showUnreadOnly)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Unread only</span>
              </label>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {filteredNotifications.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredNotifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 hover:bg-gray-50 transition-colors ${notification.read ? 'bg-white' : 'bg-indigo-50'}`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="rounded-full bg-gray-100 p-2">
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>
                    
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className={`text-sm font-medium ${notification.read ? 'text-gray-900' : 'text-indigo-800'}`}>
                          {notification.title}
                        </h3>
                        <div className="flex items-center">
                          <span className="text-xs text-gray-500">
                            {formatDate(notification.date)}
                          </span>
                          <div className="ml-2 relative">
                            <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100">
                              <EllipsisVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      
                      {!notification.read && (
                        <div className="mt-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                          >
                            Mark as Read
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {showUnreadOnly 
                  ? "You have no unread notifications." 
                  : filter !== 'all'
                  ? `You have no ${filter} notifications.`
                  : "Your notification inbox is empty."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsPage;
