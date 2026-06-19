import { fieldReports, disturbances, pruningTasks, getNextId, getUser, nowStamp, saveStore, addActivity, persistCreate, persistUpdate } from './api';

export function getFieldReports(filters = {}) {
  return fieldReports.filter((r) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const op = getUser(r.operator_id);
      if (!`${r.report_code} ${op?.name || ''} ${r.action_taken}`.toLowerCase().includes(q)) return false;
    }
    if (filters.status && filters.status !== 'All' && r.status !== filters.status) return false;
    if (filters.operator_id && r.operator_id !== filters.operator_id) return false;
    if (filters.report_type && filters.report_type !== 'All' && r.report_type !== filters.report_type) return false;
    return true;
  });
}

export function createReport(data) {
  const report = {
    id: getNextId('fieldReports'),
    report_code: `LPR-2026-${String(fieldReports.length + 1).padStart(3, '0')}`,
    status: 'submitted',
    admin_note: '',
    submitted_at: nowStamp(),
    approved_at: null,
    attachments: [],
    ...data,
  };
  fieldReports.unshift(report);
  if (report.task_id) {
    const task = pruningTasks.find((x) => x.id === report.task_id);
    if (task && task.status !== 'completed') {
      task.status = 'waiting_validation';
      task.updated_at = report.submitted_at;
    }
  }
  addActivity(report.operator_id, `Submit laporan ${report.report_code}`, 'reports');
  saveStore();
  persistCreate('fieldReports', report).catch(console.error);
  if (report.task_id) {
    persistUpdate('pruningTasks', report.task_id, { status: 'waiting_validation' }).catch(console.error);
  }
  return report;
}

export function approveReport(id) {
  const r = fieldReports.find((x) => x.id === id);
  if (!r) return null;
  r.status = 'approved';
  r.approved_at = nowStamp();
  if (r.disturbance_id) {
    const d = disturbances.find((x) => x.id === r.disturbance_id);
    if (d && d.status !== 'closed') {
      d.status = 'resolved';
      d.resolved_at = r.approved_at;
    }
  }
  if (r.task_id) {
    const task = pruningTasks.find((x) => x.id === r.task_id);
    if (task) {
      task.status = 'completed';
      task.updated_at = r.approved_at;
    }
  }
  addActivity(null, `Approve laporan ${r.report_code}`, 'reports');
  saveStore();
  persistUpdate('fieldReports', id, { status: r.status, approved_at: r.approved_at }).catch(console.error);
  if (r.disturbance_id) {
    persistUpdate('disturbances', r.disturbance_id, { status: 'resolved', resolved_at: r.approved_at }).catch(console.error);
  }
  if (r.task_id) {
    persistUpdate('pruningTasks', r.task_id, { status: 'completed' }).catch(console.error);
  }
  return r;
}

export function rejectReport(id, note = '') {
  const r = fieldReports.find((x) => x.id === id);
  if (!r) return null;
  r.status = 'rejected';
  r.admin_note = note || 'Laporan perlu dilengkapi. Harap periksa dan submit ulang.';
  if (r.task_id) {
    const task = pruningTasks.find((x) => x.id === r.task_id);
    if (task) {
      task.status = 'rejected';
      task.updated_at = nowStamp();
    }
  }
  addActivity(null, `Reject laporan ${r.report_code}`, 'reports');
  saveStore();
  persistUpdate('fieldReports', id, { status: r.status, admin_note: r.admin_note }).catch(console.error);
  if (r.task_id) {
    persistUpdate('pruningTasks', r.task_id, { status: 'rejected' }).catch(console.error);
  }
  return r;
}
