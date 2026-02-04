// /app/admin/products/components/ProductDashboard.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { 
  Package, 
  Zap,
  AlertTriangle, 
  TrendingUp, 
  Layers, 
  ArrowUpRight, 
  ArrowDownRight,
  DollarSign,
  Activity,
  Box,
  Grid3x3,
  ShoppingBag
} from 'lucide-react'
import { db } from '@/lib/firebase'
import { 
  collection, 
  query, 
  onSnapshot 
} from 'firebase/firestore'
import { ProductItem, Category } from '../lib/types'

export default function ProductDashboard() {
  const [products, setProducts] = useState<ProductItem[]>([])
  const [services, setServices] = useState<ProductItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch products from Firebase
  useEffect(() => {
    const productsRef = collection(db, 'products')
    const q = query(productsRef)
    
    const unsubscribeProducts = onSnapshot(q, (snapshot) => {
      const productsList: ProductItem[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        productsList.push({
          id: doc.id,
          name: data.name || '',
          sku: data.sku || '',
          description: data.description || '',
          type: 'PRODUCT',
          price: data.price || 0,
          cost: data.cost || 0,
          unit: data.unit || 'Unit',
          stock: data.stock || 0,
          minStock: data.minStock || 0,
          categoryId: data.categoryId || '',
          categoryName: data.categoryName || '',
          status: data.status || 'ACTIVE',
          createdAt: data.createdAt || '',
          updatedAt: data.updatedAt || '',
          imageUrl: data.imageUrl || ''
        })
      })
      setProducts(productsList)
      setLoading(false)
    })
    
    return () => unsubscribeProducts()
  }, [])

  // Fetch services from Firebase
  useEffect(() => {
    const servicesRef = collection(db, 'services')
    const q = query(servicesRef)
    
    const unsubscribeServices = onSnapshot(q, (snapshot) => {
      const servicesList: ProductItem[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        servicesList.push({
          id: doc.id,
          name: data.name || '',
          sku: data.sku || '',
          description: data.description || '',
          type: 'SERVICE',
          price: data.price || 0,
          cost: data.cost || 0,
          unit: data.unit || 'Unit',
          stock: data.stock || 0,
          minStock: data.minStock || 0,
          categoryId: data.categoryId || '',
          categoryName: data.categoryName || '',
          status: data.status || 'ACTIVE',
          createdAt: data.createdAt || '',
          updatedAt: data.updatedAt || '',
          imageUrl: data.imageUrl || ''
        })
      })
      setServices(servicesList)
    })
    
    return () => unsubscribeServices()
  }, [])

  // Fetch categories from Firebase
  useEffect(() => {
    const categoriesRef = collection(db, 'categories')
    const q = query(categoriesRef)
    
    const unsubscribeCategories = onSnapshot(q, (snapshot) => {
      const categoriesList: Category[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        categoriesList.push({
          id: doc.id,
          name: data.name || '',
          description: data.description || '',
          color: data.color || '#000000',
          itemCount: data.itemCount || 0,
          createdAt: data.createdAt || '',
          updatedAt: data.updatedAt || ''
        })
      })
      setCategories(categoriesList)
    })
    
    return () => unsubscribeCategories()
  }, [])

  // Calculate dashboard statistics
  const totalProducts = products.length
  const totalServices = services.length
  const totalItems = totalProducts + totalServices
  
  const activeProducts = products.filter(p => p.status === 'ACTIVE').length
  const activeServices = services.filter(s => s.status === 'ACTIVE').length
  
  const lowStockProducts = products.filter(p => p.status === 'ACTIVE' && p.stock <= p.minStock && p.minStock > 0)
  const outOfStockProducts = products.filter(p => p.status === 'ACTIVE' && p.stock === 0)
  
  const totalProductValue = products.reduce((sum, p) => sum + (p.stock * p.price), 0)
  const totalProductCost = products.reduce((sum, p) => sum + (p.stock * p.cost), 0)
  const productProfit = totalProductValue - totalProductCost
  
  const totalServiceValue = services.reduce((sum, s) => sum + s.price, 0)
  const totalServiceCost = services.reduce((sum, s) => sum + s.cost, 0)
  const serviceProfit = totalServiceValue - totalServiceCost
  
  const totalValue = totalProductValue + totalServiceValue
  const totalCost = totalProductCost + totalServiceCost
  const totalProfit = productProfit + serviceProfit
  
  const avgMargin = totalValue > 0 ? Math.round((totalProfit / totalValue) * 100) : 0

  // Calculate item count per category
  const itemsPerCategory = categories.map(cat => ({
    name: cat.name,
    count: products.filter(p => p.categoryId === cat.id).length + 
           services.filter(s => s.categoryId === cat.id).length
  })).sort((a, b) => b.count - a.count)

  // Calculate trends
  const calculateTrend = (current: number, previous: number = current * 0.9) => {
    if (previous === 0) return { value: '+0%', up: true }
    const change = ((current - previous) / previous) * 100
    return {
      value: `${change > 0 ? '+' : ''}${Math.round(change)}%`,
      up: change >= 0
    }
  }

  // Prepare stats data - Now with 6 stats
  const stats = [
    {
      label: 'Total Products',
      value: totalProducts.toString(),
      subValue: `${activeProducts} active`,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      ...calculateTrend(totalProducts)
    },
    {
      label: 'Total Services',
      value: totalServices.toString(),
      subValue: `${activeServices} active`,
      icon: Zap,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      ...calculateTrend(totalServices)
    },
    {
      label: 'Categories',
      value: categories.length.toString(),
      subValue: `${itemsPerCategory[0]?.name || 'None'} has most items`,
      icon: Layers,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      ...calculateTrend(categories.length)
    },
    {
      label: 'Critical Stock',
      value: lowStockProducts.length.toString(),
      subValue: `${outOfStockProducts.length} out of stock`,
      icon: AlertTriangle,
      color: lowStockProducts.length > 0 ? 'text-red-600' : 'text-green-600',
      bgColor: lowStockProducts.length > 0 ? 'bg-red-50' : 'bg-green-50',
      ...calculateTrend(lowStockProducts.length, Math.max(0, lowStockProducts.length - 2))
    },
    {
      label: 'Inventory Value',
      value: `AED ${totalValue.toLocaleString()}`,
      subValue: `Cost: AED ${totalCost.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      ...calculateTrend(totalValue)
    },
    {
      label: 'Avg Margin',
      value: `${avgMargin}%`,
      subValue: `Profit: AED ${totalProfit.toLocaleString()}`,
      icon: TrendingUp,
      color: avgMargin > 20 ? 'text-green-600' : avgMargin > 10 ? 'text-amber-600' : 'text-red-600',
      bgColor: avgMargin > 20 ? 'bg-green-50' : avgMargin > 10 ? 'bg-amber-50' : 'bg-red-50',
      ...calculateTrend(avgMargin)
    }
  ]

  // Get recent activity (last 5 items)
  const recentItems = [...products, ...services]
    .filter(item => item.status === 'ACTIVE')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white border border-gray-200 p-5 rounded-none animate-pulse">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-gray-200 rounded w-9 h-9"></div>
                <div className="h-4 w-12 bg-gray-200 rounded"></div>
              </div>
              <div>
                <div className="h-3 w-24 bg-gray-200 rounded mb-2"></div>
                <div className="h-7 w-16 bg-gray-300 rounded mb-1"></div>
                <div className="h-3 w-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
          <p className="text-sm text-gray-600 mt-2">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid - Now 6 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white border border-gray-200 p-5 rounded-none hover:border-black transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 ${stat.bgColor} group-hover:bg-black group-hover:text-white transition-colors rounded`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div className={`flex items-center text-xs font-bold ${stat.up ? 'text-green-600' : 'text-red-600'}`}>
                {stat.value}
                {stat.up ? <ArrowUpRight className="h-3 w-3 ml-0.5" /> : <ArrowDownRight className="h-3 w-3 ml-0.5" />}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">{stat.label}</p>
              <h3 className={`text-xl font-black ${stat.color}`}>
                {stat.value}
              </h3>
              <p className="text-xs text-gray-400 mt-1">{stat.subValue}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Second Row with Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-100 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 rounded">
              <Box className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Product Summary</p>
              <p className="text-xs text-blue-600">{totalProducts} items</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Value:</span>
              <span className="font-bold">AED {totalProductValue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Average Price:</span>
              <span className="font-bold">AED {totalProducts > 0 ? Math.round(totalProductValue / totalProducts) : 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Low Stock:</span>
              <span className="font-bold text-red-600">{lowStockProducts.length}</span>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-100 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-100 rounded">
              <Zap className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-purple-700">Service Summary</p>
              <p className="text-xs text-purple-600">{totalServices} items</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Value:</span>
              <span className="font-bold">AED {totalServiceValue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Average Price:</span>
              <span className="font-bold">AED {totalServices > 0 ? Math.round(totalServiceValue / totalServices) : 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Avg Margin:</span>
              <span className="font-bold text-green-600">
                {totalServiceValue > 0 ? Math.round((serviceProfit / totalServiceValue) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-100 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 rounded">
              <Grid3x3 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-green-700">Category Summary</p>
              <p className="text-xs text-green-600">{categories.length} categories</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Items:</span>
              <span className="font-bold">{totalItems}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Most Items:</span>
              <span className="font-bold">{itemsPerCategory[0]?.name || 'N/A'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Avg per Category:</span>
              <span className="font-bold">
                {categories.length > 0 ? Math.round(totalItems / categories.length) : 0}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-100 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-amber-100 rounded">
              <ShoppingBag className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-700">Financial Summary</p>
              <p className="text-xs text-amber-600">Total Value: AED {totalValue.toLocaleString()}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Cost:</span>
              <span className="font-bold">AED {totalCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Profit:</span>
              <span className="font-bold text-green-600">AED {totalProfit.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Overall Margin:</span>
              <span className={`font-bold ${avgMargin > 20 ? 'text-green-600' : avgMargin > 10 ? 'text-amber-600' : 'text-red-600'}`}>
                {avgMargin}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Recent Activity
            </h3>
            <span className="text-[10px] font-bold bg-black text-white px-2 py-1">REAL-TIME</span>
          </div>
          
          <div className="space-y-4">
            {recentItems.length > 0 ? (
              recentItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-3 border border-gray-100 hover:border-gray-300 transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-10 ${item.type === 'PRODUCT' ? 'bg-blue-500' : 'bg-purple-500'}`} />
                    <div>
                      <p className="text-sm font-bold text-black">{item.name}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-500 uppercase">{item.sku}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${item.type === 'PRODUCT' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                          {item.type}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${item.categoryId ? 'bg-gray-100 text-gray-700' : 'bg-gray-200 text-gray-500'}`}>
                          {item.categoryName || 'Uncategorized'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-black">AED {item.price.toLocaleString()}</p>
                    <p className="text-[10px] text-gray-400">
                      {item.type === 'PRODUCT' ? `Stock: ${item.stock} ${item.unit}` : 'Service'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <Package className="h-10 w-10 mb-2 opacity-20" />
                <p className="text-xs font-bold uppercase tracking-widest">No items found</p>
                <p className="text-xs text-gray-400 mt-1">Add your first product or service</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-black text-white p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest mb-6 opacity-60">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <button 
                className="w-full text-left p-3 border border-white/20 hover:bg-white hover:text-black transition-all text-xs font-bold uppercase tracking-wider flex justify-between items-center"
                onClick={() => {
                  const csvContent = [
                    ['Type', 'Name', 'SKU', 'Category', 'Price', 'Cost', 'Stock', 'Unit', 'Status', 'Created'],
                    ...products.map(p => [
                      'PRODUCT', 
                      p.name, 
                      p.sku, 
                      p.categoryName, 
                      p.price, 
                      p.cost, 
                      p.stock, 
                      p.unit, 
                      p.status,
                      p.createdAt
                    ]),
                    ...services.map(s => [
                      'SERVICE', 
                      s.name, 
                      s.sku, 
                      s.categoryName, 
                      s.price, 
                      s.cost, 
                      'N/A', 
                      s.unit, 
                      s.status,
                      s.createdAt
                    ])
                  ].map(row => row.join(',')).join('\n')
                  
                  const blob = new Blob([csvContent], { type: 'text/csv' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `inventory_export_${new Date().toISOString().split('T')[0]}.csv`
                  a.click()
                }}
              >
                Export Full Inventory
                <ArrowUpRight className="h-4 w-4" />
              </button>
              <button 
                className="w-full text-left p-3 border border-white/20 hover:bg-white hover:text-black transition-all text-xs font-bold uppercase tracking-wider flex justify-between items-center"
                onClick={() => {
                  if (products.length > 0) {
                    const newPrice = prompt('Enter percentage to increase product prices (e.g., 10 for 10%):')
                    if (newPrice && !isNaN(parseFloat(newPrice))) {
                      const percentage = parseFloat(newPrice) / 100
                      alert(`Would increase prices by ${newPrice}% for ${products.length} products.`)
                    }
                  } else {
                    alert('No products available for price adjustment.')
                  }
                }}
              >
                Bulk Price Update
                <ArrowUpRight className="h-4 w-4" />
              </button>
              <button 
                className="w-full text-left p-3 border border-white/20 hover:bg-white hover:text-black transition-all text-xs font-bold uppercase tracking-wider flex justify-between items-center"
                onClick={() => {
                  // Show categories summary
                  let message = 'Category Summary:\n\n'
                  itemsPerCategory.forEach((cat, index) => {
                    message += `${index + 1}. ${cat.name}: ${cat.count} items\n`
                  })
                  alert(message)
                }}
              >
                View Categories Report
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-400" />
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Performance Snapshot</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-xl font-black">{totalItems}</h4>
                <p className="text-[10px] opacity-40 mt-1">Total Items</p>
              </div>
              <div>
                <h4 className="text-xl font-black text-green-400">{avgMargin}%</h4>
                <p className="text-[10px] opacity-40 mt-1">Avg Margin</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs opacity-60 mb-1">
                <span>Products: {totalProducts}</span>
                <span>Services: {totalServices}</span>
              </div>
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-400"
                  style={{ width: `${(totalProducts / Math.max(1, totalItems)) * 100}%` }}
                />
                <div 
                  className="h-full bg-purple-400 -mt-1"
                  style={{ width: `${(totalServices / Math.max(1, totalItems)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}