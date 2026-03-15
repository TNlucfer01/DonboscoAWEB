# Leave and Attendance Processing

## Leave Types for Each Period
1. **Present** — Student attended the class.
2. **On Duty (OD)** — Student was on official college duty. Counts as **Present** in the percentage.
3. **Informed Leave** — Student was absent with a valid reason, physical signed form (YC + Principal). Counts as **Absent**. The Principal checks the student's % before signing — only signed if % ≥ 80%.
4. **Uninformed Leave** — Auto-set by the system for any student marked Absent who is not on Informed Leave. Counts as **Absent**. Monthly SMS to parents.
5. **College Holiday / Special Holiday** — Removed from the denominator entirely.

> ⚠️ **"Special Cases Leave" has been removed.** There is no such leave type.

## How Status and Remarks Are Set
- The **staff** only marks unlocked rows as `Present` or `Absent`.
- **OD rows** are **pre-locked by the YC** (future days only) — Status = `OD`, Remarks = reason entered by YC. Staff cannot edit.
- **Informed Leave rows** are **pre-locked by the YC** (future days only) — Status = `Informed Leave`. Staff cannot edit.
- **After submission**, for all unlocked rows still marked `Absent`, the system automatically sets them to `Uninformed Leave`.

## Attendance % Formula (Definitive)
```
Attendance % = (Present + OD) / (Total Periods − College Holidays) × 100
```
| Status | Counts as Present? | In Denominator? |
|---|---|---|
| Present | ✅ Yes | ✅ Yes |
| OD | ✅ Yes | ✅ Yes |
| Informed Leave | ❌ No (Absent) | ✅ Yes |
| Uninformed Leave | ❌ No (Absent) | ✅ Yes |
| College Holiday | ❌ No | ❌ Excluded |

## Informed Leave Gate (Principal's Role)
1. Student submits physical leave form → **Year Co-ordinator** signs.
2. Principal checks student's current attendance % on the app (by student ID / name / year).
3. If `% ≥ 80%` → Principal signs → YC enters as `Informed Leave` in the system.
4. If `% < 80%` → **Principal does not sign** → absence stays as `Uninformed Leave` → SMS sent.

## Monthly SMS Logic
- At the end of every month, if `Attendance % < 80%` → SMS sent to parent.
- There is **no exception**: students below 80% always get the monthly SMS.
- The Principal's gate-check on leave forms ensures no student with < 80% can accumulate Informed Leave to avoid the SMS.

## Attendance Correction Workflow
Triggered when a staff member marked a student incorrectly:
1. Staff reports the mistake to the **Year Co-ordinator** in person.
2. YC escalates to the **Principal**.
3. The **Principal** opens the **Attendance Correction page** (same layout as the staff attendance page, but can select any date — past or future).
4. Principal selects Year → Batch → Period → Date → finds the student → changes to the correct status (`PRESENT`, `OD`, etc.).
5. The change is saved with a full **Audit Log** entry: who changed it, old status, new status, timestamp.

## Links
- [[attendance Donbosco]]
