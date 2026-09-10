import type { ZodSchema } from 'zod';

export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

export function ok<T>(data: T): Result<T, never> {
  return { success: true, data };
}

export function fail<E = Error>(error: E): Result<never, E> {
  return { success: false, error };
}

/**
 * Defensive schema validator that catches runtime deviations gracefully.
 */
export function safeValidate<T>(
  schema: ZodSchema<T>,
  input: unknown,
  fallback?: T,
): Result<T, string> {
  const parsed = schema.safeParse(input);
  if (parsed.success) {
    return ok(parsed.data);
  }

  if (fallback !== undefined) {
    return ok(fallback);
  }

  const errorMessage = parsed.error.issues
    ? parsed.error.issues
        .map((issue) => `${String(issue.path?.join('.') || 'root')}: ${issue.message}`)
        .join('; ')
    : parsed.error.message || 'Validation failed';

  return fail(errorMessage);
}
