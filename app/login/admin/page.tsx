'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, ArrowLeft, Building2, Loader2 } from 'lucide-react';
import { validateCredentials, storeSession } from '@/lib/auth';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('Attempting login with:', { email, password: '***', portal: 'admin' });
      const authResponse = await validateCredentials('admin', email, password);
      console.log('Auth response:', authResponse);
      
      if (authResponse.success && authResponse.session) {
        console.log('Login successful, storing session...');
        storeSession(authResponse.session);
        router.push('/admin/dashboard');
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
    setEmail('admin@silvermaid.ae');
    setPassword('Demo@123');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Back button */}
        <Link
          href="/login"
          className="inline-flex items-center text-slate-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to portal selection
        </Link>

        {/* Card */}
        <div className="bg-slate-700/40 backdrop-blur-xl border border-slate-600/50 rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-center mb-8">
            <div className="bg-blue-500/20 w-14 h-14 rounded-xl flex items-center justify-center">
              <Building2 className="w-7 h-7 text-blue-400" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white text-center mb-2">
            Admin Portal
          </h1>
          <p className="text-slate-400 text-center mb-8">
            Sign in to your admin account
          </p>

          {/* Error message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="admin@silvermaid.ae"
                required
              />
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember me checkbox */}
            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 bg-slate-800/50 border border-slate-600 rounded cursor-pointer accent-blue-500"
              />
              <label htmlFor="remember" className="ml-3 text-sm text-slate-400 cursor-pointer hover:text-slate-300 transition-colors">
                Remember me for 30 days
              </label>
            </div>

            {/* Forgot password link */}
            <div className="text-right">
              <Link
                href="/login/admin/forgot-password"
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo credentials info */}
          <div className="mt-8 pt-6 border-t border-slate-600/30">
            <p className="text-xs text-slate-500 text-center mb-3">Demo Credentials</p>
            <div className="bg-slate-800/50 rounded-lg p-3 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Email:</span>
                <code className="text-slate-300 font-mono">admin@silvermaid.ae</code>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Password:</span>
                <code className="text-slate-300 font-mono">Demo@123</code>
              </div>
              <button
                type="button"
                onClick={fillDemoCredentials}
                className="w-full mt-2 py-1.5 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 text-xs font-medium rounded transition-colors"
              >
                Use Demo Credentials
              </button>
            </div>
          </div>
        </div>

        {/* Support link */}
        <p className="text-center text-slate-400 text-sm mt-8">
          Need help? <a href="mailto:support@silvermaid.ae" className="text-blue-400 hover:text-blue-300">Contact support</a>
        </p>
      </div>
    </div>
  );
}
