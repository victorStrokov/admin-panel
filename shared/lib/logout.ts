import { getOrCreateDeviceId } from './device-id';

export async function logout() {
  const deviceId = getOrCreateDeviceId();

  await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'x-device-id': deviceId,
    },
  });

  window.dispatchEvent(new Event('session-changed'));
}
