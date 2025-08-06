import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { LockKeyhole, Mail } from 'lucide-react';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    setEmail('alex@example.com');
    setPassword('password123');
  };

  const loginAsTeacher = () => {
    setEmail('sarah@example.com');
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
        
        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={passwordError}
          fullWidth
          icon={<LockKeyhole size={18} />}
        />
        
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
      </form>
    </div>
  );
};

export default LoginForm;
