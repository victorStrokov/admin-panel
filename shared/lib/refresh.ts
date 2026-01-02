import { getOrCreateDeviceId } from './device-id';

let isRefreshing = false;

export async function silentRefresh() {
  if (isRefreshing) return false; // защита от повторов
  isRefreshing = true;

  try {
    const deviceId = getOrCreateDeviceId();

    const res = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include', // обязательно!
      headers: {
        'x-device-id': deviceId,
      },
    });

    if (!res.ok) {
      return false;
    }

    return true;
  } finally {
    isRefreshing = false;
  }
}
