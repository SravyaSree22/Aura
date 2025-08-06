import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Award, BookOpen, Calendar, CircleHelp, LayoutDashboard, MessageSquare, Settings, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  
  if (!currentUser) return null;
  
  const isActive = (path: string) => location.pathname === path;
  
  const studentLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Courses', path: '/courses', icon: <BookOpen size={20} /> },
    { name: 'Schedule', path: '/schedule', icon: <Calendar size={20} /> },
    { name: 'Ask Doubts', path: '/doubts', icon: <MessageSquare size={20} /> },
  ];
  
  const teacherLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Courses', path: '/courses', icon: <BookOpen size={20} /> },
    { name: 'Schedule', path: '/schedule', icon: <Calendar size={20} /> },
    { name: 'Students', path: '/students', icon: <Users size={20} /> },
    { name: 'Doubts', path: '/doubts', icon: <MessageSquare size={20} /> },
  ];
  
  const links = currentUser.role === 'student' ? studentLinks : teacherLinks;
  
  return (
    <aside className="bg-white border-r border-gray-200 w-64 h-screen flex flex-col">
      <div className="p-4 flex-1">
        <nav className="space-y-1 mt-6">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`
                flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors
                ${isActive(link.path)
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}
              `}
            >
              <span className={`mr-3 ${isActive(link.path) ? 'text-indigo-700' : 'text-gray-500'}`}>
                {link.icon}
              </span>
              {link.name}
            </Link>
          ))}
        </nav>
      </div>
      
      <div className="p-4 border-t border-gray-200 space-y-1">
        <Link
          to="/settings"
          className="flex items-center px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
        >
          <span className="mr-3 text-gray-500">
            <Settings size={20} />
          </span>
          Settings
        </Link>
        
        <Link
          to="/help"
          className="flex items-center px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
        >
          <span className="mr-3 text-gray-500">
            <CircleHelp size={20} />
          </span>
          Help & Support
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
