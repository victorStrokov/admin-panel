import Cookies from 'js-cookie';

export function getOrCreateDeviceId() {
  let deviceId = Cookies.get('deviceId');

  if (!deviceId) {
    deviceId = crypto.randomUUID();
    Cookies.set('deviceId', deviceId, {
      expires: 7,
      sameSite: 'lax',
    });
  }

  return deviceId;
}
