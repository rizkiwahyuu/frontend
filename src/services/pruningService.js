import {
  pruningTasks,
  fieldReports,
  users,
  getAsset,
  getNextId,
  nowStamp,
  saveStore,
  addActivity,
  persistCreate,
  persistUpdate,
} from './api';

export function getPruningTasks(filters = {}, user = null) {
  return pruningTasks.filter((task) => {
    if (user?.role === 'operator' && task.assigned_to !== user.id) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const asset = task.asset_id ? getAsset(task.asset_id) : null;
      if (!`${task.task_code} ${task.title} ${task.description} ${asset?.asset_code || ''}`.toLowerCase().includes(q)) return false;
    }
    if (filters.region_id && filters.region_id !== 'All' && task.region_id !== parseInt(filters.region_id)) return false;
    if (filters.status && filters.status !== 'All' && task.status !== filters.status) return false;
    if (filters.priority && filters.priority !== 'All' && task.priority !== filters.priority) return false;
    return true;
  });
}

export function getPruningTaskById(id) {
  return pruningTasks.find((task) => task.id === parseInt(id));
}

export function getOperators() {
  return users.filter((u) => u.role === 'operator' && u.is_active);
}

export function createPruningTask(data, userId) {
  const task = {
    id: getNextId('pruningTasks'),
    task_code: `PNG-2026-${String(pruningTasks.length + 1).padStart(3, '0')}`,
    status: data.assigned_to ? 'assigned' : 'draft',
    created_by: userId,
    created_at: nowStamp(),
    updated_at: nowStamp(),
    ...data,
  };
  pruningTasks.unshift(task);
  addActivity(userId, `Membuat tugas pemangkasan ${task.task_code}`, 'pruning');
  saveStore();
  persistCreate('pruningTasks', task).catch(console.error);
  return task;
}

export function updatePruningTask(id, data, userId) {
  const idx = pruningTasks.findIndex((task) => task.id === parseInt(id));
  if (idx < 0) return null;
  pruningTasks[idx] = { ...pruningTasks[idx], ...data, updated_at: nowStamp() };
  addActivity(userId, `Memperbarui tugas ${pruningTasks[idx].task_code}`, 'pruning');
  saveStore();
  persistUpdate('pruningTasks', id, data).catch(console.error);
  return pruningTasks[idx];
}

export function updatePruningStatus(id, status, userId, note = '') {
  const task = getPruningTaskById(id);
  if (!task) return null;
  task.status = status;
  task.updated_at = nowStamp();
  addActivity(userId, `Mengubah status ${task.task_code} menjadi ${status}${note ? ` (${note})` : ''}`, 'pruning');
  saveStore();
  persistUpdate('pruningTasks', id, { status }).catch(console.error);
  return task;
}

export function getPruningReports(taskId) {
  return fieldReports.filter((report) => report.task_id === parseInt(taskId));
}

export function getPruningStats(user = null) {
  const scoped = user?.role === 'operator'
    ? pruningTasks.filter((task) => task.assigned_to === user.id)
    : pruningTasks;
  const today = new Date();
  return {
    total: scoped.length,
    active: scoped.filter((task) => ['assigned', 'on_progress', 'waiting_validation'].includes(task.status)).length,
    waitingValidation: scoped.filter((task) => task.status === 'waiting_validation').length,
    overdue: scoped.filter((task) => task.due_date && new Date(task.due_date) < today && !['completed', 'rejected'].includes(task.status)).length,
  };
}
