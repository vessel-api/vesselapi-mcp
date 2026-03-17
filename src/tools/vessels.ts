import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { VesselClient } from "vesselapi";
import { z } from "zod";
import { formatResult, handleToolError } from "../errors.js";

export function registerVesselTools(server: McpServer, client: VesselClient): void {
  server.tool(
    "search_vessels",
    "Search for vessels by name, IMO, MMSI, flag, type, callsign, year built, class society, or owner",
    {
      name: z.string().optional().describe("Vessel name (partial match)"),
      imo: z.string().optional().describe("IMO number"),
      mmsi: z.string().optional().describe("MMSI number"),
      flag: z.string().optional().describe("Flag state (ISO country code)"),
      vesselType: z.string().optional().describe("Vessel type"),
      callsign: z.string().optional().describe("Radio callsign"),
      yearBuiltMin: z.number().optional().describe("Minimum year built"),
      yearBuiltMax: z.number().optional().describe("Maximum year built"),
      classSociety: z.string().optional().describe("Classification society (case-insensitive)"),
      owner: z.string().optional().describe("Owner name (partial match, case-insensitive)"),
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
          filterYearBuiltMin: params.yearBuiltMin,
          filterYearBuiltMax: params.yearBuiltMax,
          filterClassSociety: params.classSociety,
          filterOwner: params.owner,
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

  server.tool(
    "get_vessel_inspection_detail",
    "Get detailed information about a specific vessel inspection",
    {
      vesselId: z.string().describe("Vessel identifier (IMO number by default)"),
      detailId: z.string().describe("Inspection detail ID"),
      idType: z.string().optional().describe("Identifier type: imo (default), mmsi, or vesselId"),
    },
    async (params) => {
      try {
        const data = await client.vessels.inspectionDetail(params.vesselId, params.detailId, {
          filterIdType: params.idType,
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
      idType: z.string().optional().describe("Identifier type: imo (default) or mmsi"),
      timeFrom: z.string().optional().describe("Start time filter in RFC3339 format (defaults to 2 hours ago)"),
      timeTo: z.string().optional().describe("End time filter in RFC3339 format (defaults to current time)"),
      limit: z.number().optional().describe("Max results per page"),
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
