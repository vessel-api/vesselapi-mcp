import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { VesselClient } from "vesselapi";
import { z } from "zod";
import { formatResult, formatSatelliteInfo, handleToolError } from "../errors.js";

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
    "Get the latest stored position of a vessel (latitude, longitude, speed, heading, timestamp). Check the timestamp: the fix may be hours or days old, especially for a vessel away from the coast. The response also carries the vessel's particulars, the destination and ETA it last reported, and a check against its previous position (minutes and distance between that report and this one, implied speed and course, whether the identifiers match). minutes_since_previous is not the age of this position; read vesselPosition.timestamp for that. A separate get_vessel_eta call is needed only when vesselEta is missing.",
    {
      vesselId: z.string().describe("Vessel identifier (IMO number by default)"),
      idType: z.enum(["imo", "mmsi"]).optional().describe("Identifier type: imo (default) or mmsi"),
      sat: z.boolean().optional().describe("Fall back to a satellite position when no recent terrestrial one exists. Draws on a prepaid satellite credit balance: one credit when a satellite fix is returned, never twice for the same fix on this account, and nothing when a terrestrial position is returned. The result says whether a credit was charged. Use it only when a stored position is insufficient."),
      satLookbackMinutes: z.number().int().min(60).max(4800).optional().describe("Only with sat: how old a satellite position may be and still be returned, 60 to 4800 minutes. Defaults to 180."),
      satMaxAgeMinutes: z.number().int().min(15).max(4800).optional().describe("Only with sat: how old a stored position may be before a satellite lookup is made, 15 to 4800 minutes. Defaults to 60. Paid plans only."),
    },
    async (params) => {
      try {
        const { data, satellite } = await client.vessels.positionWithSatelliteInfo(params.vesselId, {
          filterSat: params.sat,
          filterSatLookbackMinutes: params.satLookbackMinutes,
          filterSatMaxAgeMinutes: params.satMaxAgeMinutes,
          filterIdType: params.idType,
        });
        const result = formatResult(data);
        if (satellite) result.content.push({ type: "text", text: formatSatelliteInfo(satellite) });
        return result;
      } catch (error) {
        return handleToolError(error);
      }
    },
  );

  server.tool(
    "get_vessel_eta",
    "Get the most recent ETA the vessel itself reported in its AIS voyage data. This is the declared ETA, not a prediction.",
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
    "Get EU MRV annual emissions reports for a vessel (CO2, fuel consumption). Only ships that report under EU MRV have data.",
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
