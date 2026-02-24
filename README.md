# VesselAPI MCP Server

An [MCP (Model Context Protocol)](https://modelcontextprotocol.io/) server that exposes maritime data from the [VesselAPI](https://vesselapi.com) to AI assistants like Claude Desktop, Cursor, Windsurf, and Claude Code.

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

Get an API key at [vesselapi.com](https://vesselapi.com).

## Configuration

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

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

### Cursor

Add to `.cursor/mcp.json` in your project or `~/.cursor/mcp.json` globally:

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

### Claude Code

Add to `.claude/settings.json` in your project or `~/.claude/settings.json` globally:

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

### Windsurf

Add to `~/.codeium/windsurf/mcp_config.json`:

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
