import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { VesselClient } from "vesselapi";
import { z } from "zod";
import { formatResult, handleToolError } from "../errors.js";

export function registerVesselTools(server: McpServer, client: VesselClient): void {
  server.tool(
    "search_vessels",
    "Search for vessels. Use q when you have an identifier but do not know which kind it is; use the specific filters to narrow a fleet.",
    {
      q: z.string().optional().describe("Free-text search across name, IMO, MMSI, ENI and callsign. Use this when the type of identifier is unknown."),
      name: z.string().optional().describe("Vessel name (partial match)"),
      imo: z.string().optional().describe("IMO number"),
      mmsi: z.string().optional().describe("MMSI number"),
      eni: z.string().optional().describe("ENI number, used for inland waterway vessels"),
      flag: z.string().optional().describe("Flag state (ISO country code)"),
      vesselType: z.string().optional().describe("Vessel type"),
      callsign: z.string().optional().describe("Radio callsign"),
      yearBuiltMin: z.number().optional().describe("Minimum year built"),
      yearBuiltMax: z.number().optional().describe("Maximum year built"),
      limit: z.number().int().min(1).max(50).optional().describe("Results per page, 1 to 50. Defaults to 20."),
      nextToken: z.string().optional().describe("Pagination token from previous response"),
    },
    async (params) => {
      try {
        const data = await client.search.vessels({
          q: params.q,
          filterEni: params.eni,
          filterName: params.name,
          filterImo: params.imo,
          filterMmsi: params.mmsi,
          filterFlag: params.flag,
          filterVesselType: params.vesselType,
          filterCallsign: params.callsign,
          filterYearBuiltMin: params.yearBuiltMin,
          filterYearBuiltMax: params.yearBuiltMax,
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
    "get_vessel",
    "Get detailed information about a specific vessel",
    {
      vesselId: z.string().describe("Vessel identifier (IMO number by default)"),
      idType: z.enum(["imo", "mmsi"]).optional().describe("Identifier type: imo (default) or mmsi"),
    },
    async (params) => {
      try {
        const data = await client.vessels.get(params.vesselId, {
          filterIdType: params.idType,
        });
        return formatResult(data);
      } catch (error) {
        return handleToolError(error);
      }
    },
  );

  server.tool(
    "get_vessel_position",
    "Get the current position of a vessel (latitude, longitude, speed, heading)",
    {
      vesselId: z.string().describe("Vessel identifier (IMO number by default)"),
      idType: z.enum(["imo", "mmsi"]).optional().describe("Identifier type: imo (default) or mmsi"),
      sat: z.boolean().optional().describe("Fall back to a satellite position when no recent terrestrial one exists. Charged per call against a prepaid balance, so use it only when a stored position is genuinely insufficient."),
    },
    async (params) => {
      try {
        const data = await client.vessels.position(params.vesselId, {
          filterSat: params.sat,
          filterIdType: params.idType,
        });
        return formatResult(data);
      } catch (error) {
        return handleToolError(error);
      }
    },
  );

  server.tool(
    "get_vessel_eta",
    "Get the estimated time of arrival for a vessel",
    {
      vesselId: z.string().describe("Vessel identifier (IMO number by default)"),
      idType: z.enum(["imo", "mmsi"]).optional().describe("Identifier type: imo (default) or mmsi"),
    },
    async (params) => {
      try {
        const data = await client.vessels.eta(params.vesselId, {
          filterIdType: params.idType,
        });
        return formatResult(data);
      } catch (error) {
        return handleToolError(error);
      }
    },
  );

  server.tool(
    "get_vessel_emissions",
    "Get emissions data for a vessel (CO2, fuel consumption)",
    {
      vesselId: z.string().describe("Vessel identifier (IMO number by default)"),
      idType: z.enum(["imo", "mmsi"]).optional().describe("Identifier type: imo (default) or mmsi"),
      limit: z.number().int().min(1).max(50).optional().describe("Results per page, 1 to 50. Defaults to 20."),
      nextToken: z.string().optional().describe("Pagination token from previous response"),
    },
    async (params) => {
      try {
        const data = await client.vessels.emissions(params.vesselId, {
          filterIdType: params.idType,
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
    "get_vessel_casualties",
    "Get marine casualty records for a vessel",
    {
      vesselId: z.string().describe("Vessel identifier (IMO number by default)"),
      idType: z.enum(["imo", "mmsi"]).optional().describe("Identifier type: imo (default) or mmsi"),
      limit: z.number().int().min(1).max(50).optional().describe("Results per page, 1 to 50. Defaults to 20."),
      nextToken: z.string().optional().describe("Pagination token from previous response"),
    },
    async (params) => {
      try {
        const data = await client.vessels.casualties(params.vesselId, {
          filterIdType: params.idType,
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
    "get_vessel_positions_batch",
    "Get positions for multiple vessels at once by MMSI or IMO numbers",
    {
      ids: z.string().describe("Comma-separated list of MMSI or IMO numbers"),
      idType: z.enum(["imo", "mmsi"]).optional().describe("Identifier type: imo (default) or mmsi"),
      timeFrom: z.string().optional().describe("Start time filter in RFC3339 format (defaults to 2 hours ago)"),
      timeTo: z.string().optional().describe("End time filter in RFC3339 format (defaults to current time)"),
      limit: z.number().int().min(1).max(50).optional().describe("Results per page, 1 to 50. Defaults to 20."),
      nextToken: z.string().optional().describe("Pagination token from previous response"),
    },
    async (params) => {
      try {
        const data = await client.vessels.positions({
          filterIds: params.ids,
          filterIdType: params.idType,
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
