// Client-side date helpers. We work with plain YYYY-MM-DD strings for API calls
// to avoid timezone drift, and Date objects for display.

export function toISO(date) {
  const d = date instanceof Date ? date : new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function todayISO() {
  return toISO(new Date());
}

// Dates coming back from the API are calendar days normalized to UTC midnight
// (see server/src/utils/dates.js). Reading them with local getters shifts them a
// day behind for anyone west of UTC, so pull the calendar day out in UTC.
export function apiISO(value) {
  if (!value) return null;
  if (typeof value === 'string') {
    // Already a plain YYYY-MM-DD, or an ISO timestamp whose date part is the day.
    const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) return match[1];
  }
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

export function addDaysISO(iso, days) {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d + days);
  return toISO(date);
}

export function fromISO(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function dayName(iso) {
  return DAY_NAMES[fromISO(iso).getDay()];
}

export function monthName(monthIndex) {
  return MONTH_NAMES[monthIndex];
}

export function prettyDate(iso, { withYear = true } = {}) {
  const d = fromISO(iso);
  return `${DAY_NAMES[d.getDay()].slice(0, 3)}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}${
    withYear ? `, ${d.getFullYear()}` : ''
  }`;
}

export function isTodayISO(iso) {
  return iso === todayISO();
}

// Days for the month grid, padded to full weeks (weekStartsOn: 0=Sun, 1=Mon).
export function monthGrid(year, month, weekStartsOn = 1) {
  const firstOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let startPad = firstOfMonth.getDay() - weekStartsOn;
  if (startPad < 0) startPad += 7;

  const cells = [];
  for (let i = 0; i < startPad; i += 1) cells.push(null);
  for (let d = 1; d <= daysInMonth; d += 1) cells.push(toISO(new Date(year, month, d)));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function weekdayHeaders(weekStartsOn = 1) {
  const base = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  return [...base.slice(weekStartsOn), ...base.slice(0, weekStartsOn)];
}
