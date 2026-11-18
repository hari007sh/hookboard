import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { beforeAll, describe, expect, it } from "vitest";
import { createPlanner } from "../src/core/planner.js";
import { createMcpServer } from "../src/mcp/server.js";

let client: Client;

beforeAll(async () => {
  const [clientSide, serverSide] = InMemoryTransport.createLinkedPair();
  await createMcpServer(createPlanner({ demo: true })).connect(serverSide);
  client = new Client({ name: "test", version: "1.0.0" });
  await client.connect(clientSide);
});

const textOf = (r: any) => r.content[0].text as string;

describe("MCP server", () => {
  it("lists the three tools with input schemas", async () => {
    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name).sort()).toEqual(["critique_caption", "plan_week", "write_hooks"]);
    const plan = tools.find((t) => t.name === "plan_week")!;
    expect(plan.inputSchema.required).toEqual(expect.arrayContaining(["niche", "audience"]));
  });

  it("plan_week returns a JSON plan", async () => {
    const r = await client.callTool({ name: "plan_week", arguments: { niche: "fitness", audience: "new runners", days: 2 } });
    expect(r.isError).toBeFalsy();
    expect(JSON.parse(textOf(r)).posts).toHaveLength(2);
  });

  it("write_hooks and critique_caption work", async () => {
    const hooks = await client.callTool({ name: "write_hooks", arguments: { topic: "5k training", niche: "running", count: 3 } });
    expect(JSON.parse(textOf(hooks)).hooks).toHaveLength(3);
    const c = await client.callTool({ name: "critique_caption", arguments: { caption: "ran today", niche: "running" } });
    expect(JSON.parse(textOf(c)).score).toBeGreaterThan(0);
  });

  it("rejects invalid arguments", async () => {
    const r = await client.callTool({ name: "plan_week", arguments: { niche: "x", audience: "y", days: 99 } });
    expect(r.isError).toBe(true);
  });
});
