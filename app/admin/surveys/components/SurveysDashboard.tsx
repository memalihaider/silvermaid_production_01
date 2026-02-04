// 'use client'

// import { useState, useEffect, useMemo } from 'react'
// import { Search, Eye, Edit2, Trash2, Copy, FileText, CheckCircle, Play, TrendingUp, Plus } from 'lucide-react'
// import { db } from '@/lib/firebase'
// import { 
//   collection, 
//   query, 
//   orderBy,
//   onSnapshot,
//   doc,
//   deleteDoc,
//   updateDoc,
//   serverTimestamp,
//   addDoc
// } from 'firebase/firestore'

// interface Survey {
//   id: string
//   title: string
//   description: string
//   sections: any[]
//   status: 'draft' | 'published' | 'active' | 'paused' | 'closed' | 'completed'
//   createdAt: any
//   updatedAt: any
//   responsesCount: number
//   sendCount?: number
//   completionRate?: number
//   priority?: 'Low' | 'Medium' | 'High' | 'Critical'
//   clientName?: string
//   company?: string
//   serviceType?: string
// }

// interface SurveyStats {
//   total: number
//   draft: number
//   published: number
//   active: number
//   completed: number
//   totalResponses: number
//   avgCompletionRate: number
// }

// interface Props {
//   surveys: Survey[]
//   searchTerm: string
//   setSearchTerm: (term: string) => void
//   statusFilter: string
//   setStatusFilter: (status: string) => void
//   priorityFilter: string
//   setPriorityFilter: (priority: string) => void
//   onDelete: (id: string) => void
//   onDuplicate: (survey: Survey) => void
//   onViewResponses: (id: string) => void
//   onEditSurvey: (id: string) => void
//   onStatusChange: (id: string, status: Survey['status']) => void
//   onCreateNewSurvey?: () => void
// }

// export default function SurveysDashboard({
//   surveys,
//   searchTerm,
//   setSearchTerm,
//   statusFilter,
//   setStatusFilter,
//   priorityFilter,
//   setPriorityFilter,
//   onDelete,
//   onDuplicate,
//   onViewResponses,
//   onEditSurvey,
//   onStatusChange,
//   onCreateNewSurvey
// }: Props) {
//   const [loading, setLoading] = useState(false)

//   // Calculate statistics
//   const stats: SurveyStats = useMemo(() => {
//     if (surveys.length === 0) {
//       return {
//         total: 0,
//         draft: 0,
//         published: 0,
//         active: 0,
//         completed: 0,
//         totalResponses: 0,
//         avgCompletionRate: 0
//       }
//     }

//     const totalResponses = surveys.reduce((acc, survey) => acc + (survey.responsesCount || 0), 0)
//     const totalCompletionRate = surveys.reduce((acc, survey) => acc + (survey.completionRate || 0), 0)
    
//     return {
//       total: surveys.length,
//       draft: surveys.filter(s => s.status === 'draft').length,
//       published: surveys.filter(s => s.status === 'published').length,
//       active: surveys.filter(s => s.status === 'active').length,
//       completed: surveys.filter(s => s.status === 'completed').length,
//       totalResponses,
//       avgCompletionRate: Math.round(totalCompletionRate / surveys.length)
//     }
//   }, [surveys])

//   // Filter surveys
//   const filteredSurveys = useMemo(() => {
//     return surveys.filter(survey => {
//       const matchesSearch = searchTerm === '' || 
//         survey.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         (survey.description && survey.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
//         (survey.clientName && survey.clientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
//         (survey.company && survey.company.toLowerCase().includes(searchTerm.toLowerCase()))
      
//       const matchesStatus = statusFilter === 'All' || survey.status === statusFilter
//       const matchesPriority = priorityFilter === 'All' || survey.priority === priorityFilter
      
//       return matchesSearch && matchesStatus && matchesPriority
//     })
//   }, [surveys, searchTerm, statusFilter, priorityFilter])

//   const STATUS_COLORS: Record<string, { badge: string }> = {
//     draft: { badge: 'bg-gray-100 text-gray-800 border border-gray-200' },
//     published: { badge: 'bg-blue-50 text-blue-700 border border-blue-100' },
//     active: { badge: 'bg-green-50 text-green-700 border border-green-100' },
//     paused: { badge: 'bg-yellow-50 text-yellow-700 border border-yellow-100' },
//     closed: { badge: 'bg-orange-50 text-orange-700 border border-orange-100' },
//     completed: { badge: 'bg-purple-50 text-purple-700 border border-purple-100' }
//   }

//   const PRIORITY_COLORS: Record<string, string> = {
//     'Low': 'bg-blue-50 text-blue-700 border border-blue-100',
//     'Medium': 'bg-yellow-50 text-yellow-700 border border-yellow-100',
//     'High': 'bg-orange-50 text-orange-700 border border-orange-100',
//     'Critical': 'bg-red-50 text-red-700 border border-red-100'
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header with Create Button */}
//       <div className="flex justify-between items-center">
//         <div>
//           <h2 className="text-lg font-bold text-black">Surveys Dashboard</h2>
//           <p className="text-gray-600 text-sm">Manage and analyze your surveys</p>
//         </div>
//         {onCreateNewSurvey && (
//           <button
//             onClick={onCreateNewSurvey}
//             className="flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded hover:bg-gray-800 transition-colors text-sm"
//           >
//             <Plus className="w-3.5 h-3.5" />
//             Create New Survey
//           </button>
//         )}
//       </div>

//       {/* Stats */}
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
//         {[
//           { label: 'Total Surveys', value: stats.total, icon: FileText, color: 'text-gray-900' },
//           { label: 'Published', value: stats.published, icon: CheckCircle, color: 'text-blue-600' },
//           { label: 'Active', value: stats.active, icon: Play, color: 'text-green-600' },
//           { label: 'Total Responses', value: stats.totalResponses, icon: TrendingUp, color: 'text-orange-600' },
//         ].map((stat, idx) => {
//           const Icon = stat.icon
//           return (
//             <div key={idx} className="bg-white rounded p-3 shadow-sm border border-gray-200">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-xs text-gray-500 mb-0.5">{stat.label}</p>
//                   <p className="text-lg font-bold text-black">{stat.value}</p>
//                 </div>
//                 <Icon className={`w-5 h-5 ${stat.color} opacity-30`} />
//               </div>
//             </div>
//           )
//         })}
//       </div>

//       {/* Filters */}
//       <div className="bg-white rounded border border-gray-300 p-3">
//         <div className="flex flex-col md:flex-row gap-3">
//           <div className="flex-1 relative">
//             <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
//             <input 
//               type="text" 
//               placeholder="Search surveys by title, description, client..." 
//               value={searchTerm} 
//               onChange={(e) => setSearchTerm(e.target.value)} 
//               className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black" 
//             />
//           </div>
          
//           <select 
//             value={statusFilter} 
//             onChange={(e) => setStatusFilter(e.target.value)} 
//             className="px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
//           >
//             <option value="All">All Status</option>
//             <option value="draft">Draft</option>
//             <option value="published">Published</option>
//             <option value="active">Active</option>
//             <option value="paused">Paused</option>
//             <option value="closed">Closed</option>
//             <option value="completed">Completed</option>
//           </select>
          
//           <select 
//             value={priorityFilter} 
//             onChange={(e) => setPriorityFilter(e.target.value)} 
//             className="px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
//           >
//             <option value="All">All Priority</option>
//             <option value="Low">Low</option>
//             <option value="Medium">Medium</option>
//             <option value="High">High</option>
//             <option value="Critical">Critical</option>
//           </select>
//         </div>
//       </div>

//       {/* Table */}
//       <div className="bg-white rounded border border-gray-300 overflow-hidden">
//         {filteredSurveys.length === 0 ? (
//           <div className="p-6 text-center">
//             <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2 opacity-50" />
//             <p className="text-sm text-gray-500">No surveys found</p>
//             {(searchTerm || statusFilter !== 'All' || priorityFilter !== 'All') ? (
//               <button
//                 onClick={() => {
//                   setSearchTerm('')
//                   setStatusFilter('All')
//                   setPriorityFilter('All')
//                 }}
//                 className="text-sm text-black hover:underline mt-2"
//               >
//                 Clear filters
//               </button>
//             ) : (
//               onCreateNewSurvey && (
//                 <button
//                   onClick={onCreateNewSurvey}
//                   className="text-sm text-black hover:underline mt-2"
//                 >
//                   Create your first survey
//                 </button>
//               )
//             )}
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full text-sm">
//               <thead className="bg-gray-50 border-b border-gray-300">
//                 <tr>
//                   <th className="px-4 py-2 text-left font-semibold text-black">Survey</th>
//                   <th className="px-4 py-2 text-left font-semibold text-black">Client</th>
//                   <th className="px-4 py-2 text-left font-semibold text-black">Status</th>
//                   <th className="px-4 py-2 text-left font-semibold text-black">Stats</th>
//                   <th className="px-4 py-2 text-left font-semibold text-black">Priority</th>
//                   <th className="px-4 py-2 text-left font-semibold text-black">Performance</th>
//                   <th className="px-4 py-2 text-left font-semibold text-black text-right">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200">
//                 {filteredSurveys.map((survey) => (
//                   <tr key={survey.id} className="hover:bg-gray-50 transition-colors">
//                     <td className="px-4 py-3">
//                       <div>
//                         <p className="font-medium text-black">{survey.title}</p>
//                         <p className="text-xs text-gray-500 truncate max-w-[200px]">
//                           {survey.description || 'No description'}
//                         </p>
//                         <p className="text-xs text-gray-400 mt-1">
//                           Created: {survey.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
//                         </p>
//                       </div>
//                     </td>
                    
//                     <td className="px-4 py-3">
//                       <div>
//                         <p className="font-medium text-black">{survey.clientName || 'General Client'}</p>
//                         <p className="text-xs text-gray-500">{survey.company || 'General Company'}</p>
//                         <p className="text-xs text-gray-400">{survey.serviceType || 'General Survey'}</p>
//                       </div>
//                     </td>
                    
//                     <td className="px-4 py-3">
//                       <select 
//                         value={survey.status}
//                         onChange={(e) => onStatusChange(survey.id, e.target.value as Survey['status'])}
//                         className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold border cursor-pointer transition-colors ${STATUS_COLORS[survey.status].badge} hover:opacity-90`}
//                       >
//                         <option value="draft">Draft</option>
//                         <option value="published">Published</option>
//                         <option value="active">Active</option>
//                         <option value="paused">Paused</option>
//                         <option value="closed">Closed</option>
//                         <option value="completed">Completed</option>
//                       </select>
//                     </td>
                    
//                     <td className="px-4 py-3">
//                       <div>
//                         <p className="font-medium text-black">
//                           {survey.responsesCount} / {survey.sendCount || 0}
//                         </p>
//                         <p className="text-[10px] text-gray-500 uppercase">Resp/Sent</p>
//                       </div>
//                     </td>
                    
//                     <td className="px-4 py-3">
//                       <span className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${PRIORITY_COLORS[survey.priority || 'Medium']}`}>
//                         {survey.priority || 'Medium'}
//                       </span>
//                     </td>
                    
//                     <td className="px-4 py-3 min-w-[120px]">
//                       <div className="flex items-center gap-2">
//                         <div className="flex-1 bg-gray-200 rounded-full h-1.5">
//                           <div 
//                             className="bg-black h-1.5 rounded-full transition-all duration-300" 
//                             style={{ width: `${survey.completionRate || 0}%` }}
//                           ></div>
//                         </div>
//                         <span className="text-xs text-gray-600 font-medium">{survey.completionRate || 0}%</span>
//                       </div>
//                     </td>
                    
//                     <td className="px-4 py-3 text-right">
//                       <div className="flex items-center justify-end gap-1">
//                         <button 
//                           onClick={() => onEditSurvey(survey.id)}
//                           title="Edit survey"
//                           className="p-1.5 hover:bg-gray-100 rounded text-gray-600 transition-colors border border-transparent hover:border-gray-300"
//                         >
//                           <Edit2 className="w-4 h-4" />
//                         </button>
//                         <button 
//                           onClick={() => onViewResponses(survey.id)}
//                           title="View responses"
//                           className="p-1.5 hover:bg-blue-50 rounded text-blue-600 transition-colors border border-transparent hover:border-blue-200"
//                         >
//                           <Eye className="w-4 h-4" />
//                         </button>
//                         <button 
//                           onClick={() => onDuplicate(survey)}
//                           title="Duplicate"
//                           className="p-1.5 hover:bg-gray-100 rounded text-gray-600 transition-colors border border-transparent hover:border-gray-300"
//                         >
//                           <Copy className="w-4 h-4" />
//                         </button>
//                         <button 
//                           onClick={() => onDelete(survey.id)}
//                           title="Delete"
//                           className="p-1.5 hover:bg-red-50 rounded text-red-600 transition-colors border border-transparent hover:border-red-200"
//                         >
//                           <Trash2 className="w-4 h-4" />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       {/* Summary */}
//       {filteredSurveys.length > 0 && (
//         <div className="bg-white rounded border border-gray-300 p-3">
//           <div className="flex items-center justify-between">
//             <p className="text-sm text-gray-600">
//               Showing {filteredSurveys.length} of {surveys.length} surveys
//             </p>
//             <div className="flex items-center gap-3">
//               <div className="flex items-center gap-1">
//                 <span className="text-xs text-gray-500">Draft:</span>
//                 <span className="text-xs font-medium">{stats.draft}</span>
//               </div>
//               <div className="flex items-center gap-1">
//                 <span className="text-xs text-gray-500">Published:</span>
//                 <span className="text-xs font-medium">{stats.published}</span>
//               </div>
//               <div className="flex items-center gap-1">
//                 <span className="text-xs text-gray-500">Active:</span>
//                 <span className="text-xs font-medium">{stats.active}</span>
//               </div>
//               <div className="flex items-center gap-1">
//                 <span className="text-xs text-gray-500">Avg. Completion:</span>
//                 <span className="text-xs font-medium">{stats.avgCompletionRate}%</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

// new codee
'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search, Eye, Edit2, Trash2, Copy, FileText, CheckCircle, Play, TrendingUp, Plus, Share } from 'lucide-react'
import { db } from '@/lib/firebase'
import { 
  collection, 
  query, 
  orderBy,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  addDoc
} from 'firebase/firestore'

interface Survey {
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
  clientName?: string
  company?: string
  serviceType?: string
}

interface SurveyStats {
  total: number
  draft: number
  published: number
  active: number
  completed: number
  totalResponses: number
  avgCompletionRate: number
}

interface Props {
  surveys: Survey[]
  searchTerm: string
  setSearchTerm: (term: string) => void
  statusFilter: string
  setStatusFilter: (status: string) => void
  priorityFilter: string
  setPriorityFilter: (priority: string) => void
  onDelete: (id: string) => void
  onDuplicate: (survey: Survey) => void
  onViewResponses: (id: string) => void
  onEditSurvey: (id: string) => void
  onShareSurvey: (id: string) => void
  onStatusChange: (id: string, status: Survey['status']) => void
  onCreateNewSurvey?: () => void
}

export default function SurveysDashboard({
  surveys,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  onDelete,
  onDuplicate,
  onViewResponses,
  onEditSurvey,
  onShareSurvey,
  onStatusChange,
  onCreateNewSurvey
}: Props) {
  const [loading, setLoading] = useState(false)

  // Calculate statistics
  const stats: SurveyStats = useMemo(() => {
    if (surveys.length === 0) {
      return {
        total: 0,
        draft: 0,
        published: 0,
        active: 0,
        completed: 0,
        totalResponses: 0,
        avgCompletionRate: 0
      }
    }

    const totalResponses = surveys.reduce((acc, survey) => acc + (survey.responsesCount || 0), 0)
    const totalCompletionRate = surveys.reduce((acc, survey) => acc + (survey.completionRate || 0), 0)
    
    return {
      total: surveys.length,
      draft: surveys.filter(s => s.status === 'draft').length,
      published: surveys.filter(s => s.status === 'published').length,
      active: surveys.filter(s => s.status === 'active').length,
      completed: surveys.filter(s => s.status === 'completed').length,
      totalResponses,
      avgCompletionRate: Math.round(totalCompletionRate / surveys.length)
    }
  }, [surveys])

  // Filter surveys
  const filteredSurveys = useMemo(() => {
    return surveys.filter(survey => {
      const matchesSearch = searchTerm === '' || 
        survey.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (survey.description && survey.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (survey.clientName && survey.clientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (survey.company && survey.company.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesStatus = statusFilter === 'All' || survey.status === statusFilter
      const matchesPriority = priorityFilter === 'All' || survey.priority === priorityFilter
      
      return matchesSearch && matchesStatus && matchesPriority
    })
  }, [surveys, searchTerm, statusFilter, priorityFilter])

  const STATUS_COLORS: Record<string, { badge: string }> = {
    draft: { badge: 'bg-gray-100 text-gray-800 border border-gray-200' },
    published: { badge: 'bg-blue-50 text-blue-700 border border-blue-100' },
    active: { badge: 'bg-green-50 text-green-700 border border-green-100' },
    paused: { badge: 'bg-yellow-50 text-yellow-700 border border-yellow-100' },
    closed: { badge: 'bg-orange-50 text-orange-700 border border-orange-100' },
    completed: { badge: 'bg-purple-50 text-purple-700 border border-purple-100' }
  }

  const PRIORITY_COLORS: Record<string, string> = {
    'Low': 'bg-blue-50 text-blue-700 border border-blue-100',
    'Medium': 'bg-yellow-50 text-yellow-700 border border-yellow-100',
    'High': 'bg-orange-50 text-orange-700 border border-orange-100',
    'Critical': 'bg-red-50 text-red-700 border border-red-100'
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-black">Surveys Dashboard</h2>
          <p className="text-gray-600 text-sm">Manage and analyze your surveys</p>
        </div>
        {onCreateNewSurvey && (
          <button
            onClick={onCreateNewSurvey}
            className="flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded hover:bg-gray-800 transition-colors text-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Create New Survey
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Surveys', value: stats.total, icon: FileText, color: 'text-gray-900' },
          { label: 'Published', value: stats.published, icon: CheckCircle, color: 'text-blue-600' },
          { label: 'Active', value: stats.total, icon: Play, color: 'text-green-600' },
          { label: 'Total Responses', value: stats.totalResponses, icon: TrendingUp, color: 'text-orange-600' },
        ].map((stat, idx) => {
          const Icon = stat.icon
          return (
            <div key={idx} className="bg-white rounded p-3 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">{stat.label}</p>
                  <p className="text-lg font-bold text-black">{stat.value}</p>
                </div>
                <Icon className={`w-5 h-5 ${stat.color} opacity-30`} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded border border-gray-300 p-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search surveys by title, description, client..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black" 
            />
          </div>
          
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)} 
            className="px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
          >
            <option value="All">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="closed">Closed</option>
            <option value="completed">Completed</option>
          </select>
          
          <select 
            value={priorityFilter} 
            onChange={(e) => setPriorityFilter(e.target.value)} 
            className="px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
          >
            <option value="All">All Priority</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded border border-gray-300 overflow-hidden">
        {filteredSurveys.length === 0 ? (
          <div className="p-6 text-center">
            <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2 opacity-50" />
            <p className="text-sm text-gray-500">No surveys found</p>
            {(searchTerm || statusFilter !== 'All' || priorityFilter !== 'All') ? (
              <button
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('All')
                  setPriorityFilter('All')
                }}
                className="text-sm text-black hover:underline mt-2"
              >
                Clear filters
              </button>
            ) : (
              onCreateNewSurvey && (
                <button
                  onClick={onCreateNewSurvey}
                  className="text-sm text-black hover:underline mt-2"
                >
                  Create your first survey
                </button>
              )
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-300">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-black">Survey</th>
                  <th className="px-4 py-2 text-left font-semibold text-black">Client</th>
                  <th className="px-4 py-2 text-left font-semibold text-black">Status</th>
                  <th className="px-4 py-2 text-left font-semibold text-black">Stats</th>
                  <th className="px-4 py-2 text-left font-semibold text-black">Priority</th>
                  <th className="px-4 py-2 text-left font-semibold text-black">Performance</th>
                  <th className="px-4 py-2 text-left font-semibold text-black text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSurveys.map((survey) => (
                  <tr key={survey.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-black">{survey.title}</p>
                        <p className="text-xs text-gray-500 truncate max-w-[200px]">
                          {survey.description || 'No description'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Created: {survey.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                        </p>
                      </div>
                    </td>
                    
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-black">{survey.clientName || 'General Client'}</p>
                        <p className="text-xs text-gray-500">{survey.company || 'General Company'}</p>
                        <p className="text-xs text-gray-400">{survey.serviceType || 'General Survey'}</p>
                      </div>
                    </td>
                    
                    <td className="px-4 py-3">
                      <select 
                        value={survey.status}
                        onChange={(e) => onStatusChange(survey.id, e.target.value as Survey['status'])}
                        className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold border cursor-pointer transition-colors ${STATUS_COLORS[survey.status].badge} hover:opacity-90`}
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="active">Active</option>
                        <option value="paused">Paused</option>
                        <option value="closed">Closed</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                    
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-black">
                          {survey.responsesCount} 
                        </p>
                        <p className="text-[10px] text-gray-500 uppercase">Resp</p>
                      </div>
                    </td>
                    
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${PRIORITY_COLORS[survey.priority || 'Medium']}`}>
                        {survey.priority || 'Medium'}
                      </span>
                    </td>
                    
                    <td className="px-4 py-3 min-w-[120px]">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-black h-1.5 rounded-full transition-all duration-300" 
                            style={{ width: `${survey.completionRate || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600 font-medium">{survey.completionRate || 0}%</span>
                      </div>
                    </td>
                    
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => onShareSurvey(survey.id)}
                          title="Share survey"
                          className="p-1.5 hover:bg-green-50 rounded text-green-600 transition-colors border border-transparent hover:border-green-200"
                        >
                          <Share className="w-4 h-4" />
                        </button>
                       
                        
                        <button 
                          onClick={() => onDuplicate(survey)}
                          title="Duplicate"
                          className="p-1.5 hover:bg-gray-100 rounded text-gray-600 transition-colors border border-transparent hover:border-gray-300"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => onDelete(survey.id)}
                          title="Delete"
                          className="p-1.5 hover:bg-red-50 rounded text-red-600 transition-colors border border-transparent hover:border-red-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary */}
      {filteredSurveys.length > 0 && (
        <div className="bg-white rounded border border-gray-300 p-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {filteredSurveys.length} of {surveys.length} surveys
            </p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500">Draft:</span>
                <span className="text-xs font-medium">{stats.draft}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500">Published:</span>
                <span className="text-xs font-medium">{stats.published}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500">Active:</span>
                <span className="text-xs font-medium">{stats.active}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500">Avg. Completion:</span>
                <span className="text-xs font-medium">{stats.avgCompletionRate}%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}