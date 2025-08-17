import { useState, useEffect } from 'react';
import Card, { CardHeader, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Bell, Globe, Lock, Shield, Smartphone, User } from 'lucide-react';
import { apiService } from '../services/api';

interface Settings {
  language: string;
  dark_mode: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  two_factor_auth: boolean;
}

const SettingsPage = () => {
  // Settings state - now connected to database
  const [settings, setSettings] = useState<Settings>({
    language: 'english',
    dark_mode: false,
    email_notifications: true,
    push_notifications: true,
    two_factor_auth: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState('general');
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoggingOutAllDevices, setIsLoggingOutAllDevices] = useState(false);

  // Load user settings from API
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await apiService.getUserProfile();
        if (response.data) {
          const profileData = response.data;
          setSettings({
            language: profileData.language || 'english',
            dark_mode: profileData.dark_mode ?? false,
            email_notifications: profileData.email_notifications ?? true,
            push_notifications: profileData.push_notifications ?? true,
            two_factor_auth: profileData.two_factor_auth ?? false,
          });
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadSettings();
  }, []);

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await apiService.updateUserProfile(settings);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to save settings' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'New password must be at least 8 characters long' });
      return;
    }

    setIsChangingPassword(true);
    setMessage(null);

    try {
      const response = await apiService.changePassword(passwordData.currentPassword, passwordData.newPassword);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to change password' 
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogoutAllDevices = async () => {
    setIsLoggingOutAllDevices(true);
    setMessage(null);

    try {
      const response = await apiService.logoutAllDevices();
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      setMessage({ type: 'success', text: 'All devices signed out successfully!' });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to sign out all devices' 
      });
    } finally {
      setIsLoggingOutAllDevices(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Settings Navigation */}
        <div className="md:w-64 flex-shrink-0">
          <Card className="h-full">
            <CardContent className="p-0">
              <nav className="space-y-1">
                <button 
                  className={`flex items-center w-full px-4 py-3 text-sm ${activeTab === 'general' ? 'bg-indigo-50 text-indigo-700 border-l-2 border-indigo-700' : 'text-gray-700 hover:bg-gray-50'}`}
                  onClick={() => setActiveTab('general')}
                >
                  <User className={`mr-3 h-5 w-5 ${activeTab === 'general' ? 'text-indigo-700' : 'text-gray-400'}`} />
                  General
                </button>
                <button 
                  className={`flex items-center w-full px-4 py-3 text-sm ${activeTab === 'notifications' ? 'bg-indigo-50 text-indigo-700 border-l-2 border-indigo-700' : 'text-gray-700 hover:bg-gray-50'}`}
                  onClick={() => setActiveTab('notifications')}
                >
                  <Bell className={`mr-3 h-5 w-5 ${activeTab === 'notifications' ? 'text-indigo-700' : 'text-gray-400'}`} />
                  Notifications
                </button>
                <button 
                  className={`flex items-center w-full px-4 py-3 text-sm ${activeTab === 'security' ? 'bg-indigo-50 text-indigo-700 border-l-2 border-indigo-700' : 'text-gray-700 hover:bg-gray-50'}`}
                  onClick={() => setActiveTab('security')}
                >
                  <Shield className={`mr-3 h-5 w-5 ${activeTab === 'security' ? 'text-indigo-700' : 'text-gray-400'}`} />
                  Security
                </button>
                <button 
                  className={`flex items-center w-full px-4 py-3 text-sm ${activeTab === 'accessibility' ? 'bg-indigo-50 text-indigo-700 border-l-2 border-indigo-700' : 'text-gray-700 hover:bg-gray-50'}`}
                  onClick={() => setActiveTab('accessibility')}
                >
                  <Globe className={`mr-3 h-5 w-5 ${activeTab === 'accessibility' ? 'text-indigo-700' : 'text-gray-400'}`} />
                  Accessibility
                </button>
              </nav>
            </CardContent>
          </Card>
        </div>
        
        {/* Settings Content */}
        <div className="flex-1">
          {activeTab === 'general' && (
            <Card>
              <CardHeader>
                <h3 className="font-medium text-gray-900">General Settings</h3>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language
                  </label>
                  <select
                    value={settings.language}
                    onChange={(e) => handleSettingChange('language', e.target.value)}
                    className="block w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="english">English</option>
                    <option value="spanish">Spanish</option>
                    <option value="french">French</option>
                    <option value="german">German</option>
                    <option value="chinese">Chinese</option>
                  </select>
                </div>
                
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.dark_mode}
                      onChange={() => handleSettingChange('dark_mode', !settings.dark_mode)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Enable Dark Mode</span>
                  </label>
                  <p className="mt-1 text-xs text-gray-500">
                    Dark mode helps reduce eye strain in low-light environments.
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Zone
                  </label>
                  <select
                    className="block w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="utc">UTC (Coordinated Universal Time)</option>
                    <option value="est">EST (Eastern Standard Time)</option>
                    <option value="cst">CST (Central Standard Time)</option>
                    <option value="pst">PST (Pacific Standard Time)</option>
                  </select>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <Button variant="primary" onClick={handleSaveSettings} disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                  {message && (
                    <p className={`mt-2 text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                      {message.text}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          
          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <h3 className="font-medium text-gray-900">Notification Preferences</h3>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Email Notifications</h4>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.email_notifications}
                        onChange={() => handleSettingChange('email_notifications', !settings.email_notifications)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Enable Email Notifications</span>
                    </label>
                    
                    <div className="ml-6 space-y-2 mt-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          disabled={!settings.email_notifications}
                        />
                        <span className={`ml-2 text-sm ${settings.email_notifications ? 'text-gray-700' : 'text-gray-400'}`}>
                          Assignment updates
                        </span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          disabled={!settings.email_notifications}
                        />
                        <span className={`ml-2 text-sm ${settings.email_notifications ? 'text-gray-700' : 'text-gray-400'}`}>
                          Grade notifications
                        </span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          disabled={!settings.email_notifications}
                        />
                        <span className={`ml-2 text-sm ${settings.email_notifications ? 'text-gray-700' : 'text-gray-400'}`}>
                          Course announcements
                        </span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          disabled={!settings.email_notifications}
                        />
                        <span className={`ml-2 text-sm ${settings.email_notifications ? 'text-gray-700' : 'text-gray-400'}`}>
                          System updates
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Push Notifications</h4>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.push_notifications}
                        onChange={() => handleSettingChange('push_notifications', !settings.push_notifications)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Enable Push Notifications</span>
                    </label>
                    
                    <div className="ml-6 space-y-2 mt-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          disabled={!settings.push_notifications}
                        />
                        <span className={`ml-2 text-sm ${settings.push_notifications ? 'text-gray-700' : 'text-gray-400'}`}>
                          Due date reminders
                        </span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          disabled={!settings.push_notifications}
                        />
                        <span className={`ml-2 text-sm ${settings.push_notifications ? 'text-gray-700' : 'text-gray-400'}`}>
                          New messages
                        </span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          disabled={!settings.push_notifications}
                        />
                        <span className={`ml-2 text-sm ${settings.push_notifications ? 'text-gray-700' : 'text-gray-400'}`}>
                          New assignments
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <Button variant="primary" onClick={handleSaveSettings} disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save Preferences'}
                  </Button>
                  {message && (
                    <p className={`mt-2 text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                      {message.text}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          
          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <h3 className="font-medium text-gray-900">Security Settings</h3>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Change Password</h4>
                  <div className="space-y-3">
                    <Input 
                      type="password" 
                      label="Current Password" 
                      icon={<Lock size={16} />}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    />
                    <Input 
                      type="password" 
                      label="New Password" 
                      icon={<Lock size={16} />}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    />
                    <Input 
                      type="password" 
                      label="Confirm New Password" 
                      icon={<Lock size={16} />}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    />
                    <div className="pt-2">
                      <Button 
                        size="sm" 
                        onClick={handlePasswordChange}
                        disabled={isChangingPassword}
                      >
                        {isChangingPassword ? 'Updating...' : 'Update Password'}
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Two-Factor Authentication</h4>
                  <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <Shield className="h-6 w-6 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
                        <p className="text-xs text-gray-500">Add an extra layer of security to your account</p>
                      </div>
                    </div>
                    <div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          value="" 
                          className="sr-only peer" 
                          checked={settings.two_factor_auth}
                          onChange={() => handleSettingChange('two_factor_auth', !settings.two_factor_auth)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Session Management</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <Smartphone className="h-5 w-5 text-gray-400 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Current Session</p>
                          <p className="text-xs text-gray-500">Windows 11 · Chrome · IP 192.168.1.1</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                        Active Now
                      </span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleLogoutAllDevices}
                      disabled={isLoggingOutAllDevices}
                    >
                      {isLoggingOutAllDevices ? 'Signing Out...' : 'Sign Out All Other Devices'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {activeTab === 'accessibility' && (
            <Card>
              <CardHeader>
                <h3 className="font-medium text-gray-900">Accessibility Settings</h3>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Display Settings</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Font Size
                      </label>
                      <select
                        className="block w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="small">Small</option>
                        <option value="medium" selected>Medium (Default)</option>
                        <option value="large">Large</option>
                        <option value="x-large">Extra Large</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Contrast
                      </label>
                      <select
                        className="block w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="normal" selected>Normal</option>
                        <option value="high">High Contrast</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Reduce Motion</span>
                      </label>
                      <p className="mt-1 text-xs text-gray-500">
                        Minimize animations throughout the interface.
                      </p>
                    </div>
                    
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Screen Reader Optimization</span>
                      </label>
                      <p className="mt-1 text-xs text-gray-500">
                        Improves compatibility with screen readers.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <Button variant="primary" onClick={handleSaveSettings} disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save Accessibility Settings'}
                  </Button>
                  {message && (
                    <p className={`mt-2 text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                      {message.text}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
