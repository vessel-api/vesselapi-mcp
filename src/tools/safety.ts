import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { VesselClient } from "vesselapi";
import { z } from "zod";
import { formatResult, handleToolError } from "../errors.js";

export function registerSafetyTools(server: McpServer, client: VesselClient): void {
  server.tool(
    "get_navtex_messages",
    "Get NAVTEX maritime safety messages (navigational warnings, weather forecasts)",
    {
      timeFrom: z.string().optional().describe("Start time (ISO 8601 format)"),
      timeTo: z.string().optional().describe("End time (ISO 8601 format)"),
      limit: z.number().optional().describe("Max results per page"),
      nextToken: z.string().optional().describe("Pagination token from previous response"),
    },
    async (params) => {
      try {
        const data = await client.navtex.list({
          timeFrom: params.timeFrom,
          timeTo: params.timeTo,
          paginationLimit: params.limit,
          paginationNextToken: params.nextToken,
        });
        return formatResult(data);
      } catch (error) {
        return handleToolError(error);
      }
    },
  );
}
