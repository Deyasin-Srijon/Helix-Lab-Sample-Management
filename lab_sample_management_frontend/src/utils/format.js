export function formatDate(dateValue, timeValue) {
  if (!dateValue) return '—';

  let formattedDate = String(dateValue);

  const date = new Date(dateValue);

  if (!Number.isNaN(date.getTime())) {
    formattedDate = new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    }).format(date);
  }

  if (!timeValue) {
    return formattedDate;
  }

  const [hours, minutes, seconds] = String(timeValue)
    .split(':')
    .map(Number);

  if (Number.isNaN(hours)) {
    return `${formattedDate} ${timeValue}`;
  }

  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;

  const formattedTime = [
    String(hour12).padStart(2, '0'),
    !Number.isNaN(minutes) ? String(minutes).padStart(2, '0') : '00',
    !Number.isNaN(seconds) ? String(seconds).padStart(2, '0') : '00',
  ].join(':');

  return `${formattedDate}, ${formattedTime} ${period}`;
}