'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Eye, EyeOff, ArrowLeft, Loader2, Clock, Calendar, FileText } from 'lucide-react';
import { validateCredentials, storeSession } from '@/lib/auth';

export default function EmployeeLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('Attempting login with:', { email, password: '***', portal: 'employee' });
      const authResponse = await validateCredentials('employee', email, password);
      console.log('Auth response:', authResponse);
      
      if (authResponse.success && authResponse.session) {
        console.log('Login successful, storing session...');
        storeSession(authResponse.session);
        router.push('/employee/dashboard');
      } else {
        console.log('Login failed:', authResponse.message);
        setError(authResponse.message || authResponse.error || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred');
    }
    
    setIsLoading(false);
  };

  const fillDemoCredentials = () => {
    setEmail('employee@silvermaid.ae');
    setPassword('Demo@123');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-900/20 to-slate-900 flex items-center justify-center p-4">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Back button */}
       

        {/* Login Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-violet-500/20 p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-violet-500/20 rounded-xl mb-4">
              <User className="w-8 h-8 text-violet-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Employee Portal</h1>
            <p className="text-slate-400">Self-service & job management</p>
          </div>

          {/* Features preview */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="text-center p-3 bg-slate-700/30 rounded-lg">
              <Clock className="w-5 h-5 text-violet-400 mx-auto mb-1" />
              <span className="text-xs text-slate-400">Attendance</span>
            </div>
            <div className="text-center p-3 bg-slate-700/30 rounded-lg">
              <Calendar className="w-5 h-5 text-violet-400 mx-auto mb-1" />
              <span className="text-xs text-slate-400">Leave</span>
            </div>
            <div className="text-center p-3 bg-slate-700/30 rounded-lg">
              <FileText className="w-5 h-5 text-violet-400 mx-auto mb-1" />
              <span className="text-xs text-slate-400">Payslips</span>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-white placeholder-slate-400"
                placeholder="employee@silvermaid.ae"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-white placeholder-slate-400 pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in to Employee Portal'
              )}
            </button>
          </form>

          {/* Demo credentials */}
         
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-sm mt-8">
          © 2026 Silver Maid. All rights reserved.
        </p>
      </div>
    </div>
  );
}
