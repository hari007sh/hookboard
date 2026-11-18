import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { BriefSchema, CritiqueRequestSchema, HooksRequestSchema } from "../core/schemas.js";
import type { Planner } from "../core/planner.js";

/** Exposes the planner as MCP tools, so Claude Desktop / Claude Code can drive every action. */
export function createMcpServer(planner: Planner): McpServer {
  const server = new McpServer({ name: "hookboard", version: "0.1.0" });

  const run = (fn: (input: unknown) => Promise<unknown>) => async (input: unknown) => {
    try {
      const result = await fn(input);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return { isError: true, content: [{ type: "text" as const, text: message }] };
    }
  };

  server.registerTool(
    "plan_week",
    {
      title: "Plan posts",
      description:
        "Plan 1-14 days of short-form social posts for a niche and audience. Each post includes a 0-1.5s hook, payoff, caption, 5-10 hashtags, shot list and QA checklist.",
      inputSchema: BriefSchema.shape,
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    run((i) => planner.planWeek(i)),
  );

  server.registerTool(
    "write_hooks",
    {
      title: "Write hooks",
      description: "Write 1-10 scroll-stopping opening hooks (text + visual + why) for a video topic.",
      inputSchema: HooksRequestSchema.shape,
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    run((i) => planner.writeHooks(i)),
  );

  server.registerTool(
    "critique_caption",
    {
      title: "Critique caption",
      description: "Score a caption 1-10, list strengths and fixes, and suggest a rewrite.",
      inputSchema: CritiqueRequestSchema.shape,
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    run((i) => planner.critiqueCaption(i)),
  );

  return server;
}
