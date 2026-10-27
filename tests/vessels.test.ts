import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { VesselClient } from "vesselapi";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { registerVesselTools } from "../src/tools/vessels.js";

let requests: URL[];
let client: Client;

beforeEach(async () => {
  requests = [];
  const fetchStub: typeof fetch = async (input) => {
    requests.push(new URL(input instanceof Request ? input.url : String(input)));
    return new Response(JSON.stringify({ vesselPosition: { mmsi: 123456789 } }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };
  const vesselClient = new VesselClient("test-key", { fetch: fetchStub, maxRetries: 0 });
  const server = new McpServer({ name: "test", version: "0.0.0" });
  registerVesselTools(server, vesselClient);

  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  client = new Client({ name: "test-client", version: "0.0.0" });
  await client.connect(clientTransport);
});

afterEach(async () => {
  await client.close();
});

describe("get_vessel_position", () => {
  it("passes the satellite window params to the API", async () => {
    const result = await client.callTool({
      name: "get_vessel_position",
      arguments: { vesselId: "9074729", sat: true, satLookbackMinutes: 480, satMaxAgeMinutes: 15 },
    });

    expect(result.isError).toBeFalsy();
    expect(requests).toHaveLength(1);
    const params = requests[0]!.searchParams;
    expect(params.get("filter.sat")).toBe("true");
    expect(params.get("filter.satLookbackMinutes")).toBe("480");
    expect(params.get("filter.satMaxAgeMinutes")).toBe("15");
  });

  it("omits the satellite window params when they are not given", async () => {
    await client.callTool({ name: "get_vessel_position", arguments: { vesselId: "9074729" } });

    expect(requests).toHaveLength(1);
    const params = requests[0]!.searchParams;
    expect(params.has("filter.satLookbackMinutes")).toBe(false);
    expect(params.has("filter.satMaxAgeMinutes")).toBe(false);
  });

  it("rejects values outside the API ranges before calling the API", async () => {
    for (const args of [{ satLookbackMinutes: 59 }, { satLookbackMinutes: 4801 }, { satMaxAgeMinutes: 14 }, { satMaxAgeMinutes: 30.5 }]) {
      const result = await client.callTool({
        name: "get_vessel_position",
        arguments: { vesselId: "9074729", sat: true, ...args },
      });
      expect(result.isError).toBe(true);
    }
    expect(requests).toHaveLength(0);
  });

  it("lists both params on the tool", async () => {
    const { tools } = await client.listTools();
    const tool = tools.find((t) => t.name === "get_vessel_position");
    const props = tool?.inputSchema.properties ?? {};
    expect(props).toHaveProperty("satLookbackMinutes");
    expect(props).toHaveProperty("satMaxAgeMinutes");
  });
});
