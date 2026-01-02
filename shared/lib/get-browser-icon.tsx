import { Chrome, Globe } from 'lucide-react';

export function getBrowserIcon(browser: string) {
  switch (browser) {
    case 'Chrome':
    case 'Chromium': // Chromium = Chrome
      return <Chrome className='w-5 h-5' />;

    // Safari, Firefox, Edge — нет в lucide-react
    // поэтому используем fallback
    case 'Safari':
    case 'Firefox':
    case 'Edge':
      return <Globe className='w-5 h-5' />;

    default:
      return <Globe className='w-5 h-5' />;
  }
}
