// /app/admin/products/components/CategoryManager.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  Layers,
  RefreshCw
} from 'lucide-react'
import { db } from '@/lib/firebase'
import { 
  collection, 
  addDoc, 
  doc, 
  deleteDoc, 
  updateDoc,
  query,
  orderBy,
  onSnapshot,
  getDocs,
  where
} from 'firebase/firestore'

// Category Interface
interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
  slug: string;
  isActive: boolean;
}

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Category>>({
    name: '',
    description: '',
    color: '#3B82F6'
  })

  // ✅ Fetch categories from Firebase in real-time
  useEffect(() => {
    const categoriesRef = collection(db, 'categories')
    const q = query(categoriesRef, orderBy('createdAt', 'desc'))
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const categoriesList: Category[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        categoriesList.push({
          id: doc.id,
          name: data.name || '',
          description: data.description || '',
          color: data.color || '#3B82F6',
          itemCount: data.itemCount || 0,
          createdAt: data.createdAt || '',
          updatedAt: data.updatedAt || '',
          slug: data.slug || data.name?.toLowerCase().replace(/\s+/g, '-') || '',
          isActive: data.isActive !== undefined ? data.isActive : true
        })
      })
      setCategories(categoriesList)
      setLoading(false)
    }, (error) => {
      console.error('Error fetching categories:', error)
      setLoading(false)
    })
    
    return () => unsubscribe()
  }, [])

  // ✅ Check if category has products/services
  const checkCategoryItems = async (categoryId: string): Promise<number> => {
    try {
      // Check in products collection
      const productsRef = collection(db, 'products')
      const productsQuery = query(productsRef, where('categoryId', '==', categoryId))
      const productsSnapshot = await getDocs(productsQuery)
      
      // Check in services collection
      const servicesRef = collection(db, 'services')
      const servicesQuery = query(servicesRef, where('categoryId', '==', categoryId))
      const servicesSnapshot = await getDocs(servicesQuery)
      
      return productsSnapshot.size + servicesSnapshot.size
    } catch (error) {
      console.error('Error checking category items:', error)
      return 0
    }
  }

  // ✅ Save category to Firebase
  const handleSave = async () => {
    if (!formData.name?.trim()) {
      alert('Category name is required')
      return
    }

    try {
      const now = new Date().toISOString()
      const slug = formData.name.toLowerCase().replace(/\s+/g, '-')
      
      if (editingId) {
        // Update existing category
        const categoryRef = doc(db, 'categories', editingId)
        await updateDoc(categoryRef, {
          name: formData.name,
          description: formData.description || '',
          color: formData.color || '#3B82F6',
          slug: slug,
          updatedAt: now
        })
        console.log('✅ Category updated successfully!')
        alert('Category updated successfully!')
      } else {
        // Add new category
        const categoriesRef = collection(db, 'categories')
        await addDoc(categoriesRef, {
          name: formData.name,
          description: formData.description || '',
          color: formData.color || '#3B82F6',
          itemCount: 0,
          slug: slug,
          isActive: true,
          createdAt: now,
          updatedAt: now
        })
        console.log('✅ Category added successfully!')
        alert('Category added successfully!')
      }
      
      resetForm()
    } catch (error) {
      console.error('❌ Error saving category:', error)
      alert('Error saving category. Please try again.')
    }
  }

  // ✅ Delete category from Firebase
  const handleDelete = async (id: string) => {
    const category = categories.find(cat => cat.id === id)
    
    // Check if category has items
    const itemCount = await checkCategoryItems(id)
    if (itemCount > 0) {
      alert(`Cannot delete category with ${itemCount} items. Please remove items first.`)
      return
    }

    if (!confirm(`Are you sure you want to delete category "${category?.name}"?`)) return
    
    try {
      await deleteDoc(doc(db, 'categories', id))
      console.log('✅ Category deleted successfully!')
      alert('Category deleted successfully!')
    } catch (error) {
      console.error('❌ Error deleting category:', error)
      alert('Error deleting category. Please try again.')
    }
  }

  // ✅ Handle edit
  const handleEdit = (category: Category) => {
    setFormData({
      name: category.name,
      description: category.description,
      color: category.color
    })
    setEditingId(category.id)
    setIsAdding(false)
  }

  const resetForm = () => {
    setFormData({ 
      name: '', 
      description: '', 
      color: '#3B82F6' 
    })
    setIsAdding(false)
    setEditingId(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSave()
  }

  // Generate random color
  const generateRandomColor = () => {
    const colors = [
      '#3B82F6', // Blue
      '#10B981', // Emerald
      '#8B5CF6', // Violet
      '#F59E0B', // Amber
      '#EF4444', // Red
      '#EC4899', // Pink
      '#14B8A6', // Teal
      '#F97316', // Orange
      '#48e605', // Green (your existing color)
    ]
    setFormData({ ...formData, color: colors[Math.floor(Math.random() * colors.length)] })
  }

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Column - Form */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-black text-white p-6">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <Layers className="h-4 w-4" />
            {editingId ? 'Edit Category' : 'New Category'}
          </h3>
          <p className="text-[10px] text-white/50 mb-6 uppercase tracking-widest leading-relaxed">
            Organize your inventory into meaningful segments.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1 block">
                Category Name *
              </label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-white/10 border border-white/20 px-3 py-2 text-xs font-bold text-white outline-none focus:border-white transition-all uppercase tracking-widest"
                placeholder="E.G. EQUIPMENT"
                maxLength={50}
              />
            </div>
            
            <div>
              <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1 block">
                Description
              </label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-white/10 border border-white/20 px-3 py-2 text-xs font-bold text-white outline-none focus:border-white transition-all"
                placeholder="Brief summary..."
                maxLength={200}
              />
            </div>

            <div>
              <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1 block">
                Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.color}
                  onChange={e => setFormData({ ...formData, color: e.target.value })}
                  className="w-10 h-10 cursor-pointer border-2 border-white/20"
                />
                <button
                  type="button"
                  onClick={generateRandomColor}
                  className="text-[10px] text-white/60 hover:text-white transition-colors px-3 py-1 border border-white/20 hover:bg-white/10"
                >
                  Random
                </button>
                <span className="text-[10px] text-white/40">
                  {formData.color}
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                disabled={!formData.name?.trim()}
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${
                  !formData.name?.trim() 
                    ? 'bg-gray-500 cursor-not-allowed' 
                    : 'bg-white text-black hover:bg-white/90'
                }`}
              >
                {editingId ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                {editingId ? 'Update Category' : 'Create Category'}
              </button>
              {(isAdding || editingId) && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-white/20 text-white hover:bg-white/10 transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="p-4 border border-gray-200 bg-gray-50/50">
          <div className="flex items-center gap-2 text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4">
            <Check className="h-3 w-3 text-green-500" />
            Firebase Connected
          </div>
          <p className="text-[10px] text-gray-500 leading-relaxed uppercase tracking-tighter">
            Categories are saved in Firebase. Total: {categories.length} categories
          </p>
          <p className="text-[10px] text-gray-500 leading-relaxed uppercase tracking-tighter mt-2">
            Last updated: {categories.length > 0 ? formatDate(categories[0]?.updatedAt) : 'N/A'}
          </p>
        </div>
      </div>

      {/* Right Column - Categories List */}
      <div className="lg:col-span-8">
        <div className="bg-white border border-gray-200 overflow-hidden">
          {categories.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Layers className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Categories Found</h3>
              <p className="text-gray-600 mb-6">Start by creating your first category</p>
              <button
                onClick={() => setIsAdding(true)}
                className="px-6 py-3 bg-black hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create First Category
              </button>
            </div>
          ) : (
            <>
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/30">
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                      Category Details
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                      Items
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                      Created
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {categories.map((cat) => (
                    <tr key={cat.id} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div 
                            className="w-1.5 h-12 rounded-full" 
                            style={{ backgroundColor: cat.color || '#3B82F6' }} 
                          />
                          <div>
                            <p className="text-sm font-black text-black uppercase tracking-widest">
                              {cat.name}
                            </p>
                            <p className="text-[10px] text-gray-400 uppercase tracking-tighter mt-1">
                              {cat.description || 'No description'}
                            </p>
                            <div className="flex gap-3 mt-2">
                              <span className="text-[9px] text-gray-500">
                                Slug: {cat.slug}
                              </span>
                              <span className="text-[9px] text-gray-500">
                                ID: {cat.id.substring(0, 8)}...
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-black">
                            {cat.itemCount}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            items
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-[10px] text-gray-500">
                          {formatDate(cat.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(cat)}
                            className="p-2 border border-gray-200 hover:border-black hover:bg-black hover:text-white transition-all"
                            title="Edit category"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id)}
                            className={`p-2 border border-gray-200 hover:border-red-600 hover:bg-red-600 hover:text-white transition-all ${
                              cat.itemCount > 0 ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            disabled={cat.itemCount > 0}
                            title={cat.itemCount > 0 ? "Cannot delete category with items" : "Delete category"}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                <p className="text-[10px] text-gray-500">
                  Total Categories: {categories.length}
                </p>
               
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}