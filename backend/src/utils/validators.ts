import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .trim(),
  email: z.string()
    .email('Invalid email address')
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password too long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain uppercase, lowercase and number'
    ),
});

export const loginSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(1, 'Password is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export const issueCredentialSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  degree: z.string().min(1).max(100).trim(),
  graduationYear: z.string().regex(/^\d{4}$/),
  cgpa: z.string().regex(/^\d+(\.\d{1,2})?$/),
  marks: z.string().min(1).max(100).trim(),
  issuerName: z.string().min(1).max(100).trim(),
  issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const shareCredentialSchema = z.object({
  credentialId: z.string().uuid(),
  selectedFields: z.array(z.string()).min(1).max(7),
  expiryHours: z.number().min(1).max(168).default(24),
});

export const verifyCredentialSchema = z.object({
  shareToken: z.string().uuid(),
});

export type IssueCredentialInput = z.infer<typeof issueCredentialSchema>;
export type ShareCredentialInput = z.infer<typeof shareCredentialSchema>;
export type VerifyCredentialInput = z.infer<typeof verifyCredentialSchema>;
