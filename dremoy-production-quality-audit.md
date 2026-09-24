# Dremoy App — Professional Production Quality & Correctness Audit

## Role

Act as a **Senior Full-Stack SaaS Application Engineer, QA/Test Engineer, Database Engineer, and Production Readiness Auditor**.

You are auditing the existing **Dremoy App (`app.dremoy.com`)** — a React/Vite frontend with a Supabase/PostgreSQL backend.

This audit is **NOT about migration**. The purpose is to answer one question in depth:

> **"As it exists right now, is this application correct, reliable, well-designed, and safe to run with real users and real money — and if not, what exactly needs to be fixed?"**

---

# IMPORTANT: READ-ONLY AUDIT

* Do NOT edit, create, or delete any files.
* Do NOT modify database schema, RLS policies, or RPCs.
* Do NOT install packages or refactor code.
* Do NOT "fix" anything you find — only report it.
* Do NOT make assumptions without inspecting the actual code.
* You may run safe, non-destructive commands: file inspection, code search, dependency inspection, static analysis, and a non-destructive `npm run build` if useful. Report results clearly.
* If something cannot be verified from available source, explicitly write: **"Not verified from available source."**

---

# EXECUTION STRATEGY

Work in phases so a usable report exists even if you must stop early:

1. **Phase 1 — Source of Truth Check:** Section 9 (Live Supabase vs Local Source). Do this early — it determines whether the rest of the audit can trust the local schema files or must independently verify everything against the live database.
2. **Phase 2 — Correctness:** Sections 1–4 (Calculation & Data Correctness, Financial Logic, Data Integrity, Bug Hunt), informed by Section 10 (Real Data Cross-Check) and Section 11 (Transaction Boundary & Atomicity) where access allows. This is the highest priority — wrong numbers or silent bugs are the most damaging class of problem in a finance app.
3. **Phase 3 — Multi-User & Concurrency:** Section 5, supported by Section 12 (High-Risk Manual Test Matrix). Second priority — this determines whether the app breaks under real-world simultaneous usage.
4. **Phase 4 — Security:** Section 13 (Security & Sensitive Data Exposure Review).
5. **Phase 5 — UI/UX Quality:** Section 6.
6. **Phase 6 — Code Quality & Architecture Risk:** Section 7.
7. **Phase 7 — Prioritized Improvement Plan & Readiness Assessment:** Sections 8, 14, and 15 (produced last, based on everything found above).

If you must stop early, clearly state which phases were completed and which were not — never present a partial report as complete.

---

# SECTION 1 — CALCULATION & DATA CORRECTNESS AUDIT

This is the most important section. Go metric by metric, not module by module.

For **every calculated number the user sees** (dashboard totals, income totals, expense totals, remaining targets, EMI/installment balances, liability remaining balance, customer due balance, tuition balance, CRM revenue, 90-day progress, monthly totals, etc.):

1. Identify the exact source: which table(s), which query/RPC, which frontend calculation.
2. Trace the formula step by step — read the actual code, don't assume from variable names.
3. Check whether the calculation is done **once, in one place** (source of truth), or **re-derived independently in multiple components** (a classic source of drift/inconsistency).
4. Check date/range filtering: does "this month" actually mean this month? Timezone handling? Off-by-one errors in date boundaries?
5. Check rounding/floating-point handling for money values (are amounts stored/calculated as floats where they should be integers/cents, or decimal types?).
6. Check what happens when a record is **edited** or **deleted** after being counted — does every dependent total update correctly, or can it go stale?

For each metric, report:

**Metric → Formula (as implemented) → Evidence (file/function) → Is it correct? → Failure scenario (if any) → Fix recommendation**

---

# SECTION 2 — FINANCIAL LOGIC & CROSS-MODULE FLOW AUDIT

Trace these flows precisely, at the database/RPC level, not just the UI:

```text
CRM Payment → CRM balance → Income → Dashboard
Customer Due Payment → Due balance → Income → Dashboard
Tuition Payment → Tuition balance → Income → Dashboard
Liability Payment → Installment status → Liability balance → Expense → Dashboard
EMI Payment → Installment status → Liability remaining → Expense → Dashboard
```

For each flow, determine:

* Does one payment ever create **duplicate** income/expense records (e.g., once via RPC, once via a frontend fallback)?
* Does **editing** a payment correctly adjust all downstream numbers?
* Does **deleting** a payment correctly reverse all downstream effects (or is it blocked entirely, and is that the right choice)?
* Is the whole operation **atomic** (a single DB transaction), or could a network failure halfway through leave the data in an inconsistent state (e.g., due balance updated but income record never created)?
* Are there any flows where the **frontend** computes and writes a derived value instead of the database being the source of truth?

---

# SECTION 3 — DATA INTEGRITY AUDIT

Inspect the actual schema, constraints, and current data-shape assumptions:

* Missing foreign keys / missing unique constraints that should exist
* Nullable fields that should not be nullable (e.g., amounts, user_id, dates on financial records)
* Orphan-record risk: can a payment exist referencing a deleted client/liability/customer?
* Cascade behavior on delete: does deleting a parent record (e.g., a CRM client) correctly handle its related payments/income, or leave orphans / break totals?
* Any table where two different code paths can write conflicting data (e.g., both a trigger and frontend code update the same balance column)?

---

# SECTION 4 — BUG HUNT

Actively look for concrete, reproducible-from-code bugs — not style opinions. For each one found:

**File → Function/Line → What the code actually does → What it should do → Impact → How to reproduce**

Focus areas:

* Off-by-one errors in loops, date ranges, pagination
* Incorrect comparison operators or boolean logic in filters
* Race conditions in state updates (e.g., `setState` based on stale closure values)
* Error handling that silently swallows failures (empty `catch` blocks, unhandled promise rejections)
* Places where a failed API/DB call still lets the UI show a success state
* Form validation gaps that allow invalid data (negative amounts, empty required fields, impossible dates) to reach the database
* Any `TODO`, `FIXME`, or commented-out logic that hints at a known unresolved issue

---

# SECTION 5 — MULTI-USER & CONCURRENCY READINESS

This app will have multiple independent users (each presumably scoped by `user_id`/RLS) and potentially concurrent actions. Investigate:

* **Cross-user isolation:** Re-verify, table by table, that RLS actually prevents User A from reading/writing User B's data — don't just check that RLS is "enabled," check that every policy correctly scopes with `auth.uid()`.
* **Concurrent writes by the same user:** If a user opens the app in two tabs/devices and performs an action in both nearly simultaneously (e.g., recording two payments), can this create a race condition — e.g., both reads see the same stale balance and both writes overwrite each other, losing one payment's effect? Check whether updates use atomic SQL operations (`UPDATE ... SET balance = balance - X`) or read-modify-write from the frontend (fetch balance → compute new value in JS → write it back), which is unsafe under concurrency.
* **RPC-level locking/atomicity:** For RPCs that touch multiple tables, are they wrapped correctly so a partial failure can't leave data half-updated?
* **Admin/shared resources:** Are there any tables or counters that multiple users write to concurrently (not just their own row) — e.g., a shared settings table, a global counter, a waitlist? If so, what happens under simultaneous writes?
* **Session/auth edge cases:** What happens if a user's session expires mid-action — does a partial write happen before the auth error surfaces?
* **Scale behavior:** With many users and thousands of records each, do any queries fetch entire tables to the client rather than filtering/paginating at the database level? This is both a performance and a correctness concern if it silently truncates results.

For each concurrency risk found, describe a **concrete scenario** ("User opens two tabs and does X in both within Y seconds → Z happens") rather than a general statement.

---

# SECTION 6 — UI/UX QUALITY AUDIT

Evaluate as a professional product/UX reviewer, not just "does it look nice":

* **Correctness of what's displayed:** Do labels match what the underlying data actually represents? Any place where a number is mislabeled or a formatted value is wrong (e.g., currency symbol, decimal places, wrong sign for expenses)?
* **Consistency:** Same component/pattern (modals, buttons, forms, cards, empty states) used consistently across modules, or does each module reinvent its own version?
* **Feedback states:** Loading, error, empty, and success states present and correct everywhere a user takes an action? Does the UI ever show stale or contradictory data after an action (e.g., a deleted item still visible until refresh)?
* **Form UX:** Validation messages clear and immediate? Can a user submit twice by double-clicking (no debounce/disable-on-submit)?
* **Navigation & information architecture:** Is it clear where to find things? Any dead-end screens or unreachable features?
* **Accessibility basics:** Color contrast, focus states, keyboard navigation, alt text on meaningful icons/images.
* **Responsiveness:** Genuinely usable on mobile/tablet, or only "doesn't break" (test actual touch-target sizes, overflow, and modal usability on small screens).
* **Error messaging:** Are raw technical errors (stack traces, SQL error text) ever shown directly to the user?

For each finding: **Screen/Component → Evidence → Problem → User Impact → Recommendation**

---

# SECTION 7 — CODE QUALITY & ARCHITECTURAL RISK (Context Only)

Briefly note anything that materially increases the risk of the bugs found above recurring — without turning this into a full migration audit:

* Is business logic duplicated across components in a way that makes fixing Section 1–4 bugs error-prone (fix in one place, bug remains in another copy)?
* Is there a single point of failure (e.g., one giant root component) that makes isolated testing of a module difficult?
* Is there any automated testing at all (unit/integration)? If none, note this as a major risk multiplier for the bugs found.

Keep this section short — its purpose is to explain *why* bugs exist and *how hard* they'll be to keep fixed, not to plan an architecture overhaul.

---

# SECTION 8 — PRIORITIZED IMPROVEMENT PLAN

Produce a single prioritized table covering everything found in Sections 1–7:

| ID | Area | Finding | Evidence | User/Business Impact | Severity | Recommended Fix |
| -- | ---- | ------- | -------- | --------------------- | -------- | ---------------- |

Severity levels:
* **Critical** — incorrect financial data, cross-user data leakage, or data loss risk
* **High** — bug affecting core functionality or multiple users, but not yet observed causing data loss
* **Medium** — real but limited-impact bug, or a UX problem causing user confusion
* **Low** — polish, minor inconsistency, nice-to-have

Then give a short, practical **"fix this first"** list — the 5–10 items you'd tackle before anything else, in order, with a one-line reason each.

---

# SECTION 9 — LIVE SUPABASE VS LOCAL SOURCE VERIFICATION

Do NOT assume the local SQL/schema files represent the currently deployed Supabase database — local files can drift out of sync with what's actually live.

* If read-only access to the live Supabase project is available, inspect the actual deployed tables, columns, foreign keys, unique constraints, indexes, RLS policies, RPCs/functions, triggers, and relevant configuration.
* Clearly distinguish, for every finding elsewhere in this audit, between **local source definition** and **deployed/live database state** — note explicitly if they differ.
* If live database access is unavailable, explicitly mark the relevant findings as: **"Not verified from available source — live database state unavailable."**

---

# SECTION 10 — REAL DATA CROSS-CHECK

If safe, read-only access to representative database records is available, cross-check the critical financial calculations from Section 1 against actual source records, tracing:

**Raw Database Records → Database/RPC Result → Frontend Calculation → Displayed Value**

Cross-check where applicable: dashboard income, dashboard expenses, monthly totals, 90-day totals, CRM revenue/payment totals, customer due balances, tuition balances/payments, liability remaining balances, EMI/installment balances, target/progress calculations.

Do NOT expose or reproduce sensitive user data in the audit report. If actual data cannot be safely inspected, mark the calculation as **code-verified only** and state clearly that live-data cross-check was not performed.

---

# SECTION 11 — EXACT TRANSACTION BOUNDARY & ATOMICITY

For every financial operation that updates multiple records/tables (CRM Payment → balance + Income; Customer Due Payment → balance + Income; Tuition Payment → balance + Income; Liability Payment → payment + Expense + Installment status; EMI Payment → payment + Expense + Liability remaining), determine:

1. Which changes are performed by the frontend?
2. Which changes are performed by RPC/database logic?
3. Whether all related database statements execute within the **same PostgreSQL transaction**.
4. What happens if one statement fails after previous statements succeed.
5. Whether partial/inconsistent financial records can be created.
6. Whether rollback behavior is guaranteed by the actual implementation.

Do NOT assume that using an RPC automatically makes an operation safe or atomic — inspect the actual implementation (function body, not just its name).

---

# SECTION 12 — HIGH-RISK MANUAL TEST MATRIX

If automated tests are absent or insufficient, identify high-risk scenarios that require manual verification. At minimum consider: create payment, edit payment, delete/reversal of payment, duplicate submission, double-click on save/submit, same account from two browser tabs, same account from two devices, concurrent payment actions, session expiration during save, network/API failure during save, database failure during a multi-table operation, cross-user data-access attempts, refreshing immediately after a financial operation, repeated submission after a timeout/error.

For each: **Scenario → Steps → Expected Result → Actual Result (if tested) → Risk**

Do NOT perform destructive or irreversible tests on production data.

---

# SECTION 13 — SECURITY & SENSITIVE DATA EXPOSURE REVIEW

A focused production-security pass — not a separate large security project. Inspect: RLS enforcement and possible cross-user data access; whether authorization is enforced server-side/database-side rather than only in the frontend; admin privilege enforcement; RPC authorization and `auth.uid()` validation; client-side trust of user IDs or ownership fields; sensitive financial/user data unnecessarily exposed to the client; Supabase/service-role secrets accidentally exposed in frontend code; environment-variable usage; internal database/API errors exposed directly to users; information leakage through error messages; insecure direct object/reference access patterns.

Report only concrete findings supported by the code/configuration.

---

# SECTION 14 — VERIFIED VS NOT VERIFIED STATUS MATRIX

Include this matrix near the end of the report:

| Area | Status | Evidence / Limitation |
| --- | --- | --- |
| Frontend calculations | Verified / Not Verified | |
| Financial flows | Verified / Not Verified | |
| Database schema | Verified / Not Verified | |
| Live Supabase database | Verified / Not Available | |
| RLS policies | Verified / Not Verified | |
| RPC implementation | Verified / Not Verified | |
| Transaction/atomicity | Verified / Not Verified | |
| Multi-user isolation | Verified / Not Verified | |
| Concurrency behavior | Verified / Not Fully Verified | |
| Security controls | Verified / Not Verified | |
| UI/UX behavior | Verified / Not Fully Verified | |
| Production build | Tested / Failed / Not Tested | |
| Automated tests | Present / Insufficient / Absent | |
| Real-data cross-check | Performed / Not Performed | |

Never present an unverified assumption as a verified fact.

---

# SECTION 15 — PRODUCTION READINESS ASSESSMENT

Do not provide a numeric score, ranking, or simplistic "good/bad" verdict. Instead, give a descriptive status based strictly on verified findings, such as: **Ready for limited real-user use** / **Needs critical fixes before real-user use** / **Significant correctness or reliability risks identified** / **Production readiness not fully verified**.

Explain exactly which verified findings support the assessment. Do not base this on aesthetics alone — financial correctness, data integrity, security, multi-user isolation, concurrency, and failure handling must carry the highest weight.

---

# EVIDENCE STANDARD

Every finding must follow: **Verified Fact → Observed Problem → Risk → Recommendation**

Do not write vague statements like "the code could be cleaner." Be specific: which file, which function, what it does, what breaks, and under what conditions.

If a claim cannot be verified from the available codebase, mark it **"Not verified from available source"** rather than guessing.

---

# OUTPUT FORMAT

Produce a single Markdown file (`production-quality-audit.md`) with these sections in order:

1. Executive Summary (plain-language: is this app in good shape or not, and what's the single biggest risk?)
2. Live Supabase vs Local Source Findings
3. Calculation & Data Correctness Findings (including Real Data Cross-Check results)
4. Financial Logic & Cross-Module Flow Findings (including Transaction Boundary & Atomicity)
5. Data Integrity Findings
6. Bug Hunt Results
7. Multi-User & Concurrency Findings (including High-Risk Manual Test Matrix)
8. Security & Sensitive Data Exposure Findings
9. UI/UX Findings
10. Code Quality & Architectural Risk (brief)
11. Prioritized Improvement Table
12. "Fix This First" List
13. Verified vs Not Verified Status Matrix
14. Production Readiness Assessment
15. Audit Status (read-only confirmation, files inspected, what could not be verified, phases completed)

---

# FINAL RULE

This is **AUDIT ONLY**. Do not fix, modify, or refactor anything — only find, evidence, and prioritize. Distinguish clearly between what you verified directly in code versus what you inferred versus what could not be checked.
