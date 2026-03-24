# SMS Notifications to Parents

## Two Types of SMS (Daily Summary Removed)

### 1. Immediate Per-Period SMS (on every submission)
- Triggered **immediately** when a staff submits attendance and a student is marked `Absent` (unlocked = Uninformed).
- Sent per-period — if absent for 3 periods, 3 SMS sent.

**Template:**
```
Dear Parent, your ward [Student Name] ([Roll No]) was absent for
[Period] on [Date]. — Donbosco College, Uriyur
```

### 2. Monthly Summary SMS (end of month)
- Triggered at the **end of every month** if cumulative `Attendance % < 80%`.
- No exceptions.

**Template:**
```
Dear Parent, your ward [Student Name] ([Roll No]) has [X]% attendance this month
at Donbosco Agricultural College. Kindly ensure regular attendance.
— Donbosco College, Uriyur
```

> ❌ **Daily Summary SMS has been removed.** No daily check at lunch/end of day.

## SMS and OD / Informed Leave
- Students with a pre-entered OD or Informed Leave are **not** marked Absent — they do not trigger the per-period SMS.
- They may still trigger the monthly SMS if cumulative % < 80%.

## Estimated Volume
~300 SMS per day.

## Technical Implementation
**[[Resources/SMS Technical Research]]**

## Links
- [[attendance Donbosco]]