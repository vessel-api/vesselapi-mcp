import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { VesselClient } from "vesselapi";
import { z } from "zod";
import { formatResult, handleToolError } from "../errors.js";

export function registerPortTools(server: McpServer, client: VesselClient): void {
  server.tool(
    "search_ports",
    "Search for ports by name, country, type, size, region, harbor size, or harbor use",
    {
      name: z.string().optional().describe("Port name (partial match)"),
      country: z.string().optional().describe("Country (ISO code)"),
      portType: z.string().optional().describe("Port type classification"),
      size: z.string().optional().describe("Port size classification"),
      region: z.string().optional().describe("Geographic region (partial match)"),
      harborSize: z.string().optional().describe("Harbor size classification"),
      harborUse: z.string().optional().describe("Primary harbor use"),
      limit: z.number().int().min(1).max(50).optional().describe("Results per page, 1 to 50. Defaults to 20."),
      nextToken: z.string().optional().describe("Pagination token from previous response"),
    },
    async (params) => {
      try {
        const data = await client.search.ports({
          filterName: params.name,
          filterCountry: params.country,
          filterPortType: params.portType,
          filterSize: params.size,
          filterRegion: params.region,
          filterHarborSize: params.harborSize,
          filterHarborUse: params.harborUse,
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
    "get_port",
    "Get detailed information about a specific port by UN/LOCODE",
    {
      unlocode: z.string().describe("UN/LOCODE of the port (e.g. NLRTM for Rotterdam)"),
    },
    async (params) => {
      try {
        const data = await client.ports.get(params.unlocode);
        return formatResult(data);
      } catch (error) {
        return handleToolError(error);
      }
    },
  );

  server.tool(
    "get_port_inbound",
    "Get vessels heading to a specific port within an ETA arrival window",
    {
      unlocode: z.string().describe("UN/LOCODE of the destination port (e.g. NLRTM for Rotterdam)"),
      etaFrom: z.string().optional().describe("Start of ETA arrival window (RFC3339). Omit to default to now."),
      etaTo: z.string().optional().describe("End of ETA arrival window (RFC3339). Omit to default to 72 hours ahead."),
      timeFrom: z.string().optional().describe("AIS position time range start (RFC3339 format)"),
      timeTo: z.string().optional().describe("AIS position time range end (RFC3339 format)"),
      limit: z.number().int().min(1).max(50).optional().describe("Results per page, 1 to 50. Defaults to 20."),
      nextToken: z.string().optional().describe("Pagination token from previous response"),
    },
    async (params) => {
      try {
        const data = await client.ports.inbound(params.unlocode, {
          filterEtaFrom: params.etaFrom,
          filterEtaTo: params.etaTo,
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
    "get_port_events",
    "Get port events (arrivals/departures) for a specific port. Covers only the last 2 hours unless timeFrom is given.",
    {
      unlocode: z.string().describe("UN/LOCODE of the port"),
      timeFrom: z.string().optional().describe("Start of the time window, RFC3339. Without it the service returns only the last 2 hours."),
      timeTo: z.string().optional().describe("End of the time window, RFC3339. Defaults to now."),
      limit: z.number().int().min(1).max(50).optional().describe("Results per page, 1 to 50. Defaults to 20."),
      nextToken: z.string().optional().describe("Pagination token from previous response"),
    },
    async (params) => {
      try {
        const data = await client.portEvents.byPort(params.unlocode, {
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
    "get_port_events_by_vessel",
    "Get port events (arrivals/departures) for a specific vessel",
    {
      vesselId: z.string().describe("Vessel identifier (IMO number by default)"),
      idType: z.enum(["imo", "mmsi"]).optional().describe("Identifier type: imo (default) or mmsi"),
      eventType: z.enum(["arrival", "departure", "all"]).optional().describe("Filter by event type. Omit for both arrivals and departures"),
      sortOrder: z.enum(["asc", "desc"]).optional().describe("Sort order by timestamp"),
      timeFrom: z.string().optional().describe("Start time (ISO 8601 format)"),
      timeTo: z.string().optional().describe("End time (ISO 8601 format)"),
      limit: z.number().int().min(1).max(50).optional().describe("Results per page, 1 to 50. Defaults to 20."),
      nextToken: z.string().optional().describe("Pagination token from previous response"),
    },
    async (params) => {
      try {
        const data = await client.portEvents.byVessel(params.vesselId, {
          filterIdType: params.idType,
          filterEventType: params.eventType,
          filterSortOrder: params.sortOrder,
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
    "list_port_events",
    "List port events (arrivals/departures) globally with optional filters for time, country, port, vessel, or event type",
    {
      timeFrom: z.string().optional().describe("Start time (RFC3339 format)"),
      timeTo: z.string().optional().describe("End time (RFC3339 format)"),
      country: z.string().optional().describe("Filter by port country (case-insensitive)"),
      unlocode: z.string().optional().describe("Filter by port UN/LOCODE"),
      eventType: z.enum(["arrival", "departure", "all"]).optional().describe("Filter by event type. Omit for both arrivals and departures"),
      vesselName: z.string().optional().describe("Filter by vessel name (full-text search)"),
      portName: z.string().optional().describe("Filter by port name (full-text search)"),
      limit: z.number().int().min(1).max(50).optional().describe("Results per page, 1 to 50. Defaults to 20."),
      nextToken: z.string().optional().describe("Pagination token from previous response"),
    },
    async (params) => {
      try {
        const data = await client.portEvents.list({
          timeFrom: params.timeFrom,
          timeTo: params.timeTo,
          filterCountry: params.country,
          filterUnlocode: params.unlocode,
          filterEventType: params.eventType,
          filterVesselName: params.vesselName,
          filterPortName: params.portName,
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
    "search_port_events_by_port",
    "Search port events by port name. Covers only the last 2 hours unless timeFrom is given.",
    {
      portName: z.string().describe("Port name to search for"),
      timeFrom: z.string().optional().describe("Start of the time window, RFC3339. Without it the service returns only the last 2 hours."),
      timeTo: z.string().optional().describe("End of the time window, RFC3339. Defaults to now."),
      limit: z.number().int().min(1).max(50).optional().describe("Results per page, 1 to 50. Defaults to 20."),
      nextToken: z.string().optional().describe("Pagination token from previous response"),
    },
    async (params) => {
      try {
        const data = await client.portEvents.byPorts({
          filterPortName: params.portName,
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
    "search_port_events_by_vessel",
    "Search port events by vessel name. Covers only the last 2 hours unless timeFrom is given.",
    {
      vesselName: z.string().describe("Vessel name to search for"),
      timeFrom: z.string().optional().describe("Start of the time window, RFC3339. Without it the service returns only the last 2 hours."),
      timeTo: z.string().optional().describe("End of the time window, RFC3339. Defaults to now."),
      limit: z.number().int().min(1).max(50).optional().describe("Results per page, 1 to 50. Defaults to 20."),
      nextToken: z.string().optional().describe("Pagination token from previous response"),
    },
    async (params) => {
      try {
        const data = await client.portEvents.byVessels({
          filterVesselName: params.vesselName,
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
    "get_vessel_last_port_event",
    "Get the most recent port event (arrival or departure) for a vessel",
    {
      vesselId: z.string().describe("Vessel identifier (IMO number by default)"),
      idType: z.enum(["imo", "mmsi"]).optional().describe("Identifier type: imo (default) or mmsi"),
    },
    async (params) => {
      try {
        const data = await client.portEvents.lastByVessel(params.vesselId, {
          filterIdType: params.idType,
        });
        return formatResult(data);
      } catch (error) {
        return handleToolError(error);
      }
    },
  );

  server.tool(
    "list_emissions",
    "List global vessel emissions data with optional year filter",
    {
      period: z.number().optional().describe("Reporting year filter (e.g. 2024)"),
      limit: z.number().int().min(1).max(50).optional().describe("Results per page, 1 to 50. Defaults to 20."),
      nextToken: z.string().optional().describe("Pagination token from previous response"),
    },
    async (params) => {
      try {
        const data = await client.emissions.list({
          filterPeriod: params.period,
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
