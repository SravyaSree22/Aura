import { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import Card, { CardHeader, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Bell, Calendar, Check, FileText, MessageCircle, EllipsisVertical, AlertTriangle, Heart } from 'lucide-react';

const NotificationsPage = () => {
  const { notifications, loading, error, fetchNotifications, markAsRead, markAllAsRead } = useNotifications();
  const [filter, setFilter] = useState('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  
  // Filter notifications
  const filteredNotifications = notifications
    .filter(notification => {
      if (showUnreadOnly && notification.isRead) return false;
      if (filter === 'all') return true;
      return notification.type === filter;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
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
      case 'doubt':
        return <MessageCircle className="w-5 h-5 text-purple-500" />;
      case 'attendance':
        return <Calendar className="w-5 h-5 text-amber-500" />;
      case 'emotion':
        return <Heart className="w-5 h-5 text-pink-500" />;
      case 'system':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };
  
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading notifications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        </div>
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading notifications</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={fetchNotifications} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={markAllAsRead}
            disabled={!notifications.some(n => !n.isRead)}
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
              variant={filter === 'doubt' ? 'primary' : 'outline'} 
              size="sm"
              onClick={() => setFilter('doubt')}
            >
              Doubts
            </Button>
            <Button 
              variant={filter === 'attendance' ? 'primary' : 'outline'} 
              size="sm"
              onClick={() => setFilter('attendance')}
            >
              Attendance
            </Button>
            <Button 
              variant={filter === 'emotion' ? 'primary' : 'outline'} 
              size="sm"
              onClick={() => setFilter('emotion')}
            >
              Emotions
            </Button>
            <Button 
              variant={filter === 'system' ? 'primary' : 'outline'} 
              size="sm"
              onClick={() => setFilter('system')}
            >
              System
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
                  className={`p-4 hover:bg-gray-50 transition-colors ${notification.isRead ? 'bg-white' : 'bg-indigo-50'}`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="rounded-full bg-gray-100 p-2">
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>
                    
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className={`text-sm font-medium ${notification.isRead ? 'text-gray-900' : 'text-indigo-800'}`}>
                          {notification.title}
                        </h3>
                        <div className="flex items-center">
                          <span className="text-xs text-gray-500">
                            {formatDate(notification.createdAt)}
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
                      
                      {!notification.isRead && (
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
