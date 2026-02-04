'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { db } from '@/lib/firebase'
import { doc, getDoc, addDoc, collection, serverTimestamp, updateDoc } from 'firebase/firestore'
import { CheckCircle } from 'lucide-react'

export default function SurveyPage() {
  const params = useParams()
  const surveyId = params.id as string
  
  const [survey, setSurvey] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch survey data
  useEffect(() => {
    const fetchSurvey = async () => {
      if (!surveyId) return
      
      try {
        console.log('Fetching survey with ID:', surveyId)
        const surveyDoc = await getDoc(doc(db, 'surveys', surveyId))
        
        if (surveyDoc.exists()) {
          const data = surveyDoc.data()
          console.log('Raw Firebase data:', data)
          
          // Process sections and questions to add missing properties
          const processedSections = (data.sections || []).map((section: any) => ({
            ...section,
            questions: (section.questions || []).map((question: any) => {
              // Add missing properties based on question type
              const processedQuestion = { ...question }
              
              if (question.type === 'NPS') {
                processedQuestion.scaleLabels = question.scaleLabels || { 
                  min: 'Not at all likely', 
                  max: 'Extremely likely' 
                }
                processedQuestion.min = question.min || 0
                processedQuestion.max = question.max || 10
                processedQuestion.step = question.step || 1
              }
              
              if (question.type === 'scale') {
                processedQuestion.scaleLabels = question.scaleLabels || { 
                  min: 'Very Poor', 
                  max: 'Excellent' 
                }
                processedQuestion.min = question.min || 1
                processedQuestion.max = question.max || 5
                processedQuestion.step = question.step || 1
              }
              
              if (question.type === 'rating') {
                processedQuestion.max = question.max || 5
              }
              
              if (question.type === 'multiple-choice' || question.type === 'checkbox' || question.type === 'dropdown') {
                processedQuestion.options = question.options || ['Option 1', 'Option 2']
              }
              
              return processedQuestion
            })
          }))
          
          setSurvey({
            id: surveyDoc.id,
            title: data.title || 'Untitled Survey',
            description: data.description || '',
            sections: processedSections,
            status: data.status || 'draft',
            responsesCount: data.responsesCount || 0
          })
        } else {
          console.log('No survey found with ID:', surveyId)
        }
      } catch (error) {
        console.error('Error fetching survey:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchSurvey()
  }, [surveyId])

  // Handle answer change
  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }))
    
    if (errors[questionId]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[questionId]
        return newErrors
      })
    }
  }

  // Validate form
  const validateForm = (): boolean => {
    if (!survey || !survey.sections) return false
    
    const newErrors: Record<string, string> = {}
    
    survey.sections.forEach((section: any) => {
      if (section.questions && Array.isArray(section.questions)) {
        section.questions.forEach((question: any) => {
          if (question.required) {
            const answer = answers[question.id]
            if (!answer || (Array.isArray(answer) && answer.length === 0)) {
              newErrors[question.id] = 'This question is required'
            }
          }
        })
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Submit response
  const handleSubmit = async () => {
    if (!survey || !validateForm()) {
      alert('Please fill all required fields')
      return
    }
    
    setSubmitting(true)
    
    try {
      const responses: any[] = []
      
      survey.sections.forEach((section: any) => {
        if (section.questions && Array.isArray(section.questions)) {
          section.questions.forEach((question: any) => {
            const answer = answers[question.id]
            if (answer !== undefined && answer !== null && answer !== '') {
              responses.push({
                questionId: question.id,
                questionText: question.text,
                questionType: question.type,
                answer: answer
              })
            }
          })
        }
      })
      
      console.log('Submitting responses:', responses)
      
      // Save to Firebase
      await addDoc(collection(db, 'survey_submissions'), {
        surveyId: survey.id,
        surveyTitle: survey.title,
        responses: responses,
        submittedAt: serverTimestamp(),
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      })
      
      // Update response count
      await updateDoc(doc(db, 'surveys', survey.id), {
        responsesCount: survey.responsesCount + 1,
        updatedAt: serverTimestamp()
      })
      
      setSubmitted(true)
    } catch (error) {
      console.error('Error submitting response:', error)
      alert('Error submitting response. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Render question input
  const renderQuestionInput = (question: any) => {
    const value = answers[question.id] || ''
    const error = errors[question.id]
    
    console.log('Rendering question:', question)
    
    const commonInputClasses = `w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:ring-2 focus:ring-blue-500`
    
    switch(question.type) {
      case 'text':
        return (
          <div>
            <input
              type="text"
              value={value}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              placeholder={question.placeholder || 'Enter your answer...'}
              className={commonInputClasses}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        )
      
      case 'email':
        return (
          <div>
            <input
              type="email"
              value={value}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              placeholder={question.placeholder || 'example@email.com'}
              className={commonInputClasses}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        )
      
      case 'number':
        return (
          <div>
            <input
              type="number"
              value={value}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              placeholder={question.placeholder || 'Enter a number...'}
              className={commonInputClasses}
              min={question.min}
              max={question.max}
              step={question.step}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        )
      
      case 'textarea':
        return (
          <div>
            <textarea
              value={value}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              placeholder={question.placeholder || 'Enter your answer...'}
              rows={4}
              className={commonInputClasses}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        )
      
      case 'multiple-choice':
        return (
          <div className="space-y-2">
            {question.options && question.options.map((option: string, idx: number) => (
              <label key={idx} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span>{option}</span>
              </label>
            ))}
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        )
      
      case 'dropdown':
        return (
          <div>
            <select
              value={value}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              className={`${commonInputClasses} bg-white`}
            >
              <option value="">Select an option</option>
              {question.options && question.options.map((option: string, idx: number) => (
                <option key={idx} value={option}>{option}</option>
              ))}
            </select>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        )
      
      case 'checkbox':
        return (
          <div className="space-y-2">
            {question.options && question.options.map((option: string, idx: number) => {
              const currentValue = Array.isArray(value) ? value : []
              const isChecked = currentValue.includes(option)
              
              return (
                <label key={idx} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      const newValue = e.target.checked
                        ? [...currentValue, option]
                        : currentValue.filter((item: string) => item !== option)
                      handleAnswerChange(question.id, newValue)
                    }}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span>{option}</span>
                </label>
              )
            })}
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        )
      
      case 'rating':
        const ratingMax = question.max || 5
        return (
          <div className="space-y-2">
            <div className="flex gap-1">
              {Array.from({ length: ratingMax }, (_, i) => i + 1).map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleAnswerChange(question.id, star)}
                  className={`text-3xl ${value >= star ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-300`}
                >
                  ★
                </button>
              ))}
            </div>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        )
      
      case 'scale':
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">{question.scaleLabels?.min || 'Very Poor'}</span>
              <span className="text-sm text-gray-600">{question.scaleLabels?.max || 'Excellent'}</span>
            </div>
            <input
              type="range"
              min={question.min || 1}
              max={question.max || 5}
              step={question.step || 1}
              value={value || (question.min || 1)}
              onChange={(e) => handleAnswerChange(question.id, parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-sm">
              <span>{question.min || 1}</span>
              <span className="font-medium">{value || (question.min || 1)}</span>
              <span>{question.max || 5}</span>
            </div>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        )
      
      case 'NPS':
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">{question.scaleLabels?.min || 'Not at all likely'}</span>
              <span className="text-sm text-gray-600">{question.scaleLabels?.max || 'Extremely likely'}</span>
            </div>
            <input
              type="range"
              min={question.min || 0}
              max={question.max || 10}
              step={question.step || 1}
              value={value || (question.min || 0)}
              onChange={(e) => handleAnswerChange(question.id, parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-sm">
              <span>{question.min || 0}</span>
              <span className="font-medium">{value || (question.min || 0)}</span>
              <span>{question.max || 10}</span>
            </div>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        )
      
      case 'date':
        return (
          <div>
            <input
              type="date"
              value={value}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              className={commonInputClasses}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        )
      
      default:
        return (
          <div>
            <input
              type="text"
              value={value}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              placeholder="Enter your answer..."
              className={commonInputClasses}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        )
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading survey...</p>
        </div>
      </div>
    )
  }

  // No survey found
  if (!survey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Survey Not Found</h2>
          <p className="mt-2 text-gray-600">The survey you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    )
  }

  // Submitted state
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
          <p className="text-gray-600 mb-6">Your response has been submitted successfully.</p>
          <p className="text-sm text-gray-500">We appreciate your feedback.</p>
        </div>
      </div>
    )
  }

  // Calculate total questions
  const totalQuestions = survey.sections?.reduce((total: number, section: any) => {
    return total + (section.questions?.length || 0)
  }, 0) || 0

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Data Info */}
       
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Survey Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
            <h1 className="text-3xl font-bold mb-2">{survey.title}</h1>
            {survey.description && (
              <p className="text-blue-100">{survey.description}</p>
            )}
           
          </div>
          
          {/* Survey Form */}
          {totalQuestions === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">This survey has no questions yet.</p>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="p-6">
              {survey.sections?.map((section: any, sectionIndex: number) => {
                const sectionQuestions = section.questions || []
                
                if (sectionQuestions.length === 0) return null
                
                return (
                  <div key={section.id || sectionIndex} className="mb-8 last:mb-0">
                    {/* Section Header */}
                    <div className="mb-4 pb-4 border-b border-gray-200">
                      <h2 className="text-xl font-bold text-gray-900">
                        {section.title || `Section ${sectionIndex + 1}`}
                      </h2>
                      {section.description && (
                        <p className="text-gray-600 mt-1">{section.description}</p>
                      )}
                    </div>
                    
                    {/* Questions List */}
                    <div className="space-y-6">
                      {sectionQuestions.map((question: any, questionIndex: number) => (
                        <div key={question.id || questionIndex} className="border border-gray-300 rounded-lg overflow-hidden">
                          {/* Question Header */}
                          <div className="bg-gray-100 px-4 py-3 border-b border-gray-300">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium text-gray-900">
                                {questionIndex + 1}. {question.text}
                              </h3>
                              {question.required && (
                                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                                  Required
                                </span>
                              )}
                            </div>
                            {question.placeholder && (
                              <p className="text-sm text-gray-600 mt-1">{question.placeholder}</p>
                            )}
                          </div>
                          
                          {/* Answer Input Box */}
                          <div className="p-4">
                            {renderQuestionInput(question)}
                          </div>
                          
                          {/* Question Type Info */}
                          <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
                            <p className="text-xs text-gray-500">
                              Type: <span className="font-medium">{question.type}</span>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
              
              {/* Submit Button */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <h3 className="font-medium text-green-800 mb-1">Ready to Submit?</h3>
                  <p className="text-sm text-green-700">
                    You have answered {Object.keys(answers).length} of {totalQuestions} questions.
                  </p>
                </div>
                
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </span>
                  ) : (
                    'Submit Survey'
                  )}
                </button>
                <p className="text-sm text-gray-500 mt-3 text-center">
                  Your responses will be recorded anonymously
                </p>
              </div>
            </form>
          )}
        </div>
        
        {/* Debug Info (for development) */}
       
      </div>
    </div>
  )
}