import "server-only";

/** A normalised error carried up from an upstream 101 Digital service. */
export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

/**
 * The invoice and membership services return errors as `{ errors: [{ code,
 * message }] }`; the identity server uses `{ error, error_description }`. This
 * collapses both into a single ApiError.
 */
export function toApiError(status: number, body: unknown, fallback: string): ApiError {
  if (body && typeof body === "object") {
    const record = body as Record<string, unknown>;
    const errors = record.errors;
    if (Array.isArray(errors) && errors.length > 0) {
      const first = errors[0] as Record<string, unknown>;
      const message = typeof first.message === "string" ? first.message.trim() : fallback;
      const code = typeof first.code === "string" ? first.code : undefined;
      return new ApiError(status, message, code);
    }
    if (typeof record.error_description === "string") {
      return new ApiError(status, record.error_description);
    }
    if (typeof record.message === "string") {
      return new ApiError(status, record.message);
    }
  }
  return new ApiError(status, fallback);
}
