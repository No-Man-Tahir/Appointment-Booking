import {
  DateTime,
} from "luxon";

import {
  createChatMessage,
  createChatSession,
  findChatSessionByIdAndUser,
  findChatSessionsByUser,
  findMessagesBySession,
} from "../repository/chat.repository.js";

import {
  findProviders,
} from "../repository/provider.repository.js";

import {
  type BookingDraft,
} from "../schemas/ai.schema.js";

import {
  AppError,
} from "../utils/AppError.js";

import {
  generateAIResponse,
} from "./ai.service.js";

import {
  bookAppointment,
} from "./appointment.service.js";

import {
  recordRequestEvent,
} from "./analytics.service.js";

function normalizeTimezone(
  timezone?: string
) {
  if (!timezone) {
    return "UTC";
  }

  const date =
    DateTime.now().setZone(
      timezone
    );

  return date.isValid
    ? timezone
    : "UTC";
}


function normalizeBooking(
  booking: BookingDraft,
  providers: Awaited<
    ReturnType<
      typeof findProviders
    >
  >
) {
  let providerId =
    booking.providerId;

  if (
    providerId &&
    !providers.some(
      (provider) =>
        provider.id ===
        providerId
    )
  ) {
    providerId = null;
  }

  const missingFields =
    new Set(
      booking.missingFields
    );

  if (!providerId) {
    missingFields.add(
      "provider"
    );
  } else {
    missingFields.delete(
      "provider"
    );
  }

  if (!booking.date) {
    missingFields.add(
      "date"
    );
  } else {
    missingFields.delete(
      "date"
    );
  }

  if (!booking.time) {
    missingFields.add(
      "time"
    );
  } else {
    missingFields.delete(
      "time"
    );
  }

  return {
    ...booking,

    providerId,

    missingFields:
      Array.from(
        missingFields
      ),
  };
}


function getProviderName(
  providerId: string | null,
  providers: Awaited<
    ReturnType<
      typeof findProviders
    >
  >
) {
  if (!providerId) {
    return null;
  }

  return (
    providers.find(
      (provider) =>
        provider.id ===
        providerId
    )?.name ?? null
  );
}


function buildConfirmationMessage(
  input: {
    providerName: string;
    date: string;
    time: string;
  }
) {
  return (
    `I have ${input.providerName} ` +
    `on ${input.date} at ${input.time}. ` +
    `Would you like me to book this appointment?`
  );
}


function buildSuccessMessage(
  input: {
    providerName: string;
    date: string;
    time: string;
  }
) {
  return (
    `Your appointment with ${input.providerName} ` +
    `is booked for ${input.date} at ${input.time}.`
  );
}


function toUtcTimestamp(
  input: {
    date: string;
    time: string;
    timezone: string;
  }
) {
  const local =
    DateTime.fromISO(
      `${input.date}T${input.time}`,
      {
        zone:
          input.timezone,
      }
    );

  if (!local.isValid) {
    throw new AppError(
      400,
      "Invalid appointment date or time",
      "INVALID_APPOINTMENT_TIME"
    );
  }

  const utc =
    local.toUTC();

  return utc.toISO();
}


export async function startChatSession(
  userId: string
) {
  return createChatSession(
    userId
  );
}


export async function getUserChatSessions(
  userId: string
) {
  return findChatSessionsByUser(
    userId
  );
}


export async function getUserChatSession(
  userId: string,
  sessionId: string
) {
  const session =
    await findChatSessionByIdAndUser(
      sessionId,
      userId
    );

  if (!session) {
    throw new AppError(
      404,
      "Chat session not found",
      "CHAT_SESSION_NOT_FOUND"
    );
  }

  return session;
}


export async function getChatMessages(
  userId: string,
  sessionId: string
) {
  const session =
    await findChatSessionByIdAndUser(
      sessionId,
      userId
    );

  if (!session) {
    throw new AppError(
      404,
      "Chat session not found",
      "CHAT_SESSION_NOT_FOUND"
    );
  }

  return findMessagesBySession(
    session.id
  );
}


export async function sendChatMessage(
  input: {
    userId: string;

    sessionId: string;

    content: string;

    timezone?: string;
    requestId?: string;
  }
) {
  const session =
    await findChatSessionByIdAndUser(
      input.sessionId,
      input.userId
    );

  if (!session) {
    throw new AppError(
      404,
      "Chat session not found",
      "CHAT_SESSION_NOT_FOUND"
    );
  }

  if (
    session.status !==
    "active"
  ) {
    throw new AppError(
      409,
      "Chat session is closed",
      "CHAT_SESSION_CLOSED"
    );
  }


  const timezone =
    normalizeTimezone(
      input.timezone
    );


  const userMessage =
    await createChatMessage({
      sessionId:
        session.id,

      role:
        "user",

      content:
        input.content,
    });

    await recordRequestEvent({
  requestId:
    String(input.requestId),

  userId:
    input.userId,

  eventType:
    "user_message_saved",

  payload: {
    chatSessionId:
      session.id,

    messageId:
      userMessage.id,
  },
});

  const history =
    await findMessagesBySession(
      session.id
    );


  const providers =
    await findProviders();


    await recordRequestEvent({
  requestId:
    String(input.requestId),

  userId:
    input.userId,

  eventType:
    "ai_request_started",

  payload: {
    chatSessionId:
      session.id,

    providerCount:
      providers.length,
  },
});
  const aiResult =
    await generateAIResponse({
      messages:
        history,

      providers,

      timezone,
    });

await recordRequestEvent({
  requestId:
    String(input.requestId),

  userId:
    input.userId,

  eventType:
    "ai_response_received",

  payload: {
    action:
      aiResult.action,

    missingFields:
      aiResult.booking
        .missingFields,
  },
});
  const booking =
    normalizeBooking(
      aiResult.booking,
      providers
    );


  const providerName =
    getProviderName(
      booking.providerId,
      providers
    );


  const bookingComplete =
    booking.missingFields
      .length === 0 &&
    booking.providerId !==
      null &&
    booking.date !== null &&
    booking.time !== null;


  let assistantContent =
    aiResult.assistantMessage;

  let appointment:
    | Awaited<
        ReturnType<
          typeof bookAppointment
        >
      >
    | null = null;

  let fallbackToForm =false


  if (
    aiResult.action ===
    "cancel_booking"
  ) {
    assistantContent =
      "No problem. I won't book that appointment.";

    fallbackToForm = false;
  } else if (
    aiResult.action ===
      "confirm_booking" &&
    bookingComplete &&
    providerName
  ) {
    const scheduledAt =
      toUtcTimestamp({
        date:
          booking.date!,

        time:
          booking.time!,

        timezone,
      });

    try {
      appointment =
        await bookAppointment({
          userId:
            input.userId,

          providerId:
            booking.providerId!,

          scheduledAt,

          notes:
            booking.notes ??
            undefined,
        });
        await recordRequestEvent({
  requestId:
    String(input.requestId),

  userId:
    input.userId,

  eventType:
    "appointment_created",

  payload: {
    appointmentId:
      appointment.id,

    providerId:
      appointment.provider_id,

    scheduledAt:
      appointment.scheduled_at,
  },
});

      assistantContent =
        buildSuccessMessage({
          providerName,

          date:
            booking.date!,

          time:
            booking.time!,
        });

      fallbackToForm =
        false;
    } catch (error) {
      if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    error.code === "23P01" &&
    "constraint" in error &&
    error.constraint ===
      "appointments_no_provider_overlap"
  ) {
    await recordRequestEvent({
  requestId:
    String(input.requestId),

  userId:
    input.userId,

  eventType:
    "appointment_slot_conflict",

  payload: {
    providerId:
      booking.providerId,

    date:
      booking.date,

    time:
      booking.time,
  },
});
    throw new AppError(
      409,
      "The provider is already booked during that time",
      "APPOINTMENT_SLOT_UNAVAILABLE"
    );
  }

  throw error;
    }
  } else if (
    bookingComplete &&
    providerName
  ) {
    assistantContent =
      buildConfirmationMessage({
        providerName,

        date:
          booking.date!,

        time:
          booking.time!,
      });

    fallbackToForm =
      false;
      await recordRequestEvent({
  requestId:
    String(input.requestId),

  userId:
    input.userId,

  eventType:
    "booking_confirmation_requested",

  payload: {
    providerId:
      booking.providerId,

    date:
      booking.date,

    time:
      booking.time,
  },
});
  }


  const assistantMessage =
    await createChatMessage({
      sessionId:
        session.id,

      role:
        "assistant",

      content:
        assistantContent,
    });
await recordRequestEvent({
  requestId:
    String(input.requestId),

  userId:
    input.userId,

  eventType:
    "assistant_message_saved",

  payload: {
    chatSessionId:
      session.id,

    messageId:
      assistantMessage.id,
  },
});

  return {
    userMessage,

    assistantMessage,

    booking: {
      ...booking,

      providerName,
    },

    appointment:
      appointment
        ? {
            id:
              appointment.id,

            providerId:
              appointment.provider_id,

            scheduledAt:
              appointment.scheduled_at,

            status:
              appointment.status,
          }
        : null,

    fallbackToForm,
  };
}