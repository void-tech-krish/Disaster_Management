import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { name, email, password, role: 'Citizen' });
      login(res.data.data.token, res.data.data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="bg-darkslate p-8 rounded-xl border border-gray-700 shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-white">Create Account</h2>
        
        {error && <div className="bg-danger/20 text-danger border border-danger p-3 rounded mb-4 text-sm">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-400 mb-2 text-sm">Full Name</label>
            <input 
              type="text" 
              className="w-full bg-charcoal border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-warning"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-400 mb-2 text-sm">Email Address</label>
            <input 
              type="email" 
              className="w-full bg-charcoal border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-warning"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-400 mb-2 text-sm">Password</label>
            <input 
              type="password" 
              className="w-full bg-charcoal border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-warning"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-warning hover:bg-yellow-500 text-darkslate font-bold py-2 px-4 rounded transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>
        <p className="mt-4 text-center text-gray-400 text-sm">
          Already have an account? <Link to="/login" className="text-warning hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
