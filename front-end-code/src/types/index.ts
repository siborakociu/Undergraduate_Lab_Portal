export type UserRole = 'STUDENT' | 'PROFESSOR' | 'HR_STAFF' | 'ADMIN'

export type PositionStatus = 'OPEN' | 'CLOSED' | 'FILLED'
export type ApplicationStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'WITHDRAWN'
export type ProgramStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED'
export type LabStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
export type FundingStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type StipendStatus = 'PENDING' | 'APPROVED' | 'PROCESSED' | 'REJECTED'
export type DocumentType =
  | 'RESUME'
  | 'TRANSCRIPT'
  | 'COVER_LETTER'
  | 'RECOMMENDATION'
  | 'OTHER'

export interface UserOut {
  id: string
  username: string
  email: string
  role: UserRole
}

export interface TokenResponse {
  access_token: string
  token_type: string
  role: string
  expires_in: number
}

export interface StudentProfileOut {
  id: string
  full_name: string
  gpa: number | null
  major: string | null
  skills: string[]
  is_complete: boolean
}

export interface StudentProfileCreate {
  full_name: string
  gpa: number
  major: string
  skills: string[]
}

export interface StudentProfileUpdate {
  full_name?: string
  gpa?: number
  major?: string
  skills?: string[]
}

export interface PositionOut {
  id: string
  title: string
  description: string | null
  status: PositionStatus
  required_gpa: number | null
  department: string | null
}

export interface PositionCreate {
  title: string
  description: string
  required_gpa: number
  department: string
}

export interface PositionFilters {
  dept?: string
  gpa?: number
}

export interface ApplicationOut {
  id: string
  student_id: string
  position_id: string
  status: ApplicationStatus
  submitted_at: string
  decision_at: string | null
}

export interface ApplicationCreate {
  student_id: string
  position_id: string
  program_id?: string
}

export interface ApplicationStatusUpdate {
  status: ApplicationStatus
  decision_notes?: string
}

export interface ProgramOut {
  id: string
  title: string
  country: string | null
  deadline: string | null
  status: ProgramStatus
}

export interface ProgramCreate {
  title: string
  country: string
  deadline: string
}

export interface FundingRequestOut {
  id: string
  amount: number
  purpose: string | null
  status: FundingStatus
  submitted_at: string | null
}

export interface FundingDecision {
  decision: FundingStatus
  notes?: string
}

export interface StipendOut {
  id: string
  student_id: string
  amount: number
  status: StipendStatus
  processed_at: string | null
}

export interface StipendDecision {
  status: StipendStatus
}

export interface LabOut {
  id: string
  name: string
  department: string | null
  status: LabStatus
  cert_expiry: string | null
}

export interface LabMemberOut {
  id: string
  student_id: string
  role: string | null
  joined_at: string | null
}

export interface RosterAddRequest {
  student_id: string
  role: string
}

export interface NotificationOut {
  id: string
  message: string
  is_read: boolean
  created_at: string | null
}

export interface DocumentOut {
  id: string
  file_name: string
  file_url: string
  doc_type: DocumentType | null
  uploaded_at: string | null
}
