import { Monitor, Smartphone, Laptop } from 'lucide-react';

export function getDeviceIcon(os: string) {
  switch (os) {
    case 'Windows':
    case 'Linux':
      return <Monitor className='w-5 h-5' />;

    case 'MacOS':
      return <Laptop className='w-5 h-5' />;

    case 'Android':
    case 'iOS':
      return <Smartphone className='w-5 h-5' />;

    default:
      return <Monitor className='w-5 h-5' />;
  }
}
