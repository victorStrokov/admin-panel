import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .pipe(z.email({ message: 'Некорректный email' })),
  password: z.string().min(3, { message: 'Минимум 3 символа' }),
  deviceId: z.uuid(),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, { message: 'Имя слишком короткое' })
    .max(150, { message: 'Имя слишком длинное' }),

  email: z
    .string()
    .trim()
    .pipe(z.email({ message: 'Некорректный email' })),

  password: z.string().trim().min(3, { message: 'Минимум 3 символа' }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
