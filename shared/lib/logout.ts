import { getOrCreateDeviceId } from './device-id';

export async function logout() {
  const deviceId = getOrCreateDeviceId();

  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'x-device-id': deviceId,
      },
    });
  } catch (error) {
    console.error('[Logout] Error:', error);
  }

  // Диспатчим событие для уведомления AuthProvider
  window.dispatchEvent(new Event('session-changed'));

  // Редиректим на login
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}
