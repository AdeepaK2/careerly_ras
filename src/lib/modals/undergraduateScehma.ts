import { z } from 'zod';

export const undergraduateSchema = z.object({
  // Basic identification
  index: z.string().min(1, 'Index number is required'),
  name: z.string().min(2, 'Full name is required').max(100, 'Name is too long'),
  nameWithInitials: z.string().min(2, 'Name with initials is required').max(50, 'Name with initials is too long'),
  
  // University details
  universityEmail: z.string().email('Valid university email is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password is too long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  isVerified: z.boolean().default(false),
  batch: z.string().min(1, 'Batch is required'),
  
  // Education details
  education: z.object({
    faculty: z.string().min(1, 'Faculty is required'),
    department: z.string().min(1, 'Department is required'),
    degreeProgramme: z.string().min(1, 'Degree programme is required'),
  }),
  
  // Personal information
  birthdate: z.date().or(z.string().transform((str: string) => new Date(str))),
  address: z.string().min(5, 'Address is required').max(200, 'Address is too long'),
  phoneNumber: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number is too long')
    .regex(/^[+]?[\d\s()-]+$/, 'Invalid phone number format'),
  
  // Profile and status
  profilePicUrl: z.string().url('Invalid URL format').optional(),
  jobSearchingStatus: z.enum(['active', 'passive', 'not_searching', 'employed'], {
    message: 'Job searching status must be one of: active, passive, not_searching, employed'
  }).default('not_searching'),
  
  // Metadata
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type UndergraduateSchema = z.infer<typeof undergraduateSchema>;

// Create undergraduate validation function
export const validateUndergraduate = (data: unknown) => {
  return undergraduateSchema.safeParse(data);
};

// Schema for creating new undergraduate (without auto-generated fields)
export const createUndergraduateSchema = undergraduateSchema.omit({
  createdAt: true,
  updatedAt: true,
});

export type CreateUndergraduateSchema = z.infer<typeof createUndergraduateSchema>;

// Schema for login (only email and password)
export const loginSchema = z.object({
  universityEmail: z.string().email('Valid university email is required'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginSchema = z.infer<typeof loginSchema>;

// Schema for password update
export const passwordUpdateSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password is too long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type PasswordUpdateSchema = z.infer<typeof passwordUpdateSchema>;

// Schema for updating undergraduate (all fields optional except index)
export const updateUndergraduateSchema = undergraduateSchema.partial().extend({
  index: z.string().min(1, 'Index number is required'),
  updatedAt: z.date().default(() => new Date()),
});

export type UpdateUndergraduateSchema = z.infer<typeof updateUndergraduateSchema>;