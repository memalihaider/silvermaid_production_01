'use client'

import { useState, useMemo } from 'react'
import { Star, Target, Gift, Clock, CheckCircle2, AlertCircle, Send, ExternalLink } from 'lucide-react'

export default function ReviewRequestPage() {
  const [jobs, setJobs] = useState<any[]>([
    {
      id: 1,
      clientName: 'Acme Corporation',
      serviceType: 'Deep Cleaning',
      completionDate: '2025-12-23',
      npsScore: 9,
      sentiment: 'Very Positive',
      review: {
        requested: true,
        requestedAt: '2025-12-23 15:45',
        reviewPlatform: 'Google',
        status: 'Completed',
        reviewText: 'Excellent service! Professional team, arrived on time, and did an amazing job. Highly recommend!',
        rating: 5,
        completedAt: '2025-12-23 18:20',
        incentiveOffered: 'AED 25 Gift Card',
        incentiveRedeemed: false,
        referralLink: 'https://ref.cleaningpro.com/acme-001',
        referralEarned: false
      }
    },
    {
      id: 2,
      clientName: 'Tech Solutions Inc',
      serviceType: 'Office Maintenance',
      completionDate: '2025-12-22',
      npsScore: 8,
      sentiment: 'Positive',
      review: {
        requested: true,
        requestedAt: '2025-12-22 17:30',
        reviewPlatform: 'Google',
        status: 'Pending',
        reviewText: '',
        rating: 0,
        completedAt: null,
        incentiveOffered: 'AED 25 Gift Card',
        incentiveRedeemed: false,
        referralLink: 'https://ref.cleaningpro.com/techsol-002',
        referralEarned: false
      }
    },
    {
      id: 3,
      clientName: 'Medical Center West',
      serviceType: 'Post-Construction Cleaning',
      completionDate: '2025-12-21',
      npsScore: null,
      sentiment: 'Pending',
      review: {
        requested: false,
        requestedAt: null,
        reviewPlatform: null,
        status: 'Not Requested',
        reviewText: '',
        rating: 0,
        completedAt: null,
        incentiveOffered: null,
        incentiveRedeemed: false,
        referralLink: null,
        referralEarned: false
      }
    },
    {
      id: 4,
      clientName: 'Downtown Plaza',
      serviceType: 'Regular Maintenance',
      completionDate: '2025-12-20',
      npsScore: 7,
      sentiment: 'Positive',
      review: {
        requested: true,
        requestedAt: '2025-12-20 18:15',
        reviewPlatform: 'Facebook',
        status: 'Completed',
        reviewText: 'Good service, arrived on time. Would have appreciated a heads-up about the scheduling.',
        rating: 4,
        completedAt: '2025-12-21 09:00',
        incentiveOffered: 'AED 25 Gift Card',
        incentiveRedeemed: true,
        referralLink: 'https://ref.cleaningpro.com/plaza-003',
        referralEarned: true
      }
    }
  ])

  const [selectedJobId, setSelectedJobId] = useState(1)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewForm, setReviewForm] = useState({
    platform: 'Google',
    incentiveOffered: 'AED 25 Gift Card'
  })

  const selectedJob = jobs.find(j => j.id === selectedJobId) || jobs[0]

  const stats = useMemo(() => ({
    total: jobs.length,
    requested: jobs.filter(j => j.review.requested).length,
    completed: jobs.filter(j => j.review.status === 'Completed').length,
    pending: jobs.filter(j => j.review.status === 'Pending').length,
    avgRating: jobs.filter(j => j.review.rating > 0).length > 0
      ? (jobs.filter((j: any) => j.review.rating > 0).reduce((sum: number, j: any) => sum + j.review.rating, 0) / jobs.filter((j: any) => j.review.rating > 0).length).toFixed(1)
      : 0,
    fiveStarReviews: jobs.filter(j => j.review.rating === 5).length,
    referralsGenerated: jobs.filter(j => j.review.referralEarned).length,
    smartTiming: 'Sent within 24hrs'
  }), [jobs])

  const getSmartTimingRecommendation = (job: any) => {
    if (job.npsScore === null) return 'Wait for feedback'
    if (job.npsScore >= 9) return 'Send immediately (Promoter)'
    if (job.npsScore >= 7) return 'Send after 1 day'
    return 'Follow up internally first'
  }

  const getIncentiveSuggestion = (job: any) => {
    if (job.npsScore >= 9) return 'AED 50 Referral Bonus'
    return 'AED 25 Gift Card'
  }

  const handleSendReviewRequest = () => {
    setJobs(jobs.map(j =>
      j.id === selectedJob.id
        ? {
            ...j,
            review: {
              ...j.review,
              requested: true,
              requestedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
              reviewPlatform: reviewForm.platform,
              status: 'Pending',
              incentiveOffered: reviewForm.incentiveOffered,
              referralLink: `https://ref.cleaningpro.com/${j.clientName.toLowerCase().replace(/\s+/g, '-')}-${j.id}`
            }
          }
        : j
    ))
    setShowReviewModal(false)
  }

  const handleCompleteReview = (jobId: number) => {
    setJobs(jobs.map(j =>
      j.id === jobId
        ? {
            ...j,
            review: {
              ...j.review,
              status: 'Completed',
              completedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
              rating: 5,
              reviewText: 'Great service! Would recommend.',
              referralEarned: true
            }
          }
        : j
    ))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-linear-to-r from-amber-600 to-orange-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold">Review Request Management</h1>
        <p className="text-amber-100 mt-1">Smart timing, incentive triggers, and referral tracking</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Total Jobs</p>
          <p className="text-2xl font-bold text-amber-600">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Reviews Requested</p>
          <p className="text-2xl font-bold text-blue-600">{stats.requested}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Reviews Completed</p>
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Avg Rating</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.avgRating}⭐</p>
          <p className="text-xs text-gray-500 mt-1">{stats.fiveStarReviews} five-star</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Referrals Generated</p>
          <p className="text-2xl font-bold text-purple-600">{stats.referralsGenerated}</p>
        </div>
      </div>

      {/* Job Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {jobs.map(job => (
          <button
            key={job.id}
            onClick={() => setSelectedJobId(job.id)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              selectedJobId === job.id
                ? 'bg-amber-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {job.clientName}
            {job.review.completed && <span className="ml-1">✓</span>}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Review Status */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-600" />
            Review Status
          </h2>
          <div className="space-y-4">
            <div className={`p-4 rounded-lg border-2 ${
              selectedJob.review.status === 'Completed' ? 'border-green-300 bg-green-50' :
              selectedJob.review.status === 'Pending' ? 'border-yellow-300 bg-yellow-50' :
              'border-gray-300 bg-gray-50'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold">{selectedJob.review.status}</p>
                {selectedJob.review.status === 'Completed' && <CheckCircle2 className="w-5 h-5 text-green-600" />}
              </div>
              {selectedJob.review.requestedAt && (
                <p className="text-sm text-gray-600">Requested: {selectedJob.review.requestedAt}</p>
              )}
              {selectedJob.review.completedAt && (
                <p className="text-sm text-green-600 font-semibold">Completed: {selectedJob.review.completedAt}</p>
              )}
            </div>

            {selectedJob.review.completed && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Rating</p>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-6 h-6 ${
                        i < selectedJob.review.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-sm text-gray-600 mb-2">Review Platform</p>
              <p className="font-semibold">{selectedJob.review.reviewPlatform || 'Not selected'}</p>
            </div>
          </div>
        </div>

        {/* Smart Timing & Incentives */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            Smart Timing & Incentives
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">Timing Recommendation</p>
              <p className={`font-semibold px-3 py-2 rounded text-sm ${
                getSmartTimingRecommendation(selectedJob).includes('Promoter')
                  ? 'bg-green-100 text-green-700'
                  : getSmartTimingRecommendation(selectedJob).includes('Wait')
                    ? 'bg-gray-100 text-gray-700'
                    : 'bg-blue-100 text-blue-700'
              }`}>
                {getSmartTimingRecommendation(selectedJob)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Based on NPS score and feedback sentiment</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">Incentive Suggestion</p>
              <p className="font-semibold text-sm px-3 py-2 bg-purple-100 text-purple-700 rounded">
                {getIncentiveSuggestion(selectedJob)}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">Incentive Offered</p>
              <p className="font-semibold text-sm">{selectedJob.review.incentiveOffered || 'None'}</p>
              {selectedJob.review.incentiveRedeemed && (
                <p className="text-xs text-green-600 font-semibold mt-1">✓ Redeemed</p>
              )}
            </div>
          </div>
        </div>

        {/* Review Content */}
        {selectedJob.review.reviewText && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 col-span-2">
            <h2 className="text-xl font-bold mb-4">Review Content</h2>
            <div className="p-4 bg-amber-50 border-l-4 border-amber-600 rounded">
              <p className="text-gray-800">"{selectedJob.review.reviewText}"</p>
              <div className="flex gap-1 mt-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < selectedJob.review.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Referral Tracking */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Gift className="w-5 h-5 text-amber-600" />
            Referral Tracking
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600 mb-2">Referral Link</p>
              {selectedJob.review.referralLink ? (
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-gray-100 p-2 rounded border border-gray-200 overflow-hidden text-ellipsis">
                    {selectedJob.review.referralLink}
                  </code>
                  <button className="p-2 bg-gray-200 rounded hover:bg-gray-300">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No referral link generated</p>
              )}
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">Referral Status</p>
              <p className={`font-semibold text-sm px-3 py-2 rounded w-fit ${
                selectedJob.review.referralEarned
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {selectedJob.review.referralEarned ? '✓ Referral Earned' : 'No Referral Yet'}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-600" />
            Review Actions
          </h2>
          <div className="space-y-2">
            {!selectedJob.review.requested ? (
              <button
                onClick={() => setShowReviewModal(true)}
                className="w-full px-4 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send Review Request
              </button>
            ) : (
              <>
                <button
                  disabled
                  className="w-full px-4 py-3 bg-green-100 text-green-700 rounded-lg font-medium cursor-default"
                >
                  ✓ Request Sent
                </button>
                {selectedJob.review.status === 'Pending' && (
                  <button
                    onClick={() => handleCompleteReview(selectedJob.id)}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
                  >
                    Mark as Completed
                  </button>
                )}
              </>
            )}
            <button className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium text-sm">
              View Review on Platform
            </button>
          </div>
        </div>
      </div>

      {/* Review Request Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Send Review Request</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Platform
                </label>
                <div className="space-y-2">
                  {['Google', 'Facebook', 'Yelp', 'BBB'].map(platform => (
                    <button
                      key={platform}
                      onClick={() => setReviewForm({ ...reviewForm, platform })}
                      className={`w-full px-4 py-2 rounded border-2 transition-colors text-left ${
                        reviewForm.platform === platform
                          ? 'border-amber-600 bg-amber-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {platform}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Incentive Offer
                </label>
                <div className="space-y-2">
                  {['No Incentive', 'AED 25 Gift Card', 'AED 50 Referral Bonus'].map(incentive => (
                    <button
                      key={incentive}
                      onClick={() => setReviewForm({ ...reviewForm, incentiveOffered: incentive })}
                      className={`w-full px-4 py-2 rounded border-2 transition-colors text-left ${
                        reviewForm.incentiveOffered === incentive
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {incentive}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                <p className="font-semibold mb-1">Smart Timing:</p>
                <p>Request will be sent immediately to maximize engagement while the experience is fresh.</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowReviewModal(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSendReviewRequest}
                className="flex-1 px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 font-medium flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
