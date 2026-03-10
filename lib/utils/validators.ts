import { z } from 'zod';

// ─── Auth Schemas ─────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  identifier: z
    .string()
    .min(3, 'Username or Email must be at least 3 characters')
    .refine(
      (val) => {
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
        const isUsername = /^[a-zA-Z0-9_]{3,20}$/.test(val);
        return isEmail || isUsername;
      },
      { message: 'Enter a valid username or email address' }
    ),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  recaptchaToken: z.string().optional(),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(50),
    email: z.string().email('Enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must include an uppercase letter')
      .regex(/[0-9]/, 'Must include a number'),
    confirmPassword: z.string(),
    referralCode: z.string().optional(),
    recaptchaToken: z.string().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// ─── Prediction Schema ────────────────────────────────────────────────────────

export const placePredictionSchema = z.object({
  matchId: z.string().min(1),
  marketId: z.string().min(1, 'Select a market first'),
  outcomeKey: z.string().min(1, 'Select an outcome'),
  stake: z
    .number()
    .positive('Stake must be positive')
    .min(1, 'Minimum 1 point')
    .int('Stake must be a whole number'),
  idempotencyKey: z.string().min(20),
});

// ─── Inferred Types ───────────────────────────────────────────────────────────

export type LoginSchema = z.infer<typeof loginSchema>;
export type RegisterSchema = z.infer<typeof registerSchema>;
export type PlacePredictionSchema = z.infer<typeof placePredictionSchema>;
