"use client"

import { motion } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'
import { useState, useEffect } from 'react'
import { db } from '@/lib/firebase'
import { collection, getDocs } from 'firebase/firestore'

// Firebase FAQ Type
type FirebaseFAQ = {
  id: string;
  question: string;
  answer: string;
  category?: string;
  order?: number;
}

// Static FAQs (unchanged)
const staticFAQs = [
  {
    question: "1. What services does Silver Maid Cleaning Services offer in the UAE?",
    answer: "We specialize in professional cleaning services for homes and offices, including Regular home cleaning, Deep cleaning, Move-in/move-out cleaning, Office cleaning, Kitchen and bathroom cleaning, Upholstery and carpet cleaning, Yacht Cleaning, Aeroplane Cleaning, and After Event and Exhibition cleaning. Our services are customizable to meet your specific needs."
  },
  {
    question: "2. How can I book a cleaning service with Silver Maid Cleaning Services?",
    answer: "You can book directly through our website by clicking the 'BOOK ONLINE' button, or call our customer service hotline at 800-SILVERMAID (800 46639675). Our team is available to assist you with scheduling and selecting the right service for your needs."
  },
  {
    question: "3. What areas do you serve in the UAE?",
    answer: "We provide comprehensive cleaning services across the UAE, with a focus on Dubai, Abu Dhabi, and Sharjah. Whether you are in a residential villa in the outskirts or a commercial office in Business Bay, our teams can reach you."
  },
  {
    question: "4. Are your cleaning products safe for children and pets?",
    answer: "Yes, absolutely. We prioritize the health of your family and pets. We use eco-friendly, non-toxic, and biodegradable cleaning solutions that effective against dirt and pathogens but safe for all inhabitants of your home."
  },
  {
    question: "5. Do I need to be home during the cleaning service?",
    answer: "No, you do not need to be present. Many of our clients provide access via security or key boxes. All our staff are thoroughly background-checked, vetted, and supervised to ensure the highest level of trust and security."
  },
  {
    question: "6. How much does a cleaning service cost in the UAE?",
    answer: "Pricing depends on the type of service, the size of the property, and the frequency of cleaning. We offer competitive and transparent pricing with no hidden costs. You can get an instant estimate by contacting us or using our online booking tool."
  },
  {
    question: "7. Can I book a one-time cleaning service?",
    answer: "Yes, we offer flexible booking options including one-time deep cleans, move-in/out services, or event-based cleaning, as well as recurring weekly or monthly maintenance plans."
  },
  {
    question: "8. What happens if I'm not satisfied with the cleaning?",
    answer: "Customer satisfaction is our top priority. If you are not completely satisfied with any area we have cleaned, please notify us within 24 hours, and we will send a team back to reclean the area at no additional cost."
  },
  {
    question: "9. Are your cleaners trained and insured?",
    answer: "Yes, all our cleaners are professionally trained in the latest hygiene standards and safety protocols. Furthermore, they are fully insured, including public liability and workmen's compensation, for your complete peace of mind."
  },
  {
    question: "10. How long does a typical cleaning session take?",
    answer: "A standard session can range from 3 to 4 hours for smaller apartments to a full day (6-8 hours) for large villas or commercial spaces. Deep cleaning and technical services generally require more time than regular maintenance cleaning."
  },
  {
    question: "11. Do you offer same-day cleaning services in the UAE?",
    answer: "We strive to accommodate last-minute requests. Same-day bookings are subject to the availability of our teams, so we recommend booking at least 24 hours in advance whenever possible."
  },
  {
    question: "12. How do I pay for the cleaning service?",
    answer: "We offer multiple convenient payment methods, including secure online credit/debit card payments via our booking portal, bank transfers, or cash on delivery after the service is completed."
  },
  {
    question: "13. Do you bring your own cleaning equipment and supplies?",
    answer: "Yes, our technical teams arrive fully equipped with high-end industrial cleaning machines (steam cleaners, floor scrubbers, etc.) and all necessary premium cleaning supplies."
  },
  {
    question: "14. Can I customize my cleaning plan?",
    answer: "Definitely. We understand that every space is unique. You can customize your cleaning checklist to focus on specific rooms or high-priority areas, ensuring you get the exact service you require."
  }
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const [firebaseFAQs, setFirebaseFAQs] = useState<FirebaseFAQ[]>([])

  // Fetch FAQs from Firebase
  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'faq'))
        const faqsData: FirebaseFAQ[] = []
        
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          faqsData.push({
            id: doc.id,
            question: data.question || '',
            answer: data.answer || '',
            category: data.category || 'General',
            order: data.order || 0
          })
        })
        
        // Sort by order then by question
        const sortedFAQs = faqsData.sort((a, b) => {
          if (a.order !== b.order) return (a.order || 0) - (b.order || 0)
          return a.question.localeCompare(b.question)
        })
        
        setFirebaseFAQs(sortedFAQs)
      } catch (error) {
        console.error('Error fetching FAQs:', error)
        // Error handle silently, UI will still show static FAQs
      }
    }

    fetchFAQs()
  }, [])

  // Process Firebase FAQs to match static FAQ format
  const processedFirebaseFAQs = firebaseFAQs.map((faq, index) => ({
    question: `${staticFAQs.length + index + 1}. ${formatQuestion(faq.question)}`,
    answer: faq.answer
  }))

  // Helper function to format question
  function formatQuestion(question: string): string {
    // Add question mark if missing
    if (!question.trim().endsWith('?')) {
      return question.trim() + '?'
    }
    return question.trim()
  }

  // Combine static and Firebase FAQs
  const allFAQs = [
    ...staticFAQs,
    ...processedFirebaseFAQs
  ]

  return (
    <div className="flex flex-col overflow-hidden pt-20">
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto mb-20"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-6">
              Knowledge Base
            </span>
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter mb-8 leading-tight">
              Common <span className="text-primary italic">Questions</span>
            </h1>
            <p className="text-xl text-slate-600 font-medium">
              Everything you need to know about our premium cleaning services in Dubai and across the UAE.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {allFAQs.map((faq, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="mb-4"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className={`w-full flex items-center justify-between p-8 rounded-4xl text-left transition-all ${
                    openIndex === i 
                    ? "bg-slate-900 text-white shadow-2xl shadow-slate-400" 
                    : "bg-slate-50 text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <span className="text-xl font-black pr-10">{faq.question}</span>
                  <div className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                    openIndex === i ? "bg-primary text-white" : "bg-slate-200 text-slate-600"
                  }`}>
                    {openIndex === i ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </div>
                </button>
                {openIndex === i && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="p-10 text-slate-600 text-lg font-medium leading-relaxed bg-white/50"
                  >
                    {faq.answer}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}