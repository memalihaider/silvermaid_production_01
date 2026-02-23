// /app/admin/jobs/lib/jobs-data.ts

export type JobStatus = 'PENDING' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type JobPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface JobService {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  price: number;
  total: number;
}

export interface JobTask {
  id: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  progress: number;
  assignedTo?: string[];
}

export interface JobTeamMember {
  id: string;
  name: string;
  role: string;
  status: 'CONFIRMED' | 'PENDING' | 'ON_SITE';
  initials: string;
}

export interface JobActivity {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  details: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
}

export interface Job {
  id: string;
  jobId: string; // SKU-like ID e.g., JOB-2025-001
  title: string;
  clientName: string;
  clientId: string;
  status: JobStatus;
  priority: JobPriority;
  riskLevel: RiskLevel;
  location: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  teamSize: number;
  budget: number;
  actualCost: number;
  description: string;
  services: JobService[];
  tasks: JobTask[];
  team: JobTeamMember[];
  activities: JobActivity[];
  tags: string[];
  lastUpdated: string;
}

export const MOCK_JOBS: Job[] = [
  {
    id: '1',
    jobId: 'JOB-2026-001',
    title: 'Executive Office Deep Clean',
    clientName: 'Global Tech Solutions',
    clientId: 'client_1',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    riskLevel: 'LOW',
    location: 'Downtown Towers, Floor 42',
    scheduledDate: '2026-01-28',
    startTime: '08:00',
    endTime: '16:00',
    teamSize: 4,
    budget: 4500,
    actualCost: 2100,
    description: 'Comprehensive sanitization of executive suites and common areas.',
    services: [
      { id: '1', name: 'Deep Cleaning', quantity: 1, unit: 'Service', price: 3000, total: 3000 },
      { id: '2', name: 'Window Polishing', quantity: 20, unit: 'Units', price: 75, total: 1500 }
    ],
    tasks: [
      { id: 't1', description: 'Floor Scrubbing', status: 'COMPLETED', progress: 100 },
      { id: 't2', description: 'Window Cleaning', status: 'IN_PROGRESS', progress: 60 },
      { id: 't3', description: 'Sanitization', status: 'PENDING', progress: 0 }
    ],
    team: [
      { id: 'tm1', name: 'Ahmed Hassan', role: 'Lead', status: 'ON_SITE', initials: 'AH' },
      { id: 'tm2', name: 'Sarah J.', role: 'Specialist', status: 'ON_SITE', initials: 'SJ' }
    ],
    activities: [
      { id: 'a1', timestamp: new Date().toISOString(), action: 'Clock In', user: 'Ahmed Hassan', details: 'Team arrived on site', type: 'SUCCESS' },
      { id: 'a2', timestamp: new Date().toISOString(), action: 'Task Started', user: 'Sarah J.', details: 'Window cleaning initiated', type: 'INFO' }
    ],
    tags: ['Commercial', 'Urgent'],
    lastUpdated: new Date().toISOString()
  },
  {
    id: '2',
    jobId: 'JOB-2026-002',
    title: 'Residential HVAC Maintenance',
    clientName: 'Marina Residence',
    clientId: 'client_2',
    status: 'SCHEDULED',
    priority: 'MEDIUM',
    riskLevel: 'MEDIUM',
    location: 'Marina Heights, Villa 12',
    scheduledDate: '2026-01-29',
    startTime: '10:00',
    endTime: '13:00',
    teamSize: 2,
    budget: 1200,
    actualCost: 0,
    description: 'Annual HVAC filter replacement and duct cleaning.',
    services: [
      { id: '3', name: 'HVAC Service', quantity: 1, unit: 'Unit', price: 1200, total: 1200 }
    ],
    tasks: [
      { id: 't4', description: 'Filter Replacement', status: 'PENDING', progress: 0 }
    ],
    team: [
      { id: 'tm3', name: 'Michael C.', role: 'Technician', status: 'CONFIRMED', initials: 'MC' }
    ],
    activities: [],
    tags: ['Residential', 'Maintenance'],
    lastUpdated: new Date().toISOString()
  }
];

export const STORAGE_KEYS = {
  JOBS: 'silvermaid_jobs_v2',
  SETTINGS: 'silvermaid_job_settings'
};
