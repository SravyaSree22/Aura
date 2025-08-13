import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { LockKeyhole, Mail, Eye, EyeOff } from 'lucide-react';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { login, error, loading } = useAuth();

  const validateForm = () => {
    let isValid = true;
    
    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Email is invalid');
      isValid = false;
    } else {
      setEmailError('');
    }
    
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    } else {
      setPasswordError('');
    }
    
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      await login(email, password);
    } catch (err) {
      // Error is handled in the AuthContext
      console.error(err);
    }
  };

  // For demo purposes, provide login credentials
  const loginAsStudent = () => {
    setEmail('teacher1@example.com');
    setPassword('password123');
  };

  const loginAsTeacher = () => {
    setEmail('student1@example.com');
    setPassword('password123');
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={emailError}
          fullWidth
          icon={<Mail size={18} />}
        />
        
        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={passwordError}
            fullWidth
            icon={<LockKeyhole size={18} />}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            style={{ top: 'calc(50% + 8px)' }}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        
        {error && <p className="text-red-600 text-sm">{error}</p>}
        
        <Button
          type="submit"
          fullWidth
          isLoading={loading}
          className="mt-6"
        >
          Log In
        </Button>
        
        <div className="mt-4 text-center text-sm text-gray-600">
          <p className="mb-2">For demo purposes, use:</p>
          <div className="flex gap-2 justify-center mt-2">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={loginAsStudent}
            >
              Login as Student
            </Button>
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={loginAsTeacher}
            >
              Login as Teacher
            </Button>
          </div>
        </div>
        
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
                         Don&apos;t have an account?{' '}
            <button
              type="button"
              className="text-indigo-600 hover:text-indigo-500 font-medium"
              onClick={() => {
                // This will be handled by the parent component
                const event = new CustomEvent('switchToSignup');
                window.dispatchEvent(event);
              }}
            >
              Sign up here
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
