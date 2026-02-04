// 'use client';

// import Link from 'next/link';
// import { 
//   Building2, 
//   UserCog, 
//   ClipboardCheck, 
//   User, 
//   Building, 
//   Eye,
//   ArrowRight,
//   Shield
// } from 'lucide-react';

// const portals = [
//   {
//     id: 'admin',
//     name: 'Admin Portal',
//     description: 'Full system administration and organization management',
//     icon: Building2,
//     color: 'from-blue-500 to-blue-600',
//     href: '/login/admin',
//     iconBg: 'bg-blue-100 dark:bg-blue-900/50',
//     textColor: 'text-blue-600 dark:text-blue-400',
//     borderColor: 'border-blue-500/20 hover:border-blue-500/40',
//     roles: ['Super Admin', 'Admin'],
//     badge: 'Full Access'
//   },
  
// ];

// export default function LoginPortalSelection() {
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
//       {/* Background elements */}
//       <div className="absolute inset-0 overflow-hidden">
//         <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
//         <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
//         <div className="absolute top-1/2 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl"></div>
//       </div>

//       <div className="relative z-10 w-full max-w-7xl">
//         {/* Header */}
//         <div className="text-center mb-12">
//           <div className="flex items-center justify-center gap-3 mb-4">
//             <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
//               <Shield className="w-7 h-7 text-white" />
//             </div>
//             <h1 className="text-4xl md:text-5xl font-bold text-white">
//               Homeware
//             </h1>
//           </div>
//           <p className="text-lg text-slate-300 mb-2">
//             Multi-Portal Management System
//           </p>
//           <p className="text-sm text-slate-400">
//             Select your portal to access the system
//           </p>
//         </div>

//         {/* Portal Cards Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 m-auto flex justify-center">
//           {portals.map((portal) => {
//             const Icon = portal.icon;
//             return (
//               <Link
//                 key={portal.id}
//                 href={portal.href}
//                 className={`group relative overflow-hidden m-auto rounded-2xl bg-slate-800/40 justify-center backdrop-blur-xl border ${portal.borderColor} transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]`}
//               >
//                 {/* Gradient overlay on hover */}
//                 <div
//                   className={`absolute inset-0 bg-gradient-to-br ${portal.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
//                 ></div>

//                 <div className="relative p-6">
//                   {/* Header with icon and badge */}
//                   <div className="flex items-start justify-between mb-4">
//                     <div className={`${portal.iconBg} w-14 h-14 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
//                       <Icon className={`${portal.textColor} w-7 h-7`} />
//                     </div>
//                     <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${portal.iconBg} ${portal.textColor}`}>
//                       {portal.badge}
//                     </span>
//                   </div>

//                   {/* Content */}
//                   <h3 className="text-xl font-bold text-white mb-2">
//                     {portal.name}
//                   </h3>
//                   <p className="text-slate-400 text-sm mb-4 min-h-[40px]">
//                     {portal.description}
//                   </p>

//                   {/* Roles */}
//                   <div className="flex flex-wrap gap-1.5 mb-4">
//                     {portal.roles.map(role => (
//                       <span 
//                         key={role}
//                         className="text-xs px-2 py-0.5 rounded bg-slate-700/50 text-slate-300"
//                       >
//                         {role}
//                       </span>
//                     ))}
//                   </div>

//                   {/* Arrow indicator */}
//                   <div className="flex items-center text-slate-400 group-hover:text-white transition-colors duration-300">
//                     <span className="text-sm font-semibold">Sign in</span>
//                     <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
//                   </div>
//                 </div>

//                 {/* Bottom gradient line */}
//                 <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${portal.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
//               </Link>
//             );
//           })}
//         </div>

//         {/* Quick Access Info */}
       

//         {/* Footer */}
//         <div className="text-center text-slate-400 text-sm space-y-2">
          
//         </div>
//       </div>
//     </div>
//   );
// }

// new code
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
    setEmail('admin@homeware.ae');
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
       

        {/* Card */}
        <div className="bg-slate-700/40 backdrop-blur-xl border border-slate-600/50 rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-center mb-8">
            <div className="bg-blue-500/20 w-14 h-14 rounded-xl flex items-center justify-center">
              <Building2 className="w-7 h-7 text-blue-400" />
            </div>
          </div>

         
          <p className="text-slate-400 text-center mb-8">
            Sign in to enter your account
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
                placeholder="admin@homeware.ae"
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
            
            <div className="bg-slate-800/50 rounded-lg p-3 space-y-2 text-xs">
              <div className="flex justify-between items-center">
               
              </div>
              <div className="flex justify-between items-center">
               
              </div>
              
            </div>
          </div>
        </div>

        {/* Support link */}
        <p className="text-center text-slate-400 text-sm mt-8">
          Need help? <a href="mailto:support@homeware.ae" className="text-blue-400 hover:text-blue-300">Contact support</a>
        </p>
      </div>
    </div>
  );
}
