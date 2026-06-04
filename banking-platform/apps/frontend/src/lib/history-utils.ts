/**
 * Utility: formats an ISO date string the same way the history page does.
 * Extracted here so we can unit-test it in isolation.
 */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Calculates pagination slice indices.
 */
export function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  return items.slice((page - 1) * pageSize, page * pageSize);
}

/**
 * Returns total page count (minimum 1).
 */
export function totalPages(itemCount: number, pageSize: number): number {
  return Math.max(1, Math.ceil(itemCount / pageSize));
}
