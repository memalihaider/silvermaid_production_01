"use client"

import { motion } from 'framer-motion'
import { ShieldCheck, Lock, Eye, FileText, Shield } from 'lucide-react'
import { useState, useEffect } from 'react'
import { db } from '@/lib/firebase'
import { collection, getDocs } from 'firebase/firestore'

// Firebase Privacy Policy Type
type PrivacyPolicyItem = {
  id: string;
  title: string;
  content: string;
  order?: number;
  createdAt?: any;
  updatedAt?: any;
}

// Icon mapping based on title
const getIconForTitle = (title: string) => {
  const lowerTitle = title.toLowerCase();
  
  if (lowerTitle.includes('information') || lowerTitle.includes('collection') || lowerTitle.includes('data collection')) {
    return ShieldCheck;
  } else if (lowerTitle.includes('security') || lowerTitle.includes('data security') || lowerTitle.includes('protection')) {
    return Lock;
  } else if (lowerTitle.includes('usage') || lowerTitle.includes('disclosure') || lowerTitle.includes('use')) {
    return Eye;
  } else if (lowerTitle.includes('rights') || lowerTitle.includes('your rights') || lowerTitle.includes('access')) {
    return FileText;
  } else if (lowerTitle.includes('cookies') || lowerTitle.includes('tracking')) {
    return Lock;
  } else if (lowerTitle.includes('contact') || lowerTitle.includes('communication') || lowerTitle.includes('questions')) {
    return Eye;
  } else if (lowerTitle.includes('retention') || lowerTitle.includes('storage')) {
    return Shield;
  } else if (lowerTitle.includes('children') || lowerTitle.includes('minors')) {
    return ShieldCheck;
  } else if (lowerTitle.includes('changes') || lowerTitle.includes('updates') || lowerTitle.includes('modifications')) {
    return FileText;
  } else {
    return Shield;
  }
};

// Format content with proper HTML
const formatContent = (content: string) => {
  if (!content) return null;
  
  // Split by lines and filter empty ones
  const lines = content.split('\n').filter(line => line.trim());
  
  return (
    <div className="space-y-4">
      {lines.map((line, index) => {
        const trimmedLine = line.trim();
        
        // Check for bullet points (• or -)
        if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
          const bulletContent = trimmedLine.substring(1).trim();
          return (
            <div key={index} className="flex items-start gap-2 ml-4">
              <span className="text-primary mt-1">•</span>
              <span className="text-slate-600 text-lg leading-relaxed font-medium">{bulletContent}</span>
            </div>
          );
        }
        
        // Check for numbered list (1., 2., etc.)
        if (/^\d+\./.test(trimmedLine)) {
          const number = trimmedLine.match(/^\d+\./)?.[0];
          const listContent = trimmedLine.replace(/^\d+\.\s*/, '');
          return (
            <div key={index} className="flex items-start gap-2 ml-4">
              <span className="text-primary font-bold mt-1">{number}</span>
              <span className="text-slate-600 text-lg leading-relaxed font-medium">
                {listContent}
              </span>
            </div>
          );
        }
        
        // Check if line could be a sub-heading (ends with colon, not too long)
        if (trimmedLine.endsWith(':') && trimmedLine.length < 100 && !trimmedLine.includes('. ')) {
          return (
            <h3 key={index} className="font-bold text-slate-800 text-lg mt-4 mb-2">
              {trimmedLine}
            </h3>
          );
        }
        
        // Regular paragraph
        if (trimmedLine) {
          return (
            <p key={index} className="text-slate-600 text-lg leading-relaxed font-medium">
              {trimmedLine}
            </p>
          );
        }
        
        return null;
      })}
    </div>
  );
};

export default function PrivacyPolicy() {
  const [privacySections, setPrivacySections] = useState<PrivacyPolicyItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch all privacy policy documents from Firebase
  useEffect(() => {
    const fetchPrivacyPolicy = async () => {
      setIsLoading(true)
      try {
        const querySnapshot = await getDocs(collection(db, 'privacy-policy'))
        const sections: PrivacyPolicyItem[] = []
        
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          sections.push({
            id: doc.id,
            title: data.title || 'Privacy Policy Section',
            content: data.content || '',
            order: data.order || 0,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt
          })
        })
        
        // Sort by order (from CMS), then by creation date
        const sortedSections = sections.sort((a, b) => {
          // First sort by order number from CMS
          if (a.order !== b.order) return (a.order || 0) - (b.order || 0)
          
          // If same order, sort by creation date
          try {
            const dateA = a.createdAt?.toDate?.() || new Date(0)
            const dateB = b.createdAt?.toDate?.() || new Date(0)
            return dateA.getTime() - dateB.getTime()
          } catch {
            return 0
          }
        })
        
        setPrivacySections(sortedSections)
      } catch (error) {
        console.error('Error fetching privacy policy:', error)
        // No fallback data - show empty state
        setPrivacySections([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchPrivacyPolicy()
  }, [])

  // Get the latest updated date from all documents
  const getLastUpdated = () => {
    if (privacySections.length === 0) return 'January 2026';
    
    let latestDate = new Date(0);
    
    privacySections.forEach((section) => {
      try {
        if (section.updatedAt) {
          const date = section.updatedAt.toDate();
          if (date > latestDate) {
            latestDate = date;
          }
        } else if (section.createdAt) {
          const date = section.createdAt.toDate();
          if (date > latestDate) {
            latestDate = date;
          }
        }
      } catch (error) {
        // Ignore date parsing errors
      }
    });
    
    if (latestDate.getTime() > 0) {
      return latestDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    
    return 'January 2026';
  }

  return (
    <div className="flex flex-col overflow-hidden pt-20">
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-left max-w-4xl mx-auto"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-6">
              Compliance & Safety
            </span>
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter mb-12 leading-tight uppercase">
              Privacy <span className="text-primary italic">Policy</span>
            </h1>
            
            {isLoading ? (
              <div className="bg-white p-12 md:p-20 rounded-[3rem] shadow-xl shadow-slate-200 border border-slate-100">
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-slate-600">Loading privacy policy...</p>
                </div>
              </div>
            ) : privacySections.length === 0 ? (
              <div className="bg-white p-12 md:p-20 rounded-[3rem] shadow-xl shadow-slate-200 border border-slate-100">
                <div className="text-center py-12">
                  <Shield className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-700 mb-2">No Privacy Policy Content</h3>
                  <p className="text-slate-600 mb-6">
                    Privacy policy content will appear here once added from the CMS.
                  </p>
                  <div className="text-sm text-slate-500">
                    Please add privacy policy sections from the Content Management System.
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-12 bg-white p-12 md:p-20 rounded-[3rem] shadow-xl shadow-slate-200 border border-slate-100">
                {/* Header info */}
                <div className="pb-6 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    
                  </div>
                </div>

                {/* Privacy Policy Sections */}
                {privacySections.map((section, index) => {
                  const Icon = getIconForTitle(section.title);
                  
                  return (
                    <motion.div 
                      key={section.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="space-y-6"
                    >
                      {/* Section Header with Number */}
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="relative">
                            {/* Number Badge */}
                            <div className="absolute -top-2 -left-2 z-10">
                              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary text-white text-xs font-bold">
                                {index + 1}
                              </span>
                            </div>
                            {/* Icon */}
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <Icon className="h-8 w-8 text-primary" />
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-2xl font-black uppercase text-slate-900">
                              {section.title}
                            </h2>
                           
                          </div>
                          
                          {/* Content */}
                          <div className="mt-4">
                            {formatContent(section.content)}
                          </div>
                          
                          {/* Section Metadata */}
                         
                        </div>
                      </div>
                      
                      {/* Divider (except for last item) */}
                      {index < privacySections.length - 1 && (
                        <div className="pt-6">
                          <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}

                {/* Footer */}
                <div className="pt-10 border-t border-slate-100">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="text-slate-400 text-sm font-bold">
                      Last Updated: {getLastUpdated()} | Silver Maid Compliance Department
                    </div>
                    
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  )
}