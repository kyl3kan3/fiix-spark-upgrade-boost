export interface NormalizedError {
  message: string;
  cause?: unknown;
}

const hasMessage = (value: unknown): value is { message: string } => {
  return typeof value === "object" && value !== null && "message" in value && typeof (value as { message: unknown }).message === "string";
};

export const normalizeError = (error: unknown, fallbackMessage: string): NormalizedError => {
  if (error instanceof Error) {
    return { message: error.message, cause: error };
  }

  if (typeof error === "string" && error.trim().length > 0) {
    return { message: error, cause: error };
  }

  if (hasMessage(error) && error.message.trim().length > 0) {
    return { message: error.message, cause: error };
  }

  return { message: fallbackMessage, cause: error };
};
