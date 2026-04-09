# Changelog

## 2026-04-08 — Cancel Confirmation & Fuel History

### What changed
- **Cancel confirmation** — Cancelling a reservation now requires a two-step confirmation ("Are you sure? This frees up [day] for others.") with "Keep it" and "Yes, cancel" buttons. Previously it was a single tap, making accidental cancellations too easy on a shared family calendar.
- **Fuel history shows jerry cans** — The "Recent" section in the diesel panel now shows jerry can counts (e.g. "2F/1E") alongside the tank level, so you can see the full fuel picture without opening the edit form. History expanded from 3 to 5 entries.

### Technical notes
- Build verified: TypeScript passes, all 11 routes compile (Next.js 16.2.2 Turbopack).

---

## 2026-04-08 — Dark Mode

### What changed
- **Dark mode toggle** — Added a sun/moon icon in the header to switch between light and dark themes. The preference is saved to localStorage and applied instantly on page load via an inline script (no flash of wrong theme). This fulfills the CLAUDE.md spec item: "Dark mode optional, light mode default."
- **Full dark theme coverage** — Every component has been updated with `dark:` Tailwind variants: calendar grid, day cells, fuel gauge (SVG elements use Tailwind class-based fills/strokes), jerry can badges, usage stats bars and pills, activity log, day detail modal, PIN login screen (user list + number pad), toasts, and the saving progress indicator.
- **Tailwind v4 dark mode setup** — Uses `@custom-variant dark (&:where(.dark, .dark *))` for class-based dark mode toggling compatible with Tailwind CSS v4. The `<html>` element gets the `dark` class.

### Technical notes
- Build verified: TypeScript passes, all 11 routes compile (Next.js 16.2.2 Turbopack).
- Dark mode is class-based (not media-query-based) so users can choose independently of their OS setting.
- The ArcGauge SVG was refactored from inline color attributes to Tailwind classes (`className` with `dark:` variants) for the background arc, tick marks, needle, and labels, so they adapt to the theme.

---

## 2026-04-08 — Week View & Month Filtering

### What changed
- **Week/month view toggle** — The calendar now has a toggle switch to swap between a full month grid and a single-week view. The week view shows taller day cells for better readability on mobile. Swiping left/right navigates by week or month depending on the active view. The header label adapts to show the week range (e.g. "7 – 13 Apr 2026") or the full month name.
- **Month filtering on usage stats** — The usage leaderboard can now be filtered by individual month in addition to year. Month pills (Jan–Dec) appear below the year selector. Months with data are highlighted; selecting a month shows only trips from that period. An "All" pill resets to the full year view. Changing the year automatically resets the month filter.
- **Stats API extended** — `/api/stats` now accepts an optional `month` parameter (1–12) and returns `availableMonths` alongside `availableYears` so the frontend knows which months have data.

### Technical notes
- Build verified: TypeScript passes, all 11 routes compile (Next.js 16.2.2 Turbopack).
- Calendar view mode state is local to the component (not persisted) — defaults to month view on load.

---

## 2026-04-08 — Rebooking Bug Fix, Cross-Month Upcoming & Modal Polish

### What changed
- **Fixed critical rebooking bug** — The `reservations` table had a `UNIQUE` constraint on the `date` column, which prevented anyone from booking a date that was previously reserved and then cancelled. Replaced with a partial unique index (`WHERE cancelled_at IS NULL`) so only active reservations enforce uniqueness. Existing databases are automatically migrated.
- **Cross-month upcoming reservations** — The "Coming up" section below the calendar now fetches upcoming reservations across all future months via a dedicated `?upcoming=true` API parameter, instead of only showing bookings from the currently displayed month.
- **Improved mobile day detail modal** — Added slide-up animation on mobile (bottom sheet pattern), backdrop blur, a drag handle indicator, safe-area padding for phones with home indicators (`env(safe-area-inset-bottom)`), larger touch targets on action buttons, and color-coded reservation status text. Also added `viewport-fit: cover` to properly support edge-to-edge displays.

### Technical notes
- Build verified: TypeScript passes, all 11 routes compile (Next.js 16.2.2 Turbopack). The EPERM at the tail end is a FUSE-mount cleanup issue, not a code problem.
- Database migration recreates the reservations table to remove the hard UNIQUE constraint, preserving all existing data.
- New API parameter: `GET /api/reservations?upcoming=true` returns next 5 reservations from today onwards.

---

## 2026-04-08 — Bug Fix, Upcoming Reservations & Visual Polish

### What changed
- **Fixed trip count bug** — The usage stats were counting cancelled reservations in trip totals. Added `AND r.cancelled_at IS NULL` to the stats query so only active bookings are counted.
- **Upcoming reservations** — The calendar card now shows a "Coming up" section below the grid listing the next 3 upcoming reservations with color-coded dots, user names, and friendly dates. Tapping an entry opens the day detail modal.
- **Boat icon branding** — Added a sailboat icon to the header and login screen for visual identity, reinforcing the nautical theme.
- **Friendly dates in activity log** — Activity log entries now show dates as "Wed 8 Apr" instead of raw ISO "2026-04-08" for better readability.

### Technical notes
- Shell sandbox was unavailable during this session, so changes were made via file edits and verified by manual code review. All changes are type-safe (no new imports or APIs, only existing types used).
- The `useMemo` hook was added to Calendar for the upcoming reservations filter to avoid unnecessary re-computation.

---

## 2026-04-08 — Dashboard Redesign, PIN Login & Activity Log

### What changed
- **Dashboard layout** — Removed tab navigation. Calendar, fuel gauge, usage stats, and activity log are now all visible at once in a responsive grid. On desktop: 3-column layout (calendar | fuel+stats | activity). On mobile: stacked vertically.
- **PIN login** — Users now select their name and enter a 4-digit PIN to log in. Default PIN for all users is `0000`. Auto-submits on the 4th digit. Number pad with backspace for mobile-friendly entry.
- **Activity log** — Right sidebar (desktop) / bottom section (mobile) showing a live feed of all actions: bookings, cancellations, and fuel updates with timestamps and user avatars.
- **Day detail modal** — Clicking any day on the calendar opens a modal overlay showing: who reserved it, when it was booked, the full activity history for that date, and action buttons (reserve or cancel).
- **Soft-delete reservations** — Cancellations now set a `cancelled_at` timestamp instead of deleting the row, preserving the full history of bookings and cancellations per date.
- **Activity tracking** — All mutations (book, cancel, fuel update) are logged to a new `activity_log` table with user, action type, target date, and timestamp.
- **No emojis** — Removed all emoji from the UI. Clean, professional typography throughout.
- **Database migrations** — Existing databases are automatically migrated to add the `pin` column, `cancelled_at` column, and `activity_log` table.

### Technical notes
- Build verified: TypeScript passes, all 11 routes compile (Next.js 16.2.2 Turbopack).
- New API endpoints: `POST /api/auth` (PIN verification), `GET /api/activity` (activity feed with optional date filter).
- The `PinLogin`, `ActivityLog`, and `DayDetailModal` are new components.

---

## 2026-04-08 — Semicircular Fuel Gauge, Weekend Highlighting & Reservation Info

### What changed
- **Semicircular fuel gauge** — Replaced the flat horizontal bar with a proper semicircular arc gauge with needle, tick marks, E/F labels, and color-coded fill (green → amber → red). Animated transitions when the level changes. The spec asked for "a visual graphic, not just a number" — this delivers on that.
- **Weekend highlighting on calendar** — Saturday and Sunday columns now have a subtle blue tint background and blue-tinted day numbers/headers, making it easy to spot weekends at a glance. Important for a boat booking app where weekends are peak days.
- **Tap to see who booked a day** — Previously, tapping another person's reservation did nothing. Now it shows an info bar at the bottom: "[Avatar] Ruby has Wed 8 Apr" with an OK dismiss button. You can still only cancel your own reservations.
- **Improved fuel edit UX** — When editing tank level, the buttons for levels at or below the selected value now show a filled blue tint, giving visual feedback of the "fill level" in the button row itself.

### Technical notes
- Build verified: TypeScript passes, all 9 pages compile and generate successfully (Next.js 16.2.2 Turbopack). The EPERM at the tail end is a FUSE-mount cleanup issue, not a code problem.
- The `ArcGauge` component is a self-contained SVG with no external dependencies. It uses `transition-all duration-700` CSS for smooth needle/arc animation.

---

## 2026-04-08 — PWA Support, Security Fix & Calendar Swipe Navigation

### What changed
- **PWA / Add to Home Screen** — Added `manifest.json`, SVG app icon, Apple Web App meta tags, and viewport configuration. The app can now be installed on phones as a standalone app with the Miloubo branding and sky-blue theme color. This is a big UX win since the app is primarily used on mobile.
- **Disabled insecure DELETE endpoint** — The `/api/reservations/[id]` route allowed deleting any reservation without verifying ownership. Replaced with a 410 Gone response pointing to the secure `/api/reservations?id=X&user_id=Y` endpoint that checks ownership.
- **Calendar swipe navigation** — Swiping left/right on the calendar grid now navigates between months. Includes a subtle slide animation for visual feedback. Horizontal swipe threshold of 60px with vertical deadzone to avoid false triggers during scrolling.
- **"Upcoming" reservations summary** — The calendar now shows the next 3 upcoming reservations below the grid with color-coded dots, friendly dates, and names — useful for seeing at a glance who has the boat next.
- **Better touch targets** — Calendar day cells now have `active:` states for visual feedback on tap, and own-reservation cells highlight on press to indicate they're tappable for cancellation.

### Technical notes
- Build verified: TypeScript passes, all 9 pages compile and generate successfully (Next.js 16.2.2 Turbopack). The EPERM at the tail end of `npm run build` is a FUSE-mount cleanup issue in this environment, not a code problem.
- Could not delete unused files (`FuelForm.tsx`, `JerryCans.tsx`, `[id]/route.ts`) due to FUSE filesystem permissions — neutralized the insecure route instead.

---

## 2026-04-08 — UX Polish: Toast Notifications, Loading States & Calendar Improvements

### What changed
- **Toast notifications** — replaced all `alert()` calls with non-blocking toast popups (success/error). Toasts auto-dismiss after 3.5 seconds and slide in from the top with a subtle animation.
- **Saving state & progress indicator** — all mutations (reserve, cancel, fuel update) now show a pulsing progress bar at the top of the screen while in flight. Buttons are disabled during saves to prevent double-submissions.
- **Calendar "Today" button** — when navigating to a past or future month, a small "Today" pill appears in the calendar header to jump back instantly. Resets selected date on month change.
- **Improved today indicator** — today's date now shows as white text on a filled blue circle instead of just a ring, making it much more visible at a glance.
- **Friendly date display** — the calendar action bar now shows dates as "Wed 8 Apr" instead of raw ISO "2026-04-08".
- **Fixed UserPicker type hack** — removed the `null as unknown as User` cast; the `onSelect` callback now correctly accepts `User | null`.
- **Jerry can input cap** — full/empty can counts are now capped at 10 to prevent unreasonable values.
- **Fixed fuel history date parsing** — removed erroneous `+ "Z"` suffix that could show incorrect dates depending on timezone.

### Technical notes
- Build verified clean (Next.js 16.2.2 Turbopack). All routes compile, TypeScript passes, static pages generate.
- Dead components `FuelForm.tsx` and `JerryCans.tsx` identified as unused (superseded by FuelGauge inline UI) but could not be deleted due to filesystem permissions in this environment.

---

## 2026-04-08 — Security Fix, Year Filtering & Type Cleanup

### What changed
- **Fixed SQL injection in `/api/stats`** — the `year` query parameter was interpolated directly into a SQL string (`'${year}%'`). Now uses parameterized queries via `stmt.bind()`.
- **Added year filtering to Usage Stats** — the stats tab now shows left/right arrow buttons and a dropdown (when multiple years exist) to browse historical usage data by year. The API returns `availableYears` alongside stats. This fulfills the CLAUDE.md spec requirement for "filterable by year."
- **Fixed broken type import in `JerryCans.tsx`** — was importing a non-existent `FuelStatus` type. Replaced with an inline interface.
- **Resolved duplicate type declarations** — two conflicting `sql.js` type files (`sql.d.ts` and `sql.js.d.ts`) caused build failures. Consolidated into a single declaration with complete method signatures (added `run()` and `get()` to `Statement`).
- **Added `distDir` config** — `next.config.ts` now supports `NEXT_DIST_DIR` env var for building in environments where the default `.next` directory has permission issues.

### Technical notes
- Build verified clean on Next.js 16.2.2 (Turbopack) — all routes compile, TypeScript passes, static pages generate.

---

## 2026-04-08 — Initial App Build

### What changed
- **Fixed build**: Removed Google Fonts dependency (Geist/Geist_Mono) that was failing to fetch at build time. Downgraded from Next.js 16 (Turbopack, which crashed in the build environment) to Next.js 15 (webpack).
- **Database layer**: Set up SQLite via `sql.js` (WASM-based, no native compilation needed) with the full schema from the spec: `users`, `reservations`, and `fuel_logs` tables. The 11 family members are auto-seeded on first run.
- **Reservation calendar**: Full month-view calendar with color-coded reservations per person. Click to reserve a day (first come, first served). Cancel your own reservations. Navigate between months.
- **Fuel gauge**: Visual horizontal tank gauge showing level in eighths (0–8) with color coding (green → amber → red). "Update after trip" form with tap-to-select level. Recent update history log.
- **Jerry can tracker**: Integrated into the fuel section. Shows full vs. empty cans at a glance, with +/− controls for updating.
- **Usage stats**: Bar chart showing trips per person for the current year, sorted by usage. Total trip count header.
- **User picker**: Avatar-style grid to select your identity (no passwords, per spec). Selection persists in localStorage. Switch user anytime.
- **Mobile-first layout**: Single-column max-width container with tab navigation (Calendar / Fuel / Stats).
- **API routes**: RESTful endpoints for `/api/users`, `/api/reservations`, `/api/fuel`, `/api/stats`.

### Technical notes
- Used `sql.js` instead of `better-sqlite3` because native addon compilation is blocked in the current build environment. Functionally equivalent — same SQLite engine, same file-based persistence.
- Types and constants shared between client/server via `src/lib/types.ts` (no `fs` dependency) to avoid webpack module resolution errors.
