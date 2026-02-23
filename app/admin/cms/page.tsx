'use client'

import { useState, useEffect } from 'react'
import { 
  FileText, 
  Layout, 
  Image as ImageIcon, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit3, 
  Trash2,
  Globe,
  Clock,
  CheckCircle2,
  X,
  User,
  Star,
  MessageSquare,
  HelpCircle,
  Shield
} from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore'

// Blog Post Type
type BlogPost = {
  id: string;
  title: string;
  name: string;
  description: string;
  content: string;
  readTime: number;
  imageURL: string;
  featured: boolean;
  tags: string[];
  createdAt: any;
  author?: string;
  status?: string;
  date?: string;
  category?: string;
}

// Testimonial Type
type Testimonial = {
  id: string;
  name: string;
  description: string;
  rating: number;
  imageURL: string;
  location: string;
  createdAt: any;
  date?: string;
  featured?: boolean;
}

// FAQ Type
type FAQ = {
  id: string;
  question: string;
  answer: string;
  category?: string;
  order?: number;
  createdAt: any;
  updatedAt?: any;
}

// Privacy Policy Type
type PrivacyPolicy = {
  id: string;
  title: string;
  content: string;
  order?: number;
  createdAt: any;
  updatedAt?: any;
}

export default function CMS() {
  const [activeTab, setActiveTab] = useState('blog')
  const [showModal, setShowModal] = useState(false)
  const [showTestimonialModal, setShowTestimonialModal] = useState(false)
  const [showFAQModal, setShowFAQModal] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [privacyPolicies, setPrivacyPolicies] = useState<PrivacyPolicy[]>([])
  
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null)
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null)
  const [editingPrivacy, setEditingPrivacy] = useState<PrivacyPolicy | null>(null)
  
  // Blog Form Data
  const [formData, setFormData] = useState({
    title: '',
    name: '',
    description: '',
    content: '',
    readTime: 5,
    featured: false,
    tags: '',
    imageURL: ''
  })
  
  // Testimonial Form Data
  const [testimonialForm, setTestimonialForm] = useState({
    name: '',
    description: '',
    rating: 5,
    imageURL: '',
    location: '',
    featured: false
  })

  // FAQ Form Data
  const [faqForm, setFaqForm] = useState({
    question: '',
    answer: '',
    category: 'General'
  })

  // Privacy Policy Form Data
  const [privacyForm, setPrivacyForm] = useState({
    title: '',
    content: ''
  })

  // Default Privacy Policy content
  const defaultPrivacyContent = `Information Collection
At Silver Maid, we respect your privacy. We collect personal information such as your name, contact details, and address solely for the purpose of providing and coordinating our cleaning services. This data is stored securely and is never shared with third parties for marketing purposes.

Data Security
We implement industry-standard security measures to protect your personal data from unauthorized access or disclosure. Our online booking system uses SSL encryption to ensure your payment and personal details are handled with the highest level of security.

Usage Disclosure
We use your information to:

Schedule and confirm your cleaning appointments
Process payments and issue invoices
Communicate service updates or changes
Enhance our customer support experience
Your Rights
You have the right to request access to the personal data we hold about you, to request corrections, or to ask for your data to be deleted from our active databases when it is no longer required for service delivery.`

  // Fetch blog posts from Firebase
  const fetchBlogPosts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'blog-post'))
      const posts: BlogPost[] = []
      
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        posts.push({
          id: doc.id,
          title: data.title || '',
          name: data.name || 'Admin',
          description: data.description || '',
          content: data.content || '',
          readTime: data.readTime || 5,
          imageURL: data.imageURL || '',
          featured: data.featured || false,
          tags: data.tags || [],
          createdAt: data.createdAt,
          author: data.name || 'Admin',
          status: 'Published',
          date: data.createdAt?.toDate?.().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          }) || 'Dec 20, 2025',
          category: data.tags?.[0] || 'Tips'
        })
      })
      
      setBlogPosts(posts.sort((a, b) => 
        new Date(b.createdAt?.toDate?.() || 0).getTime() - 
        new Date(a.createdAt?.toDate?.() || 0).getTime()
      ))
    } catch (error) {
      console.error('Error fetching blog posts:', error)
      alert('Error fetching blog posts!')
    }
  }

  // Fetch testimonials from Firebase
  const fetchTestimonials = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'testimonials'))
      const testimonialsData: Testimonial[] = []
      
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        testimonialsData.push({
          id: doc.id,
          name: data.name || '',
          description: data.description || '',
          rating: data.rating || 5,
          imageURL: data.imageURL || '',
          location: data.location || '',
          createdAt: data.createdAt,
          featured: data.featured || false,
          date: data.createdAt?.toDate?.().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          }) || 'Dec 20, 2025'
        })
      })
      
      setTestimonials(testimonialsData.sort((a, b) => 
        new Date(b.createdAt?.toDate?.() || 0).getTime() - 
        new Date(a.createdAt?.toDate?.() || 0).getTime()
      ))
    } catch (error) {
      console.error('Error fetching testimonials:', error)
      alert('Error fetching testimonials!')
    }
  }

  // Fetch FAQs from Firebase
  const fetchFAQs = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'faq'))
      const faqsData: FAQ[] = []
      
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        faqsData.push({
          id: doc.id,
          question: data.question || '',
          answer: data.answer || '',
          category: data.category || 'General',
          order: data.order || 0,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        })
      })
      
      // Sort by order then by question
      setFaqs(faqsData.sort((a, b) => {
        if (a.order !== b.order) return (a.order || 0) - (b.order || 0)
        return a.question.localeCompare(b.question)
      }))
    } catch (error) {
      console.error('Error fetching FAQs:', error)
      alert('Error fetching FAQs!')
    }
  }

  // Fetch Privacy Policy from Firebase
  const fetchPrivacyPolicies = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'privacy-policy'))
      const privacyData: PrivacyPolicy[] = []
      
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        privacyData.push({
          id: doc.id,
          title: data.title || '',
          content: data.content || '',
          order: data.order || 0,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        })
      })
      
      // Sort by order then by title
      setPrivacyPolicies(privacyData.sort((a, b) => {
        if (a.order !== b.order) return (a.order || 0) - (b.order || 0)
        return a.title.localeCompare(b.title)
      }))
    } catch (error) {
      console.error('Error fetching privacy policies:', error)
      alert('Error fetching privacy policies!')
    }
  }

  // Fetch data on component mount
  useEffect(() => {
    if (activeTab === 'blog') {
      fetchBlogPosts()
    } else if (activeTab === 'testimonials') {
      fetchTestimonials()
    } else if (activeTab === 'faq') {
      fetchFAQs()
    } else if (activeTab === 'privacy') {
      fetchPrivacyPolicies()
    }
  }, [activeTab])

  // Open Blog Modal
  const handleOpenModal = (post?: BlogPost) => {
    if (post) {
      setEditingPost(post)
      setFormData({
        title: post.title,
        name: post.name || '',
        description: post.description,
        content: post.content,
        readTime: post.readTime,
        featured: post.featured,
        tags: post.tags.join(', '),
        imageURL: post.imageURL
      })
    } else {
      setEditingPost(null)
      setFormData({
        title: '',
        name: '',
        description: '',
        content: '',
        readTime: 5,
        featured: false,
        tags: '',
        imageURL: ''
      })
    }
    setShowModal(true)
  }

  // Open Testimonial Modal
  const handleOpenTestimonialModal = (testimonial?: Testimonial) => {
    if (testimonial) {
      setEditingTestimonial(testimonial)
      setTestimonialForm({
        name: testimonial.name,
        description: testimonial.description,
        rating: testimonial.rating,
        imageURL: testimonial.imageURL,
        location: testimonial.location,
        featured: testimonial.featured || false
      })
    } else {
      setEditingTestimonial(null)
      setTestimonialForm({
        name: '',
        description: '',
        rating: 5,
        imageURL: '',
        location: '',
        featured: false
      })
    }
    setShowTestimonialModal(true)
  }

  // Open FAQ Modal
  const handleOpenFAQModal = (faq?: FAQ) => {
    if (faq) {
      setEditingFAQ(faq)
      setFaqForm({
        question: faq.question,
        answer: faq.answer,
        category: faq.category || 'General'
      })
    } else {
      setEditingFAQ(null)
      setFaqForm({
        question: '',
        answer: '',
        category: 'General'
      })
    }
    setShowFAQModal(true)
  }

  // Open Privacy Policy Modal
  const handleOpenPrivacyModal = (privacy?: PrivacyPolicy) => {
    if (privacy) {
      setEditingPrivacy(privacy)
      setPrivacyForm({
        title: privacy.title,
        content: privacy.content
      })
    } else {
      setEditingPrivacy(null)
      setPrivacyForm({
        title: '',
        content: defaultPrivacyContent
      })
    }
    setShowPrivacyModal(true)
  }

  // Close modals
  const handleCloseModal = () => {
    setShowModal(false)
    setEditingPost(null)
  }

  const handleCloseTestimonialModal = () => {
    setShowTestimonialModal(false)
    setEditingTestimonial(null)
  }

  const handleCloseFAQModal = () => {
    setShowFAQModal(false)
    setEditingFAQ(null)
  }

  const handleClosePrivacyModal = () => {
    setShowPrivacyModal(false)
    setEditingPrivacy(null)
  }

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleTestimonialInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setTestimonialForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
               type === 'number' ? parseInt(value) : value
    }))
  }

  const handleFAQInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFaqForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePrivacyInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setPrivacyForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle star rating click
  const handleStarClick = (rating: number) => {
    setTestimonialForm(prev => ({
      ...prev,
      rating: rating
    }))
  }

  // Save/Update blog post
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.content) {
      alert('Title and Content are required!')
      return
    }

    try {
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag !== '')

      const blogData = {
        title: formData.title,
        name: formData.name,
        description: formData.description,
        content: formData.content,
        readTime: parseInt(formData.readTime.toString()) || 5,
        imageURL: formData.imageURL,
        featured: formData.featured,
        tags: tagsArray,
        createdAt: editingPost ? editingPost.createdAt : new Date(),
        updatedAt: new Date()
      }

      if (editingPost) {
        const postRef = doc(db, 'blog-post', editingPost.id)
        await updateDoc(postRef, blogData)
        alert('Blog post updated successfully!')
      } else {
        await addDoc(collection(db, 'blog-post'), blogData)
        alert('Blog post created successfully!')
      }

      await fetchBlogPosts()
      handleCloseModal()
      
    } catch (error) {
      console.error('Error saving blog post:', error)
      alert('Error saving blog post!')
    }
  }

  // Save/Update testimonial
  const handleTestimonialSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!testimonialForm.name || !testimonialForm.description) {
      alert('Name and Description are required!')
      return
    }

    try {
      const testimonialData = {
        name: testimonialForm.name,
        description: testimonialForm.description,
        rating: testimonialForm.rating,
        imageURL: testimonialForm.imageURL,
        location: testimonialForm.location,
        featured: testimonialForm.featured,
        createdAt: editingTestimonial ? editingTestimonial.createdAt : new Date(),
        updatedAt: new Date()
      }

      if (editingTestimonial) {
        const testimonialRef = doc(db, 'testimonials', editingTestimonial.id)
        await updateDoc(testimonialRef, testimonialData)
        alert('Testimonial updated successfully!')
      } else {
        await addDoc(collection(db, 'testimonials'), testimonialData)
        alert('Testimonial created successfully!')
      }

      await fetchTestimonials()
      handleCloseTestimonialModal()
      
    } catch (error) {
      console.error('Error saving testimonial:', error)
      alert('Error saving testimonial!')
    }
  }

  // Save/Update FAQ
  const handleFAQSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!faqForm.question || !faqForm.answer) {
      alert('Question and Answer are required!')
      return
    }

    try {
      const faqData = {
        question: faqForm.question,
        answer: faqForm.answer,
        category: faqForm.category,
        order: 0,
        createdAt: editingFAQ ? editingFAQ.createdAt : new Date(),
        updatedAt: new Date()
      }

      if (editingFAQ) {
        const faqRef = doc(db, 'faq', editingFAQ.id)
        await updateDoc(faqRef, faqData)
        alert('FAQ updated successfully!')
      } else {
        await addDoc(collection(db, 'faq'), faqData)
        alert('FAQ created successfully!')
      }

      await fetchFAQs()
      handleCloseFAQModal()
      
    } catch (error) {
      console.error('Error saving FAQ:', error)
      alert('Error saving FAQ!')
    }
  }

  // Save/Update Privacy Policy
  const handlePrivacySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!privacyForm.title || !privacyForm.content) {
      alert('Title and Content are required!')
      return
    }

    try {
      const privacyData = {
        title: privacyForm.title,
        content: privacyForm.content,
        order: 0,
        createdAt: editingPrivacy ? editingPrivacy.createdAt : new Date(),
        updatedAt: new Date()
      }

      if (editingPrivacy) {
        const privacyRef = doc(db, 'privacy-policy', editingPrivacy.id)
        await updateDoc(privacyRef, privacyData)
        alert('Privacy Policy updated successfully!')
      } else {
        await addDoc(collection(db, 'privacy-policy'), privacyData)
        alert('Privacy Policy created successfully!')
      }

      await fetchPrivacyPolicies()
      handleClosePrivacyModal()
      
    } catch (error) {
      console.error('Error saving privacy policy:', error)
      alert('Error saving privacy policy!')
    }
  }

  // Delete blog post
  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return

    try {
      await deleteDoc(doc(db, 'blog-post', postId))
      alert('Blog post deleted successfully!')
      await fetchBlogPosts()
    } catch (error) {
      console.error('Error deleting blog post:', error)
      alert('Error deleting blog post!')
    }
  }

  // Delete testimonial
  const handleDeleteTestimonial = async (testimonialId: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return

    try {
      await deleteDoc(doc(db, 'testimonials', testimonialId))
      alert('Testimonial deleted successfully!')
      await fetchTestimonials()
    } catch (error) {
      console.error('Error deleting testimonial:', error)
      alert('Error deleting testimonial!')
    }
  }

  // Delete FAQ
  const handleDeleteFAQ = async (faqId: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return

    try {
      await deleteDoc(doc(db, 'faq', faqId))
      alert('FAQ deleted successfully!')
      await fetchFAQs()
    } catch (error) {
      console.error('Error deleting FAQ:', error)
      alert('Error deleting FAQ!')
    }
  }

  // Delete Privacy Policy
  const handleDeletePrivacy = async (privacyId: string) => {
    if (!confirm('Are you sure you want to delete this privacy policy?')) return

    try {
      await deleteDoc(doc(db, 'privacy-policy', privacyId))
      alert('Privacy Policy deleted successfully!')
      await fetchPrivacyPolicies()
    } catch (error) {
      console.error('Error deleting privacy policy:', error)
      alert('Error deleting privacy policy!')
    }
  }

  const pages = [
    { id: 1, title: 'Home', slug: '/', status: 'Published', lastModified: 'Dec 20, 2025', views: '12.4k' },
    { id: 2, title: 'About Us', slug: '/about', status: 'Published', lastModified: 'Dec 18, 2025', views: '3.2k' },
    { id: 3, title: 'Services', slug: '/services', status: 'Published', lastModified: 'Dec 19, 2025', views: '8.1k' },
    { id: 4, title: 'Pricing', slug: '/pricing', status: 'Draft', lastModified: 'Dec 21, 2025', views: '0' }
  ]

  // Render star rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Management</h1>
          <p className="text-muted-foreground">Manage your website content including pages, blog posts, testimonials, FAQs, and privacy policy.</p>
        </div>
        
        {/* Create Buttons */}
        {activeTab === 'blog' && (
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
          >
            <Plus className="h-4 w-4" />
            Create New Post
          </button>
        )}
        {activeTab === 'pages' && (
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
            <Plus className="h-4 w-4" />
            Create New Page
          </button>
        )}
        {activeTab === 'media' && (
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
            <Plus className="h-4 w-4" />
            Upload New Asset
          </button>
        )}
        {activeTab === 'testimonials' && (
          <button 
            onClick={() => handleOpenTestimonialModal()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
          >
            <Plus className="h-4 w-4" />
            Add Testimonial
          </button>
        )}
        {activeTab === 'faq' && (
          <button 
            onClick={() => handleOpenFAQModal()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
          >
            <Plus className="h-4 w-4" />
            Add FAQ
          </button>
        )}
        {activeTab === 'privacy' && (
          <button 
            onClick={() => handleOpenPrivacyModal()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
          >
            <Plus className="h-4 w-4" />
            Add Section
          </button>
        )}
      </div>

      {/* Tabs - Updated with FAQ and Privacy */}
      <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-xl w-fit flex-wrap">
        {[
          
          { id: 'blog', label: 'Blog Posts', icon: FileText },
          { id: 'testimonials', label: 'Testimonials', icon: MessageSquare },
          { id: 'faq', label: 'FAQs', icon: HelpCircle },
          { id: 'privacy', label: 'Privacy Policy', icon: Shield },
          { id: 'media', label: 'Media Library', icon: ImageIcon },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id 
                ? 'bg-card text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder={`Search ${activeTab}...`} 
            className="w-full pl-10 pr-4 py-2 bg-card border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-card border rounded-xl text-sm font-medium hover:bg-accent">
          <Filter className="h-4 w-4" />
          Filters
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
        
        {/* Pages Tab */}
        {activeTab === 'pages' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/30 border-b">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Page Title</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Slug</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Views</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Last Modified</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {pages.map((page) => (
                  <tr key={page.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <Globe className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="font-bold">{page.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{page.slug}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        page.status === 'Published' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {page.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">{page.views}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{page.lastModified}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-2 hover:bg-muted rounded-lg text-blue-600">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button className="p-2 hover:bg-muted rounded-lg text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Blog Posts Tab */}
        {activeTab === 'blog' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogPosts.map((post) => (
                <div key={post.id} className="group relative p-4 rounded-2xl border bg-muted/30 hover:bg-card hover:shadow-md transition-all">
                  <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button 
                      onClick={() => handleOpenModal(post)}
                      className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors shadow-sm"
                      title="Edit"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDeletePost(post.id)}
                      className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors shadow-sm"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex justify-between items-start mb-4">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 text-[10px] font-bold uppercase tracking-wider rounded">
                      {post.tags[0] || 'General'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                      post.status === 'Published' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {post.status}
                    </span>
                  </div>
                  
                  {post.featured && (
                    <div className="mb-2 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-yellow-600" />
                      <span className="text-xs font-medium text-yellow-600">Featured</span>
                    </div>
                  )}

                  <h4 className="font-bold text-lg mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {post.title}
                  </h4>
                  
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {post.description}
                  </p>

                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
                    <Clock className="h-3 w-3" />
                    <span>{post.readTime} min read</span>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {post.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="px-2 py-0.5 bg-muted text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-[10px] font-bold text-blue-600">
                        <User className="h-3 w-3" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-foreground">
                          {post.name || 'Admin'}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Author
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {post.date}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {blogPosts.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No blog posts yet</h3>
                <p className="text-muted-foreground mb-6">Create your first blog post to get started!</p>
                <button 
                  onClick={() => handleOpenModal()}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 mx-auto"
                >
                  <Plus className="h-4 w-4" />
                  Create Your First Post
                </button>
              </div>
            )}
          </div>
        )}

        {/* Testimonials Tab */}
        {activeTab === 'testimonials' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="group relative p-4 rounded-2xl border bg-muted/30 hover:bg-card hover:shadow-md transition-all">
                  <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button 
                      onClick={() => handleOpenTestimonialModal(testimonial)}
                      className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors shadow-sm"
                      title="Edit"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteTestimonial(testimonial.id)}
                      className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors shadow-sm"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Featured Badge */}
                  {testimonial.featured && (
                    <div className="mb-3 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-yellow-600" />
                      <span className="text-xs font-medium text-yellow-600">Featured</span>
                    </div>
                  )}

                  {/* Star Rating */}
                  <div className="mb-4">
                    {renderStars(testimonial.rating)}
                  </div>

                  {/* Testimonial Text */}
                  <p className="text-sm italic text-muted-foreground mb-4 line-clamp-3">
                    "{testimonial.description}"
                  </p>

                  {/* User Info */}
                  <div className="flex items-center gap-3 pt-4 border-t">
                    {testimonial.imageURL ? (
                      <img 
                        src={testimonial.imageURL} 
                        alt={testimonial.name}
                        className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40'
                        }}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-bold text-sm">{testimonial.name}</h4>
                      <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {testimonial.date}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {testimonials.length === 0 && (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No testimonials yet</h3>
                <p className="text-muted-foreground mb-6">Add your first customer testimonial!</p>
                <button 
                  onClick={() => handleOpenTestimonialModal()}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 mx-auto"
                >
                  <Plus className="h-4 w-4" />
                  Add First Testimonial
                </button>
              </div>
            )}
          </div>
        )}

        {/* FAQs Tab - NEW */}
        {activeTab === 'faq' && (
          <div className="p-6">
            <div className="space-y-6">
              {faqs.map((faq) => (
                <div key={faq.id} className="group relative p-6 rounded-2xl border bg-muted/30 hover:bg-card hover:shadow-md transition-all">
                  <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button 
                      onClick={() => handleOpenFAQModal(faq)}
                      className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors shadow-sm"
                      title="Edit"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteFAQ(faq.id)}
                      className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors shadow-sm"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <HelpCircle className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-muted text-xs font-medium rounded">
                          {faq.category || 'General'}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg mb-3 text-blue-700">
                        {faq.question}
                      </h3>
                      <div className="prose prose-sm max-w-none">
                        <p className="text-slate-700 whitespace-pre-line">{faq.answer}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {faqs.length === 0 && (
              <div className="text-center py-12">
                <HelpCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No FAQs yet</h3>
                <p className="text-muted-foreground mb-6">Add your first frequently asked question!</p>
                <button 
                  onClick={() => handleOpenFAQModal()}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 mx-auto"
                >
                  <Plus className="h-4 w-4" />
                  Add First FAQ
                </button>
              </div>
            )}
          </div>
        )}

        {/* Privacy Policy Tab - NEW */}
        {activeTab === 'privacy' && (
          <div className="p-6">
            <div className="space-y-6">
              {privacyPolicies.map((policy) => (
                <div key={policy.id} className="group relative p-6 rounded-2xl border bg-muted/30 hover:bg-card hover:shadow-md transition-all">
                  <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button 
                      onClick={() => handleOpenPrivacyModal(policy)}
                      className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors shadow-sm"
                      title="Edit"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDeletePrivacy(policy.id)}
                      className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors shadow-sm"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <Shield className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-xl mb-4 text-green-700">
                        {policy.title}
                      </h3>
                      <div className="prose prose-sm max-w-none">
                        <p className="text-slate-700 whitespace-pre-line leading-relaxed">{policy.content}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {privacyPolicies.length === 0 && (
              <div className="text-center py-12">
                <Shield className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No privacy policy sections yet</h3>
                <p className="text-muted-foreground mb-6">Add your first privacy policy section!</p>
                <button 
                  onClick={() => handleOpenPrivacyModal()}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 mx-auto"
                >
                  <Plus className="h-4 w-4" />
                  Add Privacy Policy Section
                </button>
              </div>
            )}
          </div>
        )}

        {/* Media Library Tab */}
        {activeTab === 'media' && (
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="aspect-square border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-muted/50 cursor-pointer transition-colors">
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Upload</span>
              </div>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="group relative aspect-square rounded-2xl border overflow-hidden bg-muted/30">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground/20" />
                  </div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button className="p-2 bg-white/20 backdrop-blur-md rounded-lg text-white hover:bg-white/30">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-2 bg-white/20 backdrop-blur-md rounded-lg text-white hover:bg-white/30">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MODAL - Create/Edit Blog Post */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl border shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-bold">
                  {editingPost ? 'Edit Blog Post' : 'Create New Blog Post'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Fill in all the required fields below
                </p>
              </div>
              <button 
                onClick={handleCloseModal}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Blog Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-card border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Enter blog title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Author Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-card border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Enter your name (e.g., John Doe)"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Short Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-card border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none min-h-[80px]"
                  placeholder="Enter short description"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Full Blog Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-card border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none min-h-[150px]"
                  placeholder="Write your full blog content here..."
                  rows={6}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Read Time (minutes)
                  </label>
                  <input
                    type="number"
                    name="readTime"
                    value={formData.readTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-card border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="5"
                    min="1"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium mb-2">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        featured: e.target.checked 
                      }))}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    Featured Post
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-card border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Enter tags separated by commas"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Featured Image URL
                </label>
                <input
                  type="text"
                  name="imageURL"
                  value={formData.imageURL}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-card border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="https://example.com/image.jpg"
                />
                
                {formData.imageURL && (
                  <div className="mt-3">
                    <p className="text-xs font-medium mb-2">Image Preview:</p>
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                      <img 
                        src={formData.imageURL} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2.5 border rounded-xl font-medium hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                >
                  {editingPost ? 'Update Post' : 'Create Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL - Create/Edit Testimonial */}
      {showTestimonialModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl border shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-bold">
                  {editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Fill in all the testimonial details below
                </p>
              </div>
              <button 
                onClick={handleCloseTestimonialModal}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleTestimonialSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={testimonialForm.name}
                  onChange={handleTestimonialInputChange}
                  className="w-full px-4 py-2.5 bg-card border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Enter customer name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Testimonial Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={testimonialForm.description}
                  onChange={handleTestimonialInputChange}
                  className="w-full px-4 py-2.5 bg-card border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px]"
                  placeholder="What did the customer say about your service?"
                  rows={4}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Rating <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleStarClick(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`h-8 w-8 ${
                            star <= testimonialForm.rating 
                              ? 'fill-yellow-400 text-yellow-400' 
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-lg font-bold ml-2">{testimonialForm.rating}/5</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Click on stars to select rating
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={testimonialForm.location}
                  onChange={handleTestimonialInputChange}
                  className="w-full px-4 py-2.5 bg-card border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g., Karachi, Pakistan"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Customer Image URL
                </label>
                <input
                  type="text"
                  name="imageURL"
                  value={testimonialForm.imageURL}
                  onChange={handleTestimonialInputChange}
                  className="w-full px-4 py-2.5 bg-card border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="https://example.com/profile.jpg"
                />
                
                {testimonialForm.imageURL && (
                  <div className="mt-3">
                    <p className="text-xs font-medium mb-2">Image Preview:</p>
                    <div className="flex items-center gap-4">
                      <div className="relative h-16 w-16 rounded-full overflow-hidden border">
                        <img 
                          src={testimonialForm.imageURL} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none'
                          }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        This image will appear next to the testimonial
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={testimonialForm.featured}
                    onChange={(e) => setTestimonialForm(prev => ({ 
                      ...prev, 
                      featured: e.target.checked 
                    }))}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  Featured Testimonial
                </label>
                <p className="text-xs text-muted-foreground">
                  Featured testimonials will be highlighted on your website
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={handleCloseTestimonialModal}
                  className="px-4 py-2.5 border rounded-xl font-medium hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                >
                  {editingTestimonial ? 'Update Testimonial' : 'Add Testimonial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL - Create/Edit FAQ */}
      {showFAQModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl border shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-bold">
                  {editingFAQ ? 'Edit FAQ' : 'Add New FAQ'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Fill in the question and answer below
                </p>
              </div>
              <button 
                onClick={handleCloseFAQModal}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleFAQSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Question <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="question"
                  value={faqForm.question}
                  onChange={handleFAQInputChange}
                  className="w-full px-4 py-2.5 bg-card border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Enter the frequently asked question"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={faqForm.category}
                  onChange={(e) => setFaqForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-card border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="General">General</option>
                  <option value="Services">Services</option>
                  <option value="Pricing">Pricing</option>
                  <option value="Booking">Booking</option>
                  <option value="Technical">Technical</option>
                  <option value="Support">Support</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Answer <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="answer"
                  value={faqForm.answer}
                  onChange={handleFAQInputChange}
                  className="w-full px-4 py-2.5 bg-card border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none min-h-[200px]"
                  placeholder="Enter the detailed answer..."
                  rows={8}
                  required
                />
                <p className="text-xs text-muted-foreground mt-2">
                  You can use multiple lines and paragraphs. The formatting will be preserved.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={handleCloseFAQModal}
                  className="px-4 py-2.5 border rounded-xl font-medium hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                >
                  {editingFAQ ? 'Update FAQ' : 'Add FAQ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL - Create/Edit Privacy Policy */}
    {/* MODAL - Create/Edit Privacy Policy */}
{showPrivacyModal && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-card rounded-2xl border shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between p-6 border-b">
        <div>
          <h2 className="text-xl font-bold">
            {editingPrivacy ? 'Edit Privacy Policy Section' : 'Add Privacy Policy Section'}
          </h2>
          <p className="text-sm text-muted-foreground">
            Fill in the privacy policy section details below
          </p>
        </div>
        <button 
          onClick={handleClosePrivacyModal}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handlePrivacySubmit} className="p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Section Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={privacyForm.title}
            onChange={handlePrivacyInputChange}
            className="w-full px-4 py-2.5 bg-card border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="e.g., Information Collection, Data Security, Your Rights"
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium">
              Content <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Formatting Help:</span>
              <button
                type="button"
                onClick={() => {
                  // Add heading format
                  const headingText = `Information Collection\nAt Silver Maid, we respect your privacy...\n\nData Security\nWe implement industry-standard security measures...\n\nUsage Disclosure\nWe use your information to:\n• Schedule and confirm your cleaning appointments\n• Process payments and issue invoices\n• Communicate service updates or changes\n• Enhance our customer support experience\n\nYour Rights\nYou have the right to request access to the personal data...`;
                  setPrivacyForm(prev => ({ ...prev, content: headingText }));
                }}
                className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
              >
                Insert Example
              </button>
            </div>
          </div>
          
          <textarea
            name="content"
            value={privacyForm.content}
            onChange={handlePrivacyInputChange}
            className="w-full px-4 py-2.5 bg-card border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none min-h-[300px] font-mono text-sm"
            placeholder={`Enter privacy policy content...

IMPORTANT: To create headings in your content, follow these rules:

1. HEADINGS: Put headings on separate lines without any special characters
   Example: Information Collection

2. TEXT AFTER HEADING: Put the content immediately after the heading on the next line
   Example: Information Collection
   At Silver Maid, we respect your privacy...

3. BULLET POINTS: Use • for bullet points
   Example: • Schedule and confirm your cleaning appointments
            • Process payments and issue invoices

4. SEPARATE SECTIONS: Leave one blank line between sections

Example structure:
Information Collection
At Silver Maid, we respect your privacy...

Data Security
We implement industry-standard security measures...

Usage Disclosure
We use your information to:
• Schedule and confirm your cleaning appointments
• Process payments and issue invoices
• Communicate service updates or changes
• Enhance our customer support experience

Your Rights
You have the right to request access...`}
            rows={12}
            required
          />
          
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              <span className="text-sm font-medium text-amber-800">How Headings Work:</span>
            </div>
            <div className="space-y-2 text-xs text-amber-700">
              <div className="flex items-start gap-2">
                <span className="font-bold">Heading Lines:</span>
                <span>Lines without punctuation at the end (no period, comma) will be treated as headings</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold">Normal Text:</span>
                <span>Lines with punctuation or content immediately after will be treated as paragraph text</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold">Bullet Points:</span>
                <span>Lines starting with • will be displayed as bullet points</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Preview */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Content Preview
          </label>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg max-h-60 overflow-y-auto">
            <div className="space-y-4">
              {privacyForm.content.split('\n\n').map((section, sectionIndex) => {
                const lines = section.split('\n');
                return (
                  <div key={sectionIndex} className="space-y-2">
                    {lines.map((line, lineIndex) => {
                      const trimmedLine = line.trim();
                      
                      // Check if line is a heading
                      // Heading: No punctuation at end, not empty, not bullet point, next line is not empty
                      const isHeading = trimmedLine && 
                        !trimmedLine.endsWith('.') && 
                        !trimmedLine.endsWith(',') && 
                        !trimmedLine.startsWith('•') &&
                        (lineIndex === 0 || lines[lineIndex - 1] === '');
                      
                      // Check if line is bullet point
                      const isBulletPoint = trimmedLine.startsWith('•');
                      
                      if (isHeading) {
                        return (
                          <div key={`${sectionIndex}-${lineIndex}`} className="flex items-center gap-2">
                            <div className="w-2 h-6 bg-blue-500 rounded"></div>
                            <h3 className="font-bold text-lg text-blue-700">
                              {trimmedLine}
                            </h3>
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Heading</span>
                          </div>
                        );
                      } else if (isBulletPoint) {
                        return (
                          <div key={`${sectionIndex}-${lineIndex}`} className="flex items-center gap-2 ml-4">
                            <span className="text-blue-500">•</span>
                            <span className="text-slate-700">{trimmedLine.substring(1).trim()}</span>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Bullet Point</span>
                          </div>
                        );
                      } else if (trimmedLine) {
                        return (
                          <div key={`${sectionIndex}-${lineIndex}`} className="ml-4">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-700">{trimmedLine}</span>
                              <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded">Paragraph</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                );
              })}
            </div>
            
            {!privacyForm.content && (
              <p className="text-slate-400 italic">Content preview will appear here...</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t">
          <button
            type="button"
            onClick={handleClosePrivacyModal}
            className="px-4 py-2.5 border rounded-xl font-medium hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
          >
            {editingPrivacy ? 'Update Section' : 'Add Section'}
          </button>
        </div>
      </form>
    </div>
  </div>
)}
    </div>
  )
}