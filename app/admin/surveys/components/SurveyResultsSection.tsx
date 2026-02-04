'use client'

import { useMemo, useState, useEffect } from 'react'
import { AlertCircle, Download, TrendingUp, BarChart3, PieChart, User } from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'

interface Survey {
  id: string
  title: string
  description: string
  status: string
  responsesCount: number
  clientName?: string
  company?: string
  sendCount?: number
  completionRate?: number
  priority?: string
  serviceType?: string
  createdAt?: any
}

interface SurveyResponse {
  id: string
  surveyId: string
  surveyTitle: string
  responses: Array<{
    questionId: string
    questionText: string
    questionType: string
    answer: any
  }>
  submittedAt: any
  timestamp: string
  userAgent: string
}

interface Props {
  surveys: Survey[]
}

export default function SurveyResultsSection({ surveys }: Props) {
  const [selectedSurvey, setSelectedSurvey] = useState<string | null>(null)
  const [allResponses, setAllResponses] = useState<SurveyResponse[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch all survey responses from Firebase
  useEffect(() => {
    setLoading(true)
    const responsesRef = collection(db, 'survey_submissions')
    const q = query(responsesRef, orderBy('submittedAt', 'desc'))
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const responsesList: SurveyResponse[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        responsesList.push({
          id: doc.id,
          surveyId: data.surveyId,
          surveyTitle: data.surveyTitle,
          responses: data.responses || [],
          submittedAt: data.submittedAt,
          timestamp: data.timestamp || new Date().toISOString(),
          userAgent: data.userAgent || ''
        })
      })
      setAllResponses(responsesList)
      setLoading(false)
    })
    
    return () => unsubscribe()
  }, [])

  // Calculate statistics
  const stats = useMemo(() => {
    const totalResponses = allResponses.length
    const totalSurveys = surveys.length
    
    // Calculate completion rate for each survey
    let totalCompletionRate = 0
    let surveysWithCompletion = 0
    
    surveys.forEach(survey => {
      const surveyResponses = allResponses.filter(r => r.surveyId === survey.id)
      if (survey.sendCount && survey.sendCount > 0) {
        const completionRate = Math.round((surveyResponses.length / survey.sendCount) * 100)
        totalCompletionRate += completionRate
        surveysWithCompletion++
      }
    })
    
    const avgCompletionRate = surveysWithCompletion > 0 
      ? Math.round(totalCompletionRate / surveysWithCompletion)
      : 0
    
    // Calculate average rating from responses
    let totalRating = 0
    let ratingCount = 0
    
    allResponses.forEach(response => {
      response.responses.forEach(resp => {
        if (resp.questionType === 'rating' && typeof resp.answer === 'number') {
          totalRating += resp.answer
          ratingCount++
        }
      })
    })
    
    const avgRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : 'N/A'
    
    return { 
      totalResponses, 
      avgCompletionRate, 
      totalSurveys, 
      avgRating,
      totalRatingCount: ratingCount
    }
  }, [allResponses, surveys])

  // Get responses for selected survey
  const surveyResponses = useMemo(() => {
    if (!selectedSurvey) return []
    return allResponses.filter(r => r.surveyId === selectedSurvey)
  }, [selectedSurvey, allResponses])

  // Get selected survey data
  const selectedSurveyData = selectedSurvey ? surveys.find(s => s.id === selectedSurvey) : null

  // Get unique questions from selected survey responses
  const uniqueQuestions = useMemo(() => {
    if (!selectedSurvey || surveyResponses.length === 0) return []
    
    const questionsMap = new Map()
    
    surveyResponses.forEach(response => {
      response.responses.forEach(resp => {
        if (!questionsMap.has(resp.questionId)) {
          questionsMap.set(resp.questionId, {
            id: resp.questionId,
            text: resp.questionText,
            type: resp.questionType,
            answers: []
          })
        }
        questionsMap.get(resp.questionId).answers.push(resp.answer)
      })
    })
    
    return Array.from(questionsMap.values())
  }, [selectedSurvey, surveyResponses])

  // Analyze question answers
  const analyzeQuestion = (question: any) => {
    const { type, answers } = question
    
    if (answers.length === 0) {
      return { summary: 'No responses yet', details: [] }
    }
    
    switch(type) {
      case 'text':
      case 'textarea':
      case 'email':
        return {
          summary: `${answers.length} text responses`,
          details: answers
        }
      
      case 'number':
        const numbers = answers.filter((a: any) => !isNaN(parseFloat(a)))
        const avg = numbers.length > 0 
          ? (numbers.reduce((sum: number, a: any) => sum + parseFloat(a), 0) / numbers.length).toFixed(2)
          : 0
        return {
          summary: `Average: ${avg}`,
          details: answers
        }
      
      case 'rating':
        const ratings = answers.filter((a: any) => !isNaN(parseInt(a)))
        const avgRating = ratings.length > 0 
          ? (ratings.reduce((sum: number, a: any) => sum + parseInt(a), 0) / ratings.length).toFixed(1)
          : 0
        return {
          summary: `Average rating: ${avgRating}/5`,
          details: answers
        }
      
      case 'multiple-choice':
      case 'dropdown':
      case 'checkbox':
        const optionCounts: Record<string, number> = {}
        answers.forEach((answer: any) => {
          if (Array.isArray(answer)) {
            answer.forEach((opt: string) => {
              optionCounts[opt] = (optionCounts[opt] || 0) + 1
            })
          } else {
            optionCounts[answer] = (optionCounts[answer] || 0) + 1
          }
        })
        
        const details = Object.entries(optionCounts)
          .map(([option, count]) => ({
            option,
            count,
            percentage: Math.round((count / answers.length) * 100)
          }))
          .sort((a, b) => b.count - a.count)
        
        return {
          summary: `${answers.length} selections`,
          details
        }
      
      case 'scale':
      case 'NPS':
        const scaleAnswers = answers.filter((a: any) => !isNaN(parseInt(a)))
        const avgScale = scaleAnswers.length > 0 
          ? (scaleAnswers.reduce((sum: number, a: any) => sum + parseInt(a), 0) / scaleAnswers.length).toFixed(1)
          : 0
        return {
          summary: `Average score: ${avgScale}`,
          details: answers.map((a: any) => parseInt(a))
        }
      
      case 'date':
        return {
          summary: `${answers.length} date responses`,
          details: answers
        }
      
      default:
        return {
          summary: `${answers.length} responses`,
          details: answers
        }
    }
  }

  // Export to CSV
  const exportToCSV = () => {
    if (!selectedSurvey || surveyResponses.length === 0) return
    
    const headers = ['Response ID', 'Submission Date', 'Question', 'Answer']
    const rows: string[][] = []
    
    surveyResponses.forEach(response => {
      response.responses.forEach(resp => {
        rows.push([
          response.id.substring(0, 8),
          new Date(response.timestamp).toLocaleDateString(),
          resp.questionText,
          typeof resp.answer === 'object' ? JSON.stringify(resp.answer) : String(resp.answer)
        ])
      })
    })
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${selectedSurveyData?.title || 'survey'}_responses_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded border border-gray-300 p-3 shadow-none">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400 mb-0.5">Total Surveys</p>
              <p className="text-xl font-bold text-black">{stats.totalSurveys}</p>
            </div>
            <BarChart3 className="w-5 h-5 text-gray-300 opacity-30" />
          </div>
        </div>
        
        <div className="bg-white rounded border border-gray-300 p-3 shadow-none">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400 mb-0.5">Total Responses</p>
              <p className="text-xl font-bold text-black">{stats.totalResponses}</p>
            </div>
            <TrendingUp className="w-5 h-5 text-gray-300 opacity-30" />
          </div>
        </div>
        
        <div className="bg-white rounded border border-gray-300 p-3 shadow-none">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400 mb-0.5">Avg Completion</p>
              <p className="text-xl font-bold text-black">{stats.totalResponses}%</p>
            </div>
            <PieChart className="w-5 h-5 text-gray-300 opacity-30" />
          </div>
        </div>
        
       
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Survey Selector */}
        <div className="bg-white rounded border border-gray-300 p-3 shadow-none">
          <h3 className="text-sm font-bold text-black mb-3">Survey List</h3>
          
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black mx-auto"></div>
              <p className="text-xs text-gray-500 mt-2">Loading responses...</p>
            </div>
          ) : (
            <div className="space-y-1">
              {surveys.map((survey) => {
                const surveyResponseCount = allResponses.filter(r => r.surveyId === survey.id).length
                
                return (
                  <button
                    key={survey.id}
                    onClick={() => setSelectedSurvey(survey.id)}
                    className={`w-full text-left px-3 py-2 rounded transition-colors ${
                      selectedSurvey === survey.id
                        ? 'bg-black text-white shadow-sm'
                        : 'text-gray-900 hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-[13px] truncate">{survey.title}</p>
                        <p className={`text-[10px] uppercase font-medium ${selectedSurvey === survey.id ? 'text-gray-300' : 'text-gray-500'}`}>
                          {surveyResponseCount} responses
                        </p>
                      </div>
                      {surveyResponseCount > 0 && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                          selectedSurvey === survey.id 
                            ? 'bg-white text-black' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {surveyResponseCount}
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="lg:col-span-2">
          {selectedSurveyData ? (
            <div className="space-y-4">
              {/* Survey Info */}
              <div className="bg-white rounded border border-gray-300 p-4 shadow-none">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-base font-bold text-black mb-1">{selectedSurveyData.title}</h3>
                    {selectedSurveyData.description && (
                      <p className="text-sm text-gray-600">{selectedSurveyData.description}</p>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                    selectedSurveyData.status === 'published' ? 'bg-green-100 text-green-800' :
                    selectedSurveyData.status === 'active' ? 'bg-blue-100 text-blue-800' :
                    selectedSurveyData.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedSurveyData.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-gray-50 border border-gray-200 rounded p-2">
                    <p className="text-[10px] uppercase font-bold text-gray-400 mb-0.5">Client</p>
                    <p className="text-[11px] font-bold text-black truncate">{selectedSurveyData.clientName || 'General Client'}</p>
                  </div>
                  
                  <div className="bg-gray-50 border border-gray-200 rounded p-2">
                    <p className="text-[10px] uppercase font-bold text-gray-400 mb-0.5">Company</p>
                    <p className="text-[11px] font-bold text-black truncate">{selectedSurveyData.company || 'General Company'}</p>
                  </div>
                  
                  <div className="bg-gray-50 border border-gray-200 rounded p-2">
                    <p className="text-[10px] uppercase font-bold text-gray-400 mb-0.5">Responses</p>
                    <p className="text-[11px] font-bold text-black">
                      {selectedSurveyData.responsesCount || 0}/{selectedSurveyData.sendCount || 0}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 border border-gray-200 rounded p-2">
                    <p className="text-[10px] uppercase font-bold text-gray-400 mb-0.5">Completion</p>
                    <p className="text-[11px] font-bold text-black">
                      {selectedSurveyData.completionRate || 0}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Question Analysis */}
              {uniqueQuestions.length > 0 && (
                <div className="bg-white rounded border border-gray-300 p-4 shadow-none">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-black text-sm">Question Analysis</h4>
                    <p className="text-xs text-gray-500">
                      Based on {surveyResponses.length} response{surveyResponses.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    {uniqueQuestions.map((question) => {
                      const analysis = analyzeQuestion(question)
                      
                      return (
                        <div key={question.id} className="border border-gray-200 rounded-lg p-3">
                          <h5 className="font-medium text-sm text-black mb-2">
                            {question.text} <span className="text-xs text-gray-500">({question.type})</span>
                          </h5>
                          
                          <div className="mb-2">
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {analysis.summary}
                            </span>
                          </div>
                          
                          {analysis.details && analysis.details.length > 0 && (
                            <div className="mt-2">
                              {question.type === 'multiple-choice' || 
                               question.type === 'dropdown' || 
                               question.type === 'checkbox' ? (
                                <div className="space-y-1">
                                  {analysis.details.map((detail: any, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between text-xs">
                                      <span className="text-gray-700">{detail.option}</span>
                                      <div className="flex items-center gap-2">
                                        <span className="text-gray-600">{detail.count} ({detail.percentage}%)</span>
                                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                          <div 
                                            className="h-full bg-blue-600"
                                            style={{ width: `${detail.percentage}%` }}
                                          ></div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="max-h-32 overflow-y-auto">
                                  {analysis.details.slice(0, 10).map((answer: any, idx: number) => (
                                    <div key={idx} className="text-xs text-gray-600 bg-gray-50 p-2 rounded mb-1">
                                      {typeof answer === 'object' ? JSON.stringify(answer) : String(answer)}
                                    </div>
                                  ))}
                                  {analysis.details.length > 10 && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      ... and {analysis.details.length - 10} more
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Responses List */}
              {surveyResponses.length > 0 && (
                <div className="bg-white rounded border border-gray-300 p-4 shadow-none">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-black text-sm">Individual Responses ({surveyResponses.length})</h4>
                    <button 
                      onClick={exportToCSV}
                      className="flex items-center gap-1.5 px-3 py-1 text-[11px] uppercase font-bold bg-black text-white rounded hover:bg-gray-800 transition-colors border border-black"
                    >
                      <Download className="w-3 h-3" />
                      Export CSV
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {surveyResponses.map((response) => (
                      <div key={response.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">
                              Response ID: {response.id.substring(0, 8)}...
                            </p>
                            <p className="text-xs text-gray-500">
                              Submitted: {new Date(response.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <span className="text-[10px] bg-gray-200 text-gray-700 px-2 py-1 rounded">
                            {response.responses.length} answers
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          {response.responses.slice(0, 3).map((resp, idx) => (
                            <div key={idx} className="bg-white border border-gray-300 rounded p-2">
                              <p className="text-xs font-medium text-gray-900 mb-1">{resp.questionText}</p>
                              <p className="text-sm text-black">
                                {typeof resp.answer === 'object' ? JSON.stringify(resp.answer) : String(resp.answer)}
                              </p>
                              <p className="text-[10px] text-gray-500 mt-1">Type: {resp.questionType}</p>
                            </div>
                          ))}
                          
                          {response.responses.length > 3 && (
                            <p className="text-xs text-gray-500 text-center">
                              ... and {response.responses.length - 3} more questions
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {surveyResponses.length === 0 && (
                <div className="bg-white rounded border border-gray-300 p-8 text-center shadow-none">
                  <TrendingUp className="w-8 h-8 text-gray-300 mx-auto mb-2 opacity-50" />
                  <p className="text-sm text-gray-500 mb-1">No responses yet for this survey</p>
                  <p className="text-xs text-gray-400">Share the survey link to start collecting responses</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded border border-gray-300 p-10 text-center shadow-none">
              <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2 opacity-50" />
              <p className="text-sm text-gray-500">Select a survey to view analysis</p>
              {allResponses.length > 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  {allResponses.length} total responses across {surveys.length} surveys
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}