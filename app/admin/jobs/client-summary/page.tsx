'use client'

import { useState, useMemo } from 'react'
import { Users, TrendingUp, History, Gift, AlertCircle, Repeat2, Activity } from 'lucide-react'

export default function ClientSummaryPage() {
  const [clients, setClients] = useState<any[]>([
    {
      id: 1,
      name: 'Acme Corporation',
      email: 'contact@acme.com',
      phone: '(555) 123-4567',
      joinDate: '2024-06-15',
      totalServices: 12,
      totalSpent: 15800.00,
      serviceHistory: [
        { date: '2025-12-23', service: 'Deep Cleaning', cost: 1250.00, rating: 5 },
        { date: '2025-12-08', service: 'Deep Cleaning', cost: 1250.00, rating: 5 },
        { date: '2025-11-20', service: 'Window Cleaning', cost: 450.00, rating: 4 },
        { date: '2025-10-15', service: 'Deep Cleaning', cost: 1250.00, rating: 5 }
      ],
      satisfactionIndex: 0.94,
      satisfactionTrend: 'up',
      npsScores: [9, 9, 8, 9, 9],
      qualityScore: 4.8,
      referralTrigger: true,
      referralReward: 'Sent AED 50 Bonus',
      repeatServiceSuggestion: {
        service: 'Deep Cleaning',
        daysUntilDue: 15,
        recommendation: 'Schedule within 2 weeks'
      },
      lastServiceDate: '2025-12-23',
      nextScheduledService: '2026-01-23',
      loyaltyStatus: 'Premium Tier',
      monthlyAverage: 1316.67,
      paymentReliability: 100,
      communicationPreference: 'Email'
    },
    {
      id: 2,
      name: 'Tech Solutions Inc',
      email: 'facilities@techsol.com',
      phone: '(555) 987-6543',
      joinDate: '2024-09-22',
      totalServices: 8,
      totalSpent: 7150.00,
      serviceHistory: [
        { date: '2025-12-22', service: 'Office Maintenance', cost: 895.00, rating: 4 },
        { date: '2025-12-01', service: 'Office Maintenance', cost: 895.00, rating: 4 },
        { date: '2025-11-10', service: 'Floor Waxing', cost: 650.00, rating: 4 },
        { date: '2025-10-20', service: 'Office Maintenance', cost: 895.00, rating: 5 }
      ],
      satisfactionIndex: 0.78,
      satisfactionTrend: 'stable',
      npsScores: [8, 7, 8, 7, 8],
      qualityScore: 4.2,
      referralTrigger: false,
      referralReward: null,
      repeatServiceSuggestion: {
        service: 'Office Maintenance',
        daysUntilDue: 7,
        recommendation: 'Monthly scheduled service'
      },
      lastServiceDate: '2025-12-22',
      nextScheduledService: '2026-01-22',
      loyaltyStatus: 'Standard',
      monthlyAverage: 894.00,
      paymentReliability: 100,
      communicationPreference: 'Email'
    },
    {
      id: 3,
      name: 'Medical Center West',
      email: 'admin@medcenter.com',
      phone: '(555) 456-7890',
      joinDate: '2025-06-10',
      totalServices: 4,
      totalSpent: 8900.00,
      serviceHistory: [
        { date: '2025-12-21', service: 'Post-Construction Cleaning', cost: 2150.00, rating: 5 },
        { date: '2025-12-15', service: 'Post-Construction Cleaning', cost: 2100.00, rating: 5 },
        { date: '2025-12-08', service: 'Post-Construction Cleaning', cost: 2200.00, rating: 5 },
        { date: '2025-12-01', service: 'Post-Construction Cleaning', cost: 2450.00, rating: 5 }
      ],
      satisfactionIndex: 0.98,
      satisfactionTrend: 'up',
      npsScores: [10, 10, 9, 10],
      qualityScore: 4.9,
      referralTrigger: true,
      referralReward: 'Eligible for AED 100 bonus',
      repeatServiceSuggestion: {
        service: 'Maintenance Cleaning',
        daysUntilDue: 30,
        recommendation: 'Offer monthly maintenance plan'
      },
      lastServiceDate: '2025-12-21',
      nextScheduledService: '2026-01-21',
      loyaltyStatus: 'VIP Tier',
      monthlyAverage: 2225.00,
      paymentReliability: 100,
      communicationPreference: 'Phone'
    }
  ])

  const [selectedClientId, setSelectedClientId] = useState(1)
  const selectedClient = clients.find(c => c.id === selectedClientId) || clients[0]

  const stats = useMemo(() => ({
    totalClients: clients.length,
    avgSatisfaction: (clients.reduce((sum, c) => sum + c.satisfactionIndex, 0) / clients.length * 100).toFixed(0),
    avgQualityScore: (clients.reduce((sum, c) => sum + c.qualityScore, 0) / clients.length).toFixed(1),
    referralEligible: clients.filter(c => c.referralTrigger).length,
    totalRevenue: clients.reduce((sum, c) => sum + c.totalSpent, 0),
    avgClientValue: (clients.reduce((sum, c) => sum + c.totalSpent, 0) / clients.length).toFixed(2)
  }), [clients])

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return '↗️'
    if (trend === 'down') return '↘️'
    return '→'
  }

  const getLoyaltyColor = (status: string) => {
    if (status === 'VIP Tier') return 'bg-purple-100 text-purple-700'
    if (status === 'Premium Tier') return 'bg-blue-100 text-blue-700'
    return 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-linear-to-r from-indigo-600 to-blue-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold">Client Summary & Insights</h1>
        <p className="text-indigo-100 mt-1">Customer history, quality scores, satisfaction trends, and repeat service suggestions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-6 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Total Clients</p>
          <p className="text-2xl font-bold text-indigo-600">{stats.totalClients}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Avg Satisfaction</p>
          <p className="text-2xl font-bold text-green-600">{stats.avgSatisfaction}%</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Avg Quality Score</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.avgQualityScore}⭐</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Referral Eligible</p>
          <p className="text-2xl font-bold text-pink-600">{stats.referralEligible}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Total Revenue</p>
          <p className="text-2xl font-bold text-purple-600">${stats.totalRevenue.toFixed(0)}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Avg Client Value</p>
          <p className="text-2xl font-bold text-blue-600">${stats.avgClientValue}</p>
        </div>
      </div>

      {/* Client Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {clients.map(client => (
          <button
            key={client.id}
            onClick={() => setSelectedClientId(client.id)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              selectedClientId === client.id
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {client.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Client Profile */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Client Profile
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-semibold text-lg">{selectedClient.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Contact</p>
              <p className="font-semibold text-sm">{selectedClient.email}</p>
              <p className="font-semibold text-sm">{selectedClient.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Member Since</p>
              <p className="font-semibold">{selectedClient.joinDate}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Loyalty Status</p>
              <p className={`font-semibold text-sm px-3 py-1 rounded w-fit ${getLoyaltyColor(selectedClient.loyaltyStatus)}`}>
                {selectedClient.loyaltyStatus}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Communication Preference</p>
              <p className="font-semibold">{selectedClient.communicationPreference}</p>
            </div>
          </div>
        </div>

        {/* Satisfaction & Quality */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            Satisfaction & Quality
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <p className="text-sm font-medium">Satisfaction Index</p>
                <p className="text-lg font-bold text-green-600">{(selectedClient.satisfactionIndex * 100).toFixed(0)}%</p>
              </div>
              <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-green-500 to-green-600"
                  style={{ width: `${selectedClient.satisfactionIndex * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Trend: {getTrendIcon(selectedClient.satisfactionTrend)}</p>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <p className="text-sm font-medium">Quality Score</p>
                <p className="text-lg font-bold text-yellow-600">{selectedClient.qualityScore.toFixed(1)}⭐</p>
              </div>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-2 rounded ${
                      i < Math.floor(selectedClient.qualityScore)
                        ? 'bg-yellow-400'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Recent NPS Scores</p>
              <div className="flex gap-1">
                {selectedClient.npsScores.map((score: number, i: number) => (
                  <div
                    key={i}
                    className={`flex-1 py-2 px-1 rounded text-center text-xs font-bold text-white ${
                      score >= 9 ? 'bg-green-600' :
                      score >= 7 ? 'bg-blue-600' :
                      'bg-yellow-600'
                    }`}
                  >
                    {score}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Service History */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600" />
            Service History
          </h2>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Total Services</p>
                <p className="text-2xl font-bold text-indigo-600">{selectedClient.totalServices}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-blue-600">${selectedClient.totalSpent.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Monthly Average</p>
                <p className="text-lg font-bold text-purple-600">${selectedClient.monthlyAverage.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment Reliability</p>
                <p className="text-lg font-bold text-green-600">{selectedClient.paymentReliability}%</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Recent Services</p>
              <div className="space-y-2">
                {selectedClient.serviceHistory.slice(0, 3).map((service: any, i: number) => (
                  <div key={i} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                    <div>
                      <p className="font-semibold">{service.service}</p>
                      <p className="text-gray-600 text-xs">{service.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">${service.cost.toFixed(2)}</p>
                      <p className="text-yellow-600">{'⭐'.repeat(service.rating)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Repeat Service & Referral */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Repeat2 className="w-5 h-5 text-indigo-600" />
            Repeat Service & Referrals
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">Next Service Recommendation</p>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="font-semibold text-blue-900">{selectedClient.repeatServiceSuggestion.service}</p>
                <p className="text-sm text-blue-800 mt-1">{selectedClient.repeatServiceSuggestion.recommendation}</p>
                <p className="text-xs text-blue-700 mt-1">📅 In {selectedClient.repeatServiceSuggestion.daysUntilDue} days</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">Referral Status</p>
              {selectedClient.referralTrigger ? (
                <div className="p-3 bg-pink-50 border border-pink-200 rounded">
                  <p className="font-semibold text-pink-900">✓ Eligible for Referral Reward</p>
                  <p className="text-sm text-pink-800 mt-1">{selectedClient.referralReward}</p>
                  <button className="mt-2 w-full px-3 py-1 bg-pink-600 text-white rounded text-sm hover:bg-pink-700">
                    Send Referral Bonus
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded">
                  <p className="font-semibold text-gray-700">Standard Client</p>
                  <p className="text-sm text-gray-600 mt-1">Maintain quality to unlock referral rewards</p>
                </div>
              )}
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">Next Scheduled Service</p>
              <p className="font-semibold">{selectedClient.nextScheduledService}</p>
              <p className="text-xs text-gray-500 mt-1">Last service: {selectedClient.lastServiceDate}</p>
            </div>
          </div>
        </div>

        {/* Comprehensive Timeline */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 col-span-2">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            Full Service Timeline
          </h2>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {selectedClient.serviceHistory.map((service: any, i: number) => (
              <div key={i} className="flex gap-4 pb-3 border-b border-gray-200 last:border-0">
                <div className="text-xs text-gray-500 font-semibold whitespace-nowrap">{service.date}</div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{service.service}</p>
                  <p className="text-xs text-gray-600">Cost: ${service.cost.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <div className="text-yellow-600">{'⭐'.repeat(service.rating)}</div>
                  <p className="text-xs text-gray-500">{service.rating}/5</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
