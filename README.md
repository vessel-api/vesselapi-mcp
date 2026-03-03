# VesselAPI MCP Server

[![CI](https://github.com/vessel-api/vesselapi-mcp/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/vessel-api/vesselapi-mcp/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/vesselapi-mcp.svg)](https://www.npmjs.com/package/vesselapi-mcp)
[![Node](https://img.shields.io/node/v/vesselapi-mcp.svg)](https://www.npmjs.com/package/vesselapi-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

An [MCP (Model Context Protocol)](https://modelcontextprotocol.io/) server that exposes maritime data from the [VesselAPI](https://vesselapi.com) to AI assistants like Claude Desktop, Cursor, Windsurf, and Claude Code.

<a href="https://glama.ai/mcp/servers/@vessel-api/vessel-api-mcp-server">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@vessel-api/vessel-api-mcp-server/badge" alt="VesselAPI Server MCP server" />
</a>

## Prerequisites

1. Sign up at [dashboard.vesselapi.com](https://dashboard.vesselapi.com)
2. Create an API token in your dashboard
3. Use the token as `VESSELAPI_API_KEY` in the configuration below

**Resources**: [Documentation](https://vesselapi.com/docs) | [API Explorer](https://vesselapi.com/api-reference) | [Dashboard](https://dashboard.vesselapi.com) | [Contact Support](mailto:support@vesselapi.com)

## Features

- **16 tools** covering vessels, ports, location search, and maritime safety
- Vessel search, positions, ETA, classification, ownership, emissions, inspections, and casualties
- Port search, details, and port events (arrivals/departures)
- Geographic vessel search (bounding box and radius)
- NAVTEX maritime safety messages
- Manual pagination to control API quota usage

## Quick Start

No installation required — just configure your AI client with `npx`:

```json
{
  "mcpServers": {
    "vesselapi": {
      "command": "npx",
      "args": ["-y", "vesselapi-mcp"],
      "env": {
        "VESSELAPI_API_KEY": "your-api-key"
      }
    }
  }
}
```

## Configuration

Add the JSON above to the config file for your client:

| Client | Config file |
|---|---|
| Claude Desktop | `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows) |
| Cursor | `.cursor/mcp.json` or `~/.cursor/mcp.json` |
| Claude Code | `.claude/settings.json` or `~/.claude/settings.json` |
| Windsurf | `~/.codeium/windsurf/mcp_config.json` |

## Tools

### Vessel Tools

| Tool | Description |
|---|---|
| `search_vessels` | Search vessels by name, IMO, MMSI, flag, type, or callsign |
| `get_vessel` | Get detailed vessel information |
| `get_vessel_position` | Get current vessel position (lat/lon, speed, heading) |
| `get_vessel_eta` | Get vessel estimated time of arrival |
| `get_vessel_classification` | Get classification details (class society, surveys, hull) |
| `get_vessel_ownership` | Get ownership details (owner, manager, operator) |
| `get_vessel_emissions` | Get emissions data (CO2, fuel consumption) |
| `get_vessel_inspections` | Get port state control inspections |
| `get_vessel_casualties` | Get marine casualty records |

### Port Tools

| Tool | Description |
|---|---|
| `search_ports` | Search ports by name, country, type, or region |
| `get_port` | Get port details by UN/LOCODE |
| `get_port_events` | Get arrivals/departures for a port |
| `get_port_events_by_vessel` | Get port events for a vessel |

### Location Tools

| Tool | Description |
|---|---|
| `get_vessels_in_area` | Find vessels in a bounding box |
| `get_vessels_in_radius` | Find vessels within a radius of a point |

### Safety Tools

| Tool | Description |
|---|---|
| `get_navtex_messages` | Get NAVTEX maritime safety messages |

## Pagination

All list endpoints support `limit` and `nextToken` parameters for manual pagination. When more results exist, the response includes a `nextToken` — pass it in the next call to get the next page.

## Development

```bash
git clone https://github.com/vessel-api/vesselapi-mcp.git
cd vesselapi-mcp
npm install
npm run build
```

```bash
npm run build        # Build the server
npm run typecheck    # Type-check without emitting
npm run clean        # Remove build artifacts
```

### Testing with MCP Inspector

```bash
VESSELAPI_API_KEY=your-key npx @modelcontextprotocol/inspector node dist/index.js
```

## License

MIT