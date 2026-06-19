import { users } from './api';

export function loginUser(email, password) {
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) return { success: false, error: 'Email atau password salah.' };
  if (!user.is_active) return { success: false, error: 'Akun Anda telah dinonaktifkan.' };
  return { success: true, user };
}
