import { activityLogs, getUser } from './api';

export function getActivityLogs(limit) {
  const logs = activityLogs.map((log) => ({
    ...log,
    user: log.user_id ? getUser(log.user_id) : null,
  }));
  return limit ? logs.slice(0, limit) : logs;
}
