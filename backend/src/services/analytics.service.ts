import {
  createRequestEvent,
  type RequestEventPayload,
} from "../repository/request-event.repository.js";

export async function recordRequestEvent(input: {
  requestId: string;
  userId?: string | null;
  eventType: string;
  payload?: RequestEventPayload;
}) {
  try {
    return await createRequestEvent(input);
  } catch (error) {
    /*
     * Analytics should never break the user's
     * actual application request.
     */
    console.error(
      JSON.stringify({
        type: "request_event_write_failed",
        requestId: input.requestId,
        eventType: input.eventType,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      })
    );

    return null;
  }
}