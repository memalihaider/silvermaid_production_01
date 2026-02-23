// Unified Meetings Data Structure
export interface Attendee {
  id: string
  name: string
  role: string
  email: string
  status: 'Accepted' | 'Declined' | 'Pending' | 'No Response'
}

export interface Decision {
  id: string
  description: string
  owner: string
  dueDate: string
  status: 'Open' | 'In Progress' | 'Completed'
}

export interface FollowUp {
  id: string
  task: string
  assignedTo: string
  dueDate: string
  priority: 'Low' | 'Medium' | 'High'
  status: 'Open' | 'In Progress' | 'Completed'
  meetingId: string
}

export interface MeetingNote {
  id: string
  content: string
  author: string
  timestamp: string
  type: 'Note' | 'Action Item' | 'Decision'
}

export interface Meeting {
  id: string
  title: string
  description: string
  type: 'Team Standup' | 'Client Meeting' | 'Project Review' | 'Board Meeting' | 'One-on-One' | 'Training' | 'Planning' | 'Retrospective'
  date: string
  startTime: string
  endTime: string
  duration: number // in minutes
  location: string
  meetingLink?: string
  organizer: string
  attendees: Attendee[]
  linkedJob?: string
  linkedClient?: string
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled'
  agenda: string
  notes: MeetingNote[]
  decisions: Decision[]
  followUps: FollowUp[]
  costAllocated?: number
  recordings?: { url: string; title: string }[]
  createdAt: string
  updatedAt: string
}

// Mock team members for real data
export const TEAM_MEMBERS = [
  { id: 'EMP001', name: 'Ahmed Al-Mazrouei', role: 'Operations Manager', email: 'ahmed@silvermaid.ae' },
  { id: 'EMP002', name: 'Maria Rodriguez', role: 'HR Manager', email: 'maria@silvermaid.ae' },
  { id: 'EMP003', name: 'John Smith', role: 'Project Manager', email: 'john@silvermaid.ae' },
  { id: 'EMP004', name: 'Sarah Johnson', role: 'Finance Manager', email: 'sarah@silvermaid.ae' },
  { id: 'EMP005', name: 'Fatima Al-Ketbi', role: 'Team Lead', email: 'fatima@silvermaid.ae' },
  { id: 'EMP006', name: 'Hassan Al-Mansouri', role: 'Senior Technician', email: 'hassan@silvermaid.ae' },
  { id: 'EMP007', name: 'Layla Al-Mansouri', role: 'Data Analyst', email: 'layla@silvermaid.ae' }
]

// Mock client list
export const CLIENTS = [
  { id: 'CLIENT001', name: 'Downtown Business Tower', type: 'Corporate' },
  { id: 'CLIENT002', name: 'Shopping Mall Dubai', type: 'Retail' },
  { id: 'CLIENT003', name: 'Luxury Residential Complex', type: 'Residential' },
  { id: 'CLIENT004', name: 'Healthcare Clinic', type: 'Medical' }
]

// Real Meetings Data
export const MOCK_MEETINGS: Meeting[] = [
  {
    id: 'MTG001',
    title: 'Weekly Operations Standup',
    description: 'Weekly sync on project progress and blockers',
    type: 'Team Standup',
    date: '2026-01-28',
    startTime: '09:00',
    endTime: '09:30',
    duration: 30,
    location: 'Conference Room A',
    organizer: 'Ahmed Al-Mazrouei',
    attendees: [
      { id: 'EMP001', name: 'Ahmed Al-Mazrouei', role: 'Operations Manager', email: 'ahmed@silvermaid.ae', status: 'Accepted' },
      { id: 'EMP003', name: 'John Smith', role: 'Project Manager', email: 'john@silvermaid.ae', status: 'Accepted' },
      { id: 'EMP005', name: 'Fatima Al-Ketbi', role: 'Team Lead', email: 'fatima@silvermaid.ae', status: 'Pending' }
    ],
    linkedJob: 'JOB-OPS-2026-001',
    status: 'Scheduled',
    agenda: '1. Previous week recap\n2. Current week priorities\n3. Blockers and risks\n4. Resource needs',
    notes: [
      { id: 'N001', content: 'Downtown Tower project on track', author: 'John Smith', timestamp: '2026-01-27T14:30:00', type: 'Note' },
      { id: 'N002', content: 'Need 2 additional technicians for Mall project', author: 'Ahmed Al-Mazrouei', timestamp: '2026-01-27T14:35:00', type: 'Action Item' }
    ],
    decisions: [
      { id: 'D001', description: 'Allocate additional resources to Mall project', owner: 'Ahmed Al-Mazrouei', dueDate: '2026-01-29', status: 'Open' }
    ],
    followUps: [
      { id: 'FU001', task: 'Send resource allocation plan to team', assignedTo: 'Ahmed Al-Mazrouei', dueDate: '2026-01-29', priority: 'High', status: 'Open', meetingId: 'MTG001' }
    ],
    costAllocated: 0,
    createdAt: '2026-01-20T10:00:00',
    updatedAt: '2026-01-27T14:35:00'
  },
  {
    id: 'MTG002',
    title: 'Client Feedback - Downtown Tower Project',
    description: 'Final review meeting with client for Downtown Tower cleaning project',
    type: 'Client Meeting',
    date: '2026-01-30',
    startTime: '14:00',
    endTime: '15:00',
    duration: 60,
    location: 'Downtown Business Tower',
    meetingLink: 'https://teams.microsoft.com/l/meetup-join/19:meeting_abc123',
    organizer: 'John Smith',
    attendees: [
      { id: 'EMP003', name: 'John Smith', role: 'Project Manager', email: 'john@silvermaid.ae', status: 'Accepted' },
      { id: 'EMP001', name: 'Ahmed Al-Mazrouei', role: 'Operations Manager', email: 'ahmed@silvermaid.ae', status: 'Accepted' },
      { id: 'CLIENT-EMP001', name: 'Mr. Hassan Saeed', role: 'Facilities Manager', email: 'hassan.saeed@downtowntower.ae', status: 'Accepted' }
    ],
    linkedJob: 'JOB-DOT-2026-001',
    linkedClient: 'CLIENT001',
    status: 'Scheduled',
    agenda: '1. Project completion review\n2. Quality assurance results\n3. Final payment settlement\n4. Future maintenance schedule',
    notes: [
      { id: 'N003', content: 'Project 98% complete', author: 'John Smith', timestamp: '2026-01-28T09:00:00', type: 'Note' },
      { id: 'N004', content: 'Minor touch-ups required on 3rd floor', author: 'Fatima Al-Ketbi', timestamp: '2026-01-28T09:15:00', type: 'Action Item' }
    ],
    decisions: [
      { id: 'D002', description: 'Schedule final inspection for Feb 2', owner: 'John Smith', dueDate: '2026-02-02', status: 'Open' },
      { id: 'D003', description: 'Set maintenance contract terms', owner: 'Ahmed Al-Mazrouei', dueDate: '2026-02-05', status: 'Open' }
    ],
    followUps: [
      { id: 'FU002', task: 'Complete remaining touch-ups', assignedTo: 'Hassan Al-Mansouri', dueDate: '2026-02-01', priority: 'High', status: 'In Progress', meetingId: 'MTG002' },
      { id: 'FU003', task: 'Prepare final invoice', assignedTo: 'Sarah Johnson', dueDate: '2026-02-02', priority: 'High', status: 'Open', meetingId: 'MTG002' }
    ],
    costAllocated: 500,
    createdAt: '2026-01-22T11:00:00',
    updatedAt: '2026-01-28T09:15:00'
  },
  {
    id: 'MTG003',
    title: 'HR Policy Review - 2026',
    description: 'Annual review and update of HR policies',
    type: 'Planning',
    date: '2026-02-04',
    startTime: '10:00',
    endTime: '11:30',
    duration: 90,
    location: 'HR Office',
    organizer: 'Maria Rodriguez',
    attendees: [
      { id: 'EMP002', name: 'Maria Rodriguez', role: 'HR Manager', email: 'maria@silvermaid.ae', status: 'Accepted' },
      { id: 'EMP001', name: 'Ahmed Al-Mazrouei', role: 'Operations Manager', email: 'ahmed@silvermaid.ae', status: 'Pending' },
      { id: 'EMP004', name: 'Sarah Johnson', role: 'Finance Manager', email: 'sarah@silvermaid.ae', status: 'Accepted' }
    ],
    status: 'Scheduled',
    agenda: '1. Attendance policy updates\n2. Leave management changes\n3. Performance review process\n4. Compliance requirements',
    notes: [
      { id: 'N005', content: 'Need to align with UAE labor law updates', author: 'Maria Rodriguez', timestamp: '2026-01-25T10:30:00', type: 'Note' }
    ],
    decisions: [
      { id: 'D004', description: 'Update leave policy effective March 1', owner: 'Maria Rodriguez', dueDate: '2026-02-15', status: 'Open' }
    ],
    followUps: [
      { id: 'FU004', task: 'Draft updated policy document', assignedTo: 'Maria Rodriguez', dueDate: '2026-02-10', priority: 'High', status: 'Open', meetingId: 'MTG003' },
      { id: 'FU005', task: 'Communicate changes to all staff', assignedTo: 'Maria Rodriguez', dueDate: '2026-02-20', priority: 'Medium', status: 'Open', meetingId: 'MTG003' }
    ],
    createdAt: '2026-01-20T09:00:00',
    updatedAt: '2026-01-25T10:30:00'
  },
  {
    id: 'MTG004',
    title: 'Project Retrospective - Q4 2025',
    description: 'Team retrospective on Q4 2025 projects and lessons learned',
    type: 'Retrospective',
    date: '2026-02-07',
    startTime: '15:00',
    endTime: '16:30',
    duration: 90,
    location: 'Conference Room B',
    organizer: 'Fatima Al-Ketbi',
    attendees: [
      { id: 'EMP005', name: 'Fatima Al-Ketbi', role: 'Team Lead', email: 'fatima@silvermaid.ae', status: 'Accepted' },
      { id: 'EMP006', name: 'Hassan Al-Mansouri', role: 'Senior Technician', email: 'hassan@silvermaid.ae', status: 'Accepted' },
      { id: 'EMP003', name: 'John Smith', role: 'Project Manager', email: 'john@silvermaid.ae', status: 'Pending' }
    ],
    linkedJob: 'JOB-RET-2026-001',
    status: 'Scheduled',
    agenda: '1. What went well\n2. What could be improved\n3. Action items for 2026\n4. Team recognition',
    notes: [],
    decisions: [],
    followUps: [],
    createdAt: '2026-01-23T13:00:00',
    updatedAt: '2026-01-23T13:00:00'
  },
  {
    id: 'MTG005',
    title: 'Team One-on-One - John Smith',
    description: 'Monthly one-on-one performance review',
    type: 'One-on-One',
    date: '2026-01-29',
    startTime: '11:00',
    endTime: '11:30',
    duration: 30,
    location: 'Manager Office',
    organizer: 'Ahmed Al-Mazrouei',
    attendees: [
      { id: 'EMP001', name: 'Ahmed Al-Mazrouei', role: 'Operations Manager', email: 'ahmed@silvermaid.ae', status: 'Accepted' },
      { id: 'EMP003', name: 'John Smith', role: 'Project Manager', email: 'john@silvermaid.ae', status: 'Accepted' }
    ],
    status: 'Scheduled',
    agenda: '1. Performance review\n2. Career goals\n3. Support needed\n4. Feedback exchange',
    notes: [],
    decisions: [],
    followUps: [],
    createdAt: '2026-01-25T14:00:00',
    updatedAt: '2026-01-25T14:00:00'
  }
]
