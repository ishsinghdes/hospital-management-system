# Latest phone layout refinement — 16 November 2026

The phone stage now spans the full viewport width with a closer default camera (1.32× base framing; user zoom state is retained). The permanent contact card is removed from the top of the phone map. Legend remains above the plan. A bottom toolkit row contains a **Floor in charge** disclosure to the left of the existing view/zoom/theme controls; contacts open directly above it. The next row contains the four operational-insight disclosures. On desktop, contacts and the toolbar/Rooms grid remain unchanged.

Phone insights now live in page flow rather than covering Rooms as a fixed overlay. The Rooms accordion has an explicitly bounded, touch-scrollable list with normal page scroll chaining. The final pharmacy row and its detail/facilities view are reachable. Insight drawers remain on-screen and below the sticky header when opened. The original SVG fallback uses the same phone layout, with closer initial framing.

Verified at 390/320px with real browser touch input: full-width stage, row order, contact disclosure/contact modal, repeat-click/Escape dismissal, vertical scrolling through the final pharmacy, facilities details and insight placement. Desktop contact visibility and toolbar width were also checked; dark mode was reviewed at 390×844.

---

# Latest material and facilities refinement — 16 November 2026

The active WebGL view uses distinguishable, subdued materials: cool blue circulation flooring, warm patient-room surfaces, teal/blue painted wall bands, honey pharmacy finishes, and a sage garden with sand-colored paths. Four deterministic canvas textures add fine 2D grain/tile detail; no bump/displacement mapping or external textures are used. Corridor flooring is above the base slab so the finish remains visible.

A selected room has a world-aligned circular halo, stronger number label and a short, easing arrival pulse. The halo follows the same room selection in the map, directory and register; it clears on close and respects reduced motion.

`room-operations.js` adds contextual **Care/Inventory ↔ Facilities** disclosures. The shared data model now has a synthetic `room.facilities` fixture with power, energy, pressure, climate, circuit/check timestamps, service/linen information and maintenance issues. Requests create local ticket records; resolving an issue updates its building-system status. No real sensor service or maintenance dispatch is connected. Care, patient actions, pharmacy stock and all map controls are retained.

The first WebGL build is preserved as a separate rollback ZIP and at Git commit `8ad04210bc914fc19e6a6b69c0b1698bae6e7a47`; the original SVG source and `classic/` route remain unchanged. Static delivery now includes `room-operations.js` alongside the other runtime files.

---

# Current WebGL revision — 16 November 2026

The dashboard now defaults to a real Three.js r187 WebGL model. The complete pre-WebGL source is preserved separately and in `classic/`; its source commit is `e26dd50ba240d9f6e6a432a3eb7b3c68b2a37902`. The original SVG renderer remains selectable in Settings and is the automatic compatibility fallback.

`floor-plan.js` owns rendering only. `app.js` still owns rooms, patients, stock, care tasks, staff, roles, theme and navigation. A small adapter passes the same state and action callbacks to the renderer. All data remains synthetic, session-only, and unsuitable for real patient-care operations without a secure backend and validated workflows.

- Original procedural geometry: 24 patient rooms and four pharmacies per floor, real bed frames/mattresses/rails, low cutaway walls, cabinet shelves/glazed doors, counters, eight courtyard trees, benches and a small water feature.
- Orthographic camera with a smooth 3D/top-down transition. Pan, zoom, mouse/keyboard rotation and two-touch twist/pinch retain the prior controls.
- HTML room-number buttons and staff labels project from 3D world positions. Room numbers stay above geometry at every angle; directory and mesh selection share the same contextual actions.
- Slow staff dots preserve the prior routes, pauses, color identities, seven-second name reveals and contact drilldowns. Activity is illustrative, not live staff tracking.
- Real directional shadows, matte materials, light/dark palettes, glass panels, unchanged operational insights, schedule, reports and account flows.
- Static geometry is reused and instanced; a single WebGL context survives state changes and tab navigation. Shadow maps redraw only when the model changes. Camera motion renders responsively; ambient staff activity uses a lower frame rate. Rendering suspends off-page/in background, and reduced motion stops continuous rendering.
- Engine and license are bundled locally; no CDN or model downloads occur in the browser. New renderer source is separate and human-readable. GitHub hosting remains static, with no build step required.

The prior design/IA/component and iteration notes below remain useful; this section supersedes their statements that SVG is the only renderer or that there are no bundled third-party runtime libraries.

---

# Aspatal — Project handover

Current implementation: U-shaped wards with 24 patient rooms and four pharmacy rooms per floor; 144 patient beds across three floors. See “Expanded hospital and pharmacy build” below for the current workflows, filters and reporting. Earlier sections describe the original baseline and are superseded by later revision notes.

## Project and delivery

Aspatal is a desktop-first hospital patient-care and administrative command center, designed for a fictional modern Indian hospital. This delivery is an actual buildless HTML/CSS/JavaScript website: open `index.html` in any modern browser. No installation, external assets, API keys or network connection are required for the local package. Files: `index.html`, `styles.css`, `app.js`, this document, and `QA.md`. The hosted static copy is generated into `dist/`.

All patient, staff, hospital, capacity and historical data is explicitly fictional. Session changes reset on refresh. This is an interaction prototype, not a clinical system. No real patient details should be entered. No mortality/risk scores, treatment recommendations or medication advice are generated.

## Design goals and references

The primary question is: **Which room needs attention, and what can I do next?** The Overview answers this with a large selectable architectural floor plan. The hospital itself is the main interface, with generous whitespace, understated chrome, low walls, beds, a central circulation route and nurse station.

Visual direction comes from the four user-supplied Ron Design / NaveXa warehouse screenshots, dated 14 November 2026 at 14:19:08, 14:19:12, 14:19:20 and 14:19:31. They were inspected as images. Transferable elements: horizontal navigation, pale spatial ground, architectural objects with directional shading, quiet status color, floating translucent contextual surfaces, restrained chart chrome. Their exact artwork and UI are not copied. The fourth screenshot specifies Lufga and the green/coral/black/white palette. A system sans-serif is used until a properly licensed Lufga webfont is supplied.

The referenced ChatGPT conversation (SevenRooms India Feasibility, `6ae7e0ae-49ac-83ee-97a0-b1e939c28cc0`) was read. Its latest instructions were available; older Aspatal generated concepts and original image attachments were not returned by the conversation tool. The supplied local screenshots and current written brief therefore govern this implementation. Design principles consulted: Eash's Design Principles and the frontend app-screen guidance. The explicit request for glass and spatial shading takes precedence over generic recommendations against those treatments.

## Non-negotiable latest direction

The four bottom metric cards are **hidden on first load**. A single floating bottom pill row contains Patient Flow, Bed Occupancy Trend, Today's Care Schedule and Staff on Duty. Clicking opens one shared panel; clicking another switches its contents. Clicking the active item, Close or Escape dismisses it. There are no default bottom KPI cards. Secondary analytics on Patients, Beds & Rooms, Schedule and Staff are native click-to-open disclosures.

## Information architecture and workflows

| Section | Primary content | Working interactions | Analytics |
| --- | --- | --- | --- |
| Overview | Large isometric floor canvas; three-floor stack/selector; room IDs; beds; nurse-call indicators | Select room; zoom in/out/reset; change floor; open authorized fictional context; raise/acknowledge demo call; change care state | Four collapsed pill-controlled panels |
| Patients | Active inpatient register with bed, assigned nurse, admitted date | Explicit demo-access gate; search name/ID/room; contextual detail; register fictional patient into available bed; discharge | Collapsed hourly admission/discharge chart |
| Beds & Rooms | 72-bed readiness register across 36 rooms | Search ward/room; filter available/occupied/cleaning; assign patient; open room; complete cleaning | Collapsed per-floor capacity bars |
| Schedule | Today's coordination tasks; shift handover | Complete/reopen tasks; shared completion state updates reports and metric drawer | Collapsed completion progress |
| Staff | Roster, role, shift, floor coverage, assigned patient count | Filter on-duty/upcoming; reassign floor coverage (retains patient assignments, stated on action) | Collapsed floor coverage counts |
| Reports | Current capacity, occupied-bed history, hourly patient flow, task/call counts | Download CSV of bed capacity/readiness, excluding patient identities | Labeled charts and source/period explanations |

The Patients section and patient identities inside room details require an explicit fictional coordinator-view action. Room IDs and operational statuses remain visible without it. This is a UI demonstration of contextual access, not authentication: the dataset is shipped to the browser.

## Component inventory

- App shell: original Aspatal mark/name, horizontal hash navigation, hospital/shift context, fictional-demo badge, coordinator identity, attribution footer.
- Spatial canvas: original SVG projection, low extruded walls, bed blocks/pillows, status colors, room labels, focus/hover/selected outline, nurse station, circulation route, floor selector/stack, zoom controls, status legend.
- Contextual pane: room heading, ward/floor, care state, nurse-call action, authorized-view disclosure, bed readiness, patient summary, discharge/readiness/admission actions.
- Floating insights: single four-button disclosure row, shared glass panel, close control, one selected expansion at a time.
- Tables: semantic captions/headings, search/filter toolbar, horizontally contained overflow, useful empty state and row actions.
- Coordination list: time, task, room, assigned staff, completion checkbox.
- Forms: native modal registration, labeled inputs, age limits, required name/bed, whitespace validation and bed availability check.
- Feedback: status toast, button states, native validation, focus rings, modal backdrop.
- Charts: original inline SVG; capacity line, paired flow bars, floor utilization bars. Values are available in accessible SVG labels or adjacent text.

## Data model and consistency

Data lives in `app.js`; presentation reads the same arrays throughout.

- `Floor`: ID, name, two wards. Three floors: General medicine, Surgical care, Recovery & step-down.
- `Room`: room ID, floor, index, ward, nurse-call flag, room care state, two beds.
- `Bed`: ID, status (`Available`, `Occupied`, `Cleaning`), nullable patient ID. Total capacity: 72.
- `Patient`: fictional ID/name/age, room/bed/floor, assigned nurse, admitted date, coordination care state.
- `Staff`: ID/name/role, floor coverage, shift, on-duty flag. Nine fictional team members.
- `Task`: ID/time/title, patient reference, nurse reference, completion flag. Eight coordination tasks.
- `Trend`: six fictional historical occupied-bed snapshots; seventh point uses current session occupancy.
- `Flow`: six fictional hourly admission/discharge bins, 07:00–12:00. This historical shift log is illustrative and is not rewritten by current-session registration/discharge actions.
- UI state: section, floor, selected room, expanded metric, demo authorization, zoom, query, filters.

Occupied, available and cleaning totals are computed from beds; occupancy uses total physical capacity as its denominator. Active patient count equals occupied beds. Admission occupies an available bed; discharge clears its patient and marks the bed Cleaning; room turnover makes a Cleaning bed Available. Charts and reports update from current session data. Staff floor coverage and patient assignment are separate fields.

## Visual tokens and implementation

| Role | Token / decision |
| --- | --- |
| Normal / available | `#0AAB2A`; lighter tints on beds; `#087223` for accessible small green text |
| Urgent / nurse call | `#FF3D3D`; exclamation marker and text; `#B52222` for small red text |
| Text | `#1E1E1E` |
| Secondary text | `#626B68` |
| Ground / surfaces | `#EDF1EF`, white and pale cool gray-green |
| Dividers | `#DCE2DF` |
| Type | Native system sans-serif; 32px desktop page heading, 20px section, 13–15px working data |
| Spacing | Broad 38px desktop gutters; 18px phone gutters; 6/8/12/16/24/32px rhythms |
| Shape | 10px controls; 17–22px spatial/floating surfaces |
| Depth | Low extruded SVG walls/beds; diffuse map shadow; glass reserved for contextual floating panels |

SVG uses a simple isometric projection; no WebGL, model downloads or continuous animation loop. All maps and charts are original code-native drawings. This keeps the demo portable and responsive. Three layout bands cover desktop, tablet and phone. Narrow-screen tables scroll inside their own labeled frame rather than widening the page. The dock has its own horizontal scrolling on phones.

## Accessibility and interaction states

Native links, buttons, labels, select controls, dialog, table captions and details/summary are used where possible. The canvas rooms are named keyboard-operable SVG buttons: Tab focuses, Enter/Space selects. Selection opens and focuses the room heading. Escape closes contextual panes, and focus returns to the triggering room where available. Metric triggers expose `aria-expanded` and close returns focus to the trigger. The registration dialog uses native focus containment. All controls have visible focus treatment. The status legend, room labels, warning exclamation and text supplement color. Toasts use a live status region. Reduced-motion preference disables transitions and animations. This is not a claim of audited WCAG conformance; assistive-technology review remains a production milestone.

## Production roadmap

1. Validate the floor plan and top workflows with Indian hospital administrators, ward nurses and coordinators; pilot phone/tablet workflows in real ward conditions.
2. Supply licensed Lufga webfont files if the reference typography must match exactly; localize language, names, dates and terminology with hospital staff.
3. Add real authentication, role/ward-based authorization and server-side access enforcement; never ship real clinical records as static client data.
4. Integrate an authenticated hospital information system with validated patient/encounter/bed/staff identifiers. Add durable storage, audit events, conflict handling, realtime updates and reliable timestamps.
5. Define and validate nurse-call escalation, acknowledgement ownership and handover semantics with clinicians. Current actions are demo interactions only.
6. Add transfer workflows, scheduling/resource conflicts, leave/roster management, accessible building geometry customization and richer report date ranges.
7. Undertake privacy/security review, accessibility testing with assistive technology, performance checks on lower-powered devices, and operational/clinical safety review before any real deployment.

## Attribution

Designed with love, designed with a heart, by Ish.

Reference direction: user-supplied Ron Design / NaveXa screenshots and interaction recording. Original Aspatal layout, SVG architecture, charts and implementation. No third-party reference imagery is embedded in the website.

## Additional interaction reference

The user supplied `Screen Recording 2026-11-14 at 2.30.58 PM.mov` (21.815 seconds). Eight evenly spaced frames were inspected: the warehouse view changes scale, expands contextual side details and returns to an overview. Aspatal translates that behavior into intentional floor-change fades, short pane reveals, selected-room outlines, zoom controls and reversible metric disclosures. It does not copy autonomous warehouse robot behavior into a clinical context. The phone layout includes a text room directory for reliable selection. Animation is brief and event-driven; reduced-motion preference disables it.

## Revision — 14 November 2026, browser feedback

This revision supersedes the original shell, schedule list, authorization preview and footer descriptions above. Visible demo/fictional wording and the footer are removed at the user's request; the synthetic-data limitation remains explicitly documented in the source code and this handover. The app is still a session-only prototype without real authentication or hospital connectivity. It must not be used for real patient care.

- Persistent compact glass header, retained navigation nodes and an animated sliding selected-section surface. Navigation no longer scrolls the header out of view when moving focus.
- Cool blue-white surfaces; approximately 20% smaller corner radii; padded dropdown chevrons and styled native pickers where supported, with native fallbacks.
- Room labels use small white pill backgrounds, with blue hover/focus/selection treatment. The scrollable room directory lives inside the canvas at the lower left above the legend.
- All four bottom panels remain collapsed initially. Original colored SVG illustrations replace arrows. Notification dots derive from pending tasks and session mutations; opening a panel clears its mutation indicator.
- Interactive 3D/2D projection with a 720ms eased geometry morph. A 0–360° rotation range and plus/minus zoom work in both views. The flat plan preserves room selection, status and directory interactions. Reduced-motion preference makes view changes immediate.
- Patient and staff registers are denser, use full available width and concise row actions. Admission flow opens in a modal from the patient toolbar.
- Schedule is an interactive week/day calendar for 9–15 November. Click dates to select a day, empty slots to create tasks, and events to edit time, assignment and completion. Concurrent events share the slot width. Tasks use half-hour slots within 08:00–15:30.
- Patient details use compact ID cards, including bed, identity, admitted date, nurse and care state. Nurse-call acknowledgement is grouped with its bell/status control. Discharge is a separate outlined action; readiness uses a distinct green treatment.

The browser feedback screenshots and the two additional screenshots at 14:51:17 and 14:51:45 were inspected during this revision. No licensed third-party assets were introduced.

Room directory refinement: redundant zero-availability counts are removed. Entries show room number, patient names, an Occupied pill when patients are present and an Available pill when a bed is ready. Mixed rooms can show both. Active calls have a separate nurse/caution pill with hover/focus summary and click-to-open room detail. Cleaning remains accurately represented in the detailed bed view.

## Layout revision — right-side room browser and shared controls

The directory is now an always-visible right-side panel under the floor buttons, titled “Rooms in floor N”, with six 69px rows visible and all twelve rooms scrollable. Switching floors updates that directory. On desktop, room details open immediately to the directory's left; on phones they use a bottom sheet while the directory remains an accessible full-width section beneath the map. The directory has no disclosure arrow or collapsed state.

Rotation uses pointer dragging on the SVG floor (five-pixel intent threshold, pointer capture and click suppression after a drag). A small top-center Rotate cue also supports Left/Right arrow keys and Home to reset. The slider is removed from the 3D/2D and zoom toolbar. Projection morph and zoom remain intact.

Beds & Rooms and Staff now match Patients: compact registers, shared search/filter spacing and toolbar-triggered analytics dialogs. Staff supports name/role search; bed capacity and staff coverage are no longer buried under their tables. All dropdowns use a fixed right-side background chevron, with the in-flow browser picker icon hidden to prevent wrapping onto a second line. Selects use a consistent 40px desktop height; touch controls retain larger targets. The header is hospital green with a monochrome white mark/text and translucent selected navigation surface, as requested.

## Legibility revision — 14 November, 15:12–15:16 feedback

- Floor navigation is now three unboxed, one-line text controls: “Floor N · name”, with a small triangle identifying the selected floor. Rhombus icons and separate subtitles are removed.
- Room rows use one heading line with the room number and Occupied/Available pills adjacent; names occupy the second line. The nurse-call control is a red dot with a larger invisible hit area, accessible label, hover/focus summary and room-detail action. The map call marker is also a red dot.
- Mobile Overview now uses document flow: map, view/zoom controls, legend, full-width vertical floor choices and room directory. The redundant top floor dropdown is hidden on phones. Desktop floor/room navigation stays on the right, with detail opening to its left.
- Today's Care Schedule and Staff on Duty insights use narrower 540px panels, compact rows, reduced padding and content-driven height. Phone panels fit within the viewport.
- Patient rows have no redundant Open record CTA. Each row opens the existing context pane by click, Enter or Space and has hover/focus/selection treatment. Four columns are balanced with Admitted aligned right.
- All register toolbar inputs, filters and analytics buttons share a 42px height and 12px text. Admission flow, Capacity by floor and Floor coverage use green buttons with white SVG illustrations.

Latest directory instruction supersedes the always-open behavior: the heading is now “View rooms”, implemented as a native collapsible accordion closed on first load. An accessible red dot appears when the selected floor contains an active nurse call. Opening reveals six visible rows with remaining rooms scrollable. The open/closed choice persists while changing floors or updating calls during the session.

Latest legend placement: the legend sits beneath the floor caption at the top left. Desktop entries stack vertically; phone entries stay in one horizontal row above the map. Available uses green, Occupied / cleaning uses white with an outline, and Nurse call uses red. The visible rotation cue is removed; pointer-drag rotation remains, with Left/Right/Home keyboard controls on the focusable map itself.

Latest floor-selector decision: remove the three floor text controls inside the map. The dropdown is the sole floor selector on desktop and mobile. View rooms moves to the vacated top-right position on desktop and near the top of the map panel on mobile. Changing the dropdown refreshes the map and accordion contents.

## Canvas and toolbar revision — 14 November, 15:30 feedback

Desktop Rooms is now a permanent scrollable column at the top right, extending down to just above the view controls. It contains all twelve rooms for the floor and uses room numbers without repeating “Room”. The floor-plan SVG has a separate bounded viewport beside the room column; its projection viewBox includes the full rotated footprint in both 2D and 3D. Manual zoom can intentionally enlarge beyond the fit view.

Desktop operational-insight tabs now sit inside the map at its bottom left. Their 48px container height, baseline, radius and translucent treatment match the 3D/2D and plus/minus controls at bottom right. The dock element is preserved across map redraws and section changes. At tablet widths, illustration sizes reduce so all four tabs fit without horizontal scrolling.

Mobile retains the fixed insight dock and its existing four panel interactions. Its View rooms accordion moves below the map and view controls. The desktop permanent-column treatment does not apply to mobile.

Desktop insight pop-ups are anchored inside the map directly above the left insight dock: same left grid edge, with a 12px gap from the pop-up base to the dock top. All four panels share this anchor. Mobile panel positioning is retained.

## Expanded hospital and pharmacy build — 14 November

**Current build:** three U-shaped floors, each with 24 patient rooms (48 beds) and four medicine rooms. Total: 72 patient rooms, 12 pharmacies and 144 patient beds. This supersedes the original 12-room/72-bed model. Synthetic people data was expanded; patient IDs and occupied-bed counts reconcile. A continuous U-shaped corridor connects two populated wings and a back-of-house medicine-store row around a courtyard. Original CSS/SVG geometry remains buildless and supports 2D/3D morphing, drag rotation and fit framing.

Rooms contains All rooms, Patients and Pharmacy filters, defaulting to All rooms. Filtering updates the directory and rendered room objects. Desktop keeps the permanent Rooms column; mobile keeps its Rooms accordion below the interactive map. Pharmacy rooms use pale yellow/green surfaces and a restrained static green glow while operating; orange indicates low stock. Text labels carry the same status.

Each medicine room has six fictional inventory lines with unit, quantity, reorder minimum and target quantity. Opening a pharmacy shows available, low and out-of-stock lines. Request restock logs a session request; Record receipt adds its requested quantity and clears the request. Room status/glow, room filter alerts, watchlists and reports recompute from stock. No actual purchase, external order, prescription or clinical recommendation is performed.

Patient and bed registers use clickable keyboard-operable rows. Bed rows have no action column; clicking a bed puts it first in the context pane with assignment/readiness/discharge actions there. Map and directory selection states are linked. Selection scrolls the directory to its row, highlights the map and row, resets an enlarged zoom to fit, and reserves a visible map area beside the detail on wide screens. Desktop detail and Rooms panes share top/bottom edges, height and radius. Mobile retains a bottom detail sheet.

The map's top-left Floor in charge card contains the floor SPOC, duty doctor and administrator. Names reveal contact summaries on hover/focus and open contact dialogs. Addresses use the reserved `.example` domain and extensions are fictional internal numbers. The repeated floor/bed summary is removed from inside the map; the Overview header retains current counts. Desktop legend sits directly above the left insight dock; mobile retains a compact top legend.

Reports now contains capacity history, interactive hourly check-in/check-out bars, pharmacy readiness, doctor/nurse/assistant/administrator coverage, urgent-call coordination and a stock watchlist. A floor scope applies throughout. Hour bars reveal counts; low-stock filtering narrows pharmacy readiness; pharmacy/urgent rows open their contextual detail. Exports respect the selected report floor. Calls acknowledged during the session are logged; no “lives saved” or fabricated clinical outcome metric is generated. Session admissions/discharges update the current shift flow as well as bed counts. All data remains synthetic and session-only.

## Account, dark mode and access states — 14 November

The top-right coordinator identity is a disclosure button. It opens Account information, Settings, a theme switch and Sign out. Account shows Ananya Kapoor's coordinator identity, staff ID, internal extension, reserved-domain work address, and the enabled/restricted role states. Settings controls light/dark appearance, insight-notification dots and the default floor; these preferences are stored locally on the device.

Dark mode follows the supplied Fleety screenshot's near-black/charcoal layering, using hospital green instead of its blue accent. Surfaces, tables, dialogs, charts, status pills, pharmacy inventory, calendar and account screens are themed. The SVG map has a separate charcoal/green palette for floors, corridors, walls, beds, courtyard, labels and medicine stores. Pharmacy green/orange states and blue-green selection remain legible. Light/dark switching retains the current workspace context. The theme is saved locally.

Sign out opens a green Aspatal hospital sign-in screen. Roles offered: Care coordinator, Doctor, Nurse lead and Administrator. Only Ananya Kapoor's Care coordinator account is enabled in this prototype. Other roles show a blocked access-required state; invalid account details show an inline error. The form is prefilled with `ananya.kapoor@astergrove.example` and the prototype password `aspatal`, so Sign in returns to the coordinator dashboard and preferred floor.

**Authentication limitation:** this is a local, static interaction flow, not a production identity system. No credentials are transmitted or persisted. The dashboard begins in the coordinator preview state, and source-code inspection can bypass the UI restrictions. Replace this flow with server-validated authentication and role/ward authorization before connecting any real hospital data. Reserved `.example` addresses and all patient/staff/medicine quantities are synthetic.

All status pills share the same 80 × 22px dimensions, 11px type and consistent padding. Pharmacy rows use the same grid and style as patient rows; the All rooms list has a small Pharmacy divider before medicine rooms. Individual nurse calls appear as red “Nurse call” status pills next to occupancy, while the Rooms heading retains its aggregate red notification dot. Rows wrap status groups only when needed on narrow screens, retaining pill dimensions.

## Final motion and charcoal refinement

Theme changes use a synchronized whole-scene View Transition crossfade (480ms) so the SVG map and UI surfaces change together, with an opacity fallback in browsers without that API. Rapid changes settle on the latest requested state. Sign-out/sign-in use 320ms scene dissolves. Signing in reveals the map first, followed by the surrounding dashboard controls over roughly 0.7–0.9 seconds total. Reduced-motion preferences apply updates immediately.

The login's three architectural planes drift in their existing perspective with staggered 10-second loops; motion pauses when the page is hidden and becomes static with reduced motion. The hospital name is moved into the login card's caption, the redundant sign-in subtitle is removed, and “Designed by ISH” appears at the lower left. Menus, detail switches, insight tabs, toggles and row/map selection use short, restrained feedback. Insight buttons are retained across updates for continuous hover/selection transitions.

Dark surfaces are refined toward neutral charcoal/black: Rooms, Floor in charge, records, tables, dialogs and account panels. The map keeps its atmospheric green treatment. Reports mix charcoal with restrained green panels; interaction highlights remain green. The black/green palette supersedes the earlier more uniformly green dark surfaces.

GitHub-ready delivery contains `index.html`, `styles.css`, `app.js`, `README.md`, `.nojekyll`, `HANDOVER.md` and `QA.md`, with no hosting identity or repository metadata. A separate standalone HTML version embeds the same CSS/JS for convenient local opening.

## Capsule tags, sliding controls and final login refinement — 14 November, 21:16 feedback

Status tags are now smaller capsules: 76 × 20px, 10px text and fully rounded ends. The same dimensions apply to Occupied, Available, Nurse call and pharmacy states. Report tags also use capsule curvature. Floor dropdowns match the room/contact card fill, stroke, radius and desktop width, including report scope selection. Contact popover placement is unchanged.

Room-category filters and the four insight controls use an independent sliding selection surface underneath stationary labels. Position/scale animation is 360ms, with cached position across category re-renders and immediate placement under reduced motion. All four insight views share a 320px-high card whose desktop width exactly matches the full insight bar. Content is redistributed into that footprint; redundant close crosses are removed. Clicking the active tab or pressing Escape closes it.

Reports has four individually separated rounded summary cards, and Export bed data is a small underlined download action rather than a filled box. The three login illustration planes are restored to their earlier static size, spacing and perspective, superseding the previous drift loop. A faint background glow follows the pointer on the login screen without changing the native cursor; it is disabled on touch and under reduced motion. Theme/auth dissolves remain intact.


## 15 November — control and context refinement (v12)
- Unified dropdown triggers and expanded pickers: shared 8px radius, type, 1px stroke, chevron slot, subdued selection and layered elevation; capsule status tags remain distinct.
- Patient/bed registers select the individual bed, preventing two patients sharing a room from both appearing selected. Small animated pointers replace inset selection stripes.
- Dialog headers and close controls share a grid; date/time fields are 44px, task save fills the form width, pharmacy rows and summaries are tighter, and Floor in charge fits its contact content.
- Dialogs, context panels, account menu and insight drawers ease out on dismissal; reduced-motion preference skips scripted movement.
- Map toolbar aligns exactly with the Rooms column on desktop and contains 3D/2D, zoom and an accessible light/dark button. Mobile keeps controls within the viewport.


## 15 November — proportionate view selector (v13)
3D and 2D each fill half of the view segment with equal 32px control height and 13px labels. A shared selection surface glides between them using the existing segmented-control motion, including rapid reversal and reduced-motion support. Toolbar width and theme/zoom positions remain aligned to Rooms.


## 15 November — full-stage spatial viewport (v14)
The desktop/tablet SVG viewport now fills the map stage in both dimensions, including behind the floating cards. Opening room details no longer shrinks the drawing area. Contact, room, detail, insight and map-control surfaces use translucent light/charcoal glass with an 18px backdrop blur. Mobile retains its dedicated map band and accessible controls.


## 15 November — spatial exploration and canvas focus (v15)
- Initial camera fits the plan to the left of Rooms; zoom enlarges it into the full viewport. Camera and zoom remain intact when selecting rooms.
- Drag pans horizontally/vertically. Shift-drag or right-drag rotates. Arrow keys pan, Shift+Left/Right rotates, and Home resets the camera. Touch dragging manipulates the canvas; the surrounding page remains scrollable.
- Eye control at the left of the toolbar hides contact/room/detail/insight panels and dock, retaining the legend at the dock baseline plus view/zoom/theme controls. Show restores the previous panels and context. Hidden overlays are inert for keyboard and assistive technology.
- Courtyard has eight shade trees, raised planters, paving, benches and a water feature. Pharmacies have glazed cabinets, shelving, counters and small supplies.
- Three gently animated synthetic staff figures per floor show names/roles and open the existing contact dialog. Their activity is illustrative, not live location data. SVG motion avoids a continuous JavaScript redraw loop; reduced motion removes walking/patrol movement.
- Browser checks passed for panning, rotation/reset, camera persistence, staff movement/contact, hide/show restoration, retained legend, themes and 1423/1185/768/390/320px layouts.


## 15 November — final spatial and navigation refinement (v16)
- Room-number pills render in a dedicated final SVG layer, above all walls, beds, cabinets and foliage. Selection and hover remain linked to the directory.
- Replaced figurines with small blue/green/purple presence dots. Routes are slower with explicit extended stops; colored name pills appear on hover/focus or briefly every seven seconds. Motion phase survives map redraws. Reduced motion shows stationary dots.
- Two-touch twist/pinch, trackpad pan/pinch/modifier rotation, native browser gesture events and keyboard controls complement mouse drag. No additional lounge room was added.
- Workspace tabs slide horizontally in navigation order, with greater distance reflected in transition duration. Header stays interactive; rapid switches cancel and clean up the outgoing inert snapshot. Theme and authentication retain their existing dissolves.
- Current IST time updates each minute. The operational dataset remains dated 14 November 2026.
- JavaScript was formatted with parser-verified structural equivalence; two unused helpers and 75 obsolete/duplicate CSS rules were removed. CSS cleanup was checked against a pixel-identical reduced-motion reference.
- GitHub delivery remains buildless and dependency-free: index.html, styles.css and app.js plus documentation and .nojekyll.
