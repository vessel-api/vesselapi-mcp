import {
  VesselAPIError,
  VesselAuthError,
  VesselForbiddenError,
  VesselNotFoundError,
  VesselPaymentRequiredError,
  VesselRateLimitError,
  VesselServerError,
} from "vesselapi";

export function formatResult(data: unknown): { content: { type: "text"; text: string }[] } {
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
  };
}

/**
 * Turn an SDK error into something a model can act on.
 *
 * The distinction that matters to a caller is whether retrying can ever help.
 * A 4xx is the request's fault and will fail identically until the caller
 * changes something, so each one says what to change. Only 429 and 5xx are
 * worth trying again. Where the API supplies a machine-readable `code` it is
 * included, since the prose message is free-form and may be reworded.
 */
export function handleToolError(error: unknown): { isError: true; content: { type: "text"; text: string }[] } {
  let message: string;

  if (error instanceof VesselAuthError) {
    message = "Authentication failed. Check your VESSELAPI_API_KEY. Do not retry.";
  } else if (error instanceof VesselPaymentRequiredError) {
    message =
      "Out of satellite credits, and no stored position was available to fall back on. " +
      "Retry without the satellite option to use stored data, or top up the balance at " +
      "https://dashboard.vesselapi.com. Retrying the same request will not help.";
  } else if (error instanceof VesselForbiddenError) {
    message =
      error.code === "feature_not_available"
        ? "This endpoint is not included in the current plan. Do not retry; a different plan is required."
        : "The API key is suspended, usually for sustained quota abuse. Do not retry; " +
          "check the account at https://dashboard.vesselapi.com.";
  } else if (error instanceof VesselNotFoundError) {
    message = `Resource not found. Verify the ID or parameters. ${error.message}`;
  } else if (error instanceof VesselRateLimitError) {
    message = "Rate limit exceeded. Retrying later may succeed; reduce request frequency.";
  } else if (error instanceof VesselServerError) {
    message = `Server error, retrying later may succeed: ${error.message}`;
  } else if (error instanceof VesselAPIError) {
    // Remaining 4xx: the request itself is wrong. Name the code so the model can
    // tell an unparseable time range from an out-of-range coordinate.
    const code = error.code ? ` (code: ${error.code})` : "";
    const retry = error.statusCode >= 400 && error.statusCode < 500 ? " Do not retry without changing the request." : "";
    message = `Request rejected${code}: ${error.message}.${retry}`;
  } else if (error instanceof Error) {
    message = error.message;
  } else {
    message = String(error);
  }

  return {
    isError: true,
    content: [{ type: "text", text: message }],
  };
}
