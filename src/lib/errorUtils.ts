export interface NormalizedError {
  message: string;
  code?: string;
  status?: number;
}

/**
 * Normalizes any error object, HTTP response body, Axios error, string, or unknown thrown object
 * into a safe, human-readable error object.
 * Guaranteed to NEVER return or contain "[object Object]".
 */
export function normalizeApiError(error: unknown, fallbackMessage = 'An unexpected error occurred.'): NormalizedError {
  if (!error) {
    return { message: fallbackMessage };
  }

  // If already string
  if (typeof error === 'string') {
    const trimmed = error.trim();
    if (trimmed === '[object Object]') {
      return { message: fallbackMessage };
    }
    return { message: trimmed || fallbackMessage };
  }

  // If standard JS Error instance
  if (error instanceof Error) {
    const msg = error.message ? String(error.message).trim() : '';
    if (!msg || msg === '[object Object]') {
      return { message: fallbackMessage };
    }
    return { message: msg };
  }

  // If an object was thrown or passed
  if (typeof error === 'object') {
    const errObj = error as Record<string, any>;

    // Handle nested error envelopes like { error: { message: "...", code: "..." } }
    if (errObj.error && typeof errObj.error === 'object') {
      const nestedMsg = errObj.error.message || errObj.error.error || errObj.error.msg;
      const code = errObj.error.code || errObj.code;
      const status = errObj.error.status || errObj.status;
      if (typeof nestedMsg === 'string' && nestedMsg.trim() && nestedMsg !== '[object Object]') {
        return { message: nestedMsg.trim(), code, status };
      }
    }

    // Handle direct object fields { message: "...", code: "...", status: 500 }
    const directMsg = errObj.message || errObj.error || errObj.visionError || errObj.reason || errObj.msg || errObj.detail || errObj.description;
    const code = errObj.code || (typeof errObj.error === 'object' ? errObj.error?.code : undefined);
    const status = errObj.status || (typeof errObj.error === 'object' ? errObj.error?.status : undefined);

    if (typeof directMsg === 'string' && directMsg.trim() && directMsg !== '[object Object]') {
      return { message: directMsg.trim(), code, status };
    }

    // Try JSON stringification if possible
    try {
      const jsonStr = JSON.stringify(errObj);
      if (jsonStr && jsonStr !== '{}' && jsonStr !== '[object Object]') {
        if (errObj.message && typeof errObj.message === 'string' && errObj.message.trim() !== '[object Object]') {
          return { message: errObj.message, code, status };
        }
      }
    } catch {
      // Ignore JSON stringify failure
    }
  }

  return { message: fallbackMessage };
}
