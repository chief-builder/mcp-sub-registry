import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRegister } from '../../services/api/hooks/useAuth';

export function RegisterPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const register = useRegister();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await register.mutateAsync({ 
        email, 
        username, 
        password, 
        ...(adminKey && { adminKey })
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/auth/login');
      }, 2000);
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  if (success) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
          Account Created Successfully!
        </h2>
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800 text-center">
            Your account has been created. Redirecting to login page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
        Create your account
      </h2>
      
      {register.error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">
            {register.error instanceof Error ? register.error.message : 'Registration failed. Please try again.'}
          </p>
        </div>
      )}
      
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label className="form-label">Email address</label>
          <input 
            type="email" 
            className="form-input" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div>
          <label className="form-label">Username</label>
          <input 
            type="text" 
            className="form-input" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        
        <div>
          <label className="form-label">Password</label>
          <input 
            type="password" 
            className="form-input" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <div>
          <label className="form-label">Admin Setup Key (if provided)</label>
          <input 
            type="password" 
            className="form-input" 
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
          />
          <p className="form-help">
            Enter the admin setup key if you were provided one by your organization.
          </p>
        </div>
        
        <button 
          type="submit" 
          className="btn-primary w-full"
          disabled={register.isPending}
        >
          {register.isPending ? 'Creating account...' : 'Create account'}
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <Link to="/auth/login" className="text-brand-600 hover:text-brand-700">
          Already have an account? Sign in
        </Link>
      </div>
    </div>
  );
}