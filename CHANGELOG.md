# Changelog

All notable changes to this server are documented here.
This project follows [Semantic Versioning](https://semver.org/).

## [2.1.0] - 2026-10-27

### Added

- `get_vessel_position` takes `satLookbackMinutes` (60 to 4800, default 180)
  and `satMaxAgeMinutes` (15 to 4800, default 60, paid plans only). Both apply
  only with `sat`. The first sets how old a satellite position may be and still
  be returned. The second sets how old a stored position may be before a
  satellite lookup is made.

### Changed

- `@modelcontextprotocol/sdk` is upgraded from 1.27.1 to 1.32.2, and the
  dependency now requires at least 1.32.2. This clears the security alerts on
  the SDK and on the HTTP packages it depends on (express, hono and others). The
  server talks over stdio only. Apart from the new parameters, the tool list is
  unchanged.
- The `vesselapi` dependency now requires at least 2.1.0, the first version with
  the satellite window parameters.
- The API now returns `identity_match` in the position check only when it holds
  a record for the vessel and an identifier can be compared. It also checks
  every returned position for a suspected glitch, measured from the vessel's
  previous clean report, so more positions can come back with
  `suspected_glitch: true`.

### Fixed

- The `get_vessel_position` description said a separate `get_vessel_eta` call is
  not needed. The position response omits `vesselEta` when no destination or ETA
  is available, so the description now says the call is needed only when
  `vesselEta` is missing.

## [2.0.2] - 2026-10-27

Documentation only. No tool, parameter or response changed.

### Changed

- The `get_vessel_position` description says that the response also carries the
  vessel's particulars, its last reported destination and ETA, and a check
  against its previous position, so a separate `get_vessel_eta` call is not
  needed. The API added these to the position response on 25 October 2026.

## [2.0.1] - 2026-10-08

Documentation only. No tool, parameter or response changed.

### Changed

- Tool descriptions now say what each endpoint actually returns and where its
  limits are: `get_vessel_position` is the latest stored position, which may be
  hours or days old; `get_vessel_eta` is the ETA the vessel last reported, not a
  prediction; `get_vessel_emissions` and `list_emissions` are EU MRV reports;
  the port event tools state the 2-hour default window and cover "all covered
  ports" rather than "global"; `get_vessels_in_area` and `get_vessels_in_radius`
  describe the time window (default 2 hours, at most 4) and the 4-degree
  bounding box span; `get_port_inbound` describes its ETA window.

### Removed

- The README section on a third-party hosted deployment.

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
