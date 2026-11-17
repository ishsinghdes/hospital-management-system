# Hospital Management System

**UI/UX · Designed by Ish Singh**

A spatial hospital care and operations dashboard, built with HTML, CSS, JavaScript and locally bundled Three.js.

- Live project: https://ishsinghdes.github.io/hospital-management-system/
- Portfolio: https://www.ishsingh.co/#project/hospital-management-system
- Gallery: `assets/hospital-management-system/` contains eight screenshots (four mobile) and four four-second H.264 loops, with responsive variants and posters.

All hospital, patient, staff, inventory and facilities data is fictional. This is a browser-local UI prototype, not a clinical system. Sign-in is illustrative and does not authenticate against a server. Do not enter real patient information.

Run locally with `python3 -m http.server 8080` and open http://localhost:8080. GitHub Pages serves the repository root from `main`.

See `HANDOVER.md` for architecture, workflows and design decisions. The original spatial renderer is retained in `classic/`; the settings view also lets you switch renderers.

Designed with love, designed with a heart, by Ish.

---

# Aspatal

A desktop-first hospital care and operations dashboard, built with HTML, CSS, JavaScript and a locally bundled Three.js WebGL renderer.

## Open or host

Open `index.html` in a modern browser. Keep `index.html`, `styles.css` and `app.js` together. No installation, build command, API keys or network connection is needed for the local site. Keep `floor-plan.js`, `room-operations.js`, `vendor/` and `classic/` alongside those files. The bundled engine license is in `vendor/THREE-LICENSE.txt`.

For a GitHub repository, upload the files **inside** this Aspatal folder into the repository root. The site entry point is `index.html`. It can be served by a static host without a build step. `.nojekyll` is included for static hosting compatibility. Keep source filenames unchanged.

## Included

- Subdued surface finishes: slate-blue corridors, warm room floors, painted wall bands, a sage courtyard and honey-toned pharmacies.
- Selected rooms gain a persistent halo and a short arrival pulse.
- Room Facilities tabs show power/energy snapshots, water pressure, climate, building systems, supplies and maintenance requests.
- Real WebGL architecture: dimensional cutaway walls, hospital beds, glazed pharmacy cabinets, a planted courtyard and real shadows.
- Three U-shaped hospital floors, 24 patient rooms and four pharmacies per floor.
- 144 beds, patient and staff registers, interactive schedule and floor-filtered reports.
- Pharmacy inventory, low-stock states, restock requests and receipt recording.
- Linked map/list selection, clear room labels above the architecture, smooth 2D/3D morph and contextual details.
- Detailed courtyard and pharmacy cabinets; slow, pausing staff-presence dots with colored hover labels.
- Light and charcoal/green dark modes, profile, settings and sign-in role states.
- Directional sliding between workspace tabs, theme/auth dissolves and reduced-motion support.
- Current IST clock alongside the dated operational dataset.

## Phone layout

The map uses the full phone width and a closer default camera. Drag to explore the enlarged plan. The legend stays at the top. Beneath the plan are two rows: **Floor in charge + view controls**, then operational insights. Floor in charge opens a small contact panel above its control and collapses on repeat click, outside tap or Escape.

The Rooms accordion sits in the page flow below these controls. Its list supports native vertical touch scrolling through all patient and pharmacy rooms, without a fixed insights bar covering the list.

## Room facilities

Open a room and choose **Facilities**. Care/Inventory stays in its own tab. Facilities contains power (kW), energy (kWh), water pressure (bar), room climate, electrical circuit checks, plumbing/drainage, ventilation/connectivity, housekeeping/linen/supplies, service rounds and maintenance items.

**Request service** records a local ticket; **Mark resolved** clears the relevant room issue. **Log an issue** adds a categorized request. These meters, inspections and tickets are explicitly synthetic fixture data in the code. There is no building telemetry, external maintenance dispatch or hardware control. Changes last for this session only.

## Preserve or restore the original view

The prior SVG version is preserved byte-for-byte in `classic/`. Open `classic/index.html` for the complete original site.

Inside the new dashboard, choose **Settings → Floor-plan graphics → Original spatial view** to switch renderers while keeping the current session's rooms, patients, inventory, care actions and camera state. Switch back to **Architectural 3D** from the same setting. `?renderer=svg` also opens the original renderer directly. Browsers without a working WebGL context fall back automatically.

Both renderers use one data model. The WebGL scene is an added view layer, not a new source of hospital data.

## Explore the floor plan

| Control | Action |
| --- | --- |
| Drag | Move the plan in any direction |
| Shift-drag, right-drag or middle-drag | Rotate |
| Two-finger twist / pinch on a touchscreen | Rotate / zoom |
| Trackpad scroll | Pan |
| Shift or Option + trackpad scroll | Rotate |
| Pinch gesture / + and − | Zoom |
| Arrow keys while the map is focused | Pan |
| Shift + Left/Right | Rotate |
| Home | Reset the camera |
| Eye button | Hide/show floating panels; retain legend and map controls |
| Hover/focus/click a presence dot | Show the staff name / open contact details |

Native trackpad twist is also supported in browsers that expose gesture events. Presence dots are illustrative activity, not a real-time staff-location feed. They pause along their routes; name pills appear briefly every seven seconds or on hover/focus.

## Sign-in interaction

The dashboard opens in Ananya Kapoor's coordinator preview. Sign out from the top-right menu to see the green sign-in screen. It is prefilled with:

- Role: Care coordinator
- Email: `ananya.kapoor@astergrove.example`
- Password: `aspatal`

Doctor, Nurse lead and Administrator show restricted-access states. Account/profile/settings are implemented as local interaction flows. **There is no real authentication server or production role enforcement.** Credentials are not transmitted or persisted. Theme, insight-alert and default-floor preferences are saved locally; patient, stock and task changes last for the session.

## Project notes

All hospital, patient, medicine, staff and contact data is synthetic. No real patient information is included. No medical treatment recommendations are generated. The `.example` email domain is reserved example data.

See `HANDOVER.md` for the design, data model, renderer architecture and current features. See `QA.md` for verification and limitations. Earlier revision descriptions in the handover are superseded by later notes.

Original Aspatal interface and implementation by Ish. Visual direction references supplied by the user; no reference artwork is embedded.
