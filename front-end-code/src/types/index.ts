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
  user: UserOut
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
  lab_id: string | null
  stipend_per_student: number | null
  max_students: number | null
}

export interface PositionCreate {
  title: string
  description: string
  required_gpa: number
  department: string
  lab_id: string
  stipend_per_student: number
  max_students: number
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
  position_id: string
  program_id?: string
}

export interface ApplicantOut {
  application_id: string
  position_id: string
  position_title: string
  student_profile_id: string
  username: string
  email: string
  full_name: string
  gpa: number | null
  major: string | null
  skills: string[]
  status: ApplicationStatus
  submitted_at: string
  decision_at: string | null
  decision_notes: string | null
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
  description: string | null
  required_gpa: number | null
  status: ProgramStatus
}

export interface ProgramCreate {
  title: string
  country?: string | null
  deadline?: string | null
  description?: string | null
  required_gpa?: number | null
}

export interface ProgramUpdate {
  title?: string
  country?: string | null
  deadline?: string | null
  description?: string | null
  required_gpa?: number | null
  status?: ProgramStatus
}

export interface ProgramApplicantOut {
  application_id: string
  program_id: string
  program_title: string
  student_profile_id: string
  username: string
  email: string
  full_name: string
  gpa: number | null
  major: string | null
  skills: string[]
  status: ApplicationStatus
  submitted_at: string
  decision_at: string | null
  decision_notes: string | null
}

export interface StudentProgramApplicationOut {
  id: string
  program_id: string
  program_title: string
  program_country: string | null
  status: ApplicationStatus
  submitted_at: string
  decision_at: string | null
  decision_notes: string | null
}

export interface FundingRequestOut {
  id: string
  lab_id: string | null
  amount: number
  purpose: string | null
  status: FundingStatus
  submitted_at: string | null
  reviewed_at: string | null
}

export interface FundingRequestCreate {
  lab_id: string
  amount: number
  purpose: string
}

export interface FundingRequestDetailOut {
  id: string
  amount: number
  purpose: string | null
  status: FundingStatus
  submitted_at: string | null
  reviewed_at: string | null
  professor_id: string
  professor_username: string
  professor_email: string
  lab_id: string | null
  lab_name: string | null
  lab_department: string | null
}

export interface FundingDecision {
  decision: FundingStatus
  notes?: string
}

export interface StipendOut {
  id: string
  student_id: string | null
  amount: number
  status: StipendStatus
  processed_at: string | null
}

export interface StipendDetailOut {
  id: string
  amount: number
  purpose: string | null
  status: StipendStatus
  submitted_at: string | null
  processed_at: string | null
  position_id: string | null
  position_title: string | null
  lab_id: string | null
  lab_name: string | null
  lab_department: string | null
  professor_id: string | null
  professor_username: string | null
  professor_email: string | null
}

export interface StipendDecision {
  status: StipendStatus
}

export interface LabOut {
  id: string
  name: string
  department: string | null
  status: LabStatus
  cert_type: string | null
  cert_expiry: string | null
}

export interface LabCreate {
  name: string
  department?: string | null
}

export interface LabUpdate {
  name?: string
  department?: string | null
  status?: LabStatus
}

export interface LabCertificationUpdate {
  cert_type?: string | null
  cert_expiry?: string | null
}

export interface LabMemberOut {
  id: string
  student_id: string
  role: string | null
  joined_at: string | null
}

export interface RosterAddRequest {
  student_id?: string
  username?: string
  role: string
}

export interface LabMemberDetail {
  id: string
  student_id: string
  username: string
  full_name: string
  email: string
  role: string | null
  joined_at: string | null
}

export interface AdminStatsOut {
  professors: number
  students: number
  labs: number
  active_labs: number
  suspended_labs: number
  positions: number
  open_positions: number
  applications: number
  accepted_applications: number
  pending_funding: number
  approved_funding_amount: number
  expired_certs: number
}

export interface AdminLabOut {
  id: string
  name: string
  department: string | null
  status: LabStatus
  cert_type: string | null
  cert_expiry: string | null
  cert_state: 'VALID' | 'EXPIRED' | 'UNKNOWN'
  professor_username: string | null
  professor_email: string | null
  member_count: number
  position_count: number
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
