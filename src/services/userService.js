import { users, getNextId, saveStore, addActivity, persistCreate, persistUpdate } from './api';

export function getUsers(filters = {}) {
  return users.filter((user) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!`${user.name} ${user.email} ${user.phone || ''}`.toLowerCase().includes(q)) return false;
    }
    if (filters.role && filters.role !== 'All' && user.role !== filters.role) return false;
    if (filters.status && filters.status !== 'All') {
      const active = filters.status === 'active';
      if (user.is_active !== active) return false;
    }
    return true;
  });
}

export function createUser(data, actorId) {
  const user = {
    id: getNextId('users'),
    password: data.password || (data.role === 'admin' ? 'admin123' : 'operator123'),
    is_active: true,
    ...data,
  };
  users.unshift(user);
  addActivity(actorId, `Menambah user ${user.email}`, 'users');
  saveStore();
  persistCreate('users', user).catch(console.error);
  return user;
}

export function updateUser(id, data, actorId) {
  const idx = users.findIndex((user) => user.id === parseInt(id));
  if (idx < 0) return null;
  users[idx] = { ...users[idx], ...data };
  addActivity(actorId, `Memperbarui user ${users[idx].email}`, 'users');
  saveStore();
  persistUpdate('users', id, data).catch(console.error);
  return users[idx];
}

export function toggleUserStatus(id, actorId) {
  const user = users.find((item) => item.id === parseInt(id));
  if (!user) return null;
  user.is_active = !user.is_active;
  addActivity(actorId, `${user.is_active ? 'Mengaktifkan' : 'Menonaktifkan'} user ${user.email}`, 'users');
  saveStore();
  persistUpdate('users', id, { is_active: user.is_active }).catch(console.error);
  return user;
}
