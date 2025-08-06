import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex flex-col justify-center">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-indigo-600">AURA</h1>
          <p className="mt-2 text-gray-600">Advanced Unified Resource for Academia</p>
        </div>
        
        <div className="bg-white py-8 px-6 shadow-md rounded-lg sm:px-10 backdrop-blur-sm bg-white/90 border border-gray-100">
          <h2 className="mb-6 text-xl font-medium text-gray-900 text-center">
            Sign in to your account
          </h2>
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
