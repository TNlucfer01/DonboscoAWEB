# Requirements Audit — Ambiguities, Inconsistencies & Gaps
**Donbosco Attendance System | Last Updated: 2026-03-02 — All Rounds Complete**

> All rounds are resolved. Requirements are now stable. System Design.md can now be regenerated.

---

## ✅ Round 1 — All Resolved

| # | Issue | Resolution |
|---|---|---|
| 1 | Sections vs Batches ownership | YC proposes → Principal approves |
| 2 | Subject adding conflict | Principal creates globally → YC maps |
| 3 | Correction chain unclear | Staff → YC → Principal edits record directly |
| 4 | "Special Cases Leave" undefined | Removed |
| 5 | Informed Leave formula conflict | Informed Leave = Absent, Principal checks % before signing |
| 6 | Principal absent — blocked | **On hold** |
| 7 | 20-min window trigger | Starts from beginning of class hour (server-enforced) |
| 8 | ELM undefined | Experiential Learning Module, 4th year, same class rules |
| 9 | Field practice — no owner | Subject Staff overseeing that batch |
| 10 | SMS.md was a research dump | Moved to Resources/ |
| 11 | Audit Log access | Principal only; on every manual change |
| 12 | Spelling "Co-ordinater" | Fixed to "Year Co-ordinator" everywhere |
| 13 | YC reject/approve chain | Physical letter → YC sign → Principal checks % → Principal edits |
| 14 | Informed Leave in denominator | Stays as Absent (not excluded like holidays) |

---

## ✅ Round 2 — All Resolved

| # | Issue | Resolution |
|---|---|---|
| R2-1 | Elective enrollment undefined | Principal creates globally → YC maps students |
| R2-2 | ELM attendance rules | Same as regular class |
| R2-3 | SMS suppression contradiction | Principal checks % before signing — < 80% = no sign = SMS sent |
| R2-4 | System Design.md outdated | **Will now be regenerated** |
| R2-5 | loopholesQuestions.md polluting folder | Archived to Resources/ |
| R2-6 | Batch-to-staff mapping unclear | 1 dedicated staff per batch |

---

## ✅ Round 3 — All Resolved

| # | Issue | Resolution |
|---|---|---|
| R3-1 | Subject type missing from DB | `subject_type` enum: REGULAR / ELECTIVE / ELM |
| R3-2 | Lunch break undefined | Explicit non-period: 12:30–1:30 PM. 5 periods/day |
| R3-3 | Saturday logic incomplete | Non-enabled Saturday = College Holiday (excluded from denominator) |
| R3-4 | Holiday after attendance conflict | Holidays declared before day. System blocks retroactive entry |
| R3-5 | No user account lifecycle | OTP self-service. Principal creates accounts. Principal pre-seeded at deployment |
| R3-6 | student database.md outdated | Fully rewritten |

---

## ✅ Round 4 — All Resolved

| # | Issue | Resolution |
|---|---|---|
| R4-1 | 20-min clock server vs client | Server-side enforced. Client device time ignored |
| R4-2 | Corrections forced to Informed Leave | Principal sets correct status (PRESENT, OD, etc.) |
| R4-3 | Regular subject enrollment auto or manual | Regular = auto-enroll. Elective/ELM = YC manually maps |
| R4-4 | Student section_id flat | Student Batch Enrollment table scoped per semester |
| R4-5 | Who creates Principal account | Pre-seeded at deployment |
| R4-6 | SMS template undefined | All 3 templates defined in sms Gateway.md |

---

## ✅ Round 5 — All Resolved

| # | Issue | Resolution |
|---|---|---|
| R5-1 | Per-period vs monthly SMS | **Both exist**: (1) immediate per Uninformed Leave, (2) daily summary after lunch/end of day, (3) monthly if % < 80% |
| R5-2 | Informed Leave locked in table | YC pre-entry locks the row — staff cannot override |
| R5-3 | OD in attendance table | OD shows in Status column; reason shown in Remarks; row is locked |
| R5-4 | How many YCs per year | **1 YC per year** — responsible for all batches and semesters in that year |
| R5-5 | Section vs Batch terminology | **"Batch" is the single unified term**: Theory = 2 batches (A, B, 50 each); Lab = 4 batches (1–4, 25 each) |
| R5-6 | YC scope DB mismatch | YC year access enforced at **application level** — no `assigned_year` column in Users table |

---

## ✅ Round 6 — All Resolved (2026-03-05)

| # | Issue | Resolution |
|---|---|---|
| R6-1 | Timetable→Subject mapping in DB? | Not needed. Staff selects the subject live at attendance mark time. |
| R6-2 | Staff-subject-batch mapping table? | Removed. Staff may change — no pre-assignment table. |
| R6-3 | OD approval workflow in DB? | No digital workflow. Principal approves OD in person; YC enters it manually. |
| R6-4 | Student leave application table? | Removed. Leave is a physical-only process — no digital request flow. |
| R6-5 | Semester active state ambiguous | Added `is_active` BOOLEAN to `semesters`. Only one active at a time (app-enforced). |
| R6-6 | `departments` table still referenced | Fully removed: no `departments` table, no `dept_id` in any table. Single-department college. |
| R6-7 | Students had no personal details | Added: `phone`, `email`, `dob`, `gender`, `address` (optional). `parent_phone` remains required. |

---

## ⏸ Still On Hold

| # | Issue | Status |
|---|---|---|
| 6 | What happens when the Principal is on leave? | No deputy role defined. Feature deferred. |

---

## Next Step
> ✅ Requirements are stable. `System Design.md` can now be fully regenerated with accurate diagrams.

## Links
- [[attendance Donbosco]]
