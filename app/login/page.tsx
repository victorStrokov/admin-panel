'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      router.push('/admin'); // редирект в админку
    } else {
      const data = await res.json();
      alert(data.error || 'Ошибка входа');
    }
  }

  return (
    <form
      onSubmit={handleLogin}
      className='p-6 space-y-4'>
      <h1 className='text-2xl font-bold'>Вход</h1>
      <input
        type='email'
        placeholder='Email'
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className='border p-2 w-full'
      />
      <input
        type='password'
        placeholder='Пароль'
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className='border p-2 w-full'
      />
      <button
        type='submit'
        className='bg-blue-600 text-white px-4 py-2 rounded'>
        Войти
      </button>
    </form>
  );
}
