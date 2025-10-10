/* Sanitize % and _ in book title input */
export function sanitizeInput(input: string): string {
  const MAX_LENGTH: number = 100;

  return input
    .slice(0, MAX_LENGTH)
    .toLowerCase()
    .trim()
    .replace(/([\\%_])/g, '\\$1');
}
