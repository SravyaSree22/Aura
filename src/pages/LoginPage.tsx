import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import SignupForm from '../components/auth/SignupForm';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  
  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    const handleSwitchToSignup = () => setIsLogin(false);
    const handleSwitchToLogin = () => setIsLogin(true);

    window.addEventListener('switchToSignup', handleSwitchToSignup);
    window.addEventListener('switchToLogin', handleSwitchToLogin);

    return () => {
      window.removeEventListener('switchToSignup', handleSwitchToSignup);
      window.removeEventListener('switchToLogin', handleSwitchToLogin);
    };
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex flex-col justify-center">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-indigo-600">AURA</h1>
          <p className="mt-2 text-gray-600">Advanced Unified Resource for Academia</p>
        </div>
        
        <div className="bg-white py-8 px-6 shadow-md rounded-lg sm:px-10 backdrop-blur-sm bg-white/90 border border-gray-100">
          <div className="flex mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-l-lg transition-colors ${
                isLogin
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-r-lg transition-colors ${
                !isLogin
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Sign Up
            </button>
          </div>
          
          <h2 className="mb-6 text-xl font-medium text-gray-900 text-center">
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </h2>
          
          {isLogin ? <LoginForm /> : <SignupForm />}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
