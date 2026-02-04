'use client'

import { useState, useEffect } from 'react'
import { 
  User, 
  Bell, 
  Shield, 
  Globe, 
  CreditCard, 
  Mail, 
  Smartphone, 
  Save,
  ChevronRight,
  Moon,
  Sun,
  Monitor
} from 'lucide-react'
import { db } from '@/lib/firebase'
import { doc, setDoc, getDoc } from 'firebase/firestore'

export default function Settings() {
  const [activeSection, setActiveSection] = useState('profile')
  const [showSave, setShowSave] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // Profile Data
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    role: 'Administrator'
  })
  
  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    meetingReminders: true,
    jobAlerts: true,
    systemUpdates: false
  })
  
  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactor: false,
    sessionTimeout: '30',
    passwordExpiry: '90'
  })
  
  // Billing Settings
  const [billingSettings, setBillingSettings] = useState({
    billingEmail: '',
    paymentMethod: 'Bank Transfer',
    invoiceFrequency: 'Monthly',
    autoRenewal: true
  })
  
  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    theme: 'light',
    language: 'English',
    timezone: 'UAE (GMT+4)',
    dateFormat: 'DD/MM/YYYY'
  })

  // Fetch settings from Firebase on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'profile-setting', 'admin-settings')
        const docSnap = await getDoc(docRef)
        
        if (docSnap.exists()) {
          const data = docSnap.data()
          
          // Set profile data
          if (data.profile) {
            setProfileData({
              fullName: data.profile.fullName || '',
              email: data.profile.email || '',
              phone: data.profile.phone || '',
              company: data.profile.company || '',
              role: data.profile.role || 'Administrator'
            })
          }
          
          // Set notification settings
          if (data.notifications) {
            setNotificationSettings({
              emailNotifications: data.notifications.emailNotifications !== undefined ? data.notifications.emailNotifications : true,
              smsNotifications: data.notifications.smsNotifications !== undefined ? data.notifications.smsNotifications : true,
              meetingReminders: data.notifications.meetingReminders !== undefined ? data.notifications.meetingReminders : true,
              jobAlerts: data.notifications.jobAlerts !== undefined ? data.notifications.jobAlerts : true,
              systemUpdates: data.notifications.systemUpdates !== undefined ? data.notifications.systemUpdates : false
            })
          }
          
          // Set security settings
          if (data.security) {
            setSecuritySettings({
              twoFactor: data.security.twoFactor || false,
              sessionTimeout: data.security.sessionTimeout || '30',
              passwordExpiry: data.security.passwordExpiry || '90'
            })
          }
          
          // Set billing settings
          if (data.billing) {
            setBillingSettings({
              billingEmail: data.billing.billingEmail || '',
              paymentMethod: data.billing.paymentMethod || 'Bank Transfer',
              invoiceFrequency: data.billing.invoiceFrequency || 'Monthly',
              autoRenewal: data.billing.autoRenewal !== undefined ? data.billing.autoRenewal : true
            })
          }
          
          // Set general settings
          if (data.general) {
            setGeneralSettings({
              theme: data.general.theme || 'light',
              language: data.general.language || 'English',
              timezone: data.general.timezone || 'UAE (GMT+4)',
              dateFormat: data.general.dateFormat || 'DD/MM/YYYY'
            })
          }
        }
      } catch (error) {
        console.error('Error fetching settings:', error)
      }
    }
    
    fetchSettings()
  }, [])

  const sections = [
    { id: 'profile', label: 'Profile Settings', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'billing', label: 'Billing & Plans', icon: CreditCard },
    { id: 'general', label: 'General', icon: Globe },
  ]

  // Save all settings to Firebase
  const handleSaveSettings = async () => {
    setIsSaving(true)
    try {
      const settingsData = {
        profile: profileData,
        notifications: notificationSettings,
        security: securitySettings,
        billing: billingSettings,
        general: generalSettings,
        lastUpdated: new Date()
      }
      
      await setDoc(doc(db, 'profile-setting', 'admin-settings'), settingsData)
      alert('Settings saved successfully to Firebase!')
      setShowSave(false)
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Error saving settings. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleProfileChange = (field: string, value: string) => {
    setProfileData({ ...profileData, [field]: value })
    setShowSave(true)
  }

  const handleNotificationToggle = (setting: string) => {
    setNotificationSettings({
      ...notificationSettings,
      [setting]: !notificationSettings[setting as keyof typeof notificationSettings]
    })
    setShowSave(true)
  }

  const handleSecurityChange = (field: string, value: string | boolean) => {
    setSecuritySettings({ ...securitySettings, [field]: value })
    setShowSave(true)
  }

  const handleBillingChange = (field: string, value: string | boolean) => {
    setBillingSettings({ ...billingSettings, [field]: value })
    setShowSave(true)
  }

  const handleGeneralChange = (field: string, value: string) => {
    setGeneralSettings({ ...generalSettings, [field]: value })
    setShowSave(true)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account and application preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1 space-y-1">
          {sections.map((section) => {
            const Icon = section.icon
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeSection === section.id 
                    ? 'bg-pink-600 text-white shadow-md' 
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {section.label}
              </button>
            )
          })}
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Profile Settings */}
          {activeSection === 'profile' && (
            <div className="bg-card rounded-xl border shadow-sm p-6 space-y-6">
              <div>
                <h2 className="text-xl font-bold mb-6">Profile Settings</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    value={profileData.fullName}
                    onChange={(e) => handleProfileChange('fullName', e.target.value)}
                    className="w-full px-4 py-2 bg-muted border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email Address</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleProfileChange('email', e.target.value)}
                    className="w-full px-4 py-2 bg-muted border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="Enter your email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => handleProfileChange('phone', e.target.value)}
                    className="w-full px-4 py-2 bg-muted border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Company</label>
                  <input
                    type="text"
                    value={profileData.company}
                    onChange={(e) => handleProfileChange('company', e.target.value)}
                    className="w-full px-4 py-2 bg-muted border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="Enter company name"
                  />
                </div>

                <button
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="w-full px-4 py-3 bg-pink-600 text-white rounded-lg text-sm font-medium hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Profile Information
                    </>
                  )}
                </button>
                
              
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeSection === 'notifications' && (
            <div className="bg-card rounded-xl border shadow-sm p-6 space-y-6">
              <h2 className="text-xl font-bold">Notification Preferences</h2>

              <div className="space-y-4">
                {[
                  { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive updates via email' },
                  { key: 'smsNotifications', label: 'SMS Notifications', description: 'Receive urgent alerts via SMS' },
                  { key: 'meetingReminders', label: 'Meeting Reminders', description: 'Get reminded about scheduled meetings' },
                  { key: 'jobAlerts', label: 'Job Updates', description: 'Receive notifications about job assignments' },
                  { key: 'systemUpdates', label: 'System Updates', description: 'Get notified about system maintenance' }
                ].map(({ key, label, description }) => (
                  <div key={key} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div>
                      <p className="font-medium">{label}</p>
                      <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                    <button
                      onClick={() => handleNotificationToggle(key)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        notificationSettings[key as keyof typeof notificationSettings] ? 'bg-green-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                          notificationSettings[key as keyof typeof notificationSettings] ? 'translate-x-6' : ''
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeSection === 'security' && (
            <div className="bg-card rounded-xl border shadow-sm p-6 space-y-6">
              <h2 className="text-xl font-bold">Security Settings</h2>

              <div className="space-y-4">
                <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors flex items-center justify-between">
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                  </div>
                  <button
                    onClick={() => handleSecurityChange('twoFactor', !securitySettings.twoFactor)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      securitySettings.twoFactor ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                        securitySettings.twoFactor ? 'translate-x-6' : ''
                      }`}
                    />
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Session Timeout (minutes)</label>
                  <select
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => handleSecurityChange('sessionTimeout', e.target.value)}
                    className="w-full px-4 py-2 bg-muted border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="15">15</option>
                    <option value="30">30</option>
                    <option value="60">60</option>
                    <option value="120">120</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Password Expiry (days)</label>
                  <select
                    value={securitySettings.passwordExpiry}
                    onChange={(e) => handleSecurityChange('passwordExpiry', e.target.value)}
                    className="w-full px-4 py-2 bg-muted border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="30">30</option>
                    <option value="60">60</option>
                    <option value="90">90</option>
                    <option value="180">180</option>
                  </select>
                </div>

                <button className="w-full px-4 py-2 border border-pink-600 text-pink-600 rounded-lg text-sm font-medium hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors mt-4">
                  View Active Sessions
                </button>
              </div>
            </div>
          )}

          {/* Billing Settings */}
          {activeSection === 'billing' && (
            <div className="bg-card rounded-xl border shadow-sm p-6 space-y-6">
              <h2 className="text-xl font-bold">Billing & Subscription</h2>

              <div className="bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-lg p-4 mb-6">
                <p className="text-sm text-pink-900 dark:text-pink-200">
                  <strong>Current Plan:</strong> Professional Plan - AED 5,000/month (Active until Dec 31, 2025)
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Billing Email</label>
                  <input
                    type="email"
                    value={billingSettings.billingEmail}
                    onChange={(e) => handleBillingChange('billingEmail', e.target.value)}
                    className="w-full px-4 py-2 bg-muted border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="Enter billing email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Payment Method</label>
                  <select
                    value={billingSettings.paymentMethod}
                    onChange={(e) => handleBillingChange('paymentMethod', e.target.value)}
                    className="w-full px-4 py-2 bg-muted border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option>Credit Card</option>
                    <option>Bank Transfer</option>
                    <option>Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Invoice Frequency</label>
                  <select
                    value={billingSettings.invoiceFrequency}
                    onChange={(e) => handleBillingChange('invoiceFrequency', e.target.value)}
                    className="w-full px-4 py-2 bg-muted border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option>Monthly</option>
                    <option>Quarterly</option>
                    <option>Annually</option>
                  </select>
                </div>

                <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto-Renewal</p>
                    <p className="text-sm text-muted-foreground">Automatically renew subscription</p>
                  </div>
                  <button
                    onClick={() => handleBillingChange('autoRenewal', !billingSettings.autoRenewal)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      billingSettings.autoRenewal ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                        billingSettings.autoRenewal ? 'translate-x-6' : ''
                      }`}
                    />
                  </button>
                </div>

                <button className="w-full px-4 py-2 border border-pink-600 text-pink-600 rounded-lg text-sm font-medium hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors mt-4">
                  View Invoices
                </button>
              </div>
            </div>
          )}

          {/* General Settings */}
          {activeSection === 'general' && (
            <div className="bg-card rounded-xl border shadow-sm p-6 space-y-6">
              <h2 className="text-xl font-bold">General Settings</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Theme</label>
                  <select
                    value={generalSettings.theme}
                    onChange={(e) => handleGeneralChange('theme', e.target.value)}
                    className="w-full px-4 py-2 bg-muted border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Language</label>
                  <select
                    value={generalSettings.language}
                    onChange={(e) => handleGeneralChange('language', e.target.value)}
                    className="w-full px-4 py-2 bg-muted border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option>English</option>
                    <option>Arabic</option>
                    <option>French</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Timezone</label>
                  <select
                    value={generalSettings.timezone}
                    onChange={(e) => handleGeneralChange('timezone', e.target.value)}
                    className="w-full px-4 py-2 bg-muted border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option>UAE (GMT+4)</option>
                    <option>UK (GMT+0)</option>
                    <option>US East (GMT-5)</option>
                    <option>Australia (GMT+10)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Date Format</label>
                  <select
                    value={generalSettings.dateFormat}
                    onChange={(e) => handleGeneralChange('dateFormat', e.target.value)}
                    className="w-full px-4 py-2 bg-muted border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option>DD/MM/YYYY</option>
                    <option>MM/DD/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global Save Button */}
      {showSave && (
        <div className="fixed bottom-6 right-6 bg-pink-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <Save className="h-4 w-4" />
          <span className="font-medium">Unsaved changes</span>
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="ml-4 px-4 py-1.5 bg-white text-pink-600 rounded font-medium text-sm hover:bg-pink-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>
      )}
    </div>
  )
}