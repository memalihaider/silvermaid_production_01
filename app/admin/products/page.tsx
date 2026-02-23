'use client'

import { useState, useEffect } from 'react'
import { Plus, Package, Archive, Zap, BarChart3, TrendingUp, DollarSign, Settings, Download } from 'lucide-react'
import ProductDashboard from './components/ProductDashboard'
import ProductList from './components/ProductList'
import ProductBuilder from './components/ProductBuilder'
import CategoryManager from './components/CategoryManager'
import { ProductItem, Category } from '@/lib/types' // Changed to use lib/types

type TabType = 'DASHBOARD' | 'INVENTORY' | 'CATEGORIES';

// Mock data - you can remove or move this to a separate file
const MOCK_PRODUCTS: ProductItem[] = [
  {
    id: 'prod_1',
    name: 'Professional Cleaning Solution',
    sku: 'HW-CLN-001',
    description: 'Heavy-duty cleaning solution for industrial use',
    type: 'PRODUCT',
    price: 120,
    cost: 60,
    unit: 'Litre',
    stock: 150,
    minStock: 20,
    categoryId: 'cat1',
    categoryName: 'Cleaning Supplies',
    status: 'ACTIVE',
    imageUrl: '',
    slug: 'professional-cleaning-solution',
    isActive: true,
    profitMargin: 50,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  // Add more mock products as needed
];

const PRODUCT_CATEGORIES: Category[] = [
  {
    id: 'cat1',
    name: 'Cleaning Supplies',
    slug: 'cleaning-supplies',
    description: 'All cleaning materials and solutions',
    color: '#3B82F6',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    itemCount: 12
  },
  {
    id: 'cat2',
    name: 'Hygiene Products',
    slug: 'hygiene-products',
    description: 'Personal and public hygiene products',
    color: '#10B981',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    itemCount: 8
  }
];

const STORAGE_KEYS = {
  PRODUCTS: 'silvermaid_products',
  CATEGORIES: 'silvermaid_categories'
};

export default function ProductsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('DASHBOARD')
  const [products, setProducts] = useState<ProductItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [editingItem, setEditingItem] = useState<ProductItem | null>(null)
  const [showBuilder, setShowBuilder] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Initialization
  useEffect(() => {
    const savedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS)
    const savedCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES)

    if (savedProducts) {
      setProducts(JSON.parse(savedProducts))
    } else {
      setProducts(MOCK_PRODUCTS)
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(MOCK_PRODUCTS))
    }

    if (savedCategories) {
      setCategories(JSON.parse(savedCategories))
    } else {
      setCategories(PRODUCT_CATEGORIES)
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(PRODUCT_CATEGORIES))
    }
    
    setIsLoading(false)
  }, [])

  // Persist changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products))
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories))
    }
  }, [products, categories, isLoading])

  const handleSaveProduct = (data?: Partial<ProductItem>) => {
    if (!data) return
    if (editingItem) {
      setProducts(prev => prev.map(p => p.id === editingItem.id ? { 
        ...p, 
        ...data,
        updatedAt: new Date().toISOString()
      } as ProductItem : p))
    } else {
      const newItem: ProductItem = {
        ...data,
        id: `prod_${Date.now()}`,
        name: data.name || '',
        sku: data.sku || '',
        description: data.description || '',
        type: data.type || 'PRODUCT',
        price: data.price || 0,
        cost: data.cost || 0,
        unit: data.unit || 'Unit',
        stock: data.stock || 0,
        minStock: data.minStock || 0,
        categoryId: data.categoryId || '',
        categoryName: data.categoryName || '',
        status: data.status || 'ACTIVE',
        imageUrl: data.imageUrl || '',
        slug: data.slug || '',
        isActive: data.isActive !== undefined ? data.isActive : true,
        profitMargin: data.profitMargin || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      setProducts(prev => [newItem, ...prev])
    }
    setShowBuilder(false)
    setEditingItem(null)
  }

  const handleDeleteProduct = (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      setProducts(prev => prev.filter(p => p.id !== id))
    }
  }

  const handleSaveCategory = (data: Partial<Category>) => {
    if (data.id) {
      setCategories(prev => prev.map(c => c.id === data.id ? { 
        ...c, 
        ...data,
        updatedAt: new Date().toISOString()
      } as Category : c))
    } else {
      const newCat: Category = {
        ...data,
        id: `cat_${Date.now()}`,
        name: data.name || '',
        slug: data.slug || '',
        description: data.description || '',
        color: data.color || '#000000',
        isActive: data.isActive !== undefined ? data.isActive : true,
        itemCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      setCategories(prev => [...prev, newCat])
    }
  }

  const handleDeleteCategory = (id: string) => {
    const hasItems = products.some(p => p.categoryId === id)
    if (hasItems) {
      alert('Cannot delete category with active items. Reassign items first.')
      return
    }
    if (confirm('Delete this category?')) {
      setCategories(prev => prev.filter(c => c.id !== id))
    }
  }

  if (isLoading) return null;

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="border-b border-gray-200">
        <div className="max-w-[1600px] mx-auto px-8 py-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-1 bg-black" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Inventory Management System</span>
              </div>
              <h1 className="text-5xl font-black text-black tracking-tighter uppercase italic">
                Products <span className="text-gray-300">&</span> Services
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => {
                  const csvContent = [
                    ['ID', 'Name', 'SKU', 'Category', 'Type', 'Price', 'Cost', 'Stock', 'Unit', 'Status'],
                    ...products.map(p => [
                      p.id, 
                      p.name, 
                      p.sku, 
                      p.categoryName, 
                      p.type, 
                      p.price, 
                      p.cost, 
                      p.stock, 
                      p.unit, 
                      p.status
                    ])
                  ].map(row => row.join(',')).join('\n')
                  
                  const blob = new Blob([csvContent], { type: 'text/csv' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `products_export_${new Date().toISOString().split('T')[0]}.csv`
                  a.click()
                }}
                className="flex items-center gap-2 px-6 py-3 border border-gray-200 text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all"
              >
                <Download className="h-4 w-4" />
                Export Data
              </button>
              {!showBuilder && (
                <button 
                  onClick={() => {
                    setEditingItem(null)
                    setShowBuilder(true)
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-gray-900 transition-all shadow-xl shadow-black/10"
                >
                  <Plus className="h-4 w-4" />
                  Add New Item
                </button>
              )}
            </div>
          </div>

          {!showBuilder && (
            <div className="flex gap-10 mt-12 border-b border-gray-100">
              {[
                { id: 'DASHBOARD', label: 'Overview', icon: BarChart3 },
                { id: 'INVENTORY', label: 'Inventory List', icon: Package },
                { id: 'CATEGORIES', label: 'Categories', icon: Archive },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${
                    activeTab === tab.id ? 'text-black' : 'text-gray-400 hover:text-black'
                  }`}
                >
                  <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? 'text-black' : 'text-gray-300'}`} />
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-black" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-8 py-10">
        {showBuilder ? (
          <ProductBuilder 
            product={editingItem} 
            onSave={handleSaveProduct}
            onCancel={() => {
              setShowBuilder(false)
              setEditingItem(null)
            }}
          />
        ) : (
          <div className="animate-in fade-in duration-500">
            {activeTab === 'DASHBOARD' && (
              <ProductDashboard />
            )}
            
            {activeTab === 'INVENTORY' && (
              <ProductList 
               
                categories={categories}
                onEdit={(item) => {
                  setEditingItem(item)
                  setShowBuilder(true)
                }}
               
              />
            )}
            
            {activeTab === 'CATEGORIES' && (
              <CategoryManager />
            )}
          </div>
        )}
      </div>

      {/* Quick Footer Info */}
      <div className="fixed bottom-0 right-0 p-4">
        <div className="bg-black text-white px-4 py-2 flex items-center gap-4 border border-white/10 shadow-2xl">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[9px] font-bold uppercase tracking-widest">System Cloud Synced</span>
          </div>
          <div className="w-px h-4 bg-white/20" />
          <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">V.2.4.0 PROFESSIONAL</span>
        </div>
      </div>
    </div>
  )
}