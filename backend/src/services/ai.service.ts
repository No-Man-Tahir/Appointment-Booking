import {
  DateTime,
} from "luxon";

import {
  env,
} from "../config/env.js";

import type {
  ChatMessageRecord,
} from "../repository/chat.repository.js";

import type {
  ProviderRecord,
} from "../repository/provider.repository.js";

import {
  aiResponseSchema,
  type AIResponse,
} from "../schemas/ai.schema.js";

import {
  AppError,
} from "../utils/AppError.js";


const MISTRAL_API_URL =
  "https://api.mistral.ai/v1/chat/completions";

const AI_TIMEOUT_MS =
  15_000;

const MAX_HISTORY_MESSAGES =
  20;


type MistralUsage = {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
};

type MistralResponse = {
  choices?: Array<{
    message?: {
      content?:
        | string
        | Array<{
            type?: string;
            text?: string;
          }>;
    };
  }>;

  usage?: MistralUsage;

  model?: string;
};


function normalizeTimezone(
  timezone?: string
) {
  if (!timezone) {
    return "UTC";
  }

  const now =
    DateTime.now().setZone(
      timezone
    );

  if (!now.isValid) {
    return "UTC";
  }

  return timezone;
}


function buildSystemPrompt(
  providers: ProviderRecord[],
  timezone: string
) {
  const providerList =
    providers.length
      ? providers
          .map(
            (provider) =>
              `- ${provider.name} | specialty: ${
                provider.specialty ??
                "Not specified"
              } | id: ${
                provider.id
              }`
          )
          .join("\n")
      : "No providers are currently available.";

  const currentDate =
    DateTime.now()
      .setZone(timezone)
      .toISODate();

  return `
You are an appointment booking assistant.

Your only job is to help users book appointments with available providers.

Current date: ${currentDate}
User timezone: ${timezone}

Available providers:
${providerList}

Required booking fields:
- provider
- date
- time

Possible actions:

collect_details
- Use when required booking information is missing or ambiguous.

request_confirmation
- Use only when provider, date and time are all known but the user has NOT explicitly confirmed booking yet.

confirm_booking
- Use ONLY when provider, date and time are known AND the user's latest message explicitly confirms that they want the appointment booked.

cancel_booking
- Use when the user explicitly says not to proceed with the pending booking.

unsupported
- Use for requests unrelated to appointment booking.

Rules:

1. Never invent a provider.
2. providerId must come from the available provider list.
3. If provider matching is uncertain, providerId must be null.
4. Resolve relative dates such as "today", "tomorrow", and "next Monday" using the current date above.
5. Dates must use YYYY-MM-DD.
6. Times must use 24-hour HH:mm.
7. Use previous conversation messages to retain already-provided booking information.
8. If required information is missing, ask ONE concise follow-up question.
9. Never claim an appointment has already been booked.
10. Never claim to modify database state.
11. Do not call tools or external systems.
12. If the request is unrelated to appointment booking, politely explain that you only assist with appointments.
13. Do not set confirm_booking just because all fields are complete. The user must explicitly confirm.
14. Replies such as "yes", "confirm", "book it", "go ahead", or equivalent may indicate confirmation when the immediately preceding conversation clearly contains a complete booking proposal.
15. If the user rejects the booking, use cancel_booking.

Return exactly one JSON object:

{
  "assistantMessage": "message for the user",
  "action": "collect_details | request_confirmation | confirm_booking | cancel_booking | unsupported",
  "booking": {
    "providerId": "provider UUID or null",
    "date": "YYYY-MM-DD or null",
    "time": "HH:mm or null",
    "notes": "optional notes or null",
    "missingFields": [
      "provider",
      "date",
      "time"
    ]
  }
}

missingFields must accurately reflect required fields that are still unavailable.
`;
}


function extractContent(
  response: MistralResponse
) {
  const content =
    response.choices?.[0]
      ?.message?.content;

  if (
    typeof content === "string"
  ) {
    return content;
  }

  if (
    Array.isArray(content)
  ) {
    return content
      .filter(
        (part) =>
          part.type === "text"
      )
      .map(
        (part) =>
          part.text ?? ""
      )
      .join("");
  }

  return null;
}


export async function generateAIResponse(
  input: {
    messages:
      ChatMessageRecord[];

    providers:
      ProviderRecord[];

    timezone?: string;
  }
): Promise<AIResponse> {
  const startedAt =
    Date.now();

  const timezone =
    normalizeTimezone(
      input.timezone
    );

  const messages =
    input.messages.slice(
      -MAX_HISTORY_MESSAGES
    );

  try {
    const response =
      await fetch(
        MISTRAL_API_URL,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${env.MISTRAL_API_KEY}`,
          },

          signal:
            AbortSignal.timeout(
              AI_TIMEOUT_MS
            ),

          body: JSON.stringify({
            model:
              env.MISTRAL_MODEL,

            temperature: 0.1,

            response_format: {
              type:
                "json_object",
            },

            messages: [
              {
                role:
                  "system",

                content:
                  buildSystemPrompt(
                    input.providers,
                    timezone
                  ),
              },

              ...messages
                .filter(
                  (message) =>
                    message.role ===
                      "user" ||
                    message.role ===
                      "assistant"
                )
                .map(
                  (message) => ({
                    role:
                      message.role,

                    content:
                      message.content,
                  })
                ),
            ],
          }),
        }
      );

    if (!response.ok) {
      const responseText =
        await response.text();

      console.error(
        JSON.stringify({
          type:
            "ai_request_failed",

          provider:
            "mistral",

          model:
            env.MISTRAL_MODEL,

          status:
            response.status,

          durationMs:
            Date.now() -
            startedAt,

          response:
            responseText.slice(
              0,
              500
            ),
        })
      );

      throw new AppError(
        502,
        "AI service is temporarily unavailable",
        "AI_PROVIDER_ERROR"
      );
    }

    const data =
      (await response.json()) as
        MistralResponse;

    const content =
      extractContent(data);

    if (!content) {
      throw new AppError(
        502,
        "AI returned an empty response",
        "AI_INVALID_RESPONSE"
      );
    }

    let parsedJson:
      unknown;

    try {
      parsedJson =
        JSON.parse(content);
    } catch {
      throw new AppError(
        502,
        "AI returned an invalid response",
        "AI_INVALID_RESPONSE"
      );
    }

    const parsed =
      aiResponseSchema.safeParse(
        parsedJson
      );

    if (!parsed.success) {
      console.error(
        JSON.stringify({
          type:
            "ai_validation_failed",

          provider:
            "mistral",

          model:
            env.MISTRAL_MODEL,

          issues:
            parsed.error.issues,
        })
      );

      throw new AppError(
        502,
        "AI returned an invalid response",
        "AI_INVALID_RESPONSE"
      );
    }

    console.log(
      JSON.stringify({
        type:
          "ai_request",

        provider:
          "mistral",

        model:
          data.model ??
          env.MISTRAL_MODEL,

        durationMs:
          Date.now() -
          startedAt,

        success: true,

        promptTokens:
          data.usage
            ?.prompt_tokens,

        completionTokens:
          data.usage
            ?.completion_tokens,

        totalTokens:
          data.usage
            ?.total_tokens,
      })
    );

    return parsed.data;
  } catch (error) {
    if (
      error instanceof
      AppError
    ) {
      throw error;
    }

    console.error(
      JSON.stringify({
        type:
          "ai_request_failed",

        provider:
          "mistral",

        model:
          env.MISTRAL_MODEL,

        durationMs:
          Date.now() -
          startedAt,

        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      })
    );

    throw new AppError(
      502,
      "AI service is temporarily unavailable",
      "AI_PROVIDER_ERROR"
    );
  }
}