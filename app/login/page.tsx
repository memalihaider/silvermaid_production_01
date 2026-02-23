// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { Eye, EyeOff, ArrowLeft, Building2, Loader2 } from 'lucide-react';
// import { validateCredentials, storeSession } from '@/lib/auth';

// export default function AdminLogin() {
//   const router = useRouter();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [rememberMe, setRememberMe] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');
//     setIsLoading(true);

//     try {
//       console.log('Attempting login with:', { email, password: '***', portal: 'admin' });
//       const authResponse = await validateCredentials('admin', email, password);
//       console.log('Auth response:', authResponse);
      
//       if (authResponse.success && authResponse.session) {
//         console.log('Login successful, storing session...');
//         storeSession(authResponse.session);
//         router.push('/admin/dashboard');
//       } else {
//         console.log('Login failed:', authResponse.message);
//         setError(authResponse.message || authResponse.error || 'Login failed');
//       }
//     } catch (err) {
//       console.error('Login error:', err);
//       setError('An unexpected error occurred');
//     }
    
//     setIsLoading(false);
//   };

//   const fillDemoCredentials = () => {
//     setEmail('admin@silvermaid.ae');
//     setPassword('Demo@123');
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
//       {/* Background elements */}
//       <div className="absolute inset-0 overflow-hidden">
//         <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
//         <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
//       </div>

//       <div className="relative z-10 w-full max-w-md">
//         {/* Back button */}
       

//         {/* Card */}
//         <div className="bg-slate-700/40 backdrop-blur-xl border border-slate-600/50 rounded-2xl p-8 shadow-2xl">
//           {/* Header */}
//           <div className="flex items-center justify-center mb-8">
//             <div className="bg-blue-500/20 w-14 h-14 rounded-xl flex items-center justify-center">
//               <Building2 className="w-7 h-7 text-blue-400" />
//             </div>
//           </div>

         
//           <p className="text-slate-400 text-center mb-8">
//             Sign in to enter your account
//           </p>

//           {/* Error message */}
//           {error && (
//             <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg mb-6 text-sm">
//               {error}
//             </div>
//           )}

//           {/* Form */}
//           <form onSubmit={handleSubmit} className="space-y-5">
//             {/* Email field */}
//             <div>
//               <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
//                 Email Address
//               </label>
//               <input
//                 id="email"
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
//                 placeholder="admin@silvermaid.ae"
//                 required
//               />
//             </div>

//             {/* Password field */}
//             <div>
//               <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
//                 Password
//               </label>
//               <div className="relative">
//                 <input
//                   id="password"
//                   type={showPassword ? 'text' : 'password'}
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all pr-12"
//                   placeholder="••••••••"
//                   required
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
//                 >
//                   {showPassword ? (
//                     <EyeOff className="w-5 h-5" />
//                   ) : (
//                     <Eye className="w-5 h-5" />
//                   )}
//                 </button>
//               </div>
//             </div>

//             {/* Remember me checkbox */}
           

          

//             {/* Submit button */}
//             <button
//               type="submit"
//               disabled={isLoading}
//               className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500/50"
//             >
//               {isLoading ? (
//                 <span className="flex items-center justify-center">
//                   <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
//                   Signing in...
//                 </span>
//               ) : (
//                 'Sign In'
//               )}
//             </button>
//           </form>

//           {/* Demo credentials info */}
//           <div className="mt-8 pt-6 border-t border-slate-600/30">
            
//             <div className="bg-slate-800/50 rounded-lg p-3 space-y-2 text-xs">
//               <div className="flex justify-between items-center">
               
//               </div>
//               <div className="flex justify-between items-center">
               
//               </div>
              
//             </div>
//           </div>
//         </div>

//         {/* Support link */}
//         <p className="text-center text-slate-400 text-sm mt-8">
//           Need help? <a href="mailto:support@silvermaid.ae" className="text-blue-400 hover:text-blue-300">Contact support</a>
//         </p>
//       </div>
//     </div>
//   );
// }


// new code
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Building2 } from 'lucide-react';
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
      console.log('🔐 Admin login attempt:', { email, portal: 'admin' });
      
      // 🔥 IMPORTANT: portal = 'admin' pass kar rahe hain
      const authResponse = await validateCredentials('admin', email, password);
      console.log('📡 Auth response:', authResponse);
      
      if (authResponse.success && authResponse.session) {
        console.log('✅ Login successful for admin:', authResponse.session.name);
        
        // Store session
        storeSession(authResponse.session);
        
        // Redirect to admin dashboard
        router.push('/admin/dashboard');
      } else {
        console.log('❌ Login failed:', authResponse.message);
        
        // Special message for employee trying to login here
        if (authResponse.message?.includes('Employee Portal')) {
          setError('This is an employee account. Please use Employee Login.');
        } else {
          setError(authResponse.message || authResponse.error || 'Invalid email or password');
        }
      }
    } catch (err) {
      console.error('💥 Login error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Back button */}
        <Link 
          href="/" 
          className="inline-flex items-center text-slate-400 hover:text-white transition-colors mb-8 group"
        >
          <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>

        {/* Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Building2 className="w-8 h-8 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white text-center">Admin Login</h1>
          <p className="text-slate-400 text-center mb-6">
            Sign in to access admin dashboard
          </p>

         

          {/* Error message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl mb-6 text-sm flex items-start gap-2">
              <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all pl-11"
                  placeholder="admin@silvermaid.ae"
                  required
                  disabled={isLoading}
                />
                <svg className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
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
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all pl-11 pr-12"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
                <svg className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

          
            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-500/50 shadow-lg shadow-purple-500/20"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

         

          {/* Employee Login Link */}
          <div className="mt-6 pt-6 border-t border-slate-700/50 text-center">
            <p className="text-sm text-slate-400">
              Are you an employee?{' '}
              <Link href="/login/employee" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                Go to Employee Login
              </Link>
            </p>
          </div>
        </div>

        {/* Support link */}
        <p className="text-center text-slate-500 text-sm mt-8">
          Need help?{' '}
          <a href="mailto:support@silvermaid.ae" className="text-purple-400 hover:text-purple-300 transition-colors">
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
}