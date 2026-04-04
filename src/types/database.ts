export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'admin' | 'teacher' | 'guardian' | 'independent' | 'system'
export type ContractType = 'permanent' | 'contract' | 'hourly'
export type SessionType = 'group' | 'course'
export type SessionStatus = 'scheduled' | 'ongoing' | 'completed' | 'cancelled'
export type EnrollmentStatus = 'active' | 'suspended' | 'cancelled'
| 'unpaid' | 'partial' | 'paid'
export type AttendanceStatus = 'present' | 'absent_excused' | 'absent_unexcused' | 'absent_pending'
export type JustificationStatus = 'pending' | 'approved' | 'rejected'
export type InvoiceStatus = 'draft' | 'sent' | 'partial' | 'paid' | 'overdue' | 'cancelled'
export type PaymentMethod = 'cash' | 'bank_transfer' | 'check' | 'other'
export type PayrollStatus = 'draft' | 'approved' | 'paid'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          phone: string
          email: string | null
          role: UserRole
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          phone: string
          email?: string | null
          role: UserRole
          is_active?: boolean
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      guardians: {
        Row: {
          user_id: string
          full_name: string
          national_id: string | null
          address: string | null
          balance: number
          notes: string | null
        }
        Insert: {
          user_id: string
          full_name: string
          national_id?: string | null
          address?: string | null
          balance?: number
          notes?: string | null
        }
        Update: Partial<Database['public']['Tables']['guardians']['Insert']>
      }
      teachers: {
        Row: {
          user_id: string
          full_name: string
          specialty: string | null
          base_rate_per_hour: number
          iban: string | null
          hire_date: string
          contract_type: ContractType
        }
        Insert: {
          user_id: string
          full_name: string
          specialty?: string | null
          base_rate_per_hour: number
          iban?: string | null
          hire_date: string
          contract_type: ContractType
        }
        Update: Partial<Database['public']['Tables']['teachers']['Insert']>
      }
      students: {
        Row: {
          id: string
          guardian_id: string
          full_name: string
          date_of_birth: string
          student_code: string | null
          enrollment_date: string
          is_active: boolean
        }
        Insert: {
          id?: string
          guardian_id: string
          full_name: string
          date_of_birth: string
          student_code?: string | null
          enrollment_date: string
          is_active?: boolean
        }
        Update: Partial<Database['public']['Tables']['students']['Insert']>
      }
      rooms: {
        Row: {
          id: string
          name: string
          code: string
          capacity: number
          floor: string | null
          has_projector: boolean
          has_ac: boolean
          notes: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          name: string
          code: string
          capacity: number
          floor?: string | null
          has_projector?: boolean
          has_ac?: boolean
          notes?: string | null
          is_active?: boolean
        }
        Update: Partial<Database['public']['Tables']['rooms']['Insert']>
      }
      school_levels: {
        Row: {
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          id?: string
          name: string
          sort_order?: number
        }
        Update: Partial<Database['public']['Tables']['school_levels']['Insert']>
      }
      subjects: {
        Row: {
          id: string
          level_id: string
          name: string
          code: string
          default_price_per_hour: number
        }
        Insert: {
          id?: string
          level_id: string
          name: string
          code: string
          default_price_per_hour: number
        }
        Update: Partial<Database['public']['Tables']['subjects']['Insert']>
      }
      groups: {
        Row: {
          id: string
          subject_id: string
          teacher_id: string
          name: string
          academic_year: string
          max_students: number
          price_per_hour: number
          teacher_rate_per_hour: number
          is_active: boolean
        }
        Insert: {
          id?: string
          subject_id: string
          teacher_id: string
          name: string
          academic_year: string
          max_students?: number
          price_per_hour: number
          teacher_rate_per_hour: number
          is_active?: boolean
        }
        Update: Partial<Database['public']['Tables']['groups']['Insert']>
      }
      courses: {
        Row: {
          id: string
          teacher_id: string
          name: string
          description: string | null
          total_hours: number
          price_per_hour: number
          price_mode: 'per_hour' | 'fixed_total'
          fixed_total_price: number | null
          teacher_rate_per_hour: number
          max_participants: number | null
          start_date: string | null
          end_date: string | null
          status: 'draft' | 'open' | 'ongoing' | 'completed' | 'cancelled'
          justification_deadline_hours: number | null
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          teacher_id: string
          name: string
          description?: string | null
          total_hours: number
          price_per_hour: number
          price_mode?: 'per_hour' | 'fixed_total'
          fixed_total_price?: number | null
          teacher_rate_per_hour: number
          max_participants?: number | null
          start_date?: string | null
          end_date?: string | null
          status?: 'draft' | 'open' | 'ongoing' | 'completed' | 'cancelled'
          justification_deadline_hours?: number | null
          created_by: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['courses']['Insert']>
      }
      sessions: {
        Row: {
          id: string
          session_type: SessionType
          group_id: string | null
          course_id: string | null
          room_id: string | null
          teacher_id: string
          scheduled_at: string
          duration_hours: number
          justification_deadline: string
          status: SessionStatus
          topic: string | null
          notes: string | null
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          session_type: SessionType
          group_id?: string | null
          course_id?: string | null
          room_id?: string | null
          teacher_id: string
          scheduled_at: string
          duration_hours: number
          justification_deadline: string
          status?: SessionStatus
          topic?: string | null
          notes?: string | null
          created_by: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['sessions']['Insert']>
      }
      attendances: {
        Row: {
          id: string
          session_id: string
          participant_type: 'student' | 'independent'
          student_id: string | null
          independent_user_id: string | null
          status: AttendanceStatus
          hours_billed: number
          amount_due: number
          is_billed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          session_id: string
          participant_type: 'student' | 'independent'
          student_id?: string | null
          independent_user_id?: string | null
          status?: AttendanceStatus
          hours_billed: number
          amount_due?: number
          is_billed?: boolean
          created_at?: string
          updated_at: string
        }
        Update: Partial<Database['public']['Tables']['attendances']['Insert']>
      }
    }
  }
}
