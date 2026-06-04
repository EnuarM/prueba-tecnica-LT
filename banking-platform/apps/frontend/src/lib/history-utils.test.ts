import { formatDate, paginate, totalPages } from './history-utils';

describe('formatDate', () => {
  it('formats an ISO date string in es-CO locale', () => {
    // Use midday UTC to avoid timezone shifting the day
    const result = formatDate('2025-03-15T12:00:00.000Z');
    expect(result).toMatch(/15/);
    expect(result).toMatch(/2025/);
  });

  it('handles a recent date', () => {
    const result = formatDate('2026-06-04T12:00:00.000Z');
    expect(result).toMatch(/2026/);
  });
});

describe('paginate', () => {
  const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  it('returns the first page correctly', () => {
    expect(paginate(items, 1, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it('returns the second page correctly', () => {
    expect(paginate(items, 2, 5)).toEqual([6, 7, 8, 9, 10]);
  });

  it('returns a partial last page', () => {
    expect(paginate(items, 2, 7)).toEqual([8, 9, 10]);
  });

  it('returns empty array for out-of-range page', () => {
    expect(paginate(items, 5, 5)).toEqual([]);
  });
});

describe('totalPages', () => {
  it('calculates correct page count', () => {
    expect(totalPages(10, 5)).toBe(2);
    expect(totalPages(11, 5)).toBe(3);
    expect(totalPages(5, 5)).toBe(1);
  });

  it('returns 1 for empty list', () => {
    expect(totalPages(0, 5)).toBe(1);
  });

  it('returns 1 for fewer items than page size', () => {
    expect(totalPages(3, 5)).toBe(1);
  });
});
