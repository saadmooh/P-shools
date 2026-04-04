import { z } from 'zod';

export const userSchema = z.object({
  id: z.string().uuid().optional(),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  email: z.string().email('Invalid email address').optional().nullable(),
  role: z.enum(['admin', 'teacher', 'guardian', 'independent']),
  is_active: z.boolean().default(true),
});

export const guardianSchema = z.object({
  user_id: z.string().uuid(),
  full_name: z.string().min(3, 'Full name must be at least 3 characters'),
  national_id: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  balance: z.number().default(0),
  notes: z.string().optional().nullable(),
});

export const teacherSchema = z.object({
  user_id: z.string().uuid(),
  full_name: z.string().min(3, 'Full name must be at least 3 characters'),
  specialty: z.string().optional().nullable(),
  base_rate_per_hour: z.number().positive(),
  iban: z.string().optional().nullable(),
  hire_date: z.string(),
  contract_type: z.enum(['permanent', 'contract', 'hourly']),
});

export const studentSchema = z.object({
  id: z.string().uuid().optional(),
  guardian_id: z.string().uuid(),
  full_name: z.string().min(3, 'Full name must be at least 3 characters'),
  date_of_birth: z.string(),
  student_code: z.string().optional().nullable(),
  enrollment_date: z.string(),
  is_active: z.boolean().default(true),
});

export const roomSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2),
  code: z.string().min(1),
  capacity: z.number().int().positive(),
  floor: z.string().optional().nullable(),
  has_projector: z.boolean().default(false),
  has_ac: z.boolean().default(false),
  notes: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
});

export const sessionSchema = z.object({
  id: z.string().uuid().optional(),
  session_type: z.enum(['group', 'course']),
  group_id: z.string().uuid().optional().nullable(),
  course_id: z.string().uuid().optional().nullable(),
  room_id: z.string().uuid().optional().nullable(),
  teacher_id: z.string().uuid(),
  scheduled_at: z.string(),
  duration_hours: z.number().positive(),
  justification_deadline: z.string(),
  status: z.enum(['scheduled', 'ongoing', 'completed', 'cancelled']).default('scheduled'),
  topic: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});
