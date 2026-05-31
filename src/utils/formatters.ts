/** Format runtime in minutes to "2h 18m" */
export function formatRuntime(minutes: number | null | undefined): string {
  if (!minutes) return 'N/A';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/** Format a TMDB date string "YYYY-MM-DD" to "Month YYYY" */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'Unknown';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'Unknown';
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/** Format a year from a TMDB date string */
export function formatYear(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  return dateStr.slice(0, 4);
}

/** Format currency (budget/revenue) */
export function formatCurrency(amount: number): string {
  if (!amount) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount);
}

/** Format a vote average (0–10) to one decimal */
export function formatVoteAverage(avg: number): string {
  return avg.toFixed(1);
}

/** Truncate a string to a max length */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength).trimEnd() + '…';
}
