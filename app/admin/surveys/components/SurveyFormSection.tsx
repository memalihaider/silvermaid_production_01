// 'use client'

// import { useState, useEffect } from 'react'
// import { Plus, Trash2, Save, Eye, Copy, Download, X, ChevronDown, ChevronUp, Hash, Calendar, Star, ThumbsUp, CheckSquare, Radio, Type, MessageSquare } from 'lucide-react'
// import { db } from '@/lib/firebase'
// import { 
//   collection, 
//   addDoc, 
//   query, 
//   orderBy,
//   onSnapshot,
//   doc,
//   deleteDoc,
//   updateDoc,
//   serverTimestamp
// } from 'firebase/firestore'

// interface Question {
//   id: string
//   text: string
//   type: 'text' | 'textarea' | 'multiple-choice' | 'checkbox' | 'rating' | 'scale' | 'NPS' | 'date' | 'number' | 'email' | 'dropdown'
//   required: boolean
//   options?: string[]
//   placeholder?: string
//   min?: number
//   max?: number
//   step?: number
//   scaleLabels?: { min: string; max: string }
// }

// interface FormSection {
//   id: string
//   title: string
//   description?: string
//   questions: Question[]
// }

// interface Survey {
//   id: string
//   title: string
//   description: string
//   sections: FormSection[]
//   status: 'draft' | 'published' | 'archived'
//   createdAt: any
//   updatedAt: any
//   responsesCount: number
// }

// export default function SurveyFormSection() {
//   const [surveys, setSurveys] = useState<Survey[]>([])
//   const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null)
//   const [sections, setSections] = useState<FormSection[]>([
//     {
//       id: 'section-1',
//       title: 'Basic Information',
//       description: 'Please provide your feedback',
//       questions: []
//     }
//   ])
//   const [title, setTitle] = useState('New Survey')
//   const [description, setDescription] = useState('')
//   const [loading, setLoading] = useState(false)
//   const [showSavedSurveys, setShowSavedSurveys] = useState(false)
  
//   // New state for question modal
//   const [showQuestionModal, setShowQuestionModal] = useState(false)
//   const [currentSectionId, setCurrentSectionId] = useState<string>('')
//   const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
//     text: '',
//     type: 'text',
//     required: false,
//     placeholder: ''
//   })
//   const [optionInput, setOptionInput] = useState('')
//   const [optionsList, setOptionsList] = useState<string[]>([])

//   // Fetch surveys from Firebase
//   useEffect(() => {
//     const surveysRef = collection(db, 'surveys')
//     const q = query(surveysRef, orderBy('createdAt', 'desc'))
    
//     const unsubscribe = onSnapshot(q, (snapshot) => {
//       const surveysList: Survey[] = []
//       snapshot.forEach((doc) => {
//         const data = doc.data()
//         surveysList.push({
//           id: doc.id,
//           title: data.title || '',
//           description: data.description || '',
//           sections: data.sections || [],
//           status: data.status || 'draft',
//           createdAt: data.createdAt,
//           updatedAt: data.updatedAt,
//           responsesCount: data.responsesCount || 0
//         })
//       })
//       setSurveys(surveysList)
//     })
    
//     return () => unsubscribe()
//   }, [])

//   // Load selected survey data
//   useEffect(() => {
//     if (selectedSurvey) {
//       setTitle(selectedSurvey.title)
//       setDescription(selectedSurvey.description)
//       setSections(selectedSurvey.sections)
//     }
//   }, [selectedSurvey])

//   const addSection = () => {
//     const newSection: FormSection = {
//       id: `section-${Date.now()}`,
//       title: 'New Section',
//       description: '',
//       questions: []
//     }
//     setSections([...sections, newSection])
//   }

//   // Open modal to add question
//   const openQuestionModal = (sectionId: string) => {
//     setCurrentSectionId(sectionId)
//     setNewQuestion({
//       id: `question-${Date.now()}`,
//       text: '',
//       type: 'text',
//       required: false,
//       placeholder: ''
//     })
//     setOptionsList([])
//     setOptionInput('')
//     setShowQuestionModal(true)
//   }

//   // Close modal and reset
//   const closeQuestionModal = () => {
//     setShowQuestionModal(false)
//     setNewQuestion({
//       text: '',
//       type: 'text',
//       required: false,
//       placeholder: ''
//     })
//     setOptionsList([])
//     setOptionInput('')
//   }

//   // Handle question type change
//   const handleQuestionTypeChange = (type: Question['type']) => {
//     const updatedQuestion = { ...newQuestion, type }
    
//     // Set default placeholders based on type
//     updatedQuestion.placeholder = getDefaultPlaceholder(type)
    
//     // Set default options for certain types
//     if (type === 'multiple-choice' || type === 'checkbox' || type === 'dropdown') {
//       updatedQuestion.options = ['Option 1', 'Option 2']
//       setOptionsList(['Option 1', 'Option 2'])
//     } else {
//       updatedQuestion.options = []
//       setOptionsList([])
//     }
    
//     // Set default values for scale types
//     if (type === 'scale') {
//       updatedQuestion.scaleLabels = { min: 'Very Poor', max: 'Excellent' }
//       updatedQuestion.min = 1
//       updatedQuestion.max = 5
//       updatedQuestion.step = 1
//     }
    
//     if (type === 'NPS') {
//       updatedQuestion.scaleLabels = { min: 'Not at all likely', max: 'Extremely likely' }
//       updatedQuestion.min = 0
//       updatedQuestion.max = 10
//       updatedQuestion.step = 1
//     }
    
//     if (type === 'rating') {
//       updatedQuestion.max = 5
//     }
    
//     setNewQuestion(updatedQuestion)
//   }

//   // Get default placeholder based on question type
//   const getDefaultPlaceholder = (type: Question['type']): string => {
//     switch(type) {
//       case 'text': return 'Enter your answer here...'
//       case 'textarea': return 'Please provide detailed feedback...'
//       case 'number': return 'Enter a number...'
//       case 'email': return 'example@email.com'
//       case 'date': return 'Select a date...'
//       default: return ''
//     }
//   }

//   // Add option to list
//   const addOption = () => {
//     if (optionInput.trim()) {
//       const newOptions = [...optionsList, optionInput.trim()]
//       setOptionsList(newOptions)
//       setNewQuestion({...newQuestion, options: newOptions})
//       setOptionInput('')
//     }
//   }

//   // Remove option from list
//   const removeOption = (index: number) => {
//     const newOptions = [...optionsList]
//     newOptions.splice(index, 1)
//     setOptionsList(newOptions)
//     setNewQuestion({...newQuestion, options: newOptions})
//   }

//   // Move option up
//   const moveOptionUp = (index: number) => {
//     if (index > 0) {
//       const newOptions = [...optionsList]
//       const temp = newOptions[index]
//       newOptions[index] = newOptions[index - 1]
//       newOptions[index - 1] = temp
//       setOptionsList(newOptions)
//       setNewQuestion({...newQuestion, options: newOptions})
//     }
//   }

//   // Move option down
//   const moveOptionDown = (index: number) => {
//     if (index < optionsList.length - 1) {
//       const newOptions = [...optionsList]
//       const temp = newOptions[index]
//       newOptions[index] = newOptions[index + 1]
//       newOptions[index + 1] = temp
//       setOptionsList(newOptions)
//       setNewQuestion({...newQuestion, options: newOptions})
//     }
//   }

//   // Save question from modal
//   const saveQuestionFromModal = () => {
//     if (!newQuestion.text?.trim()) {
//       alert('Please enter question text')
//       return
//     }

//     const questionToAdd: Question = {
//       id: `question-${Date.now()}`,
//       text: newQuestion.text.trim(),
//       type: newQuestion.type!,
//       required: newQuestion.required || false,
//       placeholder: newQuestion.placeholder || '',
//       options: newQuestion.options || [],
//       min: newQuestion.min,
//       max: newQuestion.max,
//       step: newQuestion.step,
//       scaleLabels: newQuestion.scaleLabels
//     }

//     // Add question to the section
//     setSections(sections.map(section => {
//       if (section.id === currentSectionId) {
//         return {
//           ...section,
//           questions: [...section.questions, questionToAdd]
//         }
//       }
//       return section
//     }))

//     // Close modal and reset
//     closeQuestionModal()
//   }

//   const removeQuestion = (sectionId: string, questionId: string) => {
//     setSections(sections.map(section => {
//       if (section.id === sectionId) {
//         return {
//           ...section,
//           questions: section.questions.filter(q => q.id !== questionId)
//         }
//       }
//       return section
//     }))
//   }

//   const removeSection = (sectionId: string) => {
//     if (sections.length > 1) {
//       setSections(sections.filter(s => s.id !== sectionId))
//     } else {
//       alert('At least one section must remain')
//     }
//   }

//   const updateSection = (sectionId: string, updates: Partial<FormSection>) => {
//     setSections(sections.map(section =>
//       section.id === sectionId ? { ...section, ...updates } : section
//     ))
//   }

//   const updateQuestion = (sectionId: string, questionId: string, updates: Partial<Question>) => {
//     setSections(sections.map(section => {
//       if (section.id === sectionId) {
//         return {
//           ...section,
//           questions: section.questions.map(q =>
//             q.id === questionId ? { ...q, ...updates } : q
//           )
//         }
//       }
//       return section
//     }))
//   }

//   // Helper function to clean data before saving to Firebase
//   const cleanSurveyData = (data: any) => {
//     const cleanedSections = data.sections.map((section: FormSection) => ({
//       ...section,
//       questions: section.questions.map((question: Question) => ({
//         ...question,
//         options: question.options || [],
//         placeholder: question.placeholder || '',
//         min: question.min ?? null,
//         max: question.max ?? null,
//         step: question.step ?? null,
//         scaleLabels: question.scaleLabels || null
//       }))
//     }))
    
//     return {
//       ...data,
//       sections: cleanedSections,
//       description: data.description || ''
//     }
//   }

//   // Save survey to Firebase
//   const saveSurvey = async (status: 'draft' | 'published' = 'draft') => {
//     if (!title.trim()) {
//       alert('Please enter a survey title')
//       return
//     }

//     setLoading(true)
//     try {
//       const surveyData = cleanSurveyData({
//         title: title.trim(),
//         description: description.trim(),
//         sections: sections,
//         status: status,
//         updatedAt: serverTimestamp(),
//         responsesCount: 0
//       })

//       console.log('Saving survey data:', surveyData)

//       if (selectedSurvey && selectedSurvey.id) {
//         // Update existing survey
//         const surveyDoc = doc(db, 'surveys', selectedSurvey.id)
//         await updateDoc(surveyDoc, surveyData)
//         alert('Survey updated successfully!')
//       } else {
//         // Create new survey
//         await addDoc(collection(db, 'surveys'), {
//           ...surveyData,
//           createdAt: serverTimestamp()
//         })
//         alert(`Survey ${status === 'published' ? 'published' : 'saved as draft'} successfully!`)
//       }

//       // Reset form
//       setSelectedSurvey(null)
//       setTitle('New Survey')
//       setDescription('')
//       setSections([{
//         id: 'section-1',
//         title: 'Basic Information',
//         description: 'Please provide your feedback',
//         questions: []
//       }])
//     } catch (error) {
//       console.error('Error saving survey:', error)
//       alert('Error saving survey. Please try again.')
//     } finally {
//       setLoading(false)
//     }
//   }

//   // Load survey from saved list
//   const loadSurvey = (survey: Survey) => {
//     setSelectedSurvey(survey)
//     setShowSavedSurveys(false)
//   }

//   // Delete survey
//   const deleteSurvey = async (surveyId: string) => {
//     if (!confirm('Are you sure you want to delete this survey?')) return
    
//     try {
//       await deleteDoc(doc(db, 'surveys', surveyId))
//       if (selectedSurvey?.id === surveyId) {
//         setSelectedSurvey(null)
//       }
//       alert('Survey deleted successfully!')
//     } catch (error) {
//       console.error('Error deleting survey:', error)
//       alert('Error deleting survey. Please try again.')
//     }
//   }

//   // Duplicate survey
//   const duplicateSurvey = async (survey: Survey) => {
//     try {
//       const newSurveyData = cleanSurveyData({
//         title: `${survey.title} (Copy)`,
//         description: survey.description,
//         sections: survey.sections,
//         status: 'draft',
//         createdAt: serverTimestamp(),
//         updatedAt: serverTimestamp(),
//         responsesCount: 0
//       })
      
//       await addDoc(collection(db, 'surveys'), newSurveyData)
//       alert('Survey duplicated successfully!')
//     } catch (error) {
//       console.error('Error duplicating survey:', error)
//       alert('Error duplicating survey. Please try again.')
//     }
//   }

//   // Export survey as JSON
//   const exportSurvey = (survey: Survey) => {
//     const surveyData = {
//       title: survey.title,
//       description: survey.description,
//       sections: survey.sections,
//       createdAt: survey.createdAt?.toDate?.()?.toISOString() || survey.createdAt,
//       status: survey.status,
//       responsesCount: survey.responsesCount
//     }
    
//     const dataStr = JSON.stringify(surveyData, null, 2)
//     const dataBlob = new Blob([dataStr], { type: 'application/json' })
//     const url = URL.createObjectURL(dataBlob)
//     const link = document.createElement('a')
//     link.href = url
//     link.download = `${survey.title.replace(/\s+/g, '_')}_survey.json`
//     link.click()
//   }

//   // Render appropriate input based on question type in modal
//   const renderQuestionInput = () => {
//     switch(newQuestion.type) {
//       case 'text':
//       case 'email':
//         return (
//           <div className="space-y-2">
//             <label className="block text-xs font-medium text-gray-700">Placeholder Text</label>
//             <input
//               type="text"
//               value={newQuestion.placeholder || ''}
//               onChange={(e) => setNewQuestion({...newQuestion, placeholder: e.target.value})}
//               className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
//               placeholder="Enter placeholder text..."
//             />
//           </div>
//         )
      
//       case 'textarea':
//         return (
//           <div className="space-y-2">
//             <label className="block text-xs font-medium text-gray-700">Placeholder Text</label>
//             <textarea
//               value={newQuestion.placeholder || ''}
//               onChange={(e) => setNewQuestion({...newQuestion, placeholder: e.target.value})}
//               className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
//               placeholder="Enter placeholder text..."
//               rows={3}
//             />
//           </div>
//         )
      
//       case 'number':
//         return (
//           <div className="space-y-3">
//             <div className="grid grid-cols-3 gap-2">
//               <div>
//                 <label className="block text-xs font-medium text-gray-700">Min Value</label>
//                 <input
//                   type="number"
//                   value={newQuestion.min || ''}
//                   onChange={(e) => setNewQuestion({...newQuestion, min: e.target.value ? parseFloat(e.target.value) : undefined})}
//                   className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
//                   placeholder="Min"
//                 />
//               </div>
//               <div>
//                 <label className="block text-xs font-medium text-gray-700">Max Value</label>
//                 <input
//                   type="number"
//                   value={newQuestion.max || ''}
//                   onChange={(e) => setNewQuestion({...newQuestion, max: e.target.value ? parseFloat(e.target.value) : undefined})}
//                   className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
//                   placeholder="Max"
//                 />
//               </div>
//               <div>
//                 <label className="block text-xs font-medium text-gray-700">Step</label>
//                 <input
//                   type="number"
//                   value={newQuestion.step || 1}
//                   onChange={(e) => setNewQuestion({...newQuestion, step: e.target.value ? parseFloat(e.target.value) : 1})}
//                   className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
//                   placeholder="Step"
//                   min="0.1"
//                   step="0.1"
//                 />
//               </div>
//             </div>
//           </div>
//         )
      
//       case 'multiple-choice':
//       case 'checkbox':
//       case 'dropdown':
//         return (
//           <div className="space-y-3">
//             <label className="block text-xs font-medium text-gray-700">Options</label>
//             <div className="space-y-2">
//               {optionsList.map((option, index) => (
//                 <div key={index} className="flex items-center gap-2 p-2 border border-gray-200 rounded">
//                   <div className="flex-1">
//                     <input
//                       type="text"
//                       value={option}
//                       onChange={(e) => {
//                         const newOptions = [...optionsList]
//                         newOptions[index] = e.target.value
//                         setOptionsList(newOptions)
//                         setNewQuestion({...newQuestion, options: newOptions})
//                       }}
//                       className="w-full px-2 py-1 border-0 border-b border-gray-300 focus:outline-none focus:border-black text-sm"
//                     />
//                   </div>
//                   <div className="flex items-center gap-1">
//                     <button
//                       type="button"
//                       onClick={() => moveOptionUp(index)}
//                       disabled={index === 0}
//                       className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
//                     >
//                       <ChevronUp className="w-4 h-4" />
//                     </button>
//                     <button
//                       type="button"
//                       onClick={() => moveOptionDown(index)}
//                       disabled={index === optionsList.length - 1}
//                       className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
//                     >
//                       <ChevronDown className="w-4 h-4" />
//                     </button>
//                     <button
//                       type="button"
//                       onClick={() => removeOption(index)}
//                       className="p-1 hover:bg-red-50 text-red-500 rounded"
//                     >
//                       <Trash2 className="w-4 h-4" />
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//             <div className="flex gap-2">
//               <input
//                 type="text"
//                 value={optionInput}
//                 onChange={(e) => setOptionInput(e.target.value)}
//                 onKeyPress={(e) => e.key === 'Enter' && addOption()}
//                 className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
//                 placeholder="Add new option..."
//               />
//               <button
//                 type="button"
//                 onClick={addOption}
//                 className="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm font-medium"
//               >
//                 Add
//               </button>
//             </div>
//           </div>
//         )
      
//       case 'rating':
//         return (
//           <div className="space-y-2">
//             <label className="block text-xs font-medium text-gray-700">Number of Stars (1-10)</label>
//             <input
//               type="number"
//               min="1"
//               max="10"
//               value={newQuestion.max || 5}
//               onChange={(e) => setNewQuestion({...newQuestion, max: parseInt(e.target.value)})}
//               className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
//             />
//           </div>
//         )
      
//       case 'scale':
//         return (
//           <div className="space-y-3">
//             <div className="grid grid-cols-2 gap-3">
//               <div>
//                 <label className="block text-xs font-medium text-gray-700">Min Label</label>
//                 <input
//                   type="text"
//                   value={newQuestion.scaleLabels?.min || ''}
//                   onChange={(e) => setNewQuestion({
//                     ...newQuestion,
//                     scaleLabels: {
//                       min: e.target.value,
//                       max: newQuestion.scaleLabels?.max || ''
//                     }
//                   })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
//                   placeholder="e.g., Very Poor"
//                 />
//               </div>
//               <div>
//                 <label className="block text-xs font-medium text-gray-700">Max Label</label>
//                 <input
//                   type="text"
//                   value={newQuestion.scaleLabels?.max || ''}
//                   onChange={(e) => setNewQuestion({
//                     ...newQuestion,
//                     scaleLabels: {
//                       min: newQuestion.scaleLabels?.min || '',
//                       max: e.target.value
//                     }
//                   })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
//                   placeholder="e.g., Excellent"
//                 />
//               </div>
//             </div>
//             <div className="grid grid-cols-3 gap-2">
//               <div>
//                 <label className="block text-xs font-medium text-gray-700">Min Value</label>
//                 <input
//                   type="number"
//                   value={newQuestion.min || 1}
//                   onChange={(e) => setNewQuestion({...newQuestion, min: parseInt(e.target.value)})}
//                   className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
//                 />
//               </div>
//               <div>
//                 <label className="block text-xs font-medium text-gray-700">Max Value</label>
//                 <input
//                   type="number"
//                   value={newQuestion.max || 5}
//                   onChange={(e) => setNewQuestion({...newQuestion, max: parseInt(e.target.value)})}
//                   className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
//                 />
//               </div>
//               <div>
//                 <label className="block text-xs font-medium text-gray-700">Step</label>
//                 <input
//                   type="number"
//                   value={newQuestion.step || 1}
//                   onChange={(e) => setNewQuestion({...newQuestion, step: parseInt(e.target.value)})}
//                   className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
//                 />
//               </div>
//             </div>
//           </div>
//         )
      
//       case 'NPS':
//         return (
//           <div className="space-y-2">
//             <p className="text-sm text-gray-600">Net Promoter Score (0-10 scale)</p>
//             <div className="grid grid-cols-2 gap-3">
//               <div>
//                 <label className="block text-xs font-medium text-gray-700">Min Label (0)</label>
//                 <input
//                   type="text"
//                   value={newQuestion.scaleLabels?.min || 'Not at all likely'}
//                   onChange={(e) => setNewQuestion({
//                     ...newQuestion,
//                     scaleLabels: {
//                       min: e.target.value,
//                       max: newQuestion.scaleLabels?.max || ''
//                     }
//                   })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
//                 />
//               </div>
//               <div>
//                 <label className="block text-xs font-medium text-gray-700">Max Label (10)</label>
//                 <input
//                   type="text"
//                   value={newQuestion.scaleLabels?.max || 'Extremely likely'}
//                   onChange={(e) => setNewQuestion({
//                     ...newQuestion,
//                     scaleLabels: {
//                       min: newQuestion.scaleLabels?.min || '',
//                       max: e.target.value
//                     }
//                   })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
//                 />
//               </div>
//             </div>
//           </div>
//         )
      
//       case 'date':
//         return (
//           <div className="space-y-2">
//             <p className="text-sm text-gray-600">Date picker will be shown to users</p>
//           </div>
//         )
      
//       default:
//         return null
//     }
//   }

//   // Question type icons
//   const getQuestionTypeIcon = (type: Question['type']) => {
//     switch(type) {
//       case 'text': return <Type className="w-4 h-4" />
//       case 'textarea': return <MessageSquare className="w-4 h-4" />
//       case 'multiple-choice': return <Radio className="w-4 h-4" />
//       case 'checkbox': return <CheckSquare className="w-4 h-4" />
//       case 'rating': return <Star className="w-4 h-4" />
//       case 'scale': return <Hash className="w-4 h-4" />
//       case 'NPS': return <ThumbsUp className="w-4 h-4" />
//       case 'date': return <Calendar className="w-4 h-4" />
//       case 'number': return <Hash className="w-4 h-4" />
//       case 'email': return <Type className="w-4 h-4" />
//       case 'dropdown': return <ChevronDown className="w-4 h-4" />
//       default: return <Type className="w-4 h-4" />
//     }
//   }

//   // Question type options for dropdown
//   const questionTypeOptions = [
//     { value: 'text', label: 'Short Text', icon: <Type className="w-4 h-4" /> },
//     { value: 'textarea', label: 'Long Text', icon: <MessageSquare className="w-4 h-4" /> },
//     { value: 'number', label: 'Number', icon: <Hash className="w-4 h-4" /> },
//     { value: 'email', label: 'Email', icon: <Type className="w-4 h-4" /> },
//     { value: 'multiple-choice', label: 'Multiple Choice', icon: <Radio className="w-4 h-4" /> },
//     { value: 'checkbox', label: 'Checkbox', icon: <CheckSquare className="w-4 h-4" /> },
//     { value: 'dropdown', label: 'Dropdown', icon: <ChevronDown className="w-4 h-4" /> },
//     { value: 'rating', label: 'Rating (Stars)', icon: <Star className="w-4 h-4" /> },
//     { value: 'scale', label: 'Scale', icon: <Hash className="w-4 h-4" /> },
//     { value: 'NPS', label: 'NPS Score', icon: <ThumbsUp className="w-4 h-4" /> },
//     { value: 'date', label: 'Date', icon: <Calendar className="w-4 h-4" /> }
//   ]

//   return (
//     <div className="space-y-6">
//       {/* Question Modal */}
//       {showQuestionModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
//             {/* Modal Header */}
//             <div className="flex items-center justify-between p-4 border-b">
//               <h3 className="text-lg font-bold text-black">Add New Question</h3>
//               <button
//                 onClick={closeQuestionModal}
//                 className="p-1 hover:bg-gray-100 rounded"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>

//             {/* Modal Content */}
//             <div className="flex-1 overflow-y-auto p-4 space-y-4">
//               {/* Question Text */}
//               <div className="space-y-2">
//                 <label className="block text-sm font-medium text-gray-700">Question Text *</label>
//                 <textarea
//                   value={newQuestion.text}
//                   onChange={(e) => setNewQuestion({...newQuestion, text: e.target.value})}
//                   className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
//                   placeholder="Enter your question here..."
//                   rows={2}
//                   autoFocus
//                 />
//               </div>

//               {/* Question Type Selection */}
//               <div className="space-y-2">
//                 <label className="block text-sm font-medium text-gray-700">Question Type</label>
//                 <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
//                   {questionTypeOptions.map((type) => (
//                     <button
//                       key={type.value}
//                       type="button"
//                       onClick={() => handleQuestionTypeChange(type.value as Question['type'])}
//                       className={`p-3 border rounded-lg flex flex-col items-center justify-center gap-2 transition-all ${
//                         newQuestion.type === type.value
//                           ? 'border-black bg-black text-white'
//                           : 'border-gray-300 hover:border-gray-400'
//                       }`}
//                     >
//                       {type.icon}
//                       <span className="text-xs font-medium">{type.label}</span>
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               {/* Dynamic Input based on Question Type */}
//               {newQuestion.type && (
//                 <div className="space-y-4 p-3 border border-gray-200 rounded-lg bg-gray-50">
//                   <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
//                     {getQuestionTypeIcon(newQuestion.type)}
//                     {questionTypeOptions.find(t => t.value === newQuestion.type)?.label} Settings
//                   </h4>
//                   {renderQuestionInput()}
//                 </div>
//               )}

//               {/* Required Toggle */}
//               <div className="flex items-center justify-between p-3 border border-gray-200 rounded">
//                 <div>
//                   <h4 className="text-sm font-medium text-gray-700">Required Question</h4>
//                   <p className="text-xs text-gray-500">User must answer this question</p>
//                 </div>
//                 <label className="relative inline-flex items-center cursor-pointer">
//                   <input
//                     type="checkbox"
//                     checked={newQuestion.required || false}
//                     onChange={(e) => setNewQuestion({...newQuestion, required: e.target.checked})}
//                     className="sr-only peer"
//                   />
//                   <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
//                 </label>
//               </div>
//             </div>

//             {/* Modal Footer */}
//             <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
//               <button
//                 onClick={closeQuestionModal}
//                 className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded border border-gray-300"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={saveQuestionFromModal}
//                 className="px-4 py-2 text-sm font-medium bg-black text-white hover:bg-gray-800 rounded"
//               >
//                 Add Question
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Header */}
//       <div className="bg-white rounded border border-gray-300 p-4">
//         <div className="flex justify-between items-center mb-3">
//           <h2 className="text-lg font-bold text-black">
//             {selectedSurvey ? `Editing: ${selectedSurvey.title}` : 'Create New Survey'}
//           </h2>
//           <div className="flex gap-2">
//             <button
//               onClick={() => setShowSavedSurveys(!showSavedSurveys)}
//               className="px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
//             >
//               {showSavedSurveys ? 'Hide Saved' : 'View Saved'}
//             </button>
//             {selectedSurvey && (
//               <button
//                 onClick={() => {
//                   setSelectedSurvey(null)
//                   setTitle('New Survey')
//                   setDescription('')
//                   setSections([{
//                     id: 'section-1',
//                     title: 'Basic Information',
//                     description: 'Please provide your feedback',
//                     questions: []
//                   }])
//                 }}
//                 className="px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
//               >
//                 New Survey
//               </button>
//             )}
//           </div>
//         </div>

//         {/* Survey Title & Description */}
//         <div className="space-y-3">
//           <div>
//             <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Survey Title *</label>
//             <input
//               type="text"
//               value={title}
//               onChange={(e) => setTitle(e.target.value)}
//               className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm bg-white text-black focus:outline-none focus:ring-1 focus:ring-black"
//               placeholder="e.g. Client Satisfaction Survey"
//               required
//             />
//           </div>
//           <div>
//             <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Description (Internal)</label>
//             <textarea
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//               className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm bg-white text-black focus:outline-none focus:ring-1 focus:ring-black min-h-[60px]"
//               placeholder="Describe the purpose of this survey..."
//               rows={2}
//             />
//           </div>
//         </div>
//       </div>

//       {/* Saved Surveys Panel */}
//       {showSavedSurveys && (
//         <div className="bg-white rounded border border-gray-300 p-4">
//           <h3 className="text-sm font-bold text-black mb-3 flex items-center gap-2">
//             <Save className="w-4 h-4" />
//             Saved Surveys
//           </h3>
//           {surveys.length === 0 ? (
//             <p className="text-gray-500 text-sm py-4 text-center">No surveys saved yet</p>
//           ) : (
//             <div className="space-y-2">
//               {surveys.map((survey) => (
//                 <div key={survey.id} className="flex items-center justify-between p-3 border border-gray-200 rounded hover:bg-gray-50">
//                   <div className="flex-1">
//                     <div className="flex items-center gap-2">
//                       <h4 className="font-medium text-black">{survey.title}</h4>
//                       <span className={`text-[10px] px-1.5 py-0.5 rounded ${
//                         survey.status === 'published' 
//                           ? 'bg-green-100 text-green-800' 
//                           : survey.status === 'draft'
//                           ? 'bg-yellow-100 text-yellow-800'
//                           : 'bg-gray-100 text-gray-800'
//                       }`}>
//                         {survey.status.toUpperCase()}
//                       </span>
//                       <span className="text-[10px] text-gray-500">
//                         {survey.responsesCount} responses
//                       </span>
//                     </div>
//                     <p className="text-xs text-gray-500 mt-1">{survey.description}</p>
//                   </div>
//                   <div className="flex items-center gap-1">
//                     <button
//                       onClick={() => loadSurvey(survey)}
//                       className="p-1.5 hover:bg-blue-50 rounded text-blue-600 transition-colors"
//                       title="Edit survey"
//                     >
//                       <Eye className="w-4 h-4" />
//                     </button>
//                     <button
//                       onClick={() => duplicateSurvey(survey)}
//                       className="p-1.5 hover:bg-gray-100 rounded text-gray-600 transition-colors"
//                       title="Duplicate survey"
//                     >
//                       <Copy className="w-4 h-4" />
//                     </button>
//                     <button
//                       onClick={() => exportSurvey(survey)}
//                       className="p-1.5 hover:bg-green-50 rounded text-green-600 transition-colors"
//                       title="Export survey"
//                     >
//                       <Download className="w-4 h-4" />
//                     </button>
//                     <button
//                       onClick={() => deleteSurvey(survey.id)}
//                       className="p-1.5 hover:bg-red-50 rounded text-red-600 transition-colors"
//                       title="Delete survey"
//                     >
//                       <Trash2 className="w-4 h-4" />
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       )}

//       {/* Sections */}
//       {!showSavedSurveys && (
//         <div className="space-y-3">
//           {sections.map((section) => (
//             <div key={section.id} className="bg-white rounded border border-gray-300 p-4">
//               <div className="flex items-start justify-between mb-3 border-b border-gray-200 pb-3">
//                 <div className="flex-1">
//                   <input
//                     type="text"
//                     value={section.title}
//                     onChange={(e) => updateSection(section.id, { title: e.target.value })}
//                     className="text-base font-bold text-black bg-transparent border-0 focus:outline-none focus:ring-0 w-full p-0"
//                     placeholder="Section Title"
//                   />
//                   <textarea
//                     value={section.description || ''}
//                     onChange={(e) => updateSection(section.id, { description: e.target.value })}
//                     className="w-full p-0 text-xs text-gray-500 bg-transparent border-0 focus:outline-none focus:ring-0 resize-none mt-0.5"
//                     placeholder="Add section description..."
//                     rows={1}
//                   />
//                 </div>
//                 {sections.length > 1 && (
//                   <button
//                     onClick={() => removeSection(section.id)}
//                     className="p-1.5 hover:bg-red-50 rounded text-red-500 transition-colors ml-2 border border-transparent hover:border-red-200"
//                   >
//                     <Trash2 className="w-4 h-4" />
//                   </button>
//                 )}
//               </div>

//               {/* Questions */}
//               <div className="space-y-2 mb-3">
//                 {section.questions.map((question) => (
//                   <div key={question.id} className="bg-white rounded p-3 space-y-2 border border-gray-200">
//                     <div className="flex items-start gap-2">
//                       <div className="flex-1">
//                         <input
//                           type="text"
//                           value={question.text}
//                           onChange={(e) => updateQuestion(section.id, question.id, { text: e.target.value })}
//                           className="w-full text-sm font-medium text-black bg-transparent border-0 border-b border-gray-300 focus:outline-none focus:ring-0 focus:border-black py-0.5"
//                           placeholder="Enter question here"
//                         />
//                       </div>
//                       <button
//                         onClick={() => removeQuestion(section.id, question.id)}
//                         className="p-1.5 hover:bg-red-50 rounded text-red-500 transition-colors border border-transparent hover:border-red-200"
//                       >
//                         <Trash2 className="w-3.5 h-3.5" />
//                       </button>
//                     </div>

//                     <div className="flex items-center gap-4">
//                       <select
//                         value={question.type}
//                         onChange={(e) => updateQuestion(section.id, question.id, { type: e.target.value as any })}
//                         className="px-2 py-1 border border-gray-300 rounded bg-white text-black text-[11px] font-bold uppercase tracking-tight focus:outline-none focus:ring-1 focus:ring-black cursor-pointer"
//                       >
//                         <option value="text">Short Text</option>
//                         <option value="textarea">Long Text</option>
//                         <option value="multiple-choice">Multiple Choice</option>
//                         <option value="checkbox">Checkbox</option>
//                         <option value="rating">Rating</option>
//                         <option value="scale">Scale</option>
//                         <option value="NPS">NPS</option>
//                         <option value="date">Date</option>
//                         <option value="number">Number</option>
//                         <option value="email">Email</option>
//                         <option value="dropdown">Dropdown</option>
//                       </select>
//                       <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-tight text-gray-500 cursor-pointer">
//                         <input
//                           type="checkbox"
//                           checked={question.required}
//                           onChange={(e) => updateQuestion(section.id, question.id, { required: e.target.checked })}
//                           className="w-3.5 h-3.5 rounded border-gray-300 text-black focus:ring-black"
//                         />
//                         <span>Required</span>
//                       </label>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               <button
//                 onClick={() => openQuestionModal(section.id)}
//                 className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-600 hover:text-black hover:bg-gray-100 rounded transition-colors border border-gray-200 hover:border-gray-400"
//               >
//                 <Plus className="w-3.5 h-3.5" />
//                 ADD QUESTION
//               </button>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Add Section Button */}
//       {!showSavedSurveys && (
//         <button
//           onClick={addSection}
//           className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-gray-400 text-[11px] font-bold uppercase tracking-widest text-gray-500 rounded hover:border-black hover:text-black transition-all bg-white"
//         >
//           <Plus className="w-4 h-4" />
//           Add New Section
//         </button>
//       )}

//       {/* Action Buttons */}
//       {!showSavedSurveys && (
//         <div className="flex gap-2 sticky bottom-0 bg-white border-t border-gray-300 py-3 -mx-4 -mb-4 px-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
//           <button 
//             onClick={() => saveSurvey('draft')}
//             disabled={loading || !title.trim()}
//             className="flex-1 px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-500 border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//           >
//             {loading ? (
//               <>
//                 <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-500 border-t-transparent"></div>
//                 Saving...
//               </>
//             ) : (
//               <>
//                 <Save className="w-4 h-4" />
//                 {selectedSurvey ? 'Update Draft' : 'Save Draft'}
//               </>
//             )}
//           </button>
//           <button 
//             onClick={() => saveSurvey('published')}
//             disabled={loading || !title.trim()}
//             className="flex-1 px-4 py-2 text-xs font-bold uppercase tracking-widest bg-black text-white rounded hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             {loading ? 'Publishing...' : 'Publish Survey'}
//           </button>
//         </div>
//       )}
//     </div>
//   )
// }
// new codee

'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Save, Eye, Copy, Download, X, ChevronDown, ChevronUp, Hash, Calendar, Star, ThumbsUp, CheckSquare, Radio, Type, MessageSquare, Share, Edit2 } from 'lucide-react'
import { db } from '@/lib/firebase'
import { 
  collection, 
  addDoc, 
  query, 
  orderBy,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  getDoc
} from 'firebase/firestore'
import { useParams } from 'next/navigation'

interface Question {
  id: string
  text: string
  type: 'text' | 'textarea' | 'multiple-choice' | 'checkbox' | 'rating' | 'scale' | 'NPS' | 'date' | 'number' | 'email' | 'dropdown'
  required: boolean
  options?: string[]
  placeholder?: string
  min?: number
  max?: number
  step?: number
  scaleLabels?: { min: string; max: string }
}

interface FormSection {
  id: string
  title: string
  description?: string
  questions: Question[]
}

interface Survey {
  id: string
  title: string
  description: string
  sections: FormSection[]
  status: 'draft' | 'published' | 'archived'
  createdAt: any
  updatedAt: any
  responsesCount: number
}

export default function SurveyFormSection() {
  const params = useParams()
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null)
  const [sections, setSections] = useState<FormSection[]>([
    {
      id: 'section-1',
      title: 'Basic Information',
      description: 'Please provide your feedback',
      questions: []
    }
  ])
  const [title, setTitle] = useState('New Survey')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSavedSurveys, setShowSavedSurveys] = useState(false)
  const [shareLink, setShareLink] = useState<string | null>(null)
  const [showShareModal, setShowShareModal] = useState(false)
  
  // New state for question modal
  const [showQuestionModal, setShowQuestionModal] = useState(false)
  const [currentSectionId, setCurrentSectionId] = useState<string>('')
  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    text: '',
    type: 'text',
    required: false,
    placeholder: ''
  })
  const [optionInput, setOptionInput] = useState('')
  const [optionsList, setOptionsList] = useState<string[]>([])

  // Fetch specific survey when editing from URL
  useEffect(() => {
    const fetchSurveyById = async (id: string) => {
      try {
        const surveyDoc = await getDoc(doc(db, 'surveys', id))
        if (surveyDoc.exists()) {
          const data = surveyDoc.data()
          const survey: Survey = {
            id: surveyDoc.id,
            title: data.title || '',
            description: data.description || '',
            sections: data.sections || [],
            status: data.status || 'draft',
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            responsesCount: data.responsesCount || 0
          }
          setSelectedSurvey(survey)
          setTitle(survey.title)
          setDescription(survey.description)
          setSections(survey.sections)
        }
      } catch (error) {
        console.error('Error fetching survey:', error)
      }
    }

    if (params?.id) {
      fetchSurveyById(params.id as string)
      setShowSavedSurveys(false)
    }
  }, [params?.id])

  // Fetch surveys from Firebase
  useEffect(() => {
    const surveysRef = collection(db, 'surveys')
    const q = query(surveysRef, orderBy('createdAt', 'desc'))
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const surveysList: Survey[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        surveysList.push({
          id: doc.id,
          title: data.title || '',
          description: data.description || '',
          sections: data.sections || [],
          status: data.status || 'draft',
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          responsesCount: data.responsesCount || 0
        })
      })
      setSurveys(surveysList)
    })
    
    return () => unsubscribe()
  }, [])

  // Load selected survey data
  useEffect(() => {
    if (selectedSurvey) {
      setTitle(selectedSurvey.title)
      setDescription(selectedSurvey.description)
      setSections(selectedSurvey.sections)
    }
  }, [selectedSurvey])

  const addSection = () => {
    const newSection: FormSection = {
      id: `section-${Date.now()}`,
      title: 'New Section',
      description: '',
      questions: []
    }
    setSections([...sections, newSection])
  }

  // Open modal to add question
  const openQuestionModal = (sectionId: string) => {
    setCurrentSectionId(sectionId)
    setNewQuestion({
      id: `question-${Date.now()}`,
      text: '',
      type: 'text',
      required: false,
      placeholder: ''
    })
    setOptionsList([])
    setOptionInput('')
    setShowQuestionModal(true)
  }

  // Close modal and reset
  const closeQuestionModal = () => {
    setShowQuestionModal(false)
    setNewQuestion({
      text: '',
      type: 'text',
      required: false,
      placeholder: ''
    })
    setOptionsList([])
    setOptionInput('')
  }

  // Handle question type change
  const handleQuestionTypeChange = (type: Question['type']) => {
    const updatedQuestion = { ...newQuestion, type }
    
    // Set default placeholders based on type
    updatedQuestion.placeholder = getDefaultPlaceholder(type)
    
    // Set default options for certain types
    if (type === 'multiple-choice' || type === 'checkbox' || type === 'dropdown') {
      updatedQuestion.options = ['Option 1', 'Option 2']
      setOptionsList(['Option 1', 'Option 2'])
    } else {
      updatedQuestion.options = []
      setOptionsList([])
    }
    
    // Set default values for scale types
    if (type === 'scale') {
      updatedQuestion.scaleLabels = { min: 'Very Poor', max: 'Excellent' }
      updatedQuestion.min = 1
      updatedQuestion.max = 5
      updatedQuestion.step = 1
    }
    
    if (type === 'NPS') {
      updatedQuestion.scaleLabels = { min: 'Not at all likely', max: 'Extremely likely' }
      updatedQuestion.min = 0
      updatedQuestion.max = 10
      updatedQuestion.step = 1
    }
    
    if (type === 'rating') {
      updatedQuestion.max = 5
    }
    
    setNewQuestion(updatedQuestion)
  }

  // Get default placeholder based on question type
  const getDefaultPlaceholder = (type: Question['type']): string => {
    switch(type) {
      case 'text': return 'Enter your answer here...'
      case 'textarea': return 'Please provide detailed feedback...'
      case 'number': return 'Enter a number...'
      case 'email': return 'example@email.com'
      case 'date': return 'Select a date...'
      default: return ''
    }
  }

  // Add option to list
  const addOption = () => {
    if (optionInput.trim()) {
      const newOptions = [...optionsList, optionInput.trim()]
      setOptionsList(newOptions)
      setNewQuestion({...newQuestion, options: newOptions})
      setOptionInput('')
    }
  }

  // Remove option from list
  const removeOption = (index: number) => {
    const newOptions = [...optionsList]
    newOptions.splice(index, 1)
    setOptionsList(newOptions)
    setNewQuestion({...newQuestion, options: newOptions})
  }

  // Move option up
  const moveOptionUp = (index: number) => {
    if (index > 0) {
      const newOptions = [...optionsList]
      const temp = newOptions[index]
      newOptions[index] = newOptions[index - 1]
      newOptions[index - 1] = temp
      setOptionsList(newOptions)
      setNewQuestion({...newQuestion, options: newOptions})
    }
  }

  // Move option down
  const moveOptionDown = (index: number) => {
    if (index < optionsList.length - 1) {
      const newOptions = [...optionsList]
      const temp = newOptions[index]
      newOptions[index] = newOptions[index + 1]
      newOptions[index + 1] = temp
      setOptionsList(newOptions)
      setNewQuestion({...newQuestion, options: newOptions})
    }
  }

  // Save question from modal
  const saveQuestionFromModal = () => {
    if (!newQuestion.text?.trim()) {
      alert('Please enter question text')
      return
    }

    const questionToAdd: Question = {
      id: `question-${Date.now()}`,
      text: newQuestion.text.trim(),
      type: newQuestion.type!,
      required: newQuestion.required || false,
      placeholder: newQuestion.placeholder || '',
      options: newQuestion.options || [],
      min: newQuestion.min,
      max: newQuestion.max,
      step: newQuestion.step,
      scaleLabels: newQuestion.scaleLabels
    }

    // Add question to the section
    setSections(sections.map(section => {
      if (section.id === currentSectionId) {
        return {
          ...section,
          questions: [...section.questions, questionToAdd]
        }
      }
      return section
    }))

    // Close modal and reset
    closeQuestionModal()
  }

  const removeQuestion = (sectionId: string, questionId: string) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: section.questions.filter(q => q.id !== questionId)
        }
      }
      return section
    }))
  }

  const removeSection = (sectionId: string) => {
    if (sections.length > 1) {
      setSections(sections.filter(s => s.id !== sectionId))
    } else {
      alert('At least one section must remain')
    }
  }

  const updateSection = (sectionId: string, updates: Partial<FormSection>) => {
    setSections(sections.map(section =>
      section.id === sectionId ? { ...section, ...updates } : section
    ))
  }

  const updateQuestion = (sectionId: string, questionId: string, updates: Partial<Question>) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: section.questions.map(q =>
            q.id === questionId ? { ...q, ...updates } : q
          )
        }
      }
      return section
    }))
  }

  // Helper function to clean data before saving to Firebase
  const cleanSurveyData = (data: any) => {
    const cleanedSections = data.sections.map((section: FormSection) => ({
      ...section,
      questions: section.questions.map((question: Question) => ({
        ...question,
        options: question.options || [],
        placeholder: question.placeholder || '',
        min: question.min ?? null,
        max: question.max ?? null,
        step: question.step ?? null,
        scaleLabels: question.scaleLabels || null
      }))
    }))
    
    return {
      ...data,
      sections: cleanedSections,
      description: data.description || ''
    }
  }

  // Save survey to Firebase
  const saveSurvey = async (status: 'draft' | 'published' = 'draft') => {
    if (!title.trim()) {
      alert('Please enter a survey title')
      return
    }

    setLoading(true)
    try {
      const surveyData = cleanSurveyData({
        title: title.trim(),
        description: description.trim(),
        sections: sections,
        status: status,
        updatedAt: serverTimestamp(),
        responsesCount: selectedSurvey?.responsesCount || 0
      })

      console.log('Saving survey data:', surveyData)

      if (selectedSurvey && selectedSurvey.id) {
        // Update existing survey
        const surveyDoc = doc(db, 'surveys', selectedSurvey.id)
        await updateDoc(surveyDoc, surveyData)
        alert('Survey updated successfully!')
      } else {
        // Create new survey
        await addDoc(collection(db, 'surveys'), {
          ...surveyData,
          createdAt: serverTimestamp()
        })
        alert(`Survey ${status === 'published' ? 'published' : 'saved as draft'} successfully!`)
      }

      // Reset form
      setSelectedSurvey(null)
      setTitle('New Survey')
      setDescription('')
      setSections([{
        id: 'section-1',
        title: 'Basic Information',
        description: 'Please provide your feedback',
        questions: []
      }])
    } catch (error) {
      console.error('Error saving survey:', error)
      alert('Error saving survey. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Load survey from saved list
  const loadSurvey = (survey: Survey) => {
    setSelectedSurvey(survey)
    setShowSavedSurveys(false)
  }

  // Handle share survey
  const handleShareSurvey = (survey: Survey) => {
    const link = `${window.location.origin}/survey/${survey.id}`
    setShareLink(link)
    setShowShareModal(true)
  }

  // Copy link to clipboard
  const copyToClipboard = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink)
      alert('Link copied to clipboard!')
    }
  }

  // Delete survey
  const deleteSurvey = async (surveyId: string) => {
    if (!confirm('Are you sure you want to delete this survey?')) return
    
    try {
      await deleteDoc(doc(db, 'surveys', surveyId))
      if (selectedSurvey?.id === surveyId) {
        setSelectedSurvey(null)
      }
      alert('Survey deleted successfully!')
    } catch (error) {
      console.error('Error deleting survey:', error)
      alert('Error deleting survey. Please try again.')
    }
  }

  // Duplicate survey
  const duplicateSurvey = async (survey: Survey) => {
    try {
      const newSurveyData = cleanSurveyData({
        title: `${survey.title} (Copy)`,
        description: survey.description,
        sections: survey.sections,
        status: 'draft',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        responsesCount: 0
      })
      
      await addDoc(collection(db, 'surveys'), newSurveyData)
      alert('Survey duplicated successfully!')
    } catch (error) {
      console.error('Error duplicating survey:', error)
      alert('Error duplicating survey. Please try again.')
    }
  }

  // Export survey as JSON
  const exportSurvey = (survey: Survey) => {
    const surveyData = {
      title: survey.title,
      description: survey.description,
      sections: survey.sections,
      createdAt: survey.createdAt?.toDate?.()?.toISOString() || survey.createdAt,
      status: survey.status,
      responsesCount: survey.responsesCount
    }
    
    const dataStr = JSON.stringify(surveyData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${survey.title.replace(/\s+/g, '_')}_survey.json`
    link.click()
  }

  // Render appropriate input based on question type in modal
  const renderQuestionInput = () => {
    switch(newQuestion.type) {
      case 'text':
      case 'email':
        return (
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-700">Placeholder Text</label>
            <input
              type="text"
              value={newQuestion.placeholder || ''}
              onChange={(e) => setNewQuestion({...newQuestion, placeholder: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              placeholder="Enter placeholder text..."
            />
          </div>
        )
      
      case 'textarea':
        return (
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-700">Placeholder Text</label>
            <textarea
              value={newQuestion.placeholder || ''}
              onChange={(e) => setNewQuestion({...newQuestion, placeholder: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              placeholder="Enter placeholder text..."
              rows={3}
            />
          </div>
        )
      
      case 'number':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700">Min Value</label>
                <input
                  type="number"
                  value={newQuestion.min || ''}
                  onChange={(e) => setNewQuestion({...newQuestion, min: e.target.value ? parseFloat(e.target.value) : undefined})}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  placeholder="Min"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Max Value</label>
                <input
                  type="number"
                  value={newQuestion.max || ''}
                  onChange={(e) => setNewQuestion({...newQuestion, max: e.target.value ? parseFloat(e.target.value) : undefined})}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  placeholder="Max"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Step</label>
                <input
                  type="number"
                  value={newQuestion.step || 1}
                  onChange={(e) => setNewQuestion({...newQuestion, step: e.target.value ? parseFloat(e.target.value) : 1})}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  placeholder="Step"
                  min="0.1"
                  step="0.1"
                />
              </div>
            </div>
          </div>
        )
      
      case 'multiple-choice':
      case 'checkbox':
      case 'dropdown':
        return (
          <div className="space-y-3">
            <label className="block text-xs font-medium text-gray-700">Options</label>
            <div className="space-y-2">
              {optionsList.map((option, index) => (
                <div key={index} className="flex items-center gap-2 p-2 border border-gray-200 rounded">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...optionsList]
                        newOptions[index] = e.target.value
                        setOptionsList(newOptions)
                        setNewQuestion({...newQuestion, options: newOptions})
                      }}
                      className="w-full px-2 py-1 border-0 border-b border-gray-300 focus:outline-none focus:border-black text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveOptionUp(index)}
                      disabled={index === 0}
                      className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveOptionDown(index)}
                      disabled={index === optionsList.length - 1}
                      className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="p-1 hover:bg-red-50 text-red-500 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={optionInput}
                onChange={(e) => setOptionInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addOption()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                placeholder="Add new option..."
              />
              <button
                type="button"
                onClick={addOption}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm font-medium"
              >
                Add
              </button>
            </div>
          </div>
        )
      
      case 'rating':
        return (
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-700">Number of Stars (1-10)</label>
            <input
              type="number"
              min="1"
              max="10"
              value={newQuestion.max || 5}
              onChange={(e) => setNewQuestion({...newQuestion, max: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            />
          </div>
        )
      
      case 'scale':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700">Min Label</label>
                <input
                  type="text"
                  value={newQuestion.scaleLabels?.min || ''}
                  onChange={(e) => setNewQuestion({
                    ...newQuestion,
                    scaleLabels: {
                      min: e.target.value,
                      max: newQuestion.scaleLabels?.max || ''
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  placeholder="e.g., Very Poor"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Max Label</label>
                <input
                  type="text"
                  value={newQuestion.scaleLabels?.max || ''}
                  onChange={(e) => setNewQuestion({
                    ...newQuestion,
                    scaleLabels: {
                      min: newQuestion.scaleLabels?.min || '',
                      max: e.target.value
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  placeholder="e.g., Excellent"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700">Min Value</label>
                <input
                  type="number"
                  value={newQuestion.min || 1}
                  onChange={(e) => setNewQuestion({...newQuestion, min: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Max Value</label>
                <input
                  type="number"
                  value={newQuestion.max || 5}
                  onChange={(e) => setNewQuestion({...newQuestion, max: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Step</label>
                <input
                  type="number"
                  value={newQuestion.step || 1}
                  onChange={(e) => setNewQuestion({...newQuestion, step: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>
          </div>
        )
      
      case 'NPS':
        return (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Net Promoter Score (0-10 scale)</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700">Min Label (0)</label>
                <input
                  type="text"
                  value={newQuestion.scaleLabels?.min || 'Not at all likely'}
                  onChange={(e) => setNewQuestion({
                    ...newQuestion,
                    scaleLabels: {
                      min: e.target.value,
                      max: newQuestion.scaleLabels?.max || ''
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Max Label (10)</label>
                <input
                  type="text"
                  value={newQuestion.scaleLabels?.max || 'Extremely likely'}
                  onChange={(e) => setNewQuestion({
                    ...newQuestion,
                    scaleLabels: {
                      min: newQuestion.scaleLabels?.min || '',
                      max: e.target.value
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>
          </div>
        )
      
      case 'date':
        return (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Date picker will be shown to users</p>
          </div>
        )
      
      default:
        return null
    }
  }

  // Question type icons
  const getQuestionTypeIcon = (type: Question['type']) => {
    switch(type) {
      case 'text': return <Type className="w-4 h-4" />
      case 'textarea': return <MessageSquare className="w-4 h-4" />
      case 'multiple-choice': return <Radio className="w-4 h-4" />
      case 'checkbox': return <CheckSquare className="w-4 h-4" />
      case 'rating': return <Star className="w-4 h-4" />
      case 'scale': return <Hash className="w-4 h-4" />
      case 'NPS': return <ThumbsUp className="w-4 h-4" />
      case 'date': return <Calendar className="w-4 h-4" />
      case 'number': return <Hash className="w-4 h-4" />
      case 'email': return <Type className="w-4 h-4" />
      case 'dropdown': return <ChevronDown className="w-4 h-4" />
      default: return <Type className="w-4 h-4" />
    }
  }

  // Question type options for dropdown
  const questionTypeOptions = [
    { value: 'text', label: 'Short Text', icon: <Type className="w-4 h-4" /> },
    { value: 'textarea', label: 'Long Text', icon: <MessageSquare className="w-4 h-4" /> },
    { value: 'number', label: 'Number', icon: <Hash className="w-4 h-4" /> },
    { value: 'email', label: 'Email', icon: <Type className="w-4 h-4" /> },
    { value: 'multiple-choice', label: 'Multiple Choice', icon: <Radio className="w-4 h-4" /> },
    { value: 'checkbox', label: 'Checkbox', icon: <CheckSquare className="w-4 h-4" /> },
    { value: 'dropdown', label: 'Dropdown', icon: <ChevronDown className="w-4 h-4" /> },
    { value: 'rating', label: 'Rating (Stars)', icon: <Star className="w-4 h-4" /> },
    { value: 'scale', label: 'Scale', icon: <Hash className="w-4 h-4" /> },
    { value: 'NPS', label: 'NPS Score', icon: <ThumbsUp className="w-4 h-4" /> },
    { value: 'date', label: 'Date', icon: <Calendar className="w-4 h-4" /> }
  ]

  return (
    <div className="space-y-6">
      {/* Share Link Modal */}
      {showShareModal && shareLink && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-bold text-black">Share Survey</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-600 mb-2">Share this link with respondents:</p>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm bg-gray-50"
                />
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 text-sm"
                >
                  Copy
                </button>
              </div>
              <div className="text-xs text-gray-500">
                <p>Anyone with this link can submit responses</p>
              </div>
            </div>
            <div className="flex justify-end p-4 border-t">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded border border-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Question Modal */}
      {showQuestionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-bold text-black">Add New Question</h3>
              <button
                onClick={closeQuestionModal}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Question Text */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Question Text *</label>
                <textarea
                  value={newQuestion.text}
                  onChange={(e) => setNewQuestion({...newQuestion, text: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  placeholder="Enter your question here..."
                  rows={2}
                  autoFocus
                />
              </div>

              {/* Question Type Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Question Type</label>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {questionTypeOptions.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => handleQuestionTypeChange(type.value as Question['type'])}
                      className={`p-3 border rounded-lg flex flex-col items-center justify-center gap-2 transition-all ${
                        newQuestion.type === type.value
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {type.icon}
                      <span className="text-xs font-medium">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Input based on Question Type */}
              {newQuestion.type && (
                <div className="space-y-4 p-3 border border-gray-200 rounded-lg bg-gray-50">
                  <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    {getQuestionTypeIcon(newQuestion.type)}
                    {questionTypeOptions.find(t => t.value === newQuestion.type)?.label} Settings
                  </h4>
                  {renderQuestionInput()}
                </div>
              )}

              {/* Required Toggle */}
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded">
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Required Question</h4>
                  <p className="text-xs text-gray-500">User must answer this question</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newQuestion.required || false}
                    onChange={(e) => setNewQuestion({...newQuestion, required: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
              <button
                onClick={closeQuestionModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded border border-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={saveQuestionFromModal}
                className="px-4 py-2 text-sm font-medium bg-black text-white hover:bg-gray-800 rounded"
              >
                Add Question
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded border border-gray-300 p-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold text-black">
            {selectedSurvey ? `Editing: ${selectedSurvey.title}` : 'Create New Survey'}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowSavedSurveys(!showSavedSurveys)}
              className="px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              {showSavedSurveys ? 'Hide Saved' : 'View Saved'}
            </button>
            {selectedSurvey && (
              <>
                <button
                  onClick={() => handleShareSurvey(selectedSurvey)}
                  className="px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center gap-1"
                >
                  <Share className="w-4 h-4" />
                  Share
                </button>
                <button
                  onClick={() => {
                    setSelectedSurvey(null)
                    setTitle('New Survey')
                    setDescription('')
                    setSections([{
                      id: 'section-1',
                      title: 'Basic Information',
                      description: 'Please provide your feedback',
                      questions: []
                    }])
                  }}
                  className="px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  New Survey
                </button>
              </>
            )}
          </div>
        </div>

        {/* Survey Title & Description */}
        <div className="space-y-3">
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Survey Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm bg-white text-black focus:outline-none focus:ring-1 focus:ring-black"
              placeholder="e.g. Client Satisfaction Survey"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Description (Internal)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm bg-white text-black focus:outline-none focus:ring-1 focus:ring-black min-h-[60px]"
              placeholder="Describe the purpose of this survey..."
              rows={2}
            />
          </div>
        </div>
      </div>

      {/* Saved Surveys Panel */}
      {showSavedSurveys && (
        <div className="bg-white rounded border border-gray-300 p-4">
          <h3 className="text-sm font-bold text-black mb-3 flex items-center gap-2">
            <Save className="w-4 h-4" />
            Saved Surveys
          </h3>
          {surveys.length === 0 ? (
            <p className="text-gray-500 text-sm py-4 text-center">No surveys saved yet</p>
          ) : (
            <div className="space-y-2">
              {surveys.map((survey) => (
                <div key={survey.id} className="flex items-center justify-between p-3 border border-gray-200 rounded hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-black">{survey.title}</h4>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                        survey.status === 'published' 
                          ? 'bg-green-100 text-green-800' 
                          : survey.status === 'draft'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {survey.status.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        {survey.responsesCount} responses
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{survey.description}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleShareSurvey(survey)}
                      className="p-1.5 hover:bg-green-50 rounded text-green-600 transition-colors"
                      title="Share survey"
                    >
                      <Share className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => loadSurvey(survey)}
                      className="p-1.5 hover:bg-blue-50 rounded text-blue-600 transition-colors"
                      title="Edit survey"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => duplicateSurvey(survey)}
                      className="p-1.5 hover:bg-gray-100 rounded text-gray-600 transition-colors"
                      title="Duplicate survey"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => exportSurvey(survey)}
                      className="p-1.5 hover:bg-green-50 rounded text-green-600 transition-colors"
                      title="Export survey"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteSurvey(survey.id)}
                      className="p-1.5 hover:bg-red-50 rounded text-red-600 transition-colors"
                      title="Delete survey"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sections */}
      {!showSavedSurveys && (
        <div className="space-y-3">
          {sections.map((section) => (
            <div key={section.id} className="bg-white rounded border border-gray-300 p-4">
              <div className="flex items-start justify-between mb-3 border-b border-gray-200 pb-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => updateSection(section.id, { title: e.target.value })}
                    className="text-base font-bold text-black bg-transparent border-0 focus:outline-none focus:ring-0 w-full p-0"
                    placeholder="Section Title"
                  />
                  <textarea
                    value={section.description || ''}
                    onChange={(e) => updateSection(section.id, { description: e.target.value })}
                    className="w-full p-0 text-xs text-gray-500 bg-transparent border-0 focus:outline-none focus:ring-0 resize-none mt-0.5"
                    placeholder="Add section description..."
                    rows={1}
                  />
                </div>
                {sections.length > 1 && (
                  <button
                    onClick={() => removeSection(section.id)}
                    className="p-1.5 hover:bg-red-50 rounded text-red-500 transition-colors ml-2 border border-transparent hover:border-red-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Questions */}
              <div className="space-y-2 mb-3">
                {section.questions.map((question) => (
                  <div key={question.id} className="bg-white rounded p-3 space-y-2 border border-gray-200">
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={question.text}
                          onChange={(e) => updateQuestion(section.id, question.id, { text: e.target.value })}
                          className="w-full text-sm font-medium text-black bg-transparent border-0 border-b border-gray-300 focus:outline-none focus:ring-0 focus:border-black py-0.5"
                          placeholder="Enter question here"
                        />
                      </div>
                      <button
                        onClick={() => removeQuestion(section.id, question.id)}
                        className="p-1.5 hover:bg-red-50 rounded text-red-500 transition-colors border border-transparent hover:border-red-200"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-4">
                      <select
                        value={question.type}
                        onChange={(e) => updateQuestion(section.id, question.id, { type: e.target.value as any })}
                        className="px-2 py-1 border border-gray-300 rounded bg-white text-black text-[11px] font-bold uppercase tracking-tight focus:outline-none focus:ring-1 focus:ring-black cursor-pointer"
                      >
                        <option value="text">Short Text</option>
                        <option value="textarea">Long Text</option>
                        <option value="multiple-choice">Multiple Choice</option>
                        <option value="checkbox">Checkbox</option>
                        <option value="rating">Rating</option>
                        <option value="scale">Scale</option>
                        <option value="NPS">NPS</option>
                        <option value="date">Date</option>
                        <option value="number">Number</option>
                        <option value="email">Email</option>
                        <option value="dropdown">Dropdown</option>
                      </select>
                      <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-tight text-gray-500 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={question.required}
                          onChange={(e) => updateQuestion(section.id, question.id, { required: e.target.checked })}
                          className="w-3.5 h-3.5 rounded border-gray-300 text-black focus:ring-black"
                        />
                        <span>Required</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => openQuestionModal(section.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-600 hover:text-black hover:bg-gray-100 rounded transition-colors border border-gray-200 hover:border-gray-400"
              >
                <Plus className="w-3.5 h-3.5" />
                ADD QUESTION
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Section Button */}
      {!showSavedSurveys && (
        <button
          onClick={addSection}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-gray-400 text-[11px] font-bold uppercase tracking-widest text-gray-500 rounded hover:border-black hover:text-black transition-all bg-white"
        >
          <Plus className="w-4 h-4" />
          Add New Section
        </button>
      )}

      {/* Action Buttons */}
      {!showSavedSurveys && (
        <div className="flex gap-2 sticky bottom-0 bg-white border-t border-gray-300 py-3 -mx-4 -mb-4 px-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <button 
            onClick={() => saveSurvey('draft')}
            disabled={loading || !title.trim()}
            className="flex-1 px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-500 border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-500 border-t-transparent"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {selectedSurvey ? 'Update Draft' : 'Save Draft'}
              </>
            )}
          </button>
          <button 
            onClick={() => saveSurvey('published')}
            disabled={loading || !title.trim()}
            className="flex-1 px-4 py-2 text-xs font-bold uppercase tracking-widest bg-black text-white rounded hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Publishing...' : 'Publish Survey'}
          </button>
        </div>
      )}
    </div>
  )
}