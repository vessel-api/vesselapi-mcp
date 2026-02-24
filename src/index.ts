import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { VesselClient } from "vesselapi";
import { registerLocationTools } from "./tools/location.js";
import { registerPortTools } from "./tools/ports.js";
import { registerSafetyTools } from "./tools/safety.js";
import { registerVesselTools } from "./tools/vessels.js";

const client = new VesselClient();

const server = new McpServer({
  name: "vesselapi",
  version: "1.0.0",
});

registerVesselTools(server, client);
registerPortTools(server, client);
registerLocationTools(server, client);
registerSafetyTools(server, client);

const transport = new StdioServerTransport();
await server.connect(transport);
