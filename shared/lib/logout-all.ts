export async function logoutAll() {
  await fetch('/api/auth/logout-all', {
    method: 'POST',
    credentials: 'include',
  });
}
