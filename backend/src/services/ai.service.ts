import {
  env,
} from "../config/env.js";

import {
  aiResponseSchema,
  type AIResponse,
} from "../schemas/ai.schema.js";

import {
  AppError,
} from "../utils/AppError.js";

import type {
  ChatMessageRecord,
} from "../repository/chat.repository.js";

import type {
  ProviderRecord,
} from "../repository/provider.repository.js";


const MISTRAL_API_URL =
  "https://api.mistral.ai/v1/chat/completions";

const AI_TIMEOUT_MS = 15_000;

const MAX_HISTORY_MESSAGES = 20;


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


function buildSystemPrompt(
  providers: ProviderRecord[]
) {
  const providerList =
    providers.length > 0
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
    new Date()
      .toISOString()
      .slice(0, 10);

  return `
You are an appointment booking assistant.

Your job is to understand the user's appointment request and collect the information required for a booking.

Current date: ${currentDate}

Available providers:
${providerList}

Required booking fields:
- provider
- date
- time

Rules:
1. Only use a providerId from the available provider list.
2. Never invent a provider.
3. If a provider cannot be matched confidently, providerId must be null.
4. Resolve relative dates such as "tomorrow" using the current date above.
5. Use YYYY-MM-DD for date.
6. Use 24-hour HH:mm format for time.
7. If required information is missing or ambiguous, ask one concise follow-up question.
8. Do not claim that an appointment has been booked.
9. Do not modify or create appointments.
10. Keep the assistant response concise and helpful.
11. Use previous conversation messages when determining information already provided.

Return exactly one JSON object with this shape:

{
  "assistantMessage": "text shown to the user",
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

missingFields must contain only fields that are still required.
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

  if (Array.isArray(content)) {
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
    messages: ChatMessageRecord[];
    providers: ProviderRecord[];
  }
): Promise<AIResponse> {
  const startedAt =
    Date.now();

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
              type: "json_object",
            },

            messages: [
              {
                role: "system",
                content:
                  buildSystemPrompt(
                    input.providers
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
          provider: "mistral",
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

    let parsedJson: unknown;

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
          provider: "mistral",
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
        type: "ai_request",
        provider: "mistral",
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
      error instanceof AppError
    ) {
      throw error;
    }

    console.error(
      JSON.stringify({
        type:
          "ai_request_failed",
        provider: "mistral",
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