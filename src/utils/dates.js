export function pad(n) {
  return n < 10 ? `0${n}` : String(n);
}

export function localDayKey(iso) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Calendar day in local timezone from a Date instance (avoid UTC drift from toISOString). */
export function localCalendarKey(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function todayLocalKey() {
  return localCalendarKey(new Date());
}

export function formatLongDate(iso) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatMediumDate(iso) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

/** Monday-based week: array of 7 dates at local midnight */
export function getWeekDays(anchor = new Date()) {
  const start = new Date(anchor);
  const dow = start.getDay();
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  start.setDate(start.getDate() + mondayOffset);
  start.setHours(0, 0, 0, 0);
  const days = [];
  for (let i = 0; i < 7; i++) {
    const x = new Date(start);
    x.setDate(start.getDate() + i);
    days.push(x);
  }
  return days;
}

export function isSameLocalDay(iso, dateObj) {
  return localDayKey(iso) === localDayKey(dateObj.toISOString());
}
