import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { VesselClient } from "vesselapi";

import { VERSION } from "./version.js";
import { registerLocationTools } from "./tools/location.js";
import { registerPortTools } from "./tools/ports.js";
import { registerVesselTools } from "./tools/vessels.js";

// Fail with a readable line rather than a stack trace. Without a key the client
// throws while this module is still evaluating, so the transport never connects
// and the calling application sees the process die mid-handshake with no reason.
if (!process.env.VESSELAPI_API_KEY) {
  process.stderr.write(
    "vesselapi-mcp: VESSELAPI_API_KEY is not set. Add it to the env block of your " +
      "MCP client configuration. Keys are issued at https://dashboard.vesselapi.com\n",
  );
  process.exit(1);
}

const client = new VesselClient(undefined, { userAgent: `vesselapi-mcp/${VERSION}` });

const server = new McpServer({
  name: "vesselapi",
  version: VERSION,
});

registerVesselTools(server, client);
registerPortTools(server, client);
registerLocationTools(server, client);

const transport = new StdioServerTransport();
await server.connect(transport);
