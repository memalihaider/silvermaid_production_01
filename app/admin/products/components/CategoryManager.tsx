// /app/admin/products/components/CategoryManager.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  Layers
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
  onSnapshot
} from 'firebase/firestore'

interface Category {
  id: string
  name: string
  description: string
  color: string
  itemCount: number
  createdAt: string
  updatedAt: string
}

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Category>>({
    name: '',
    description: '',
    color: '#000000'
  })

  // Fetch categories from Firebase
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
          color: data.color || '#000000',
          itemCount: data.itemCount || 0,
          createdAt: data.createdAt || '',
          updatedAt: data.updatedAt || ''
        })
      })
      setCategories(categoriesList)
    })
    
    return () => unsubscribe()
  }, [])

  // Save category to Firebase
  const handleSave = async (categoryData: Partial<Category>) => {
    try {
      const categoriesRef = collection(db, 'categories')
      const now = new Date().toISOString()
      
      if (editingId && categoryData.id) {
        // Update existing category
        const categoryDoc = doc(db, 'categories', editingId)
        await updateDoc(categoryDoc, {
          name: categoryData.name,
          description: categoryData.description,
          color: categoryData.color || '#000000',
          updatedAt: now
        })
      } else {
        // Add new category
        await addDoc(categoriesRef, {
          name: categoryData.name,
          description: categoryData.description,
          color: categoryData.color || '#000000',
          itemCount: 0,
          createdAt: now,
          updatedAt: now
        })
      }
      
      resetForm()
    } catch (error) {
      console.error('Error saving category:', error)
      alert('Error saving category. Please try again.')
    }
  }

  // Delete category from Firebase
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return
    
    try {
      // First check if this category has any items
      const category = categories.find(cat => cat.id === id)
      if (category && category.itemCount > 0) {
        alert('Cannot delete category with items. Please remove items first.')
        return
      }
      
      await deleteDoc(doc(db, 'categories', id))
      alert('Category deleted successfully!')
    } catch (error) {
      console.error('Error deleting category:', error)
      alert('Error deleting category. Please try again.')
    }
  }

  const resetForm = () => {
    setFormData({ 
      name: '', 
      description: '', 
      color: '#000000' 
    })
    setIsAdding(false)
    setEditingId(null)
  }

  const handleEdit = (cat: Category) => {
    setFormData(cat)
    setEditingId(cat.id)
    setIsAdding(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name?.trim()) {
      alert('Category name is required')
      return
    }
    handleSave(formData)
  }

  // Generate random color for new categories
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
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-black text-white p-6">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <Layers className="h-4 w-4" />
            {editingId ? 'Edit category' : 'New category'}
          </h3>
          <p className="text-[10px] text-white/50 mb-6 uppercase tracking-widest leading-relaxed">
            Organize your inventory into meaningful segments for better reporting and quotation building.
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

            <div className="flex items-center justify-between">
              <div>
                <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1 block">
                  Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={e => setFormData({ ...formData, color: e.target.value })}
                    className="w-8 h-8 cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, color: generateRandomColor() })}
                    className="text-[10px] text-white/60 hover:text-white transition-colors"
                  >
                    Random
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={!formData.name?.trim()}
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${
                  !formData.name?.trim() 
                    ? 'bg-gray-500 cursor-not-allowed' 
                    : 'bg-white text-black hover:bg-white/90'
                }`}
              >
                {editingId ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                {editingId ? 'Update' : 'Create'}
              </button>
              {(isAdding || editingId) && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-white/20 text-white hover:bg-white/10 transition-all"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="p-4 border border-gray-200 bg-gray-50/50">
          <div className="flex items-center gap-2 text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4">
            <Check className="h-3 w-3 text-green-500" />
            Pro Tip
          </div>
          <p className="text-[10px] text-gray-500 leading-relaxed uppercase tracking-tighter">
            Categories with high volume items should be placed at the top for faster access in the builder.
          </p>
        </div>
      </div>

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
                            className="w-1.5 h-10" 
                            style={{ backgroundColor: cat.color || '#000000' }} 
                          />
                          <div>
                            <p className="text-xs font-black text-black uppercase tracking-widest">
                              {cat.name}
                            </p>
                            <p className="text-[10px] text-gray-400 uppercase tracking-tighter">
                              {cat.description || 'No description'}
                            </p>
                            <div className="flex gap-2 mt-1">
                              <span className="text-[9px] text-gray-500">
                                Created: {new Date(cat.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-black">
                            {cat.itemCount || 0}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            items
                          </span>
                        </div>
                      </td>
                     <td className="px-6 py-4 text-right">
  <div className="flex justify-end gap-2">
    <button
      onClick={() => handleEdit(cat)}
      className="p-2 border border-gray-200"
      title="Edit category"
    >
      <Edit2 className="h-3 w-3" />
    </button>
    <button
      onClick={() => handleDelete(cat.id)}
      className="p-2 border border-gray-200"
      disabled={cat.itemCount > 0}
      title={cat.itemCount > 0 ? "Cannot delete category with items" : "Delete category"}
    >
      <Trash2 className="h-3 w-3" />
    </button>
  </div>
</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <div className="px-6 py-4 border-t border-gray-200 text-right">
                <p className="text-[10px] text-gray-500">
                  Total: {categories.length} categories
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}