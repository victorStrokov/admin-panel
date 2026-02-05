// Типизированное событие для уведомления AuthContext о необходимости перезагрузить профиль
export const AUTH_REFRESH_EVENT = 'auth-refresh' as const;

export function triggerAuthRefresh() {
  const event = new CustomEvent(AUTH_REFRESH_EVENT);
  window.dispatchEvent(event);
}

