import { getOrCreateDeviceId } from './device-id';

export async function deleteOthers() {
  const deviceId = getOrCreateDeviceId();

  const res = await fetch('/api/sessions/delete-others', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'x-device-id': deviceId,
    },
  });

  return res.ok;
}
