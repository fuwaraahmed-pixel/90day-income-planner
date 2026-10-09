# AGENTS.md — Dremoy Income Manager Agent Protocol & Repository Rules

> **Repository:** Dremoy Income Manager (`app.dremoy.com`)  
> **Stack:** React 19, Vite, Tailwind CSS 3, Supabase (PostgreSQL, GoTrue Auth, Row Level Security, RPCs), Lucide React  
> **Scope & Authority:** This document specifies absolute operational, security, architectural, and auditing rules for any autonomous or semi-autonomous AI coding agent operating in this repository.

---

## 1. Core Operating Directives & Safety Invariants

### 1.1 Read-Only Audit First
- **No speculative edits:** An agent MUST inspect and read the relevant codebase files before proposing or writing code.
- **Audit Phase First:** Whenever a bug, refactor, vulnerability, or feature is discussed, the agent must perform a read-only investigation and produce concrete findings with file references before proposing file mutations.
- **Explicit User Consent:** Do NOT begin executing multi-file edits or destructive steps without user alignment.

### 1.2 Secrets & Environment Protection
- **NEVER** read, print, output, expose, copy, log, or commit `.env`, `.env.local`, `.env.production`, or any file matching `.env*`.
- **NEVER** output service role keys, Supabase DB connection strings, passwords, or personal credentials.
- **Client Configuration:** Only publicly safe configuration (such as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`) may be referenced in code via `import.meta.env.*`. Secret credentials (e.g. `SUPABASE_SERVICE_ROLE_KEY`) must never touch client bundles or git.

### 1.3 Database & Migration Safety
- **NO DESTRUCTIVE SQL:** Strictly forbid executing or generating unapproved `DROP TABLE`, `DROP DATABASE`, `TRUNCATE`, `ALTER TABLE ... DROP COLUMN`, mass `DELETE FROM`, or `CASCADE` drops.
- **NO RLS Disabling:** Never propose or run `ALTER TABLE ... DISABLE ROW LEVEL SECURITY` on any production or tenant table.
- **Safe Migrations:** Database migrations must always be additive, backward-compatible, idempotent (`IF NOT EXISTS`, `OR REPLACE`), and non-destructive.
- **Audit Trail Preservation:** Tables storing critical financial history, payment logs, and audit trails (e.g. `trial_history`, `payment_requests`, `crm_payments`, `tuition_payments`) must be treated as append-only.

### 1.4 Git & Repository Hygiene
- **NO Unsolicited Git Actions:** Do NOT execute `git commit`, `git push`, `git push --force`, `git reset`, `git checkout .`, `git clean -f`, or `git revert` without explicit user instruction.
- **Never Overwrite User Work:** Respect working tree modifications. Before editing, inspect whether uncommitted user changes exist in the target file.
- **Minimal Scope:** Touch ONLY the files strictly required to address the assigned task. Never make incidental formatting changes, reformat whole files, or introduce stylistic refactoring across untouched modules.

---

## 2. Distinction: Repository Audit vs. Live Supabase Audit

When analyzing the system, an agent must maintain and clearly state the distinction between what exists in the repository versus the live Supabase project:

| Dimension | Repository Audit (Static) | Live Supabase Audit (Runtime) |
| :--- | :--- | :--- |
| **Source of Truth** | Git tracked code (`src/**`, `supabase_schema*.sql`, `*.sql`) | Live PostgreSQL instance, active Supabase project, actual table data |
| **RLS Policies** | Declared in `.sql` migration files | Actually enabled and attached to live database catalog (`pg_policies`) |
| **Database Functions / RPCs** | Declared signatures and SQL bodies in files | Active deployed functions in the Supabase schema (`information_schema.routines`) |
| **Data Verification** | Structural validation only | Live row counts, foreign key integrity, orphaned records |
| **Reporting Rule** | Must explicitly state: *"Verified from local repository source files"* | Must explicitly state: *"Requires live database connection / Live Supabase check not performed unless connected"* |

Agents must NEVER claim a live database bug or live data issue is resolved without verifying the live environment or clearly qualifying that only the repository source was updated.

---

## 3. Supabase, PostgreSQL, Auth & Security Rules

### 3.1 Row Level Security (RLS) Standards
1. **Compulsory RLS:** Every single table exposed to the Supabase PostgREST API must have `ROW LEVEL SECURITY` explicitly enabled:
   ```sql
   ALTER TABLE public.<table_name> ENABLE ROW LEVEL SECURITY;
   ```
2. **`USING` vs `WITH CHECK` Auditing:**
   - `USING` clause controls which rows are visible for `SELECT`, `UPDATE`, and `DELETE`.
   - `WITH CHECK` clause controls what new or updated data can be written via `INSERT` and `UPDATE`.
   - An agent must verify both clauses. A policy allowing `UPDATE` with a valid `USING` expression is dangerous if missing a `WITH CHECK` that prevents changing `user_id` to another user's UUID.
3. **Multi-Tenant User Isolation:**
   - Tenant tables (`tasks`, `income`, `expenses`, `crm_clients`, `crm_payments`, `tuition_students`, `tuition_payments`, `customer_dues`, `liabilities`, `services`, `settings`) must strictly enforce:
     ```sql
     auth.uid() = user_id
     ```
   - Defaults must bind to `auth.uid()`: `user_id UUID NOT NULL DEFAULT auth.uid()`.

### 3.2 `SECURITY DEFINER` Functions Auditing
1. **Explicit Search Path:** Every `SECURITY DEFINER` function MUST set `SET search_path = public, pg_temp;` to protect against search-path injection vulnerabilities.
2. **Caller Authorization Check:** A `SECURITY DEFINER` function runs with the privileges of its owner (superuser/postgres). It MUST immediately validate the caller's identity:
   ```sql
   IF auth.uid() IS NULL THEN
     RAISE EXCEPTION 'Not authenticated';
   END IF;
   ```
3. **Role & Privilege Verification:** Sensitive administrative operations (such as `approve_payment_request`, `extend_user_trial`, `reject_payment_request`) must invoke an authoritative admin check (e.g. `public.is_admin(auth.uid())`) inside the function before executing any mutations.
4. **Revoke Public Execution:** Revoke default execution privileges from `PUBLIC` and `anon` for administrative or elevated RPCs:
   ```sql
   REVOKE EXECUTE ON FUNCTION public.<function_name> FROM PUBLIC, anon;
   GRANT EXECUTE ON FUNCTION public.<function_name> TO authenticated;
   ```

### 3.3 Security Boundary Enforcement
- **Frontend filtering is NEVER a security boundary.** Hiding a tab, disabling a button, or filtering an array in React (`.filter(item => item.user_id === user.id)`) is purely a UX feature.
- All authorization, tenant isolation, and privilege gates must be strictly enforced at the database level via Postgres RLS policies and RPC validations.

---

## 4. Subscriptions, Licensing & Free-Trial Access Rules

### 4.1 Plan Hierarchy & Feature Matrix
The system recognizes three tiers configured in [src/utils/planPermissions.js](file:///src/utils/planPermissions.js) and [src/utils/plans.js](file:///src/utils/plans.js):
1. **Starter (৳499):** Core modules (`dashboard`, `tasks`, `plan`, `weekly`, `income`, `expense`, `tuition`, `settings`).
2. **Pro Business (৳999):** Starter modules + `crm`, `dues`, `services`.
3. **Business Plus / Agency (৳1,999):** Pro Business modules + `liabilities`, banking/EMI tracking.

### 4.2 Subscription Verification Contract
- Access is governed by [src/utils/subscriptionHelper.js](file:///src/utils/subscriptionHelper.js):
  - **Paid Active:** `status === 'active' && expiresAt > NOW()`
  - **Active Trial:** `trialEndsAt > NOW() && !trialEndedAt`
  - **Admin Override:** Authorized admins (`is_admin`) bypass subscription access barriers for platform management.
- When an account expires, core read-only viewing or subscription payment requests must remain accessible so the user can settle dues or renew without deadlocking their account.

### 4.3 Trial Security
- Users cannot grant themselves active subscriptions or arbitrarily extend their own trials via client-side upserts.
- The `trial_history` table is append-only and audited with `admin_id`, `action`, `previous_end_at`, and `new_end_at`.
- Direct modifications to subscription plan dates must occur through validated RPCs or server-controlled channels, not unconstrained client `UPDATE` operations.

---

## 5. Financial Calculation & Data Integrity Rules

### 5.1 Financial Integrity Mandates
1. **Zero Silent Rounding Errors:** Financial arithmetic involves Bangladesh Taka (৳). Monetary values must be validated as valid positive numbers (`amount > 0`). In database columns, use `NUMERIC` (not imprecise floats).
2. **Transaction Boundaries & Atomic RPCs:**
   - Multi-table financial operations (e.g., recording a CRM advance payment which must simultaneously log an entry into `crm_payments` and `income`) MUST execute within atomic database transactions via dedicated Postgres RPCs (e.g. `record_crm_payment`, `record_tuition_payment`).
   - Never perform fractured, client-orchestrated two-step writes for linked ledger items where a network disconnect could create orphaned payments or mismatched income.
3. **Orphan Prevention & Foreign Key Consistency:**
   - When financial items reference related records (e.g., payments referencing clients or income records), foreign keys must use appropriate constraints (`ON DELETE RESTRICT` or carefully audited cascades).
4. **Derived Metrics vs Source of Truth:**
   - Client totals (e.g. `totalIncome`, `totalExpense`, `remainingTarget`) computed in React components must always be derived cleanly from authoritative state, with server-side validation or RPC validation for ground-truth financial reports.

---

## 6. Frontend Architecture & React 19 + Vite Rules

### 6.1 React 19 Standards
- **Modern React 19 Idioms:** Utilize clean hooks (`useState`, `useEffect`, `useCallback`, `useMemo`, `useRef`). Avoid deprecated lifecycle methods or outdated patterns.
- **Dependency Arrays:** Always provide accurate, complete dependency arrays in `useEffect` and `useCallback` to prevent infinite loops, stale closures, or unmounted state updates.
- **Uncontrolled Inputs & Sanitization:** Sanitize and parse user financial inputs (`Number(val) || 0`) before dispatching payloads.

### 6.2 Optimistic UI Rules: Pending Guards & Rollback
When implementing optimistic UI updates (e.g., toggling task status, adding a quick expense, updating payment status):
1. **Snapshot Previous State:** Store the previous state before applying the speculative update.
2. **Pending Guard:** Set a localized loading/pending indicator so the user cannot trigger conflicting duplicate submissions while the request is in flight.
3. **Deterministic Rollback on Failure:** If the backend RPC or Supabase request fails:
   - Roll back the client state immediately to the pre-action snapshot.
   - Display a clear, user-friendly error toast/alert explaining the failure.
4. **Idempotency:** Prevent double-clicking mutations by disabling submit buttons or using debounce/in-flight guards.

### 6.3 State Management & Sync
- Multi-module updates must coordinate cleanly. If an RPC updates payments and income on the backend, the client must refresh or synchronize all affected state slices (e.g. both `incomes` and `crmPayments`).
- Sync events via [src/store/syncStore.js](file:///src/store/syncStore.js) must be respected across tabs and components.

---

## 7. Premium Dremoy UI/UX Guidelines

The Dremoy design system is tailored for Bangladeshi business owners, agency founders, and professionals:
- **Typography:** Primary font pairing is `"Anek Bangla"` and `Inter` (as configured in [tailwind.config.js](file:///tailwind.config.js) and [index.html](file:///index.html)).
- **Color Palette & Theme:**
  - Page Background: `#f8fafc` (`bg-page`)
  - Cards & Surfaces: `#ffffff` (`bg-card`) with subtle borders `#e2e8f0` (`border-border`) and soft shadows (`shadow-sm`)
  - Accent / Primary: Emerald/Teal tones (`emerald-600`, `emerald-700`) representing financial clarity and growth, paired with dark slate (`slate-900`) for headers and typography.
  - Badges & Statuses: Explicit semantic color tokens (e.g., `emerald` for paid/active, `amber` for pending/trial, `rose` for overdue/cancelled).
- **Bangla Language & Currency Localization:**
  - Standard currency symbol: `৳` (Taka).
  - Use clear, professional, respectful Bengali phrasing for user messages and payment instructions (e.g., bKash, Nagad, Rocket merchant guidelines).
- **Micro-Interactions & Feedback:**
  - Interactive elements must provide hover states, focus rings, disabled states during submission, and clear loading spinners (`lucide-react` icons).
  - Modals must be responsive, scroll-locked when open, and dismissible via backdrop or Escape key.

---

## 8. Development, Auditing & Verification Protocol

### 8.1 Minimal-Scope Editing & No Unrelated Refactoring
- Solve the user's explicit problem with the smallest correct changeset.
- **Do NOT** rewrite unrelated functions, rename established exports, or change formatting across entire files.
- Keep diffs focused, reviewable, and surgically precise.

### 8.2 Verification Before Claiming Success
- Before claiming any task is done:
  1. Verify file syntax and imports.
  2. Run the repository linter (`npm run lint` with `oxlint`) if checking code correctness.
  3. Verify that changes do not break build configuration.
  4. Ensure no uncommitted side-effect files or artifacts are left lingering.

---

## 9. Required Audit & Reporting Format

Whenever an audit, investigation, or implementation report is requested, agents must present findings with rigorous evidence using the following standardized schema:

```markdown
### 1. Audit Target & Executive Overview
- **Component / Module:** [Exact Name]
- **Scope:** [Repository Static Code / Database Migration / Architecture]
- **Risk Level:** [Critical / High / Medium / Low / Clean]

### 2. Evidence-Based Findings Table
| # | File Path | Line Range | Symbol / Function | Issue Description | Impact & Severity |
|---|-----------|------------|-------------------|-------------------|-------------------|
| 1 | `src/...` | L12-L34    | `functionName()`  | Specific defect   | High              |

### 3. Detailed Technical Analysis
- **Observed Behavior:** What the code currently does with exact code snippet.
- **Failure Scenario:** Step-by-step description of how and when failure occurs.
- **Root Cause:** Architectural, logic, or permission defect.

### 4. Recommended Fix / Implementation Plan
- **Target File:** Exact path
- **Safe Solution:** Surgical fix ensuring idempotency, RLS safety, and rollback handling.
- **Verification Method:** How to verify the fix without regression.
```

---

*End of Protocol. Every agent operating within the Dremoy repository must strictly adhere to these rules.*
