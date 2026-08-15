import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { VesselClient } from "vesselapi";
import { z } from "zod";
import { formatResult, handleToolError } from "../errors.js";

export function registerLocationTools(server: McpServer, client: VesselClient): void {
  server.tool(
    "get_vessels_in_area",
    "Find all vessels within a rectangular bounding box (latitude/longitude)",
    {
      latMin: z.number().describe("Southern boundary latitude"),
      latMax: z.number().describe("Northern boundary latitude"),
      lonMin: z.number().describe("Western boundary longitude"),
      lonMax: z.number().describe("Eastern boundary longitude"),
      timeFrom: z.string().optional().describe("Start of the time window, RFC3339. Defaults to 2 hours ago. The window may not exceed 4 hours."),
      timeTo: z.string().optional().describe("End of the time window, RFC3339. Defaults to now. The window may not exceed 4 hours."),
      limit: z.number().int().min(1).max(50).optional().describe("Results per page, 1 to 50. Defaults to 20."),
      nextToken: z.string().optional().describe("Pagination token from previous response"),
    },
    async (params) => {
      try {
        const data = await client.location.vesselsBoundingBox({
          latMin: params.latMin,
          latMax: params.latMax,
          lonMin: params.lonMin,
          lonMax: params.lonMax,
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

  server.tool(
    "get_vessels_in_radius",
    "Find all vessels within a radius of a point. The radius is in METRES, not nautical miles or kilometres.",
    {
      latitude: z.number().describe("Center latitude"),
      longitude: z.number().describe("Center longitude"),
      radius: z.number().describe("Search radius in METRES, maximum 100000 (100 km). One nautical mile is 1852 metres."),
      timeFrom: z.string().optional().describe("Start of the time window, RFC3339. Defaults to 2 hours ago. The window may not exceed 4 hours."),
      timeTo: z.string().optional().describe("End of the time window, RFC3339. Defaults to now. The window may not exceed 4 hours."),
      limit: z.number().int().min(1).max(50).optional().describe("Results per page, 1 to 50. Defaults to 20."),
      nextToken: z.string().optional().describe("Pagination token from previous response"),
    },
    async (params) => {
      try {
        const data = await client.location.vesselsRadius({
          latitude: params.latitude,
          longitude: params.longitude,
          radius: params.radius,
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
