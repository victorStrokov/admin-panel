import { z } from 'zod';

export const loginFormSchema = z.object({
  email: z
    .string()
    .trim()
    .pipe(z.email({ message: 'Некорректный email' })),
  password: z.string().min(3, { message: 'Минимум 3 символа' }),
});

export type LoginFormInput = z.infer<typeof loginFormSchema>;
