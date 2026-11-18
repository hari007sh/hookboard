#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { claudeGenerator, hasServerCredentials } from "../core/claude.js";
import { createPlanner } from "../core/planner.js";
import { createMcpServer } from "./server.js";

const planner = hasServerCredentials() ? createPlanner({ generate: claudeGenerator() }) : createPlanner({ demo: true });
const server = createMcpServer(planner);
await server.connect(new StdioServerTransport());
// stdout is the MCP channel; log to stderr only.
console.error(`hookboard MCP server ready (${hasServerCredentials() ? "live" : "demo"} mode)`);
