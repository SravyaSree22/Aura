
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { Bell, LogOut, Settings } from 'lucide-react';

const Header = () => {
  const { currentUser, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!currentUser) return null;

  return (
    <header className="bg-white border-b border-gray-200 py-4 px-6 flex items-center justify-between">
      <div className="flex items-center">
        <div className="text-2xl font-bold text-indigo-600 mr-10">AURA</div>
        <nav className="hidden md:flex space-x-6">
          <a href="#" className="text-gray-700 hover:text-indigo-600 text-sm font-medium"></a>
          <a href="#" className="text-gray-700 hover:text-indigo-600 text-sm font-medium"></a>
          <a href="#" className="text-gray-700 hover:text-indigo-600 text-sm font-medium"></a>
          <a href="#" className="text-gray-700 hover:text-indigo-600 text-sm font-medium"></a>
        </nav>
      </div>
      
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => navigate('/notifications')}
          className="relative p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
        <button 
          onClick={() => navigate('/settings')}
          className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
        >
          <Settings size={20} />
        </button>
        
        <div className="flex items-center ml-4">
          <img
            src={currentUser.profile_picture || currentUser.avatar || '/default-avatar.png'}
            alt={currentUser.name}
            className="w-8 h-8 rounded-full object-cover mr-2"
            onError={(e) => {
              // Fallback to default avatar if image fails to load
              const target = e.target as HTMLImageElement;
              target.src = '/default-avatar.png';
            }}
          />
          <div className="hidden md:block">
            <div className="text-sm font-medium text-gray-900">{currentUser.name}</div>
            <div className="text-xs text-gray-500 capitalize">{currentUser.role}</div>
          </div>
          
          <button
            onClick={handleLogout}
            className="ml-4 p-2 text-gray-500 hover:text-red-500 rounded-full hover:bg-gray-100"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
