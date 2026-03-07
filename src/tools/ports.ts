import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { VesselClient } from "vesselapi";
import { z } from "zod";
import { formatResult, handleToolError } from "../errors.js";

export function registerPortTools(server: McpServer, client: VesselClient): void {
  server.tool(
    "search_ports",
    "Search for ports by name, country, type, or region",
    {
      name: z.string().optional().describe("Port name (partial match)"),
      country: z.string().optional().describe("Country (ISO code)"),
      portType: z.string().optional().describe("Port type"),
      region: z.string().optional().describe("Geographic region"),
      limit: z.number().optional().describe("Max results per page"),
      nextToken: z.string().optional().describe("Pagination token from previous response"),
    },
    async (params) => {
      try {
        const data = await client.search.ports({
          filterName: params.name,
          filterCountry: params.country,
          filterPortType: params.portType,
          filterRegion: params.region,
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
