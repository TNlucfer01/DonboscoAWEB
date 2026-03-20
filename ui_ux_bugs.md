# 🐛 UI/UX Bug Report — Don Bosco AMS
> Agricultural Attendance Management System · Generated: 2026-03-20
> Theme: Warm Agricultural (Green #9CAF88 · Brown #8B5E3C · Gold #D6A75E · Cream #E3E8DC)

---

## 🔴 CRITICAL BUGS (Security / Functional Breakage)

### BUG-001 · Login — Plain-text Credentials Exposed
**File:** `src/features/auth/Login.tsx` · Lines 264–267  
**Issue:** The "Quick Access" admin tip block at the bottom of the login card shows a production username & password (`principal@donbosco.edu / Password@123`) in plain text, visible to **all visitors** before authentication.  
**Impact:** Critical security hole — anyone can see the admin account credentials.  
**Fix:** Remove this block entirely from production code; use environment-specific dummy data or a separate dev-only overlay.

---

### BUG-002 · Layout — Sidebar Height Mismatch on Mobile
**File:** `src/app/components/Layout.tsx` · Lines 94–98  
**Issue:** The sidebar is offset using `top-[73px]` (hardcoded pixel value), but the header height can vary based on content/viewport. If the header wraps, the sidebar will overlap content or leave a gap.  
**Impact:** Navigation inaccessible or overlapping on certain device widths.  
**Fix:** Use `top-[--header-height]` CSS variable or calculate the header offset dynamically via `ref`.

---

### BUG-003 · ChartCard — Chart Tooltip Hardcoded White Background
**File:** `src/features/shared/ChartCard.tsx` · Lines 10–14  
**Issue:** `CHART_TOOLTIP_STYLE` uses `backgroundColor: 'white'` and `borderRadius: 0` — hardcoded values that (a) break dark mode and (b) look completely out of style on the warm cream theme.  
**Impact:** Jarring tooltip appearance; dark mode unusable.  
**Fix:** Use CSS variables: `backgroundColor: 'var(--card)'`, `border: '1px solid var(--border)'`, `borderRadius: '8px'`.

---

## 🟠 HIGH SEVERITY BUGS (Visible UX Flaws)

### BUG-004 · Login — No Password Visibility Toggle
**File:** `src/features/auth/Login.tsx` · Lines 241–247  
**Issue:** The password input has no show/hide toggle button. Users cannot verify what they're typing.  
**Impact:** Increased login failures; poor usability on mobile.  
**Fix:** Add an Eye/EyeOff icon button inside the input wrapper that toggles `type="text"/"password"`.

---

### BUG-005 · Login — Excessive Mobile Padding
**File:** `src/features/auth/Login.tsx` · Line 190  
**Issue:** The login card uses `p-10` (40px padding) which is too large for small mobile screens, causing the form content to feel squeezed.  
**Impact:** On phones < 380px width, inputs may overflow or the card may clip.  
**Fix:** Use `p-6 sm:p-10` for responsive padding.

---

### BUG-006 · AttendanceStatusBadge — No Border Radius
**File:** `src/features/shared/AttendanceStatusBadge.tsx` · Line 13  
**Issue:** The badge uses `inline-block px-3 py-1 border` with **no border-radius class**. The result is a plain sharp-cornered pill that looks raw and unpolished.  
**Impact:** Visually inconsistent with the rest of the design which uses `rounded-xl`, `rounded-md`, etc.  
**Fix:** Add `rounded-full` or `rounded-md` to the badge class.

---

### BUG-007 · StatCard — Border Too Harsh & Missing Icon Color
**File:** `src/features/shared/StatCard.tsx` · Lines 15–26  
**Issue:**  
(a) `border-2 border-border` creates a hard, visually heavy border that clashes with the soft agricultural feel.  
(b) The icon has no themed color — it appears in the same muted gray as the label.  
(c) The value `text-3xl` has no `font-weight`, making large numbers appear thin.  
**Impact:** Cards look stark and disconnected from the warm theme.  
**Fix:** Remove `border-2`, add `shadow-sm`, color the icon with `text-primary`, and add `font-bold` to the value.

---

### BUG-008 · ChartCard — Harsh Border on Card
**File:** `src/features/shared/ChartCard.tsx` · Line 24  
**Issue:** `border-2 border-border` on the card — the thick border is completely inconsistent with adjacent cards that use `border-none shadow-sm`.  
**Fix:** Change to `border-none shadow-sm shadow-black/5`.

---

### BUG-009 · TakeAttendance — Duplicate Hover Class on Button
**File:** `src/features/staff/TakeAttendance.tsx` · Line 114  
**Issue:** The "Fetch Students" button has `hover:bg-primary/90 text-primary-foreground hover:bg-primary/90 text-white` — both `text-primary-foreground` and `text-white` are specified AND `hover:bg-primary/90` appears **twice**. This is a redundant/conflicting class mess.  
**Fix:** Clean to `bg-primary hover:bg-primary/90 text-white`.

---

### BUG-010 · TakeAttendance — Countdown Timer Off-Theme Colors
**File:** `src/features/staff/TakeAttendance.tsx` · Lines 130–134  
**Issue:** The countdown timer uses `bg-red-100 border-red-300 text-red-800`, `bg-amber-100`, `bg-green-100` — raw Tailwind utility colors that clash with the agricultural beige/green theme palette.  
**Impact:** The timer looks like a system alert from a different app.  
**Fix:** Map to theme colors: use `bg-destructive/10 text-destructive` for danger, `bg-accent/20 text-secondary` for warning, and `bg-primary/10 text-primary` for safe.

---

### BUG-011 · TakeAttendance — Timer Badge Border Radius Inconsistency
**File:** `src/features/staff/TakeAttendance.tsx` · Line 130  
**Issue:** The timer container uses `rounded` (4px) while every other element uses `rounded-xl` (12px) or `rounded-full`. The badge looks out of place.  
**Fix:** Change `rounded` to `rounded-xl`.

---

### BUG-012 · HolidayMarking — Uses `window.confirm()` for Delete
**File:** `src/features/principal/HolidayMarking.tsx` · Line 104  
**Issue:** `confirm(...)` is a native browser dialog that is ugly, breaks on certain mobile browsers, and can't be styled to match the agricultural theme.  
**Fix:** Replace with a Shadcn `AlertDialog` component for a themed confirmation dialog.

---

### BUG-013 · HolidayMarking — Calendar Legend Dot Colors Off-Theme
**File:** `src/features/principal/HolidayMarking.tsx` · Lines 125–133  
**Issue:** The calendar uses raw `#fee2e2 / #991b1b` for holiday and `#dcfce7 / #166534` for working Saturday. These are standard Tailwind green/red tones not aligned with the warm agricultural palette.  
**Impact:** The calendar legend clashes with the cream/sage theme.  
**Fix:** Use the accent/destructive tokens from the theme.

---

### BUG-014 · DatePickerField — Label Style Overly Heavy
**File:** `src/features/shared/DatePickerField.tsx` · Line 24  
**Issue:** The label uses `font-black tracking-widest uppercase` — extreme styling that looks out of place compared to `SelectField`'s gentle `opacity-90` label style.  
**Impact:** Inconsistent label hierarchy across the form.  
**Fix:** Match `SelectField`'s label style: `text-sm font-medium text-foreground opacity-90`.

---

### BUG-015 · DatePickerField — Popover Overflows on Mobile
**File:** `src/features/shared/DatePickerField.tsx` · Line 38  
**Issue:** `PopoverContent` uses `w-auto` — on small mobile screens, the calendar popover overflows the right edge of the viewport with no scrolling.  
**Fix:** Add `max-w-[calc(100vw-2rem)]` and use `align="start"` (already set) plus `side="bottom"`.

---

### BUG-016 · DatePickerField — Hardcoded Min-Width on Mobile
**File:** `src/features/shared/DatePickerField.tsx` · Line 23  
**Issue:** `min-w-[240px]` is hardcoded which forces the trigger wider than the column on small screens.  
**Fix:** Change to `min-w-[160px] sm:min-w-[240px]` or use `w-full`.

---

### BUG-017 · SelectField — Hardcoded Background Color
**File:** `src/features/shared/SelectField.tsx` · Line 45  
**Issue:** `SelectContent` uses `bg-[#f7f3ea]` — hardcoded hex value. This won't adapt if the user switches to dark mode, and it differs from the CSS variable `--popover` / `--card`.  
**Fix:** Use `bg-popover` Tailwind class (which maps to `--popover` CSS variable).

---

## 🟡 MEDIUM SEVERITY BUGS (Visual Inconsistency / Polish)

### BUG-018 · Layout — Staff Has Duplicate Nav Icon
**File:** `src/app/components/Layout.tsx` · Lines 47–49  
**Issue:** Both "Take Attendance" and "Attendance Correction" in the Staff nav use the same `ClipboardEdit` icon. Users can't distinguish them at a glance.  
**Fix:** Use `ClipboardList` for "Take Attendance" and keep `ClipboardEdit` for "Correction".

---

### BUG-019 · Layout — Mobile Hamburger Missing ARIA Label
**File:** `src/app/components/Layout.tsx` · Lines 59–64  
**Issue:** The `<button>` for open/close sidebar has no `aria-label` attribute. Screen readers will just read "button" with no context.  
**Fix:** Add `aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}`.

---

### BUG-020 · Layout — Sidebar Overlay Missing Scroll Lock
**File:** `src/app/components/Layout.tsx` · Lines 126–131  
**Issue:** When the mobile sidebar is open, the background page is still scrollable. This creates disorienting dual-scroll behavior.  
**Fix:** Add `overflow-hidden` to `document.body` when `sidebarOpen` is `true` (via `useEffect`).

---

### BUG-021 · Login — External Unsplash Image Dependency
**File:** `src/features/auth/Login.tsx` · Lines 65, 187  
**Issue:** Both ForgotPassword and Login panels load an image from `images.unsplash.com`. This is an unnecessary external network dependency that can slow down page load or fail entirely in restricted networks.  
**Fix:** Host the image locally in `/public/` or use a CSS gradient as the sole background.

---

### BUG-022 · Login — Alert Error No Close Button
**File:** `src/features/auth/Login.tsx` · Lines 83–88, 208–213  
**Issue:** Error alerts have no dismiss button (`X`). If a user resolves the error by re-typing, there's no way to manually dismiss the alert — it only disappears on form submit.  
**Fix:** Add a close `X` button or auto-dismiss after 5 seconds.

---

### BUG-023 · AuditLog — No Empty State
**File:** `src/features/principal/AuditLog.tsx` · Lines 36–68  
**Issue:** When `loading` is `false` but `logs.length === 0`, the table renders as an empty table (with headers but no rows) — no empty state message is shown.  
**Fix:** Add a centered empty-state with an icon when logs are empty.

---

### BUG-024 · AttendanceCorrection — Checkbox Style Inconsistency
**File:** `src/features/principal/AttendanceCorrection.tsx` · Lines 296–303  
**Issue:** The "Lock" column uses a raw native `<input type="checkbox">` — visually inconsistent with the rest of the UI which uses ShadCN components. The `accent-secondary` class styling is minimal and doesn't match the theme.  
**Fix:** Replace with ShadCN `<Checkbox>` component for consistent styling.

---

### BUG-025 · AttendanceView — Sticky Column Background Hardcoded
**File:** `src/features/principal/AttendanceView.tsx` · Lines 202–203, 229–230  
**Issue:** Sticky columns use `bg-[#f7f3ea]` hardcoded hex — this won't work correctly in dark mode. The sticky shadow creates a visual artifact where it shows above non-sticky content.  
**Fix:** Use `bg-card` CSS class + dark mode variable-aware background.

---

### BUG-026 · TakeAttendance — No Empty State When Students Not Found
**File:** `src/features/staff/TakeAttendance.tsx` · Line 122  
**Issue:** `{fetched && students.length > 0 && ...}` — if fetch returns 0 students, the user sees nothing. No message is shown explaining that no students were found for the selection.  
**Fix:** Add `{fetched && students.length === 0 && <EmptyState />}` block.

---

### BUG-027 · TakeAttendance — Year Radio Group Layout on Mobile
**File:** `src/features/staff/TakeAttendance.tsx` · Line 93  
**Issue:** `grid-cols-2 sm:grid-cols-4` — on mobile, the 4 year options are split into 2 columns instead of fitting on one row. Since these are short "1st Year" labels, `grid-cols-4` works even on small screens.  
**Fix:** Change to `grid-cols-4` for all breakpoints, adjusting label text size if needed.

---

### BUG-028 · HolidayMarking — Mark Holiday Button Uses Raw Red Color
**File:** `src/features/principal/HolidayMarking.tsx` · Line 180  
**Issue:** `bg-red-700 hover:bg-red-800 text-white` — doesn't use the theme's `destructive` CSS variable. This could conflict if the destructive color is customized.  
**Fix:** Change to `bg-destructive hover:bg-destructive/90 text-destructive-foreground`.

---

### BUG-029 · HolidayMarking — Enable Working Saturday Button Uses Raw Green
**File:** `src/features/principal/HolidayMarking.tsx` · Line 193  
**Issue:** `bg-green-700 hover:bg-green-800 text-white` — raw Tailwind color, inconsistent with theme.  
**Fix:** Change to `bg-primary hover:bg-primary/90 text-primary-foreground`.

---

### BUG-030 · HolidayMarking — Selected Date Info Box Missing Border Radius
**File:** `src/features/principal/HolidayMarking.tsx` · Line 150  
**Issue:** `mt-4 p-3 bg-muted/10 border border-border` — the info box has no `rounded-*` class, making it sharp-cornered while everything else is rounded.  
**Fix:** Add `rounded-xl` to the info div.

---

## 🟢 LOW SEVERITY BUGS (Minor Polish / Accessibility)

### BUG-031 · Global — Missing Font Import for Agricultural Feel
**File:** `src/styles/fonts.css`  
**Issue:** The fonts.css file is present but there's no Google Fonts import for a warm, humanist typeface. The app defaults to system sans-serif.  
**Fix:** Import `Nunito` or `Lora` for headings + `Inter` for body text to reinforce the warm, earthy feel.

---

### BUG-032 · Global — `responsive.css` Classes Not Used
**File:** `src/styles/responsive.css`  
**Issue:** Custom CSS classes like `.mobile-header`, `.card-grid`, `.card-grid-tablet`, `.stats-grid` are defined but never applied to any component. They are dead CSS code.  
**Fix:** Either apply these classes to appropriate components or remove them to keep the codebase clean.

---

### BUG-033 · AttendanceStatusBadge — Only Shows Status Code, No Full Text
**File:** `src/features/shared/AttendanceStatusBadge.tsx` · Line 14  
**Issue:** Badges show raw codes like `P`, `A`, `OD`, `IL` — not human-readable. Users unfamiliar with the system won't understand what they mean.  
**Fix:** Show full text with a title attribute: `Present`, `Absent`, `On Duty`, `Informed Leave` and keep the code as an aria-label.

---

### BUG-034 · Dashboard — Academic Year Calculation During Mid-Year Classes
**File:** `src/features/principal/Dashboard.tsx` · Lines 47–48  
**Issue:** `now.getMonth() >= 5` assumes academic year starts in June. For agricultural institutions with different academic calendars this may be incorrect.  
**Fix:** Make academic year start month configurable via a constant.

---

### BUG-035 · All Tables — No Row Count / Pagination
**File:** Multiple table components  
**Issue:** Large datasets (many students/logs) render all rows at once with no pagination, virtualization, or row count indicator. This can cause significant performance problems.  
**Impact:** Page freeze for batches with 60+ students.  
**Fix:** Add a row count badge and implement basic pagination or virtual scrolling.

---

### BUG-036 · All Buttons — Inconsistent Loading State Labels
**File:** Multiple components  
**Issue:** Loading state text is inconsistent across the app: `'Processing...'`, `'Fetching…'`, `'Retrieving…'`, `'Syncing…'`, `'Submitting…'`. While variety is fine, the ellipsis style is mixed (`...` vs `…`).  
**Fix:** Standardize on the Unicode ellipsis `…` character.

---

### BUG-037 · Login — ForgotPassword & Login Share Background But Are Separate Components
**File:** `src/features/auth/Login.tsx` · Lines 64–65 and 185–187  
**Issue:** The gradient background and Unsplash image overlay are duplicated in both the `ForgotPassword` and main `Login` components. Any future background change requires updating both places.  
**Fix:** Extract a shared `AuthLayout` wrapper component.

---

### BUG-038 · AttendanceCorrection — `font-medium italic` Duplicated Class
**File:** `src/features/principal/AttendanceCorrection.tsx` · Line 254  
**Issue:** The empty search result cell has `font-medium` written **twice** (once before `italic`, once after). Minor lint issue.  
**Fix:** Remove the duplicate class.

---

## 📱 MOBILE-SPECIFIC BUGS

### BUG-039 · Sidebar — No Bottom Padding for iOS Safe Area
**File:** `src/app/components/Layout.tsx` · Line 94–98  
**Issue:** The sidebar has no `pb-safe` or `padding-bottom: env(safe-area-inset-bottom)` for iPhones with a home indicator. The bottom nav items can be hidden behind the iOS system UI.  
**Fix:** Add `pb-[env(safe-area-inset-bottom)]` to the sidebar nav.

---

### BUG-040 · Tables on Mobile — Horizontal Scroll UX Poor
**File:** Multiple table components  
**Issue:** While `overflow-x-auto` exists, there's no visual scroll indicator (gradient fade, sticky scroll hint) to tell users they can scroll horizontally. Many users won't discover horizontal scroll.  
**Fix:** Add a right-edge gradient fade overlay on the table container on mobile.

---

### BUG-041 · Filter Forms — `flex-wrap` Layout Breaks on Tablet
**File:** `src/features/principal/AttendanceView.tsx` · Line 138, `AttendanceCorrection.tsx` · Line 133  
**Issue:** `flex flex-wrap gap-6 items-end` on filter rows allows items to wrap, but the `DatePickerField` components have `min-w-[240px]` which forces awkward partial wraps on tablet (~768px wide screens).  
**Fix:** Use a `grid` layout instead: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` for the filter row.

---

### BUG-042 · AttendanceCorrection — Table Too Wide for Mobile
**File:** `src/features/principal/AttendanceCorrection.tsx` · Line 242  
**Issue:** The correction table has 7 columns with inputs — on mobile this requires significant horizontal scrolling with no row-lock UX (no way to keep context of which student row you're editing while scrolling right).  
**Impact:** Very difficult to use on phones.  
**Fix:** On mobile, consider a card-based layout per student instead of a wide table.

---

## 🎨 THEME CONSISTENCY ISSUES (Design System Violations)

| Issue | Location | Current Value | Correct Value |
|-------|----------|--------------|---------------|
| Tooltip background hardcoded white | ChartCard.tsx | `white` | `var(--card)` |
| SelectContent hardcoded cream | SelectField.tsx | `#f7f3ea` | `var(--popover)` |
| Sticky columns hardcoded cream | AttendanceView.tsx, AttendanceCorrection.tsx | `#f7f3ea` | `var(--card)` |
| Delete button red not themed | HolidayMarking.tsx | `bg-red-700` | `bg-destructive` |
| Saturday button green not themed | HolidayMarking.tsx | `bg-green-700` | `bg-primary` |
| Timer colors raw Tailwind | TakeAttendance.tsx | `bg-green-100/amber/red` | Theme tokens |
| MODIFIERS_STYLES raw hex | HolidayMarking.tsx | `#fee2e2 / #dcfce7` | Theme variables |

---

## 📊 Summary

| Severity | Count |
|----------|-------|
| 🔴 Critical | 3 |
| 🟠 High | 14 |
| 🟡 Medium | 12 |
| 🟢 Low | 8 |
| 📱 Mobile-specific | 4 |
| **Total** | **42** |

---
*Generated by UI/UX audit of Don Bosco AMS · Agricultural Theme · March 2026*
