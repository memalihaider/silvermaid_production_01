'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Megaphone,
  Package,
  LogOut,
  Menu,
  Eye,
  Calendar,
  Info,
  ExternalLink,
  Star,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Clock
} from 'lucide-react';
import { getSession, clearSession, type SessionData } from '@/lib/auth';

// Mock data for guest dashboard
const announcements = [
  { 
    id: '1', 
    title: 'New Service Offerings for 2024', 
    excerpt: 'We are excited to announce our expanded range of home maintenance services including smart home integration and energy efficiency solutions.',
    date: '2024-02-01',
    category: 'News',
    image: null
  },
  { 
    id: '2', 
    title: 'Holiday Operating Hours', 
    excerpt: 'Please note our modified operating hours during the upcoming National Day celebrations.',
    date: '2024-01-30',
    category: 'Notice',
    image: null
  },
  { 
    id: '3', 
    title: 'Customer Satisfaction Survey Results', 
    excerpt: 'Thank you for your feedback! We achieved a 95% satisfaction rate in our annual customer survey.',
    date: '2024-01-28',
    category: 'News',
    image: null
  },
  { 
    id: '4', 
    title: 'Sustainability Initiative Launch', 
    excerpt: 'Silver Maid is committed to sustainability. Learn about our new eco-friendly practices and green service options.',
    date: '2024-01-25',
    category: 'News',
    image: null
  },
];

const serviceCategories = [
  { id: '1', name: 'HVAC Services', description: 'Air conditioning, heating, and ventilation solutions', icon: '❄️', services: 12 },
  { id: '2', name: 'Electrical Works', description: 'Complete electrical installation and maintenance', icon: '⚡', services: 15 },
  { id: '3', name: 'Plumbing', description: 'Professional plumbing services and repairs', icon: '🔧', services: 10 },
  { id: '4', name: 'Renovation', description: 'Home and office renovation projects', icon: '🏠', services: 8 },
  { id: '5', name: 'Maintenance', description: 'Regular and preventive maintenance plans', icon: '🛠️', services: 20 },
  { id: '6', name: 'Smart Home', description: 'Smart home automation and integration', icon: '📱', services: 6 },
];

const featuredProducts = [
  { id: '1', name: 'Premium AC Unit', brand: 'Daikin', rating: 4.8, price: 'AED 2,500' },
  { id: '2', name: 'Smart Thermostat', brand: 'Nest', rating: 4.9, price: 'AED 850' },
  { id: '3', name: 'LED Panel Lights', brand: 'Philips', rating: 4.7, price: 'AED 120' },
  { id: '4', name: 'Water Heater', brand: 'Ariston', rating: 4.6, price: 'AED 1,200' },
];

const companyInfo = {
  about: 'Silver Maid is a leading provider of home and commercial maintenance services in the UAE. With over 15 years of experience, we deliver exceptional quality and customer satisfaction.',
  founded: '2009',
  employees: '500+',
  projectsCompleted: '10,000+',
  locations: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman']
};

const contactInfo = {
  phone: '+971 4 123 4567',
  email: 'info@silvermaid.ae',
  address: 'Office 501, Business Bay, Dubai, UAE',
  hours: 'Sun - Thu: 8:00 AM - 6:00 PM'
};

const sidebarItems = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, href: '/guest/dashboard' },
  { id: 'announcements', name: 'Announcements', icon: Megaphone, href: '/guest/announcements' },
  { id: 'catalog', name: 'Service Catalog', icon: Package, href: '/guest/catalog' },
];

export default function GuestDashboard() {
  const router = useRouter();
  const [session, setSession] = useState<SessionData | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const storedSession = getSession();
    if (!storedSession) {
      router.push('/login/guest');
      return;
    }
    setSession(storedSession);
  }, [router]);

  const handleLogout = () => {
    clearSession();
    router.push('/login');
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 border-r border-slate-700 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Guest Portal</h1>
                <p className="text-xs text-slate-400">Silver Maid</p>
              </div>
            </div>
          </div>

          {/* Guest notice */}
          <div className="p-4 border-b border-slate-700 bg-amber-500/5">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-slate-400">
                You're browsing as a guest. <Link href="/login" className="text-amber-400 hover:text-amber-300">Sign in</Link> for full access.
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === 'dashboard';
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-gray-500/20 text-gray-300'
                      : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}

            <div className="pt-4 mt-4 border-t border-slate-700">
              <p className="text-xs text-slate-500 px-3 mb-2">Quick Links</p>
              <a
                href="tel:+97141234567"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-700/50 hover:text-white transition-colors"
              >
                <Phone className="w-5 h-5" />
                Call Us
              </a>
              <a
                href="mailto:info@silvermaid.ae"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-700/50 hover:text-white transition-colors"
              >
                <Mail className="w-5 h-5" />
                Email Us
              </a>
            </div>
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-500/20 rounded-full flex items-center justify-center text-gray-400 font-semibold">
                G
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">Guest User</p>
                <p className="text-xs text-slate-400 truncate">Limited access</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Exit"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
          <div className="flex items-center justify-between px-4 lg:px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-white">Welcome to Silver Maid</h1>
                <p className="text-sm text-slate-400">Explore our services and announcements</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
              >
                Sign In for Full Access
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </header>

        {/* Dashboard content */}
        <div className="p-4 lg:p-6 space-y-6">
          {/* About Banner */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-3">About Silver Maid</h2>
                <p className="text-slate-400 mb-4">{companyInfo.about}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-white">{companyInfo.projectsCompleted}</p>
                    <p className="text-xs text-slate-400">Projects Completed</p>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-white">{companyInfo.employees}</p>
                    <p className="text-xs text-slate-400">Team Members</p>
                  </div>
                </div>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-white mb-3">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-300">{contactInfo.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-300">{contactInfo.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-300">{contactInfo.address}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-300">{contactInfo.hours}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-600">
                  <p className="text-xs text-slate-400 mb-2">We operate in:</p>
                  <div className="flex flex-wrap gap-2">
                    {companyInfo.locations.map(location => (
                      <span key={location} className="text-xs bg-slate-600 text-slate-300 px-2 py-1 rounded">
                        {location}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Service Categories */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Our Services</h2>
              <Link href="/guest/catalog" className="text-sm text-gray-400 hover:text-gray-300 flex items-center gap-1">
                View catalog <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {serviceCategories.map((category) => (
                <div key={category.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:border-slate-600 transition-colors cursor-pointer">
                  <div className="text-3xl mb-3">{category.icon}</div>
                  <p className="text-sm font-medium text-white mb-1">{category.name}</p>
                  <p className="text-xs text-slate-400">{category.services} services</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Announcements */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl">
              <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-amber-400" />
                  Latest Announcements
                </h2>
                <Link href="/guest/announcements" className="text-sm text-gray-400 hover:text-gray-300">
                  View all
                </Link>
              </div>
              <div className="p-4 space-y-4">
                {announcements.slice(0, 3).map((announcement) => (
                  <div key={announcement.id} className="group cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className="w-1 h-full bg-slate-600 rounded-full group-hover:bg-amber-400 transition-colors"></div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded">{announcement.category}</span>
                          <span className="text-xs text-slate-500">{announcement.date}</span>
                        </div>
                        <p className="text-sm font-medium text-white group-hover:text-gray-300 transition-colors">{announcement.title}</p>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{announcement.excerpt}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Featured Products */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl">
              <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  Featured Products
                </h2>
                <Link href="/guest/catalog" className="text-sm text-gray-400 hover:text-gray-300">
                  Browse all
                </Link>
              </div>
              <div className="p-4 space-y-3">
                {featuredProducts.map((product) => (
                  <div key={product.id} className="flex items-center gap-4 p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer">
                    <div className="w-12 h-12 bg-slate-600 rounded-lg flex items-center justify-center text-2xl">
                      📦
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{product.name}</p>
                      <p className="text-xs text-slate-400">{product.brand}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-white">{product.price}</p>
                      <div className="flex items-center gap-1 text-xs text-yellow-400">
                        <Star className="w-3 h-3 fill-yellow-400" />
                        {product.rating}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA Banner */}
          <div className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border border-blue-500/30 rounded-xl p-6 text-center">
            <h2 className="text-xl font-bold text-white mb-2">Ready to Get Started?</h2>
            <p className="text-slate-400 mb-4">Sign in or register for full access to our services, quotations, and support.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/login"
                className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
              >
                Register as Client
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}