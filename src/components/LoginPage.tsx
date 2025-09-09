import React, { useState } from 'react';
import { User, Shield, UserCheck } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import CustomerSignup from './customer/CustomerSignup';

interface LoginPageProps {
  onLogin: (role: string) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [selectedRole, setSelectedRole] = useState<string>('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSignup, setShowSignup] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error('Invalid credentials');
      const data = await res.json();
      localStorage.setItem('token', data.token);
      // Only allow login for selected role
      if (data.user?.role !== selectedRole) {
        setError(`This account is not a ${selectedRole}. Please select the correct role.`);
        setLoading(false);
        return;
      }
      onLogin(selectedRole);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    {
      id: 'customer',
      title: 'Customer',
      description: 'Create support tickets and chat with agents',
      icon: User,
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      id: 'agent',
      title: 'Support Agent',
      description: 'Handle customer inquiries and resolve tickets',
      icon: UserCheck,
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      id: 'admin',
      title: 'Administrator',
      description: 'Manage agents and oversee support operations',
      icon: Shield,
      color: 'bg-purple-500 hover:bg-purple-600'
    }
  ];

  if (showSignup) {
    return <CustomerSignup onSignup={() => setShowSignup(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to SupportHub
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A comprehensive customer support platform connecting customers, agents, and administrators
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {roles.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;
            
            return (
              <div
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`cursor-pointer rounded-xl p-6 border-2 transition-all duration-200 ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50 shadow-lg scale-105' 
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <div className="text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${role.color} flex items-center justify-center transition-colors`}>
                    <Icon size={32} className="text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{role.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{role.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <form onSubmit={handleLogin} className="max-w-md mx-auto mb-8 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <input
              type="text"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="customer"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="customer"
              required
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors shadow-lg hover:shadow-xl w-full"
            disabled={loading}
          >
            {loading ? 'Logging in...' : `Login as ${selectedRole}`}
          </button>
        </form>
        <div className="text-center mt-4">
          <button
            onClick={() => setShowSignup(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors shadow-lg hover:shadow-xl"
          >
            Sign Up as Customer
          </button>
        </div>

        {/* <div className="text-center">
          <button
            onClick={() => onLogin(selectedRole)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors shadow-lg hover:shadow-xl"
          >
            Continue as {roles.find(r => r.id === selectedRole)?.title}
          </button>
        </div> */}

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            This is a demo version. In production, you would authenticate with your actual credentials.
          </p>
        </div>
      </div>
    </div>
  );
}