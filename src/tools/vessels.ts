import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { VesselClient } from "vesselapi";
import { z } from "zod";
import { formatResult, handleToolError } from "../errors.js";

export function registerVesselTools(server: McpServer, client: VesselClient): void {
  server.tool(
    "search_vessels",
    "Search for vessels by name, IMO, MMSI, flag, type, or callsign",
    {
      name: z.string().optional().describe("Vessel name (partial match)"),
      imo: z.string().optional().describe("IMO number"),
      mmsi: z.string().optional().describe("MMSI number"),
      flag: z.string().optional().describe("Flag state (ISO country code)"),
      vesselType: z.string().optional().describe("Vessel type"),
      callsign: z.string().optional().describe("Radio callsign"),
      limit: z.number().optional().describe("Max results per page"),
      nextToken: z.string().optional().describe("Pagination token from previous response"),
    },
    async (params) => {
      try {
        const data = await client.search.vessels({
          filterName: params.name,
          filterImo: params.imo,
          filterMmsi: params.mmsi,
          filterFlag: params.flag,
          filterVesselType: params.vesselType,
          filterCallsign: params.callsign,
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
      idType: z.string().optional().describe("Identifier type: imo (default), mmsi, or vesselId"),
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
      idType: z.string().optional().describe("Identifier type: imo (default), mmsi, or vesselId"),
    },
    async (params) => {
      try {
        const data = await client.vessels.position(params.vesselId, {
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
      idType: z.string().optional().describe("Identifier type: imo (default), mmsi, or vesselId"),
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
    "get_vessel_classification",
    "Get the classification details for a vessel (class society, surveys, hull info)",
    {
      vesselId: z.string().describe("Vessel identifier (IMO number by default)"),
      idType: z.string().optional().describe("Identifier type: imo (default), mmsi, or vesselId"),
    },
    async (params) => {
      try {
        const data = await client.vessels.classification(params.vesselId, {
          filterIdType: params.idType,
        });
        return formatResult(data);
      } catch (error) {
        return handleToolError(error);
      }
    },
  );

  server.tool(
    "get_vessel_ownership",
    "Get the ownership details for a vessel (owner, manager, operator)",
    {
      vesselId: z.string().describe("Vessel identifier (IMO number by default)"),
      idType: z.string().optional().describe("Identifier type: imo (default), mmsi, or vesselId"),
    },
    async (params) => {
      try {
        const data = await client.vessels.ownership(params.vesselId, {
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
      idType: z.string().optional().describe("Identifier type: imo (default), mmsi, or vesselId"),
      limit: z.number().optional().describe("Max results per page"),
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
    "get_vessel_inspections",
    "Get port state control inspections for a vessel",
    {
      vesselId: z.string().describe("Vessel identifier (IMO number by default)"),
      idType: z.string().optional().describe("Identifier type: imo (default), mmsi, or vesselId"),
      limit: z.number().optional().describe("Max results per page"),
      nextToken: z.string().optional().describe("Pagination token from previous response"),
    },
    async (params) => {
      try {
        const data = await client.vessels.inspections(params.vesselId, {
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
      idType: z.string().optional().describe("Identifier type: imo (default), mmsi, or vesselId"),
      limit: z.number().optional().describe("Max results per page"),
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
}
