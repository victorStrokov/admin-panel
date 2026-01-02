'use client';

export function UserAvatar({
  email,
  provider,
  size = 32,
}: {
  email: string;
  provider?: string | null;
  size?: number;
}) {
  // Если есть provider — используем его аватар
  if (provider === 'google') {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`https://www.google.com/s2/favicons?domain=google.com&sz=${size}`}
        alt='Google'
        width={size}
        height={size}
        className='rounded-full'
      />
    );
  }

  if (provider === 'github') {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`https://avatars.githubusercontent.com/${email.split('@')[0]}`}
        alt='GitHub'
        width={size}
        height={size}
        className='rounded-full'
      />
    );
  }

  // Fallback: генерируем аватар по email
  const hash = email.charCodeAt(0) + email.charCodeAt(email.length - 1);

  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundColor: `hsl(${hash * 10}, 70%, 60%)`,
      }}
      className='rounded-full flex items-center justify-center text-white font-bold'>
      {email[0].toUpperCase()}
    </div>
  );
}
