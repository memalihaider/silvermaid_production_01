'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, FileText, Settings, TrendingUp, Share } from 'lucide-react'
import SurveysDashboard from './components/SurveysDashboard'
import SurveyFormSection from './components/SurveyFormSection'
import SurveyTemplatesSection from './components/SurveyTemplatesSection'
import SurveyResultsSection from './components/SurveyResultsSection'
import { db } from '@/lib/firebase'
import { collection, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc, serverTimestamp, addDoc } from 'firebase/firestore'

// Firebase se real survey interface - UPDATED with selectedClient
interface FirebaseSurvey {
  id: string
  title: string
  description: string
  sections: any[]
  status: 'draft' | 'published' | 'active' | 'paused' | 'closed' | 'completed'
  createdAt: any
  updatedAt: any
  responsesCount: number
  sendCount?: number
  completionRate?: number
  priority?: 'Low' | 'Medium' | 'High' | 'Critical'
  selectedClient?: {
    id: string
    name: string
    company: string
    type: 'client' | 'lead'
  }
  clientName?: string
  company?: string
  serviceType?: string
}

export default function SurveysModule() {
  const router = useRouter()
  const [surveys, setSurveys] = useState<FirebaseSurvey[]>([])
  const [activeTab, setActiveTab] = useState<'dashboard' | 'create' | 'templates' | 'results'>('dashboard')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [priorityFilter, setPriorityFilter] = useState<string>('All')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [surveyToDelete, setSurveyToDelete] = useState<string | null>(null)
  const [selectedDetailSurvey, setSelectedDetailSurvey] = useState<FirebaseSurvey | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch real surveys from Firebase
  useEffect(() => {
    setLoading(true)
    const surveysRef = collection(db, 'surveys')
    const q = query(surveysRef, orderBy('createdAt', 'desc'))
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const surveysList: FirebaseSurvey[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        
        console.log('🔥 Raw Firebase data for survey:', doc.id, {
          title: data.title,
          selectedClient: data.selectedClient,
          hasSelectedClient: !!data.selectedClient
        })
        
        const survey: FirebaseSurvey = {
          id: doc.id,
          title: data.title || 'Untitled Survey',
          description: data.description || '',
          sections: data.sections || [],
          status: data.status || 'draft',
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          responsesCount: data.responsesCount || 0,
          sendCount: data.sendCount || 0,
          completionRate: data.responsesCount && data.sendCount 
            ? Math.round((data.responsesCount / data.sendCount) * 100)
            : 0,
          priority: data.priority || 'Medium',
          selectedClient: data.selectedClient || undefined,
          clientName: data.clientName || 'General Client',
          company: data.company || 'General Company',
          serviceType: data.serviceType || 'General Survey'
        }
        surveysList.push(survey)
      })
      
      console.log('📊 Processed surveys list:', surveysList.map(s => ({
        id: s.id,
        title: s.title,
        hasSelectedClient: !!s.selectedClient,
        selectedClientName: s.selectedClient?.name,
        selectedClientCompany: s.selectedClient?.company
      })))
      
      setSurveys(surveysList)
      setLoading(false)
    })
    
    return () => unsubscribe()
  }, [])

  // Edit Survey - Navigate to edit page with ID
  const handleEditSurvey = (surveyId: string) => {
    console.log('✏️ Editing survey:', surveyId)
    router.push(`/admin/surveys/${surveyId}`)
  }

  // Create New Survey - Navigate to new survey page
  const handleCreateNewSurvey = () => {
    console.log('🆕 Creating new survey')
    router.push('/admin/surveys/new')
  }

  // Delete survey from Firebase
  const handleDeleteSurvey = (id: string) => {
    setSurveyToDelete(id)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (surveyToDelete) {
      try {
        await deleteDoc(doc(db, 'surveys', surveyToDelete))
        alert('Survey deleted successfully!')
      } catch (error) {
        console.error('Error deleting survey:', error)
        alert('Error deleting survey. Please try again.')
      }
      setShowDeleteModal(false)
      setSurveyToDelete(null)
    }
  }

  // Change survey status in Firebase
  const handleStatusChange = async (id: string, newStatus: FirebaseSurvey['status']) => {
    try {
      const surveyDoc = doc(db, 'surveys', id)
      await updateDoc(surveyDoc, {
        status: newStatus,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error updating survey status:', error)
      alert('Error updating survey status. Please try again.')
    }
  }

  // Duplicate survey in Firebase - UPDATED to include selectedClient
  const handleDuplicateSurvey = async (survey: FirebaseSurvey) => {
    try {
      const newSurveyData: any = {
        title: `${survey.title} (Copy)`,
        description: survey.description,
        sections: survey.sections,
        status: 'draft',
        priority: survey.priority || 'Medium',
        responsesCount: 0,
        sendCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      
      if (survey.selectedClient) {
        newSurveyData.selectedClient = survey.selectedClient
      }
      
      newSurveyData.clientName = survey.clientName
      newSurveyData.company = survey.company
      newSurveyData.serviceType = survey.serviceType
      
      await addDoc(collection(db, 'surveys'), newSurveyData)
      alert('Survey duplicated successfully!')
    } catch (error) {
      console.error('Error duplicating survey:', error)
      alert('Error duplicating survey. Please try again.')
    }
  }

  // View responses
  const handleViewResponses = (surveyId: string) => {
    const survey = surveys.find(s => s.id === surveyId)
    if (survey) {
      setSelectedDetailSurvey(survey)
      setActiveTab('results')
    }
  }

  // Share survey
  const handleShareSurvey = (surveyId: string) => {
    const link = `${window.location.origin}/survey/${surveyId}`
    navigator.clipboard.writeText(link)
    alert('Survey link copied to clipboard!\n\nShare this link with respondents: ' + link)
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: FileText },
    { id: 'create', label: 'Create Survey', icon: Plus },
    { id: 'templates', label: 'Templates', icon: Settings },
    { id: 'results', label: 'Results & Analytics', icon: TrendingUp }
  ] as const

  return (
    <div className="w-full bg-white min-h-screen p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black mb-1">Survey Management</h1>
        <p className="text-sm text-gray-600">Create and analyze client surveys with dynamic form generation</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded border border-gray-300 p-1 mb-6 flex gap-1 overflow-x-auto shadow-none">
        {tabs.map((tab) => {
          const TabIcon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id)
                if (tab.id === 'create') {
                  handleCreateNewSurvey()
                }
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded transition-colors whitespace-nowrap text-[12px] uppercase font-bold tracking-tight ${
                activeTab === tab.id
                  ? 'bg-black text-white'
                  : 'text-gray-500 hover:bg-gray-100 border border-transparent'
              }`}
            >
              <TabIcon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg border border-gray-100 p-1">
        {activeTab === 'dashboard' && (
          <SurveysDashboard
            surveys={surveys}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
            onDelete={handleDeleteSurvey}
            onDuplicate={handleDuplicateSurvey}
            onViewResponses={handleViewResponses}
            onEditSurvey={handleEditSurvey}
            onShareSurvey={handleShareSurvey}
            onStatusChange={handleStatusChange}
            onCreateNewSurvey={handleCreateNewSurvey}
          />
        )}

        {activeTab === 'create' && (
          <SurveyFormSection />
        )}

        {activeTab === 'templates' && (
          <SurveyTemplatesSection onUseTemplate={(id) => {
            handleCreateNewSurvey()
          }} />
        )}

        {activeTab === 'results' && (
          <SurveyResultsSection surveys={surveys} />
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-5 max-w-sm w-full shadow-xl border border-gray-200">
            <h3 className="text-lg font-bold text-black mb-1">Delete Survey?</h3>
            <p className="text-sm text-gray-600 mb-6">This action cannot be undone. All data associated with this survey will be permanently removed.</p>
            <div className="flex gap-2 justify-end">
              <button 
                onClick={() => setShowDeleteModal(false)} 
                className="px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete} 
                className="px-3 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
              >
                Delete Survey
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}