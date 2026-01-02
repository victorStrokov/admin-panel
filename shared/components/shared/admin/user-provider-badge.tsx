/* eslint-disable @next/next/no-img-element */
'use client';

export function UserProviderBadge({ provider }: { provider?: string | null }) {
  if (!provider) {
    return <span className='text-gray-400'>—</span>;
  }

  if (provider === 'google') {
    return (
      <div className='flex items-center gap-1'>
        <img
          src='https://www.google.com/favicon.ico'
          alt='Google'
          width={16}
          height={16}
        />
        <span className='text-sm text-gray-700'>Google</span>
      </div>
    );
  }

  if (provider === 'github') {
    return (
      <div className='flex items-center gap-1'>
        <img
          src='https://github.githubassets.com/favicons/favicon.png'
          alt='GitHub'
          width={16}
          height={16}
        />
        <span className='text-sm text-gray-700'>GitHub</span>
      </div>
    );
  }

  return <span className='text-gray-400'>{provider}</span>;
}
