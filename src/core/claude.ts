import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import type { Generator } from "./planner.js";

export const MODEL = process.env.HOOKBOARD_MODEL ?? "claude-opus-5-5";

/** True when the server has its own credentials configured. */
export function hasServerCredentials(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
}

export class ModelError extends Error {
  constructor(message: string, readonly status = 502) {
    super(message);
  }
}

/**
 * Builds a Generator backed by the Claude Messages API with structured outputs.
 * Pass apiKey to use a caller-supplied key (bring-your-own-key); it is never logged or stored.
 */
export function claudeGenerator(apiKey?: string): Generator {
  const client = apiKey ? new Anthropic({ apiKey }) : new Anthropic();

  return async (schema, system, user) => {
    const response = await client.beta.messages.parse({
      model: MODEL,
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "medium", format: betaZodOutputFormat(schema) },
      system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: user }],
    });

    if (response.stop_reason === "refusal") {
      throw new ModelError("The model declined this request. Try rephrasing the brief.", 422);
    }
    if (response.stop_reason === "max_tokens") {
      throw new ModelError("The response was too long. Try fewer days.", 502);
    }
    if (response.parsed_output == null) {
      throw new ModelError("The model returned output that did not match the expected format.", 502);
    }
    return response.parsed_output;
  };
}
