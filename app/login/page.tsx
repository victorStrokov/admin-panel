'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { getOrCreateDeviceId } from '@/shared/lib/device-id';
import { useRouter } from 'next/navigation';
import { loginFormSchema } from '@/shared/lib/validation/login-form-schema';
import React from 'react';

type LoginForm = z.infer<typeof loginFormSchema>;

export default function LoginPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginFormSchema),
  });

  async function onSubmit(data: LoginForm) {
    const deviceId = getOrCreateDeviceId();

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'x-device-id': deviceId,
      },
      body: JSON.stringify({ ...data, deviceId }),
    });

    if (res.ok) {
      toast.success('Вы успешно вошли в аккаунт', { icon: '✅' });
      setTimeout(() => {
        router.push('/admin');
      }, 1000);
    } else {
      toast.error(
        'Не удалось войти в аккаунт, не правильный логин или пароль!',
        {
          icon: '❌',
        }
      );
    }
  }

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('logout') === '1') {
      toast.success('Вы вышли из системы', { icon: '✅' });
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className='p-6 space-y-4 max-w-sm mx-auto'>
      <h1 className='text-2xl font-bold'>Вход</h1>

      {/* Email */}
      <div>
        <input
          type='email'
          placeholder='Email'
          {...register('email')}
          className='border p-2 w-full rounded'
        />
        {errors.email && (
          <p className='text-red-600 text-sm mt-1'>{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <input
          type='password'
          placeholder='Пароль'
          {...register('password')}
          className='border p-2 w-full rounded'
        />
        {errors.password && (
          <p className='text-red-600 text-sm mt-1'>{errors.password.message}</p>
        )}
      </div>

      {/* Submit */}
      <button
        type='submit'
        disabled={isSubmitting}
        className='bg-blue-600 text-white px-4 py-2 rounded w-full disabled:opacity-50'>
        {isSubmitting ? 'Вход...' : 'Войти'}
      </button>
    </form>
  );
}
