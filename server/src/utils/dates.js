/**
 * Date helpers. All meal-plan dates are normalised to UTC midnight so a plan
 * maps to exactly one calendar day regardless of the request's timezone.
 */

export function startOfDay(input) {
  const d = input ? new Date(input) : new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export function addDays(input, days) {
  const d = startOfDay(input);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

export function isSameDay(a, b) {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

// Returns the 7 dates of the week containing `input`.
export function weekRange(input, weekStartsOn = 'Monday') {
  const d = startOfDay(input);
  const day = d.getUTCDay(); // 0 = Sun
  const offset = weekStartsOn === 'Monday' ? (day === 0 ? -6 : 1 - day) : -day;
  const first = addDays(d, offset);
  return Array.from({ length: 7 }, (_, i) => addDays(first, i));
}

// Returns every date in the month containing `input`.
export function monthRange(input) {
  const d = startOfDay(input);
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth();
  const first = new Date(Date.UTC(year, month, 1));
  const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return Array.from({ length: days }, (_, i) => new Date(Date.UTC(year, month, i + 1)));
}

export function formatISODate(input) {
  return startOfDay(input).toISOString().slice(0, 10);
}
