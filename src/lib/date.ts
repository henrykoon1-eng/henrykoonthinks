// Format a post's "YYYY-MM-DD" date for display.
//
// `new Date("2026-07-05")` parses as UTC midnight, so in any negative-UTC
// timezone (all of the US) it renders as the previous calendar day ("Jul 4").
// Building the Date from explicit local parts keeps the calendar day stable
// for every reader, wherever they are.
export function formatPostDate(date: string | Date): string {
  if (!date) return '';
  let y: number;
  let mo: number;
  let d: number;
  if (date instanceof Date) {
    // YAML parses unquoted dates as UTC-midnight Date objects; read them back in
    // UTC so we recover the calendar day that was actually written.
    y = date.getUTCFullYear();
    mo = date.getUTCMonth();
    d = date.getUTCDate();
  } else {
    const m = String(date).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return String(date);
    y = Number(m[1]);
    mo = Number(m[2]) - 1;
    d = Number(m[3]);
  }
  return new Date(y, mo, d).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
