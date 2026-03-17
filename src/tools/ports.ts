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
      limit: z.number().optional().describe("Max results per page"),
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
      etaFrom: z.string().describe("Start of ETA arrival window (RFC3339 format, e.g. 2026-03-07T00:00:00Z)"),
      etaTo: z.string().describe("End of ETA arrival window (RFC3339 format, e.g. 2026-03-14T00:00:00Z)"),
      timeFrom: z.string().optional().describe("AIS position time range start (RFC3339 format)"),
      timeTo: z.string().optional().describe("AIS position time range end (RFC3339 format)"),
      limit: z.number().optional().describe("Max results per page"),
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
    "Get port events (arrivals/departures) for a specific port",
    {
      unlocode: z.string().describe("UN/LOCODE of the port"),
      limit: z.number().optional().describe("Max results per page"),
      nextToken: z.string().optional().describe("Pagination token from previous response"),
    },
    async (params) => {
      try {
        const data = await client.portEvents.byPort(params.unlocode, {
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
      idType: z.string().optional().describe("Identifier type: imo (default), mmsi, or vesselId"),
      eventType: z.string().optional().describe("Filter by event type (arrival, departure)"),
      sortOrder: z.string().optional().describe("Sort order by timestamp (asc or desc)"),
      timeFrom: z.string().optional().describe("Start time (ISO 8601 format)"),
      timeTo: z.string().optional().describe("End time (ISO 8601 format)"),
      limit: z.number().optional().describe("Max results per page"),
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
      eventType: z.string().optional().describe("Filter by event type (arrival, departure)"),
      vesselName: z.string().optional().describe("Filter by vessel name (full-text search)"),
      portName: z.string().optional().describe("Filter by port name (full-text search)"),
      limit: z.number().optional().describe("Max results per page"),
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
    "Search port events by port name",
    {
      portName: z.string().describe("Port name to search for"),
      limit: z.number().optional().describe("Max results per page"),
      nextToken: z.string().optional().describe("Pagination token from previous response"),
    },
    async (params) => {
      try {
        const data = await client.portEvents.byPorts({
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
    "search_port_events_by_vessel",
    "Search port events by vessel name",
    {
      vesselName: z.string().describe("Vessel name to search for"),
      limit: z.number().optional().describe("Max results per page"),
      nextToken: z.string().optional().describe("Pagination token from previous response"),
    },
    async (params) => {
      try {
        const data = await client.portEvents.byVessels({
          filterVesselName: params.vesselName,
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
      idType: z.string().optional().describe("Identifier type: imo (default), mmsi, or vesselId"),
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
      limit: z.number().optional().describe("Max results per page"),
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
