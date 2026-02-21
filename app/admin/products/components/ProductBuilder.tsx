// /app/admin/products/components/ProductBuilder.tsx
'use client'

import React, { useState, useEffect, useRef } from 'react'
import { 
  X, 
  Save, 
  Package, 
  Zap, 
  Image as ImageIcon, 
  Plus,
  AlertTriangle,
  ArrowLeft,
  Link as LinkIcon,
  Upload,
  Camera,
  Trash2,
  RefreshCw
} from 'lucide-react'
import { db, storage } from '@/lib/firebase'
import { 
  addDoc, 
  updateDoc, 
  doc, 
  collection,
  getDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  where
} from 'firebase/firestore'
import { 
  ref, 
  uploadBytes, 
  getDownloadURL,
  deleteObject 
} from 'firebase/storage'

// Types
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

interface ProductItem {
  id?: string;
  name: string;
  sku: string;
  description: string;
  type: 'PRODUCT' | 'SERVICE';
  price: number;
  cost: number;
  unit: string;
  stock?: number;
  minStock?: number;
  categoryId: string;
  categoryName: string;
  status: 'ACTIVE' | 'INACTIVE';
  imageUrl: string;
  slug?: string;
  isActive?: boolean;
  profitMargin?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface ProductBuilderProps {
  product?: ProductItem | null
  onSave: () => void  // Just refresh, no data needed
  onCancel: () => void
}

const UNITS = ['Litre', 'Kg', 'Unit', 'Pack', 'Box', 'Roll', 'Hour', 'SqFt']

export default function ProductBuilder({ product, onSave, onCancel }: ProductBuilderProps) {
  const [formData, setFormData] = useState<Partial<ProductItem>>({
    name: '',
    sku: '',
    description: '',
    type: 'PRODUCT',
    price: 0,
    cost: 0,
    unit: 'Unit',
    stock: 0,
    minStock: 0,
    categoryId: '',
    categoryName: '',
    status: 'ACTIVE',
    imageUrl: ''
  })

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageUploadMethod, setImageUploadMethod] = useState<'url' | 'upload' | null>(null)
  const [imageUrlInput, setImageUrlInput] = useState('')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
          updatedAt: data.updatedAt || '',
          slug: data.slug || '',
          isActive: data.isActive || true
        })
      })
      setCategories(categoriesList)
      
      // Set default category if not already set and no product
      if (categoriesList.length > 0 && !formData.categoryId && !product) {
        setFormData((prev) => ({
          ...prev,
          categoryId: categoriesList[0].id,
          categoryName: categoriesList[0].name
        }))
      }
    })
    
    return () => unsubscribe()
  }, [])

  // Load product data if editing
  useEffect(() => {
    if (product) {
      setFormData(product)
      if (product.imageUrl) {
        setImagePreview(product.imageUrl)
      }
    }
  }, [product])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    if (name === 'categoryId') {
      const cat = categories.find(c => c.id === value)
      setFormData((prev) => ({ 
        ...prev, 
        categoryId: value, 
        categoryName: cat?.name || '' 
      }))
    } else {
      setFormData((prev) => ({ 
        ...prev, 
        [name]: ['price', 'cost', 'stock', 'minStock'].includes(name) ? Number(value) || 0 : value 
      }))
    }
  }

  // Handle image URL input
  const handleImageUrlSubmit = () => {
    if (imageUrlInput.trim()) {
      setFormData((prev) => ({ ...prev, imageUrl: imageUrlInput.trim() }))
      setImagePreview(imageUrlInput.trim())
      setImageUrlInput('')
      setImageUploadMethod(null)
    }
  }

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB')
        return
      }
      
      setSelectedImage(file)
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      
      setImageUploadMethod(null)
    }
  }

  // Upload image to Firebase Storage
  const uploadImageToFirebase = async (file: File): Promise<string> => {
    try {
      setUploadingImage(true)
      
      const timestamp = Date.now()
      const fileName = `${formData.type?.toLowerCase() || 'product'}_${timestamp}_${file.name.replace(/\s+/g, '_')}`
      const storageRef = ref(storage, `product-images/${fileName}`)
      
      const snapshot = await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(snapshot.ref)
      
      setUploadingImage(false)
      return downloadURL
    } catch (error) {
      setUploadingImage(false)
      console.error('Error uploading image:', error)
      throw new Error('Failed to upload image')
    }
  }

  // Handle image upload
  const handleImageUpload = async () => {
    if (selectedImage) {
      try {
        const imageUrl = await uploadImageToFirebase(selectedImage)
        setFormData((prev) => ({ ...prev, imageUrl }))
        alert('Image uploaded successfully!')
      } catch (error) {
        alert('Failed to upload image. Please try again.')
      }
    }
  }

  // Remove image
  const handleRemoveImage = async () => {
    if (formData.imageUrl && formData.imageUrl.startsWith('https://firebasestorage.googleapis.com/')) {
      try {
        const url = new URL(formData.imageUrl)
        const path = decodeURIComponent(url.pathname.split('/o/')[1]?.split('?')[0] || '')
        
        if (path) {
          const imageRef = ref(storage, path)
          await deleteObject(imageRef)
        }
      } catch (error) {
        console.log('Error deleting image from storage:', error)
      }
    }
    
    setImagePreview(null)
    setFormData((prev) => ({ ...prev, imageUrl: '' }))
    setSelectedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Generate SKU if not provided
  const generateSKU = () => {
    if (!formData.name) return
    
    const prefix = formData.type === 'PRODUCT' ? 'PROD' : 'SERV'
    const namePart = formData.name.substring(0, 3).toUpperCase()
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    const sku = `${prefix}-${namePart}-${random}`
    
    setFormData((prev) => ({ ...prev, sku }))
  }

  // ✅ Main form submit handler - Saves to correct Firebase collection
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      if (!formData.categoryId || !formData.categoryName) {
        alert('Please select a category')
        setLoading(false)
        return
      }

      if (!formData.name?.trim()) {
        alert('Please enter item name')
        setLoading(false)
        return
      }

      const now = new Date().toISOString()
      
      // Upload image if selected
      let finalImageUrl = formData.imageUrl || ''
      if (selectedImage && (!formData.imageUrl || !formData.imageUrl.startsWith('https://'))) {
        try {
          finalImageUrl = await uploadImageToFirebase(selectedImage)
        } catch (error) {
          alert('Failed to upload image. Please try again.')
          setLoading(false)
          return
        }
      }

      // Prepare item data
      const itemData = {
        name: formData.name?.trim() || '',
        sku: formData.sku?.trim() || generateSKU() || `${formData.type}_${Date.now()}`,
        description: formData.description?.trim() || '',
        type: formData.type || 'PRODUCT',
        price: Number(formData.price) || 0,
        cost: Number(formData.cost) || 0,
        unit: formData.unit || 'Unit',
        categoryId: formData.categoryId || '',
        categoryName: formData.categoryName || '',
        status: formData.status || 'ACTIVE',
        imageUrl: finalImageUrl || '',
        slug: formData.name?.toLowerCase().replace(/\s+/g, '-') || '',
        isActive: formData.status === 'ACTIVE',
        profitMargin: formData.price && formData.price > 0 
          ? Math.round(((formData.price - (formData.cost || 0)) / formData.price) * 100) 
          : 0,
        updatedAt: now
      }

      // Add type-specific fields
      if (formData.type === 'PRODUCT') {
        Object.assign(itemData, {
          stock: Number(formData.stock) || 0,
          minStock: Number(formData.minStock) || 0
        })
      }

      // ✅ Save to appropriate Firebase collection
      if (product?.id) {
        // Update existing item
        const collectionName = product.type === 'PRODUCT' ? 'products' : 'services'
        const docRef = doc(db, collectionName, product.id)
        await updateDoc(docRef, itemData)
        console.log(`✅ ${product.type} updated in ${collectionName} collection`)
        alert(`${product.type} updated successfully!`)
      } else {
        // Add new item
        const collectionName = formData.type === 'PRODUCT' ? 'products' : 'services'
        const docRef = await addDoc(collection(db, collectionName), {
          ...itemData,
          createdAt: now
        })
        console.log(`✅ New ${formData.type} added to ${collectionName} collection with ID: ${docRef.id}`)
        alert(`${formData.type} added successfully!`)
      }

      // Call onSave to refresh parent list
      onSave()
      
    } catch (error) {
      console.error('❌ Error saving item:', error)
      alert('Error saving item. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle type change
  const handleTypeChange = (type: 'PRODUCT' | 'SERVICE') => {
    setFormData((prev) => ({ ...prev, type }))
  }

  return (
    <div className="bg-white border border-gray-200">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
        <div className="flex items-center gap-4">
          <button 
            onClick={onCancel} 
            className="p-2 hover:bg-black hover:text-white transition-all border border-transparent hover:border-black"
            type="button"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h2 className="text-xl font-black uppercase tracking-tighter">
            {product ? 'Edit Item' : 'Create New Item'}
          </h2>
          <div className="ml-4 px-3 py-1 bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest">
            {formData.type === 'PRODUCT' ? 'Physical Product' : 'Service Fee'}
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            type="button" 
            onClick={onCancel}
            className="px-4 py-2 border border-gray-200 text-xs font-black uppercase hover:bg-gray-50 transition-all tracking-widest"
          >
            Cancel
          </button>
          <button 
            form="product-form"
            type="submit"
            disabled={loading || uploadingImage || !formData.name?.trim() || !formData.categoryId}
            className={`px-6 py-2 text-xs font-black uppercase transition-all flex items-center gap-2 tracking-widest ${
              loading || uploadingImage || !formData.name?.trim() || !formData.categoryId
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-black text-white hover:bg-gray-900'
            }`}
          >
            {loading || uploadingImage ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                {uploadingImage ? 'Uploading Image...' : 'Saving...'}
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {product ? 'Update Item' : 'Save Item'}
              </>
            )}
          </button>
        </div>
      </div>

      <form id="product-form" onSubmit={handleSubmit} className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column: Media & Type */}
          <div className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Item Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleTypeChange('PRODUCT')}
                  className={`flex flex-col items-center gap-2 p-4 border transition-all ${
                    formData.type === 'PRODUCT' 
                      ? 'border-black bg-black text-white' 
                      : 'border-gray-200 text-gray-400 hover:border-gray-300'
                  }`}
                >
                  <Package className="h-6 w-6" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Physical Product</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange('SERVICE')}
                  className={`flex flex-col items-center gap-2 p-4 border transition-all ${
                    formData.type === 'SERVICE' 
                      ? 'border-black bg-black text-white' 
                      : 'border-gray-200 text-gray-400 hover:border-gray-300'
                  }`}
                >
                  <Zap className="h-6 w-6" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Service Fee</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                Media {uploadingImage && '(Uploading...)'}
              </label>
              
              {/* Image Preview */}
              {imagePreview && (
                <div className="relative mb-4">
                  <div className="aspect-square border border-gray-200 overflow-hidden bg-gray-100">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                  <div className="mt-2 text-center">
                    <p className="text-[10px] text-gray-500">
                      {formData.imageUrl && formData.imageUrl.startsWith('https://firebasestorage.googleapis.com/') 
                        ? '✓ Stored in Firebase Storage' 
                        : formData.imageUrl 
                          ? '✓ Image URL saved' 
                          : 'Local preview'}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Image Upload Options */}
              {!imagePreview && (
                <div className="space-y-3">
                  <div 
                    onClick={() => setImageUploadMethod('upload')}
                    className="aspect-square border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-6 text-center group hover:border-black transition-colors cursor-pointer bg-gray-50/50"
                  >
                    <ImageIcon className="h-10 w-10 text-gray-300 group-hover:text-black mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-black">
                      {imageUploadMethod === 'upload' ? 'Select Image' : 'Click to Upload'}
                    </p>
                    <p className="text-[10px] text-gray-300 mt-1 uppercase">OR PASTE IMAGE URL</p>
                  </div>
                  
                  {/* Upload Options */}
                  {imageUploadMethod === 'upload' && (
                    <div className="space-y-3 p-4 border border-gray-200 bg-gray-50">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                      >
                        <Camera className="h-4 w-4" />
                        Select from Gallery
                      </button>
                      {selectedImage && (
                        <div className="mt-2 p-3 bg-white border border-gray-200">
                          <p className="text-[10px] text-gray-600 mb-2">Selected: {selectedImage.name}</p>
                          <button
                            type="button"
                            onClick={handleImageUpload}
                            disabled={uploadingImage}
                            className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-xs font-bold transition-all"
                          >
                            {uploadingImage ? (
                              <>
                                <RefreshCw className="h-3 w-3 animate-spin inline-block mr-2" />
                                Uploading...
                              </>
                            ) : (
                              'Upload to Firebase Storage'
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* URL Input Option */}
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setImageUploadMethod(imageUploadMethod === 'url' ? null : 'url')}
                      className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                    >
                      <LinkIcon className="h-4 w-4" />
                      Paste Image URL
                    </button>
                    
                    {imageUploadMethod === 'url' && (
                      <div className="space-y-2">
                        <input
                          type="url"
                          value={imageUrlInput}
                          onChange={(e) => setImageUrlInput(e.target.value)}
                          placeholder="https://example.com/image.jpg"
                          className="w-full px-3 py-2 border border-gray-200 text-sm"
                        />
                        <button
                          type="button"
                          onClick={handleImageUrlSubmit}
                          disabled={!imageUrlInput.trim()}
                          className="w-full px-4 py-2 bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white text-xs font-bold transition-all"
                        >
                          Use URL
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-100 flex gap-3">
              <AlertTriangle className="h-5 w-5 text-blue-500 shrink-0" />
              <div>
                <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest">
                  {formData.type === 'PRODUCT' ? 'Products Collection' : 'Services Collection'}
                </p>
                <p className="text-[10px] text-blue-600/80 mt-1">
                  {formData.type === 'PRODUCT' 
                    ? 'This item will be saved in Firebase "products" collection' 
                    : 'This item will be saved in Firebase "services" collection'}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Form Fields */}
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Item Name *</label>
                <input
                  required
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 focus:border-black outline-none text-sm font-bold uppercase tracking-widest"
                  placeholder="E.G. PROFESSIONAL CLEANING SOLUTION"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">SKU / Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    className="flex-1 px-4 py-3 border border-gray-200 focus:border-black outline-none text-sm font-bold uppercase tracking-widest"
                    placeholder="HW-CLN-001"
                  />
                  <button
                    type="button"
                    onClick={generateSKU}
                    className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-xs font-black uppercase tracking-widest border border-gray-200"
                  >
                    Generate
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Description</label>
              <textarea
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 focus:border-black outline-none text-sm font-bold"
                placeholder="PROPER APPLICATION AND MIXING RATIO..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Category *</label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 focus:border-black outline-none text-sm font-bold uppercase tracking-widest"
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name.toUpperCase()}  
                    </option>
                  ))}
                </select>
                <p className="text-[9px] text-gray-400 mt-1">
                  Real-time categories from Firebase
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Unit Type *</label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 focus:border-black outline-none text-sm font-bold uppercase tracking-widest"
                >
                  <option value="">Select Unit</option>
                  {UNITS.map(unit => (
                    <option key={unit} value={unit}>{unit.toUpperCase()}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-100">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Unit Price (AED) *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black">AED</span>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 focus:border-black outline-none text-sm font-black"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Unit Cost (AED) *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400">AED</span>
                  <input
                    type="number"
                    name="cost"
                    value={formData.cost}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 focus:border-black outline-none text-sm font-black"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Margin</label>
                <div className="w-full px-4 py-3 bg-gray-50 border border-gray-100 text-sm font-black text-center">
                  {formData.price && formData.price > 0 
                    ? `${Math.round(((formData.price - (formData.cost || 0)) / formData.price) * 100)}%` 
                    : '0%'}
                </div>
              </div>
            </div>

            {formData.type === 'PRODUCT' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Current Stock</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-3 border border-gray-200 focus:border-black outline-none text-sm font-black"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Low Stock Alert</label>
                  <input
                    type="number"
                    name="minStock"
                    value={formData.minStock}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-3 border border-gray-200 focus:border-black outline-none text-sm font-black"
                  />
                </div>
              </div>
            )}
            
            <div className="pt-6 border-t border-gray-100">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Status</label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="ACTIVE"
                    checked={formData.status === 'ACTIVE'}
                    onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as 'ACTIVE' | 'INACTIVE' }))}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-bold">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="INACTIVE"
                    checked={formData.status === 'INACTIVE'}
                    onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as 'ACTIVE' | 'INACTIVE' }))}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-bold">Inactive</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}