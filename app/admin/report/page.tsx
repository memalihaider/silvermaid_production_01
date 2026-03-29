'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Download,
  RefreshCw,
  TrendingUp,
  DollarSign,
  Package,
  Users,
  Briefcase,
  BarChart3,
  PieChart,
  ChevronDown,
  X,
  Menu,
  Mail,
  User,
  Sparkles,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Layers,
  FileText
} from 'lucide-react';
import { format, subDays, subMonths, startOfMonth, endOfMonth, startOfYear, endOfYear, startOfWeek, endOfWeek } from 'date-fns';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getSession } from '@/lib/auth';
import * as XLSX from 'xlsx';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';


// ============================================
// INTERFACES
// ============================================

interface Job {
  id: string;
  title: string;
  client: string;
  clientId: string;
  status: string;
  priority: string;
  budget: number;
  actualCost: number;
  createdAt: string;
  completedAt?: string;
  scheduledDate?: string;
  teamRequired: number;
  location: string;
  description: string;
}

interface Service {
  id: string;
  name: string;
  categoryName: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  status: string;
  type: string;
  unit: string;
  createdAt: string;
  updatedAt: string;
}

interface Product {
  id: string;
  name: string;
  categoryName: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  status: string;
  type: string;
  unit: string;
  createdAt: string;
  updatedAt: string;
}

interface Booking {
  id: string;
  bookingId: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  serviceName?: string;
  date: string;
  time: string;
  status: string;
  area: string;
  propertyType: string;
  frequency: string;
  staffName?: string;
  totalAmount?: number;
  estimatedPrice?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  materialsOption?: string;
  schedule?: { date: string; time: string }[];
  message: string;
  createdAt: string;
  updatedAt: string;
}

interface DateRange {
  start: Date;
  end: Date;
  label: string;
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function FinanceAnalyticsPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Data states
  const [jobs, setJobs] = useState<Job[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date()),
    label: 'This Month'
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customStartDate, setCustomStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [customEndDate, setCustomEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'services' | 'bookings'>('overview');

  // Date range presets
  const datePresets = [
    { label: 'Today', start: new Date(), end: new Date() },
    { label: 'Yesterday', start: subDays(new Date(), 1), end: subDays(new Date(), 1) },
    { label: 'This Week', start: startOfWeek(new Date(), { weekStartsOn: 1 }), end: endOfWeek(new Date(), { weekStartsOn: 1 }) },
    { label: 'This Month', start: startOfMonth(new Date()), end: endOfMonth(new Date()) },
    { label: 'Last Month', start: startOfMonth(subMonths(new Date(), 1)), end: endOfMonth(subMonths(new Date(), 1)) },
    { label: 'This Year', start: startOfYear(new Date()), end: endOfYear(new Date()) },
    { label: 'All Time', start: new Date(2020, 0, 1), end: new Date() },
  ];

  // Session check
  useEffect(() => {
    const storedSession = getSession();
    if (!storedSession) {
      router.push('/login');
      return;
    }
    setSession(storedSession);
  }, [router]);

  // Fetch all data
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchJobs(),
        fetchServices(),
        fetchProducts(),
        fetchBookings()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const jobsRef = collection(db, 'jobs');
      const snapshot = await getDocs(jobsRef);
      const jobsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Job[];
      setJobs(jobsData);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const fetchServices = async () => {
    try {
      const servicesRef = collection(db, 'services');
      const snapshot = await getDocs(servicesRef);
      const servicesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Service[];
      setServices(servicesData);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const productsRef = collection(db, 'products');
      const snapshot = await getDocs(productsRef);
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      const bookingsRef = collection(db, 'bookings');
      const snapshot = await getDocs(bookingsRef);
      const bookingsData = snapshot.docs.map(doc => {
        const data = doc.data() as any;
        const schedule = Array.isArray(data.schedule) ? data.schedule : [];
        const date = data.date || data.bookingDate || schedule[0]?.date || '';
        const time = data.time || data.bookingTime || schedule[0]?.time || '';
        const serviceName = data.serviceName || data.service || '';
        const totalAmount = Number(data.totalAmount ?? data.estimatedPrice ?? 0);
        const paymentMethod = data.paymentMethod || data.payment_method || '';
        const paymentStatus = data.paymentStatus || data.payment_status || '';

        return {
          id: doc.id,
          bookingId: data.bookingId || `BK${doc.id.slice(-6).toUpperCase()}`,
          name: data.name || data.clientName || '',
          email: data.email || data.clientEmail || '',
          phone: data.phone || data.clientPhone || '',
          service: serviceName,
          serviceName,
          date,
          time,
          status: data.status || 'pending',
          area: data.area || data.clientAddress || '',
          propertyType: data.propertyType || '',
          frequency: data.frequency || 'once',
          staffName: data.staffName || data.assignedStaffName || data.assignedStaff || '',
          totalAmount,
          estimatedPrice: Number(data.estimatedPrice ?? totalAmount),
          paymentMethod,
          paymentStatus,
          materialsOption: data.materialsOption || data.materialOption || '',
          schedule,
          message: data.message || data.notes || '',
          createdAt: data.createdAt || '',
          updatedAt: data.updatedAt || '',
        } as Booking;
      });
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  // Filter data by date range
  const filterByDateRange = <T extends { createdAt?: string }>(
    items: T[]
  ): T[] => {
    return items.filter(item => {
      const dateStr = item.createdAt;
      if (!dateStr) return false;
      
      const itemDate = new Date(dateStr);
      return itemDate >= dateRange.start && itemDate <= dateRange.end;
    });
  };

  // Apply date filter to all data
  const filteredJobs = useMemo(() => filterByDateRange(jobs), [jobs, dateRange]);
  const filteredServices = useMemo(() => filterByDateRange(services), [services, dateRange]);
  const filteredProducts = useMemo(() => filterByDateRange(products), [products, dateRange]);
  const filteredBookings = useMemo(() => filterByDateRange(bookings), [bookings, dateRange]);

  const getBookingAmount = (booking: Booking) =>
    booking.totalAmount ?? booking.estimatedPrice ?? 0;

  const resolvePaymentStatus = (booking: Booking) => {
    if (booking.paymentStatus) return booking.paymentStatus;
    if (booking.paymentMethod === 'card') return 'paid';
    if (booking.paymentMethod === 'after-work') return 'after-work';
    return 'pending';
  };

  const bookingPaymentBreakdown = useMemo(() => {
    return filteredBookings.reduce(
      (acc, booking) => {
        const status = resolvePaymentStatus(booking);
        const amount = getBookingAmount(booking);

        if (status === 'paid') {
          acc.paid += 1;
          acc.paidAmount += amount;
        } else if (status === 'after-work') {
          acc.afterWork += 1;
          acc.afterWorkAmount += amount;
        } else {
          acc.pending += 1;
          acc.pendingAmount += amount;
        }

        return acc;
      },
      {
        paid: 0,
        afterWork: 0,
        pending: 0,
        paidAmount: 0,
        afterWorkAmount: 0,
        pendingAmount: 0,
      },
    );
  }, [filteredBookings]);

  const materialsUsage = useMemo(() => {
    return filteredBookings.reduce(
      (acc, booking) => {
        if (booking.materialsOption === 'with-materials') {
          acc.withMaterials += 1;
        } else if (booking.materialsOption === 'without-materials') {
          acc.withoutMaterials += 1;
        } else {
          acc.unknown += 1;
        }
        return acc;
      },
      {
        withMaterials: 0,
        withoutMaterials: 0,
        unknown: 0,
      },
    );
  }, [filteredBookings]);

  const inventoryMetrics = useMemo(() => {
    const totalStock = filteredProducts.reduce((sum, product) => sum + (product.stock || 0), 0);
    const totalCostValue = filteredProducts.reduce(
      (sum, product) => sum + (product.cost || 0) * (product.stock || 0),
      0,
    );
    const totalRetailValue = filteredProducts.reduce(
      (sum, product) => sum + (product.price || 0) * (product.stock || 0),
      0,
    );
    const lowStock = filteredProducts.filter(
      (product) => (product.stock || 0) <= (product.minStock || 0),
    ).length;

    return {
      totalStock,
      totalCostValue,
      totalRetailValue,
      lowStock,
    };
  }, [filteredProducts]);

  // ============================================
  // THIS WEEK DATA
  // ============================================

  const thisWeekRange = useMemo(() => ({
    start: startOfWeek(new Date(), { weekStartsOn: 1 }),
    end: endOfWeek(new Date(), { weekStartsOn: 1 })
  }), []);

  const thisWeekJobs = useMemo(() => 
    jobs.filter(job => {
      if (!job.createdAt) return false;
      const jobDate = new Date(job.createdAt);
      return jobDate >= thisWeekRange.start && jobDate <= thisWeekRange.end;
    }), [jobs, thisWeekRange]);

  const thisWeekServices = useMemo(() => 
    services.filter(service => {
      if (!service.createdAt) return false;
      const serviceDate = new Date(service.createdAt);
      return serviceDate >= thisWeekRange.start && serviceDate <= thisWeekRange.end;
    }), [services, thisWeekRange]);

  const thisWeekProducts = useMemo(() => 
    products.filter(product => {
      if (!product.createdAt) return false;
      const productDate = new Date(product.createdAt);
      return productDate >= thisWeekRange.start && productDate <= thisWeekRange.end;
    }), [products, thisWeekRange]);

  const thisWeekBookings = useMemo(() => 
    bookings.filter(booking => {
      if (!booking.createdAt) return false;
      const bookingDate = new Date(booking.createdAt);
      return bookingDate >= thisWeekRange.start && bookingDate <= thisWeekRange.end;
    }), [bookings, thisWeekRange]);

  const thisWeekMetrics = useMemo(() => ({
    jobs: {
      count: thisWeekJobs.length,
      revenue: thisWeekJobs.reduce((sum, job) => sum + (job.budget || 0), 0),
      profit: thisWeekJobs.reduce((sum, job) => sum + ((job.budget || 0) - (job.actualCost || 0)), 0)
    },
    services: {
      count: thisWeekServices.length,
      revenue: thisWeekServices.reduce((sum, service) => sum + ((service.price || 0) * (service.stock || 1)), 0),
      profit: thisWeekServices.reduce((sum, service) => sum + (((service.price || 0) - (service.cost || 0)) * (service.stock || 1)), 0)
    },
    products: {
      count: thisWeekProducts.length,
      revenue: thisWeekProducts.reduce((sum, product) => sum + ((product.price || 0) * (product.stock || 0)), 0),
      profit: thisWeekProducts.reduce((sum, product) => sum + (((product.price || 0) - (product.cost || 0)) * (product.stock || 0)), 0),
      itemsSold: thisWeekProducts.reduce((sum, product) => sum + (product.stock || 0), 0)
    },
    bookings: {
      count: thisWeekBookings.length,
      pending: thisWeekBookings.filter(b => b.status === 'pending').length,
      completed: thisWeekBookings.filter(b => b.status === 'completed').length,
      revenue: thisWeekBookings.reduce((sum, booking) => sum + getBookingAmount(booking), 0),
      paid: thisWeekBookings.filter(b => resolvePaymentStatus(b) === 'paid').length,
      afterWork: thisWeekBookings.filter(b => resolvePaymentStatus(b) === 'after-work').length,
      pendingPayment: thisWeekBookings.filter(b => resolvePaymentStatus(b) === 'pending').length
    }
  }), [thisWeekJobs, thisWeekServices, thisWeekProducts, thisWeekBookings]);

  // ============================================
  // FINANCIAL CALCULATIONS
  // ============================================

  const financialMetrics = useMemo(() => {
    // Jobs financials
    const totalJobBudget = filteredJobs.reduce((sum, job) => sum + (job.budget || 0), 0);
    const totalJobActualCost = filteredJobs.reduce((sum, job) => sum + (job.actualCost || 0), 0);
    const jobProfit = totalJobBudget - totalJobActualCost;
    const jobProfitMargin = totalJobBudget > 0 ? (jobProfit / totalJobBudget) * 100 : 0;

    // Services financials
    const totalServiceRevenue = filteredServices.reduce((sum, service) => sum + (service.price || 0) * (service.stock || 1), 0);
    const totalServiceCost = filteredServices.reduce((sum, service) => sum + (service.cost || 0) * (service.stock || 1), 0);
    const serviceProfit = totalServiceRevenue - totalServiceCost;
    const serviceProfitMargin = totalServiceRevenue > 0 ? (serviceProfit / totalServiceRevenue) * 100 : 0;

    // Products financials
    const totalProductRevenue = filteredProducts.reduce((sum, product) => sum + (product.price || 0) * (product.stock || 0), 0);
    const totalProductCost = filteredProducts.reduce((sum, product) => sum + (product.cost || 0) * (product.stock || 0), 0);
    const productProfit = totalProductRevenue - totalProductCost;
    const productProfitMargin = totalProductRevenue > 0 ? (productProfit / totalProductRevenue) * 100 : 0;

    // Bookings count
    const totalBookings = filteredBookings.length;
    const pendingBookings = filteredBookings.filter(b => b.status === 'pending').length;
    const completedBookings = filteredBookings.filter(b => b.status === 'completed').length;
    const totalBookingRevenue = filteredBookings.reduce((sum, booking) => sum + getBookingAmount(booking), 0);
    const paidBookingRevenue = bookingPaymentBreakdown.paidAmount;
    const outstandingBookingRevenue = bookingPaymentBreakdown.afterWorkAmount + bookingPaymentBreakdown.pendingAmount;

    // Overall
    const totalRevenue = totalJobBudget + totalServiceRevenue + totalProductRevenue;
    const totalCost = totalJobActualCost + totalServiceCost + totalProductCost;
    const totalProfit = totalRevenue - totalCost;
    const overallProfitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    return {
      jobs: {
        count: filteredJobs.length,
        budget: totalJobBudget,
        actualCost: totalJobActualCost,
        profit: jobProfit,
        profitMargin: jobProfitMargin,
        completed: filteredJobs.filter(j => j.status === 'Completed').length,
        inProgress: filteredJobs.filter(j => j.status === 'In Progress').length,
        pending: filteredJobs.filter(j => j.status === 'Pending').length,
      },
      services: {
        count: filteredServices.length,
        revenue: totalServiceRevenue,
        cost: totalServiceCost,
        profit: serviceProfit,
        profitMargin: serviceProfitMargin,
        active: filteredServices.filter(s => s.status === 'ACTIVE').length,
      },
      products: {
        count: filteredProducts.length,
        revenue: totalProductRevenue,
        cost: totalProductCost,
        profit: productProfit,
        profitMargin: productProfitMargin,
        totalStock: filteredProducts.reduce((sum, p) => sum + (p.stock || 0), 0),
        lowStock: filteredProducts.filter(p => (p.stock || 0) <= (p.minStock || 0)).length,
      },
      bookings: {
        total: totalBookings,
        pending: pendingBookings,
        completed: completedBookings,
        conversionRate: totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0,
        revenue: totalBookingRevenue,
        paidRevenue: paidBookingRevenue,
        outstandingRevenue: outstandingBookingRevenue,
      },
      overall: {
        revenue: totalRevenue,
        cost: totalCost,
        profit: totalProfit,
        profitMargin: overallProfitMargin,
      },
    };
  }, [filteredJobs, filteredServices, filteredProducts, filteredBookings]);

  const statementMetrics = useMemo(() => {
    const revenue = {
      jobs: financialMetrics.jobs.budget,
      services: financialMetrics.services.revenue,
      products: financialMetrics.products.revenue,
      bookings: financialMetrics.bookings.revenue,
    };
    const totalRevenue = revenue.jobs + revenue.services + revenue.products + revenue.bookings;

    const cost = {
      jobs: financialMetrics.jobs.actualCost,
      services: financialMetrics.services.cost,
      products: financialMetrics.products.cost,
    };
    const totalCost = cost.jobs + cost.services + cost.products;
    const profit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

    const cashflow = {
      collected: bookingPaymentBreakdown.paidAmount,
      afterWork: bookingPaymentBreakdown.afterWorkAmount,
      pending: bookingPaymentBreakdown.pendingAmount,
      outstanding: bookingPaymentBreakdown.afterWorkAmount + bookingPaymentBreakdown.pendingAmount,
    };

    return {
      revenue,
      totalRevenue,
      cost,
      totalCost,
      profit,
      profitMargin,
      cashflow,
    };
  }, [financialMetrics, bookingPaymentBreakdown]);

  // ============================================
  // CHART DATA
  // ============================================

  // Revenue by category (pie chart)
  const revenueByCategory = useMemo(() => {
    return [
      { name: 'Jobs', value: financialMetrics.jobs.budget, color: '#3b82f6' },
      { name: 'Services', value: financialMetrics.services.revenue, color: '#10b981' },
      { name: 'Products', value: financialMetrics.products.revenue, color: '#f59e0b' },
    ].filter(item => item.value > 0);
  }, [financialMetrics]);

  // Profit by category (bar chart)
  const profitByCategory = useMemo(() => {
    return [
      { name: 'Jobs', profit: financialMetrics.jobs.profit, margin: financialMetrics.jobs.profitMargin },
      { name: 'Services', profit: financialMetrics.services.profit, margin: financialMetrics.services.profitMargin },
      { name: 'Products', profit: financialMetrics.products.profit, margin: financialMetrics.products.profitMargin },
    ];
  }, [financialMetrics]);

  // Monthly trend data
  const monthlyTrendData = useMemo(() => {
    const months: { [key: string]: { revenue: number; cost: number; profit: number } } = {};
    
    // Process jobs
    filteredJobs.forEach(job => {
      if (job.createdAt) {
        const month = format(new Date(job.createdAt), 'MMM yyyy');
        if (!months[month]) months[month] = { revenue: 0, cost: 0, profit: 0 };
        months[month].revenue += job.budget || 0;
        months[month].cost += job.actualCost || 0;
      }
    });

    // Process services
    filteredServices.forEach(service => {
      if (service.createdAt) {
        const month = format(new Date(service.createdAt), 'MMM yyyy');
        if (!months[month]) months[month] = { revenue: 0, cost: 0, profit: 0 };
        months[month].revenue += (service.price || 0) * (service.stock || 1);
        months[month].cost += (service.cost || 0) * (service.stock || 1);
      }
    });

    // Process products
    filteredProducts.forEach(product => {
      if (product.createdAt) {
        const month = format(new Date(product.createdAt), 'MMM yyyy');
        if (!months[month]) months[month] = { revenue: 0, cost: 0, profit: 0 };
        months[month].revenue += (product.price || 0) * (product.stock || 0);
        months[month].cost += (product.cost || 0) * (product.stock || 0);
      }
    });

    // Calculate profit
    Object.keys(months).forEach(month => {
      months[month].profit = months[month].revenue - months[month].cost;
    });

    // Convert to array and sort by date
    return Object.entries(months)
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => {
        const dateA = new Date(a.month);
        const dateB = new Date(b.month);
        return dateA.getTime() - dateB.getTime();
      });
  }, [filteredJobs, filteredServices, filteredProducts]);

  // Job status distribution
  const jobStatusData = useMemo(() => {
    const statusCount: { [key: string]: number } = {};
    filteredJobs.forEach(job => {
      statusCount[job.status] = (statusCount[job.status] || 0) + 1;
    });
    
    const colors: { [key: string]: string } = {
      'Completed': '#10b981',
      'In Progress': '#3b82f6',
      'Pending': '#f59e0b',
      'Scheduled': '#8b5cf6',
      'Cancelled': '#ef4444',
    };

    return Object.entries(statusCount).map(([name, value]) => ({
      name,
      value,
      color: colors[name] || '#6b7280'
    }));
  }, [filteredJobs]);

  const bookingPaymentChart = useMemo(() => {
    return [
      { name: 'Paid', value: bookingPaymentBreakdown.paid, color: '#10b981' },
      { name: 'After Work', value: bookingPaymentBreakdown.afterWork, color: '#f59e0b' },
      { name: 'Pending', value: bookingPaymentBreakdown.pending, color: '#94a3b8' },
    ].filter(item => item.value > 0);
  }, [bookingPaymentBreakdown]);

  const materialsUsageChart = useMemo(() => {
    return [
      { name: 'With Materials', value: materialsUsage.withMaterials, color: '#3b82f6' },
      { name: 'Without Materials', value: materialsUsage.withoutMaterials, color: '#22c55e' },
      { name: 'Unknown', value: materialsUsage.unknown, color: '#94a3b8' },
    ].filter(item => item.value > 0);
  }, [materialsUsage]);

  // Top performing services
  const topServices = useMemo(() => {
    return [...filteredServices]
      .sort((a, b) => (b.price || 0) - (a.price || 0))
      .slice(0, 5)
      .map(s => ({
        name: s.name,
        revenue: (s.price || 0) * (s.stock || 1),
        profit: ((s.price || 0) - (s.cost || 0)) * (s.stock || 1),
      }));
  }, [filteredServices]);

  // ============================================
  // EXCEL EXPORT
  // ============================================

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();

    // Summary Sheet
    const summaryData = [
      ['FINANCE ANALYTICS REPORT'],
      [`Generated on: ${format(new Date(), 'dd MMM yyyy HH:mm')}`],
      [`Date Range: ${format(dateRange.start, 'dd MMM yyyy')} - ${format(dateRange.end, 'dd MMM yyyy')}`],
      [],
      ['OVERALL METRICS'],
      ['Metric', 'Value'],
      ['Total Revenue', `AED ${financialMetrics.overall.revenue.toLocaleString()}`],
      ['Total Cost', `AED ${financialMetrics.overall.cost.toLocaleString()}`],
      ['Total Profit', `AED ${financialMetrics.overall.profit.toLocaleString()}`],
      ['Profit Margin', `${financialMetrics.overall.profitMargin.toFixed(2)}%`],
      ['Bookings Revenue (Gross)', `AED ${financialMetrics.bookings.revenue.toLocaleString()}`],
      ['Bookings Paid (Stripe)', `AED ${financialMetrics.bookings.paidRevenue.toLocaleString()}`],
      ['Bookings Outstanding', `AED ${financialMetrics.bookings.outstandingRevenue.toLocaleString()}`],
      [],
      ['JOBS METRICS'],
      ['Metric', 'Value'],
      ['Total Jobs', financialMetrics.jobs.count],
      ['Completed Jobs', financialMetrics.jobs.completed],
      ['In Progress Jobs', financialMetrics.jobs.inProgress],
      ['Pending Jobs', financialMetrics.jobs.pending],
      ['Total Budget', `AED ${financialMetrics.jobs.budget.toLocaleString()}`],
      ['Total Actual Cost', `AED ${financialMetrics.jobs.actualCost.toLocaleString()}`],
      ['Job Profit', `AED ${financialMetrics.jobs.profit.toLocaleString()}`],
      ['Job Profit Margin', `${financialMetrics.jobs.profitMargin.toFixed(2)}%`],
      [],
      ['SERVICES METRICS'],
      ['Metric', 'Value'],
      ['Total Services', financialMetrics.services.count],
      ['Active Services', financialMetrics.services.active],
      ['Service Revenue', `AED ${financialMetrics.services.revenue.toLocaleString()}`],
      ['Service Cost', `AED ${financialMetrics.services.cost.toLocaleString()}`],
      ['Service Profit', `AED ${financialMetrics.services.profit.toLocaleString()}`],
      ['Service Profit Margin', `${financialMetrics.services.profitMargin.toFixed(2)}%`],
      [],
      ['PRODUCTS METRICS'],
      ['Metric', 'Value'],
      ['Total Products', financialMetrics.products.count],
      ['Total Stock', financialMetrics.products.totalStock],
      ['Low Stock Items', financialMetrics.products.lowStock],
      ['Product Revenue', `AED ${financialMetrics.products.revenue.toLocaleString()}`],
      ['Product Cost', `AED ${financialMetrics.products.cost.toLocaleString()}`],
      ['Product Profit', `AED ${financialMetrics.products.profit.toLocaleString()}`],
      ['Product Profit Margin', `${financialMetrics.products.profitMargin.toFixed(2)}%`],
      [],
      ['BOOKINGS METRICS'],
      ['Metric', 'Value'],
      ['Total Bookings', financialMetrics.bookings.total],
      ['Pending Bookings', financialMetrics.bookings.pending],
      ['Completed Bookings', financialMetrics.bookings.completed],
      ['Conversion Rate', `${financialMetrics.bookings.conversionRate.toFixed(2)}%`],
      ['Paid Bookings Amount', `AED ${financialMetrics.bookings.paidRevenue.toLocaleString()}`],
      ['After Work + Pending Amount', `AED ${financialMetrics.bookings.outstandingRevenue.toLocaleString()}`],
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');

    const statementSheetData = [
      ['COMPLETE STATEMENT'],
      [`Generated on: ${format(new Date(), 'dd MMM yyyy HH:mm')}`],
      [`Date Range: ${format(dateRange.start, 'dd MMM yyyy')} - ${format(dateRange.end, 'dd MMM yyyy')}`],
      [],
      ['REVENUE'],
      ['Jobs', `AED ${statementMetrics.revenue.jobs.toLocaleString()}`],
      ['Services', `AED ${statementMetrics.revenue.services.toLocaleString()}`],
      ['Products', `AED ${statementMetrics.revenue.products.toLocaleString()}`],
      ['Bookings (Gross)', `AED ${statementMetrics.revenue.bookings.toLocaleString()}`],
      ['Total Revenue', `AED ${statementMetrics.totalRevenue.toLocaleString()}`],
      [],
      ['COSTS'],
      ['Jobs Cost', `AED ${statementMetrics.cost.jobs.toLocaleString()}`],
      ['Services Cost', `AED ${statementMetrics.cost.services.toLocaleString()}`],
      ['Products Cost', `AED ${statementMetrics.cost.products.toLocaleString()}`],
      ['Total Cost', `AED ${statementMetrics.totalCost.toLocaleString()}`],
      [],
      ['PROFIT'],
      ['Net Profit', `AED ${statementMetrics.profit.toLocaleString()}`],
      ['Profit Margin', `${statementMetrics.profitMargin.toFixed(2)}%`],
      [],
      ['CASHFLOW (BOOKINGS)'],
      ['Collected (Stripe)', `AED ${statementMetrics.cashflow.collected.toLocaleString()}`],
      ['After Work', `AED ${statementMetrics.cashflow.afterWork.toLocaleString()}`],
      ['Pending', `AED ${statementMetrics.cashflow.pending.toLocaleString()}`],
      ['Outstanding', `AED ${statementMetrics.cashflow.outstanding.toLocaleString()}`],
    ];
    const statementSheet = XLSX.utils.aoa_to_sheet(statementSheetData);
    XLSX.utils.book_append_sheet(wb, statementSheet, 'Statement');

    // Jobs Sheet
    if (filteredJobs.length > 0) {
      const jobsSheetData = [
        ['ID', 'Title', 'Client', 'Status', 'Priority', 'Budget (AED)', 'Actual Cost (AED)', 'Profit (AED)', 'Team Required', 'Location', 'Created At'],
        ...filteredJobs.map(job => [
          job.id,
          job.title,
          job.client,
          job.status,
          job.priority,
          job.budget || 0,
          job.actualCost || 0,
          (job.budget || 0) - (job.actualCost || 0),
          job.teamRequired || 0,
          job.location || '',
          job.createdAt ? format(new Date(job.createdAt), 'dd/MM/yyyy') : '',
        ])
      ];
      const jobsSheet = XLSX.utils.aoa_to_sheet(jobsSheetData);
      XLSX.utils.book_append_sheet(wb, jobsSheet, 'Jobs');
    }

    // Services Sheet
    if (filteredServices.length > 0) {
      const servicesSheetData = [
        ['ID', 'Name', 'Category', 'Price (AED)', 'Cost (AED)', 'Profit (AED)', 'Margin %', 'Stock', 'Status', 'Created At'],
        ...filteredServices.map(service => {
          const profit = (service.price || 0) - (service.cost || 0);
          const margin = service.price ? (profit / service.price) * 100 : 0;
          return [
            service.id,
            service.name,
            service.categoryName || '',
            service.price || 0,
            service.cost || 0,
            profit,
            margin.toFixed(2),
            service.stock || 0,
            service.status || '',
            service.createdAt ? format(new Date(service.createdAt), 'dd/MM/yyyy') : '',
          ];
        })
      ];
      const servicesSheet = XLSX.utils.aoa_to_sheet(servicesSheetData);
      XLSX.utils.book_append_sheet(wb, servicesSheet, 'Services');
    }

    // Products Sheet
    if (filteredProducts.length > 0) {
      const productsSheetData = [
        ['ID', 'Name', 'Category', 'Price (AED)', 'Cost (AED)', 'Profit (AED)', 'Margin %', 'Stock', 'Min Stock', 'Status', 'Created At'],
        ...filteredProducts.map(product => {
          const profit = (product.price || 0) - (product.cost || 0);
          const margin = product.price ? (profit / product.price) * 100 : 0;
          return [
            product.id,
            product.name,
            product.categoryName || '',
            product.price || 0,
            product.cost || 0,
            profit,
            margin.toFixed(2),
            product.stock || 0,
            product.minStock || 0,
            product.status || '',
            product.createdAt ? format(new Date(product.createdAt), 'dd/MM/yyyy') : '',
          ];
        })
      ];
      const productsSheet = XLSX.utils.aoa_to_sheet(productsSheetData);
      XLSX.utils.book_append_sheet(wb, productsSheet, 'Products');
    }

    // Materials Summary Sheet
    const materialsSheetData = [
      ['MATERIALS SUMMARY'],
      [`Generated on: ${format(new Date(), 'dd MMM yyyy HH:mm')}`],
      [`Date Range: ${format(dateRange.start, 'dd MMM yyyy')} - ${format(dateRange.end, 'dd MMM yyyy')}`],
      [],
      ['INVENTORY'],
      ['Total Stock', inventoryMetrics.totalStock],
      ['Low Stock Items', inventoryMetrics.lowStock],
      ['Cost Value (AED)', inventoryMetrics.totalCostValue.toLocaleString()],
      ['Retail Value (AED)', inventoryMetrics.totalRetailValue.toLocaleString()],
      [],
      ['BOOKING MATERIALS USAGE'],
      ['With Materials', materialsUsage.withMaterials],
      ['Without Materials', materialsUsage.withoutMaterials],
      ['Unknown', materialsUsage.unknown],
    ];
    const materialsSheet = XLSX.utils.aoa_to_sheet(materialsSheetData);
    XLSX.utils.book_append_sheet(wb, materialsSheet, 'Materials');

    // Bookings Sheet
    if (filteredBookings.length > 0) {
      const bookingsSheetData = [
        ['Booking ID', 'Customer', 'Email', 'Phone', 'Service', 'Date', 'Time', 'Amount (AED)', 'Payment Status', 'Payment Method', 'Materials', 'Status', 'Area', 'Property Type', 'Staff', 'Schedule Days', 'Created At'],
        ...filteredBookings.map(booking => [
          booking.bookingId || booking.id,
          booking.name || '',
          booking.email || '',
          booking.phone || '',
          booking.serviceName || booking.service || '',
          booking.date || '',
          booking.time || '',
          getBookingAmount(booking),
          resolvePaymentStatus(booking),
          booking.paymentMethod || '',
          booking.materialsOption || 'unknown',
          booking.status || '',
          booking.area || '',
          booking.propertyType || '',
          booking.staffName || '',
          booking.schedule?.length || 0,
          booking.createdAt ? format(new Date(booking.createdAt), 'dd/MM/yyyy') : '',
        ])
      ];
      const bookingsSheet = XLSX.utils.aoa_to_sheet(bookingsSheetData);
      XLSX.utils.book_append_sheet(wb, bookingsSheet, 'Bookings');
    }

    // Save file
    XLSX.writeFile(wb, `Finance_Report_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`);
  };

  // ============================================
  // DATE RANGE HANDLERS
  // ============================================

  const applyDatePreset = (preset: typeof datePresets[0]) => {
    setDateRange({
      start: preset.start,
      end: preset.end,
      label: preset.label
    });
    setShowDatePicker(false);
  };

  const applyCustomDateRange = () => {
    setDateRange({
      start: new Date(customStartDate),
      end: new Date(customEndDate),
      label: 'Custom Range'
    });
    setShowDatePicker(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading financial data...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-gray-50 flex">
     

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-200">
          <div className="flex items-center justify-between p-6 max-w-7xl mx-auto w-full">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Finance Analytics</h1>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <span>Real-time financial overview and analytics</span>
                  <Badge variant="outline" className="border-blue-500/30 text-blue-600">
                    {dateRange.label}
                  </Badge>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Date Range Picker */}
              <div className="relative">
                <Button
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  variant="outline"
                  className="border-gray-300 hover:bg-gray-50 text-gray-700"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  {dateRange.label}
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>

                {showDatePicker && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowDatePicker(false)}
                    />
                    <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 p-4">
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-gray-900">Quick Select</p>
                        <div className="grid grid-cols-2 gap-2">
                          {datePresets.map(preset => (
                            <button
                              key={preset.label}
                              onClick={() => applyDatePreset(preset)}
                              className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>

                        <div className="border-t border-gray-200 my-3" />

                        <p className="text-sm font-medium text-gray-900">Custom Range</p>
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">Start Date</label>
                            <input
                              type="date"
                              value={customStartDate}
                              onChange={(e) => setCustomStartDate(e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">End Date</label>
                            <input
                              type="date"
                              value={customEndDate}
                              onChange={(e) => setCustomEndDate(e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm"
                            />
                          </div>
                          <Button
                            onClick={applyCustomDateRange}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            Apply Range
                          </Button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Export Button */}
              <Button
                onClick={exportToExcel}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Excel
              </Button>

              {/* Refresh Button */}
              <Button
                onClick={handleRefresh}
                variant="outline"
                className="border-gray-300 hover:bg-gray-50 text-gray-700"
                disabled={refreshing}
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 max-w-7xl mx-auto space-y-6">
          {/* THIS WEEK SECTION */}
          <Card className="border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-linear-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">This Week's Activity</h2>
                <Badge className="ml-2 bg-blue-100 text-blue-700 border-0">
                  {format(thisWeekRange.start, 'dd MMM')} - {format(thisWeekRange.end, 'dd MMM yyyy')}
                </Badge>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Jobs */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Briefcase className="w-4 h-4 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Jobs</h3>
                    </div>
                    <Badge className="bg-blue-100 text-blue-700 border-0">
                      {thisWeekMetrics.jobs.count}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Revenue</span>
                      <span className="font-medium text-gray-900">AED {thisWeekMetrics.jobs.revenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Profit</span>
                      <span className="font-medium text-green-600">AED {thisWeekMetrics.jobs.profit.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Services */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <Package className="w-4 h-4 text-emerald-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Services</h3>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700 border-0">
                      {thisWeekMetrics.services.count}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Revenue</span>
                      <span className="font-medium text-gray-900">AED {thisWeekMetrics.services.revenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Profit</span>
                      <span className="font-medium text-green-600">AED {thisWeekMetrics.services.profit.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Products */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                        <Layers className="w-4 h-4 text-amber-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Products</h3>
                    </div>
                    <Badge className="bg-amber-100 text-amber-700 border-0">
                      {thisWeekMetrics.products.count}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Items Sold</span>
                      <span className="font-medium text-gray-900">{thisWeekMetrics.products.itemsSold}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Revenue</span>
                      <span className="font-medium text-gray-900">AED {thisWeekMetrics.products.revenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Profit</span>
                      <span className="font-medium text-green-600">AED {thisWeekMetrics.products.profit.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Bookings */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                        <Users className="w-4 h-4 text-purple-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Bookings</h3>
                    </div>
                    <Badge className="bg-purple-100 text-purple-700 border-0">
                      {thisWeekMetrics.bookings.count}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Revenue</span>
                      <span className="font-medium text-gray-900">AED {thisWeekMetrics.bookings.revenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Completed</span>
                      <span className="font-medium text-green-600">{thisWeekMetrics.bookings.completed}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Pending</span>
                      <span className="font-medium text-amber-600">{thisWeekMetrics.bookings.pending}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Paid / After Work</span>
                      <span>{thisWeekMetrics.bookings.paid} / {thisWeekMetrics.bookings.afterWork}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-linear-to-br from-blue-600 to-blue-800 border-0 shadow-lg">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <DollarSign className="w-8 h-8 text-blue-200" />
                  <Badge className="bg-white/20 text-white border-0">
                    {dateRange.label}
                  </Badge>
                </div>
                <p className="text-blue-200 text-sm font-medium">Total Revenue</p>
                <p className="text-3xl font-bold text-white mt-2">
                  AED {statementMetrics.totalRevenue.toLocaleString()}
                </p>
                <div className="flex items-center gap-2 mt-4 text-blue-200">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">Profit: AED {statementMetrics.profit.toLocaleString()}</span>
                </div>
              </div>
            </Card>

            <Card className="bg-linear-to-br from-emerald-600 to-emerald-800 border-0 shadow-lg">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Briefcase className="w-8 h-8 text-emerald-200" />
                  <Badge className="bg-white/20 text-white border-0">
                    {financialMetrics.jobs.count} Jobs
                  </Badge>
                </div>
                <p className="text-emerald-200 text-sm font-medium">Jobs Revenue</p>
                <p className="text-3xl font-bold text-white mt-2">
                  AED {financialMetrics.jobs.budget.toLocaleString()}
                </p>
                <div className="flex items-center gap-2 mt-4 text-emerald-200">
                  <span className="text-sm">Profit: AED {financialMetrics.jobs.profit.toLocaleString()}</span>
                  <span className="text-xs px-2 py-1 bg-emerald-700 rounded-full">
                    {financialMetrics.jobs.profitMargin.toFixed(1)}% margin
                  </span>
                </div>
              </div>
            </Card>

            <Card className="bg-linear-to-br from-amber-600 to-amber-800 border-0 shadow-lg">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Package className="w-8 h-8 text-amber-200" />
                  <Badge className="bg-white/20 text-white border-0">
                    {financialMetrics.services.count + financialMetrics.products.count} Items
                  </Badge>
                </div>
                <p className="text-amber-200 text-sm font-medium">Services & Products</p>
                <p className="text-3xl font-bold text-white mt-2">
                  AED {(financialMetrics.services.revenue + financialMetrics.products.revenue).toLocaleString()}
                </p>
                <div className="flex items-center gap-2 mt-4 text-amber-200">
                  <span className="text-sm">Stock: {financialMetrics.products.totalStock} units</span>
                  {financialMetrics.products.lowStock > 0 && (
                    <span className="text-xs px-2 py-1 bg-amber-700 rounded-full">
                      {financialMetrics.products.lowStock} low stock
                    </span>
                  )}
                </div>
              </div>
            </Card>

            <Card className="bg-linear-to-br from-purple-600 to-purple-800 border-0 shadow-lg">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-8 h-8 text-purple-200" />
                  <Badge className="bg-white/20 text-white border-0">
                    {financialMetrics.bookings.total} Bookings
                  </Badge>
                </div>
                <p className="text-purple-200 text-sm font-medium">Conversion Rate</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {financialMetrics.bookings.conversionRate.toFixed(1)}%
                </p>
                <div className="flex items-center gap-2 mt-4 text-purple-200">
                  <span className="text-sm">{financialMetrics.bookings.completed} completed</span>
                  <span className="text-xs px-2 py-1 bg-purple-700 rounded-full">
                    {financialMetrics.bookings.pending} pending
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Statement + Materials Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Complete Statement
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Revenue</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Jobs</span>
                      <span className="font-medium">AED {statementMetrics.revenue.jobs.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Services</span>
                      <span className="font-medium">AED {statementMetrics.revenue.services.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Products</span>
                      <span className="font-medium">AED {statementMetrics.revenue.products.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bookings</span>
                      <span className="font-medium">AED {statementMetrics.revenue.bookings.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-gray-200 flex justify-between text-sm font-semibold">
                    <span>Total Revenue</span>
                    <span>AED {statementMetrics.totalRevenue.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Cashflow</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Collected (Stripe)</span>
                      <span className="font-medium text-green-600">AED {statementMetrics.cashflow.collected.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">After Work</span>
                      <span className="font-medium text-amber-600">AED {statementMetrics.cashflow.afterWork.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pending</span>
                      <span className="font-medium text-gray-600">AED {statementMetrics.cashflow.pending.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-gray-200 flex justify-between text-sm font-semibold">
                    <span>Outstanding</span>
                    <span>AED {statementMetrics.cashflow.outstanding.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="mt-5 pt-4 border-t border-gray-200 flex flex-wrap gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Total Cost</span>
                  <span className="font-semibold">AED {statementMetrics.totalCost.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Net Profit</span>
                  <span className={`font-semibold ${statementMetrics.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    AED {statementMetrics.profit.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Margin</span>
                  <span className="font-semibold">{statementMetrics.profitMargin.toFixed(1)}%</span>
                </div>
                <span className="text-xs text-gray-400 ml-auto">Bookings are reported as gross revenue.</span>
              </div>
            </Card>

            <Card className="bg-white border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-600" />
                Materials Summary
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs uppercase text-gray-500 font-semibold">Inventory Stock</p>
                  <p className="text-xl font-bold text-gray-900 mt-2">{inventoryMetrics.totalStock}</p>
                  <p className="text-xs text-gray-500">Low stock: {inventoryMetrics.lowStock}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs uppercase text-gray-500 font-semibold">Inventory Value</p>
                  <p className="text-xl font-bold text-gray-900 mt-2">AED {inventoryMetrics.totalCostValue.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Retail: AED {inventoryMetrics.totalRetailValue.toLocaleString()}</p>
                </div>
                <div className="col-span-2 bg-gray-50 rounded-lg p-4">
                  <p className="text-xs uppercase text-gray-500 font-semibold">Booking Materials Usage</p>
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">With Materials</p>
                      <p className="text-lg font-bold text-blue-600">{materialsUsage.withMaterials}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Without</p>
                      <p className="text-lg font-bold text-green-600">{materialsUsage.withoutMaterials}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Unknown</p>
                      <p className="text-lg font-bold text-gray-500">{materialsUsage.unknown}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue by Category - Pie Chart */}
            <Card className="bg-white border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-blue-600" />
                Revenue by Category
              </h3>
              {revenueByCategory.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
// Fix for the Pie Chart label
<Pie
  data={revenueByCategory}
  cx="50%"
  cy="50%"
  innerRadius={60}
  outerRadius={100}
  paddingAngle={5}
  dataKey="value"
  label={({ name, percent }) => {
    // ✅ Fix: Check if percent exists and is a number
    const percentage = percent && typeof percent === 'number' ? percent * 100 : 0;
    return `${name} ${percentage.toFixed(0)}%`;
  }}
>
  {revenueByCategory.map((entry, index) => (
    <Cell key={`cell-${index}`} fill={entry.color} />
  ))}
</Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: 'white', borderColor: '#e5e7eb', color: '#111827' }}
                        formatter={(value: any) => `AED ${value.toLocaleString()}`}
                      />
                      <Legend />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center">
                  <p className="text-gray-500">No revenue data for selected period</p>
                </div>
              )}
            </Card>

            {/* Profit by Category - Bar Chart */}
            <Card className="bg-white border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Profit by Category
              </h3>
              {profitByCategory.some(item => item.profit !== 0) ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={profitByCategory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" tickFormatter={(value) => `AED ${value/1000}k`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'white', borderColor: '#e5e7eb', color: '#111827' }}
                        formatter={(value: any) => `AED ${value.toLocaleString()}`}
                      />
                      <Legend />
                      <Bar dataKey="profit" fill="#10b981" name="Profit" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center">
                  <p className="text-gray-500">No profit data for selected period</p>
                </div>
              )}
            </Card>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Trend - Area Chart */}
            <Card className="bg-white border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Monthly Financial Trend
              </h3>
              {monthlyTrendData.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyTrendData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="month" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" tickFormatter={(value) => `AED ${value/1000}k`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'white', borderColor: '#e5e7eb', color: '#111827' }}
                        formatter={(value: any) => `AED ${value.toLocaleString()}`}
                      />
                      <Legend />
                      <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" />
                      <Area type="monotone" dataKey="profit" stroke="#10b981" fillOpacity={1} fill="url(#colorProfit)" name="Profit" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center">
                  <p className="text-gray-500">No trend data for selected period</p>
                </div>
              )}
            </Card>

            {/* Job Status Distribution */}
            <Card className="bg-white border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                Job Status Distribution
              </h3>
              {jobStatusData.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={jobStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {jobStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: 'white', borderColor: '#e5e7eb', color: '#111827' }}
                      />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center">
                  <p className="text-gray-500">No job data for selected period</p>
                </div>
              )}
            </Card>
          </div>

          {/* Charts Row 3 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Booking Payment Status */}
            <Card className="bg-white border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                Booking Payment Status
              </h3>
              {bookingPaymentChart.length > 0 ? (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={bookingPaymentChart}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={95}
                        paddingAngle={4}
                        dataKey="value"
                        label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {bookingPaymentChart.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: 'white', borderColor: '#e5e7eb', color: '#111827' }}
                      />
                      <Legend />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-72 flex items-center justify-center">
                  <p className="text-gray-500">No booking payments for selected period</p>
                </div>
              )}
              <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Paid</p>
                  <p className="font-semibold text-green-600">AED {bookingPaymentBreakdown.paidAmount.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">After Work</p>
                  <p className="font-semibold text-amber-600">AED {bookingPaymentBreakdown.afterWorkAmount.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Pending</p>
                  <p className="font-semibold text-gray-600">AED {bookingPaymentBreakdown.pendingAmount.toLocaleString()}</p>
                </div>
              </div>
            </Card>

            {/* Materials Usage */}
            <Card className="bg-white border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-600" />
                Materials Usage (Bookings)
              </h3>
              {materialsUsageChart.length > 0 ? (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={materialsUsageChart}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'white', borderColor: '#e5e7eb', color: '#111827' }}
                      />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {materialsUsageChart.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-72 flex items-center justify-center">
                  <p className="text-gray-500">No materials data for selected period</p>
                </div>
              )}
              <div className="mt-4 text-sm text-gray-500">
                Total bookings tracked: {filteredBookings.length}
              </div>
            </Card>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab('overview')}
                className={cn(
                  "py-3 px-4 font-medium text-sm border-b-2 transition-colors",
                  activeTab === 'overview'
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                )}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('jobs')}
                className={cn(
                  "py-3 px-4 font-medium text-sm border-b-2 transition-colors",
                  activeTab === 'jobs'
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                )}
              >
                Jobs
              </button>
              <button
                onClick={() => setActiveTab('services')}
                className={cn(
                  "py-3 px-4 font-medium text-sm border-b-2 transition-colors",
                  activeTab === 'services'
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                )}
              >
                Services & Products
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                className={cn(
                  "py-3 px-4 font-medium text-sm border-b-2 transition-colors",
                  activeTab === 'bookings'
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                )}
              >
                Bookings
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Top Services */}
                <Card className="bg-white border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Services</h3>
                  {topServices.length > 0 ? (
                    <div className="space-y-4">
                      {topServices.map((service, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-sm font-bold text-blue-600">#{idx + 1}</span>
                            </div>
                            <div>
                              <p className="text-gray-900 font-medium">{service.name}</p>
                              <p className="text-xs text-gray-500">Profit: AED {service.profit.toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-gray-900 font-semibold">AED {service.revenue.toLocaleString()}</p>
                            <p className="text-xs text-emerald-600">
                              +{service.revenue ? ((service.profit / service.revenue) * 100).toFixed(1) : 0}% margin
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No service data available</p>
                  )}
                </Card>

                {/* Recent Jobs */}
                <Card className="bg-white border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Jobs</h3>
                  {filteredJobs.slice(0, 5).length > 0 ? (
                    <div className="space-y-4">
                      {filteredJobs.slice(0, 5).map(job => (
                        <div key={job.id} className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-gray-900 font-medium">{job.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500">{job.client}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                job.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                job.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                                'bg-amber-100 text-amber-700'
                              }`}>
                                {job.status}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-gray-900 font-semibold">AED {job.budget?.toLocaleString() || 0}</p>
                            <p className="text-xs text-gray-500">Profit: AED {((job.budget || 0) - (job.actualCost || 0)).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No jobs in selected period</p>
                  )}
                </Card>
              </div>
            )}

            {/* Jobs Tab */}
            {activeTab === 'jobs' && (
              <Card className="bg-white border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actual Cost</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Margin</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredJobs.map(job => {
                        const profit = (job.budget || 0) - (job.actualCost || 0);
                        const margin = job.budget ? (profit / job.budget) * 100 : 0;
                        return (
                          <tr key={job.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <p className="text-gray-900 font-medium">{job.title}</p>
                              <p className="text-xs text-gray-500">{job.location}</p>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-700">{job.client}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                job.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                job.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                                job.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {job.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
                              AED {job.budget?.toLocaleString() || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-gray-500">
                              AED {job.actualCost?.toLocaleString() || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <span className={profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                                AED {profit.toLocaleString()}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <span className={margin >= 0 ? 'text-green-600' : 'text-red-600'}>
                                {margin.toFixed(1)}%
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                              {job.createdAt ? format(new Date(job.createdAt), 'dd/MM/yyyy') : '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* Services & Products Tab */}
            {activeTab === 'services' && (
              <div className="space-y-6">
                <Card className="bg-white border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-amber-600" />
                    Materials Insights
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs uppercase text-gray-500 font-semibold">Inventory Value</p>
                      <p className="text-xl font-bold text-gray-900 mt-2">AED {inventoryMetrics.totalCostValue.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Retail: AED {inventoryMetrics.totalRetailValue.toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs uppercase text-gray-500 font-semibold">Stock Health</p>
                      <p className="text-xl font-bold text-gray-900 mt-2">{inventoryMetrics.totalStock} units</p>
                      <p className="text-xs text-gray-500">Low stock: {inventoryMetrics.lowStock}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs uppercase text-gray-500 font-semibold">Bookings Materials</p>
                      <p className="text-sm text-gray-600 mt-2">With: {materialsUsage.withMaterials}</p>
                      <p className="text-sm text-gray-600">Without: {materialsUsage.withoutMaterials}</p>
                      <p className="text-sm text-gray-600">Unknown: {materialsUsage.unknown}</p>
                    </div>
                  </div>
                </Card>

                {/* Services */}
                <Card className="bg-white border-gray-200 overflow-hidden shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Services</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Margin</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredServices.map(service => {
                          const profit = (service.price || 0) - (service.cost || 0);
                          const margin = service.price ? (profit / service.price) * 100 : 0;
                          return (
                            <tr key={service.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <p className="text-gray-900 font-medium">{service.name}</p>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-gray-700">{service.categoryName || '-'}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
                                AED {service.price?.toLocaleString() || 0}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-gray-500">
                                AED {service.cost?.toLocaleString() || 0}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <span className={profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                                  AED {profit.toLocaleString()}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <span className={margin >= 0 ? 'text-green-600' : 'text-red-600'}>
                                  {margin.toFixed(1)}%
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-gray-500">
                                {service.stock || 0} {service.unit || ''}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </Card>

                {/* Products */}
                <Card className="bg-white border-gray-200 overflow-hidden shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Products</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Margin</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Min Stock</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredProducts.map(product => {
                          const profit = (product.price || 0) - (product.cost || 0);
                          const margin = product.price ? (profit / product.price) * 100 : 0;
                          const isLowStock = (product.stock || 0) <= (product.minStock || 0);
                          return (
                            <tr key={product.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <p className="text-gray-900 font-medium">{product.name}</p>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-gray-700">{product.categoryName || '-'}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
                                AED {product.price?.toLocaleString() || 0}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-gray-500">
                                AED {product.cost?.toLocaleString() || 0}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <span className={profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                                  AED {profit.toLocaleString()}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <span className={margin >= 0 ? 'text-green-600' : 'text-red-600'}>
                                  {margin.toFixed(1)}%
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <span className={isLowStock ? 'text-red-600 font-semibold' : 'text-gray-500'}>
                                  {product.stock || 0}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-gray-500">
                                {product.minStock || 0}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}

            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
              <Card className="bg-white border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Materials</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Area</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredBookings.map(booking => (
                        <tr key={booking.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="text-gray-900 font-medium">{booking.bookingId || booking.id}</p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="text-gray-900">{booking.name}</p>
                            <p className="text-xs text-gray-500">{booking.email}</p>
                            <p className="text-xs text-gray-500">{booking.phone}</p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                            <p className="text-gray-900 font-medium">{booking.serviceName || booking.service}</p>
                            <p className="text-xs text-gray-500 capitalize">{booking.frequency || 'once'}</p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                            <p className="text-gray-900">{booking.date || '-'}</p>
                            <p className="text-xs text-gray-500">{booking.time || '-'}</p>
                            {booking.schedule && booking.schedule.length > 1 && (
                              <p className="text-xs text-gray-500">+{booking.schedule.length - 1} more</p>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
                            AED {getBookingAmount(booking).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-xs px-2 py-1 rounded-full mr-2 ${
                              resolvePaymentStatus(booking) === 'paid' ? 'bg-green-100 text-green-700' :
                              resolvePaymentStatus(booking) === 'after-work' ? 'bg-amber-100 text-amber-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {resolvePaymentStatus(booking)}
                            </span>
                            <p className="text-xs text-gray-500 mt-1">{booking.paymentMethod || 'n/a'}</p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-700 capitalize">
                            {booking.materialsOption || 'unknown'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                              booking.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                              booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {booking.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                            {booking.staffName || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-700">{booking.area}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}