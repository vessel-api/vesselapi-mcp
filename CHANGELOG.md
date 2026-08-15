# Changelog

All notable changes to this server are documented here.
This project follows [Semantic Versioning](https://semver.org/).

## [2.0.0] - 2026-08-13

Vessel ownership, classification and inspection data, and NAVTEX messages were
retired from the VesselAPI service on **10 August 2026**. There is no
replacement for them.

### Removed (breaking)

- `get_vessel_classification`
- `get_vessel_ownership`
- `get_vessel_inspections`
- `get_vessel_inspection_detail`
- `get_navtex_messages`

`search_vessels` no longer accepts `classSociety` or `owner`. The API rejects
both with HTTP 400.

**19 tools remain**, down from 24.

### Added

- **`q` on `search_vessels`.** Free-text search across name, IMO, MMSI, ENI and
  callsign. The response reports which fields matched.
- **`eni` on `search_vessels`**, for inland waterway vessels.
- **`sat` on `get_vessel_position`.** Falls back to a satellite position when no
  recent terrestrial one exists. Charged per call against a prepaid balance.
- **`timeFrom` and `timeTo` on `get_port_events`, `search_port_events_by_port`
  and `search_port_events_by_vessel`.** Without them the service returns only
  the last 2 hours.

### Fixed

- **`get_vessels_in_radius` asked for the radius in nautical miles.** The API
  takes metres, so a request for 20 nautical miles searched 20 metres and
  returned nothing.
- **`get_port_inbound` required an ETA window.** It is now optional, and the
  service defaults to the next 72 hours.
- **`idType` offered `vesselId`, which the API rejects with HTTP 400.** It now
  accepts `imo` and `mmsi` only.
- **402 and 403 reported as generic API errors.** Out of satellite credits, a
  suspended key and a feature outside the plan are now distinct conditions,
  none worth retrying unchanged.
- **A missing `VESSELAPI_API_KEY` killed the process with a stack trace during
  startup.** It now prints one line naming the variable.
- **Two version mismatches.** `server.json` declared 1.0.1 while the package was
  1.3.0, and the server reported 1.0.0 in the MCP handshake whatever the
  installed version.
- **Tool schemas now match what the API accepts.** `idType`, `eventType` and
  `sortOrder` are enumerations, `limit` is bounded to 1 to 50, and the area
  tools state the 4 hour maximum window.

### Requires

`vesselapi` 2.0.0 or later.

### Attribution

Emissions and casualty data: © European Union. Source: European Maritime Safety
Agency (EMSA), THETIS-MRV (EU MRV, Regulation (EU) 2015/757) and the European
Marine Casualty Information Platform (EMCIP). See the README.
