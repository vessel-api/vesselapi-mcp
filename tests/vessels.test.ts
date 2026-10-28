import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { VesselClient } from "vesselapi";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { registerVesselTools } from "../src/tools/vessels.js";

let requests: URL[];
let client: Client;
// Per-test overrides for the stubbed API response.
let responseStatus: number;
let responseHeaders: Record<string, string>;
let responseBody: unknown;

beforeEach(async () => {
  requests = [];
  responseStatus = 200;
  responseHeaders = {};
  responseBody = { vesselPosition: { mmsi: 123456789 } };
  const fetchStub: typeof fetch = async (input) => {
    requests.push(new URL(input instanceof Request ? input.url : String(input)));
    return new Response(JSON.stringify(responseBody), {
      status: responseStatus,
      headers: { "Content-Type": "application/json", ...responseHeaders },
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

type TextContent = { type: string; text: string }[];

describe("get_vessel_position satellite billing", () => {
  it("tells the model what the satellite lookup charged", async () => {
    responseHeaders = {
      "X-Data-Source": "satellite",
      "X-Satellite-Credit-Charged": "true",
      "X-Satellite-Credits-Remaining": "189",
      "X-Satellite-Lookback-Minutes": "180",
      "X-Satellite-Max-Age-Minutes": "60",
    };
    const result = await client.callTool({ name: "get_vessel_position", arguments: { vesselId: "9074729", sat: true } });
    const content = result.content as TextContent;
    expect(content).toHaveLength(2);
    expect(JSON.parse(content[0]!.text)).toEqual({ vesselPosition: { mmsi: 123456789 } });
    expect(content[1]!.text).toBe(
      "Satellite lookup: position source satellite; 1 satellite credit charged; 189 satellite credits remaining; " +
        "lookback 180 min; stored-position age limit 60 min.",
    );
  });

  it("says when nothing was charged", async () => {
    responseHeaders = { "X-Data-Source": "terrestrial", "X-Satellite-Credits-Remaining": "190" };
    const result = await client.callTool({ name: "get_vessel_position", arguments: { vesselId: "9074729", sat: true } });
    expect((result.content as TextContent)[1]!.text).toBe(
      "Satellite lookup: position source terrestrial; no satellite credit charged; 190 satellite credits remaining.",
    );
  });

  it("says when the balance was empty", async () => {
    responseHeaders = { "X-Data-Source": "terrestrial", "X-Satellite-Status": "insufficient_credits" };
    const result = await client.callTool({ name: "get_vessel_position", arguments: { vesselId: "9074729", sat: true } });
    expect((result.content as TextContent)[1]!.text).toMatch(/^Satellite lookup skipped: .*nothing was charged\.$/);
  });

  it("adds nothing when no satellite lookup was requested", async () => {
    responseHeaders = { "X-Ratelimit-Remaining": "700" };
    const result = await client.callTool({ name: "get_vessel_position", arguments: { vesselId: "9074729" } });
    expect(result.content as TextContent).toHaveLength(1);
  });

  it("describes the charge per fix and what minutes_since_previous means", async () => {
    const { tools } = await client.listTools();
    const tool = tools.find((t) => t.name === "get_vessel_position");
    const sat = (tool?.inputSchema.properties as Record<string, { description?: string }>).sat?.description ?? "";
    expect(sat).not.toMatch(/per call/i);
    expect(sat).toContain("never twice for the same fix on this account");
    expect(tool?.description).toContain("minutes_since_previous is not the age of this position");
  });
});

describe("rate limit errors", () => {
  it("tells the model not to call again", async () => {
    responseStatus = 429;
    responseBody = { error: { type: "rate_limit_error", message: "Rate limit exceeded", code: "rate_limit_exceeded" } };
    const result = await client.callTool({ name: "get_vessel", arguments: { vesselId: "9074729" } });
    expect(result.isError).toBe(true);
    const text = (result.content as TextContent)[0]!.text;
    expect(text).toContain("do not call the API again now");
    expect(text).not.toMatch(/retrying later may succeed/i);
  });
});
