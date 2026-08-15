# Changelog

All notable changes to this server are documented here.
This project follows [Semantic Versioning](https://semver.org/).

## [2.0.0] - 2026-08-13

Vessel ownership, classification and inspection data, and NAVTEX messages, were
retired from the VesselAPI service on **10 August 2026**. This release removes
the tools that exposed them.

### Removed (breaking)

| Removed tool | Replacement |
|---|---|
| `get_vessel_classification` | none |
| `get_vessel_ownership` | none |
| `get_vessel_inspections` | none |
| `get_vessel_inspection_detail` | none |
| `get_navtex_messages` | none |

The `search_vessels` tool no longer accepts `classSociety` or `owner`. The API
rejects both with HTTP 400, so supplying either turned a valid search into a
failure.

**19 tools remain**, down from 24.

### Added

- **`q` on `search_vessels`.** One free-text search across name, IMO, MMSI, ENI
  and callsign, so a model holding an identifier does not have to guess which
  kind it is before searching. The response reports which field matched.
- **`eni` on `search_vessels`**, for inland waterway vessels.
- **`sat` on `get_vessel_position`.** Falls back to a satellite position when no
  recent terrestrial one exists. It is charged per call against a prepaid
  balance, and the tool says so.
- **Time windows on the port-event tools.** `get_port_events`,
  `search_port_events_by_port` and `search_port_events_by_vessel` now accept
  `timeFrom` and `timeTo`. Without them the service returns only the last two
  hours, so a model asking about last week silently received almost nothing.
- **Distinct User-Agent.** This server now identifies itself as
  `vesselapi-mcp/<version>`.

### Fixed

- The published registry entry advertised a version that did not match the
  package it installed, so a fresh install could receive an older build.
- The package description claimed coverage of navigational infrastructure
  (DGPS stations, light aids, offshore units, radio beacons). No tools for those
  exist here; the description now matches what is exposed.
- **`get_vessels_in_radius` asked for the radius in nautical miles.** The API
  takes metres. A model asking for vessels within 20 nautical miles sent a
  20 metre circle, got nothing back, and reported no vessels in the area. The
  tool now states metres, gives the 100 km maximum, and notes the conversion.
- **The port-event and area tools did not say how far back they look.**
  `get_port_events` and the two port-event searches silently covered only the
  last two hours; the area tools did not mention that a window may not exceed
  four hours.
- **`limit` is bounded to the 1 to 50 the API accepts**, so an out-of-range
  value is rejected before a call is made rather than after.
- **402 and 403 no longer report as generic API errors.** Out of satellite
  credits, a suspended key and a feature outside the plan are distinct
  conditions, and none of them are worth retrying. Every error now says whether
  retrying can help, and carries the API's error code where there is one.
- **A missing `VESSELAPI_API_KEY` now prints one line explaining what to set**,
  instead of a stack trace as the process dies mid-handshake.
- **`get_port_inbound` required an explicit ETA window**, which obliged the
  model to invent RFC3339 timestamps. The window is now optional and the
  service defaults to the next 72 hours.
- **`idType` advertised a value the API rejects.** Seven tools described it as
  "imo (default), mmsi, or vesselId", but the service accepts only `imo` and
  `mmsi`, so a model that chose `vesselId` got HTTP 400.
- **Parameters with a fixed set of values are now declared as enumerations.**
  `idType`, `eventType` and `sortOrder` were typed as free-form strings across
  11 tool inputs, so the model could pass anything and only find out from a
  failed call. The valid values are now part of the tool schema.

### Requires

`vesselapi` 2.0.0 or later.

### Attribution

Emissions and casualty data: © European Union. Source: European Maritime Safety
Agency (EMSA), THETIS-MRV (EU MRV, Regulation (EU) 2015/757) and the European
Marine Casualty Information Platform (EMCIP). See the README.
