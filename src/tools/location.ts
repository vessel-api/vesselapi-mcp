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
      limit: z.number().optional().describe("Max results per page"),
      nextToken: z.string().optional().describe("Pagination token from previous response"),
    },
    async (params) => {
      try {
        const data = await client.location.vesselsBoundingBox({
          latMin: params.latMin,
          latMax: params.latMax,
          lonMin: params.lonMin,
          lonMax: params.lonMax,
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
    "Find all vessels within a radius (in nautical miles) of a point",
    {
      latitude: z.number().describe("Center latitude"),
      longitude: z.number().describe("Center longitude"),
      radius: z.number().describe("Radius in nautical miles"),
      limit: z.number().optional().describe("Max results per page"),
      nextToken: z.string().optional().describe("Pagination token from previous response"),
    },
    async (params) => {
      try {
        const data = await client.location.vesselsRadius({
          latitude: params.latitude,
          longitude: params.longitude,
          radius: params.radius,
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
