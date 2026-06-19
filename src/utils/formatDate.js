export function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function calcDuration(start, end) {
  if (!start) return '-';
  const s = new Date(start);
  const e = end ? new Date(end) : new Date();
  const h = Math.round(((e - s) / 36e5) * 10) / 10;
  if (h < 24) return `${h} jam`;
  return `${(Math.round((h / 24) * 10) / 10)} hari`;
}
