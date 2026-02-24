import {
  VesselAPIError,
  VesselAuthError,
  VesselNotFoundError,
  VesselRateLimitError,
  VesselServerError,
} from "vesselapi";

export function formatResult(data: unknown): { content: { type: "text"; text: string }[] } {
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
  };
}

export function handleToolError(error: unknown): { isError: true; content: { type: "text"; text: string }[] } {
  let message: string;

  if (error instanceof VesselAuthError) {
    message = "Authentication failed. Check your VESSELAPI_API_KEY.";
  } else if (error instanceof VesselNotFoundError) {
    message = "Resource not found. Verify the ID or parameters.";
  } else if (error instanceof VesselRateLimitError) {
    message = "Rate limit exceeded. Try again later or reduce request frequency.";
  } else if (error instanceof VesselServerError) {
    message = `Server error: ${error.message}`;
  } else if (error instanceof VesselAPIError) {
    message = `API error: ${error.message}`;
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
