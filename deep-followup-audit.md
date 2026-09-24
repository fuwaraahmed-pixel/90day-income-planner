# Dremoy App — Deep Follow-up Audit (Live Production App)

## 1. Executive Summary
This deep follow-up audit evaluated the live production codebase, focusing on hidden bugs, silent data drift, and UX improvements. 
**The most critical invisible risk found:** A silent data-wiping bug exists in the main data synchronization loop. When a user records a CRM payment, the application fetches the latest data. However, if the network drops *during* this fetch, the API service catches the error and returns an empty array `[]` instead of `null` or throwing an exception. The frontend sees `[]` as truthy and instantly overwrites the user's entire UI state with zero records, making it appear as if all their data was deleted until a hard reload. 
Additionally, drag-and-drop status changes in the CRM Kanban board never actually save to the database — they are purely local state illusions.

---

## 2. Full Module Coverage Findings

### CRM Module
* **Metric/Flow:** Drag-and-drop Lead Status Change (`handleDrop` → `handleStatusChange`)
* **Logic:** Updates the local `leads` state array via `setLeads`.
* **Evidence:** `src/components/Crm.jsx` lines 130-133, 230-237.
* **Correct?** No. It never calls the Supabase API (`updateCRMClientStatus`). 
* **Failure scenario:** The user drags a lead from "New" to "Contacted". It visually moves. The user closes the app. Upon reopening, the lead is back in "New".
* **Fix:** `handleStatusChange` must await `api.updateCRMClientStatus(userId, leadId, targetStatus)` before updating the local UI state.

### Tuition Module
* **Metric/Flow:** Multi-student Payment Processing (`handleRecordTuitionPayment`)
* **Logic:** Loops over an array of payments and awaits `api.recordTuitionPayment` sequentially.
* **Evidence:** `src/App.jsx` lines 622-648.
* **Correct?** No. If one payment fails in the loop, the loop continues, but the user is not warned about the specific failure.
* **Failure scenario:** User selects 5 students to mark as paid. Student 3 fails due to a network glitch. The loop finishes, the UI refreshes, but Student 3 is silently left unpaid while the success toast is shown.
* **Fix:** Use a single bulk RPC, or collect errors in an array during the loop and display a multi-status result.

### Liabilities & EMI Module
* **Metric/Flow:** EMI Installment Generation (`handleCreateLiability`)
* **Logic:** If `liabilityType === 'EMI'`, it generates `durationMonths` number of installments using JavaScript Date math.
* **Evidence:** `src/App.jsx` lines 943-965.
* **Correct?** Mostly, but vulnerable to timezone drift.
* **Failure scenario:** A user creates an EMI on the 31st of the month. The JS date math handles month overflow by setting the date to `0` (last day of previous month). This causes unexpected due dates for shorter months (e.g., jumping backwards).
* **Fix:** Generate EMI schedules via a PostgreSQL trigger or RPC where interval math is strictly correct, rather than doing it in the client.

### Customer Dues
* **Metric/Flow:** Fallback State Management (`handleRecordCustomerDuePayment`)
* **Logic:** In fallback mode, the code manually subtracts `paidAmount` from `totalAmount`.
* **Evidence:** `src/App.jsx` lines 886-930.
* **Correct?** Yes, but creates massive technical debt.
* **Failure scenario:** Duplicated business logic between the SQL RPC and the React component. If the SQL logic changes, the UI fallback will compute different totals.
* **Fix:** Remove the fallback. A live production app should not have a "fake offline mode" that desynchronizes data.

---

## 3. Hidden / Not-Obvious Problems

**1. The Silent Data Wipe (Network Drop)**
* **What normal usage would never reveal this:** You have to experience a micro-disconnection exactly *after* a successful payment but *before* the subsequent data fetch completes.
* **Exact condition that triggers it:** `handleRecordCrmPayment` calls `Promise.all` for CRM payments. If `api.getCrmPayments` fails, it catches the error and returns `[]`. `App.jsx` checks `if (crmPaysRes)` (which is `true` for an empty array) and calls `setCrmPayments([])`.
* **Evidence:** `src/lib/supabaseService.js` line 1071 (`return [];`) and `src/App.jsx` line 697.
* **Real-world impact:** Panic. The user sees their dashboard drop to ৳0 instantly.
* **Fix:** `getCrmPayments` should return `null` on error. `App.jsx` should explicitly check `if (crmPaysRes !== null)`.

**2. Ghost Updates (Kanban Board)**
* **What normal usage would never reveal this:** The UI updates instantaneously and gives no error. Only a page reload reveals the truth.
* **Exact condition that triggers it:** Dropping a card in `Crm.jsx` calls `setLeads` without an API call.
* **Evidence:** `src/components/Crm.jsx` line 132.
* **Real-world impact:** Loss of work and user trust. Users will think the app is broken or losing their data.
* **Fix:** Implement optimistic UI updates backed by an actual Supabase `update` call.

**3. Orphaned Payment Records**
* **What normal usage would never reveal this:** Deleting a lead or due leaves the payment history, but deletes the link to the income ledger.
* **Exact condition that triggers it:** `income_id` in `crm_payments` is set to `ON DELETE SET NULL`. If the income record is deleted from the Income Tracker, the CRM payment remains but loses its financial tie.
* **Evidence:** `supabase_schema.sql` lines 646.
* **Real-world impact:** Desynchronization between CRM revenue totals and actual Dashboard income totals.
* **Fix:** Use `ON DELETE CASCADE` or restrict deletion if dependent financial records exist.

---

## 4. Manual Test Matrix (Traced from Code)

| Scenario | Code Path Traced | Expected (safe) Behavior | What the Code Actually Does | Risk |
| --- | --- | --- | --- | --- |
| Double-click submit on a payment form | `Crm.jsx` lines 174-195 | Button disabled, one submission | `isSubmittingPayment` locks the button correctly. | **Low** |
| Two browser tabs, simultaneous payments | `App.jsx` → `rpcRecordCrmPayment` | Rejected if overpayment | DB RPC checks `p_amount` against `quoted_price`. Blocked safely. | **Low** |
| Network drops mid-save (after DB write) | `App.jsx` lines 691-698 | Data remains stale | API returns `[]`, wiping the UI state completely. | **Critical** |
| Session expires mid-action | `supabaseService.js` → RPC | Auth error caught & displayed | `auth.uid()` fails in DB, throws standard error, caught by UI. | **Low** |
| Edit payment immediately after creation | No edit functionality | Blocked | App does not have edit functionality for payments, only delete. | **None** |
| Delete a record referenced by others | `App.jsx` → `deleteCRMClient` | Handled via constraints | DB schema handles via `CASCADE` or `SET NULL`. | **Medium** |
| Submit a form with negative/zero amount | `Crm.jsx` line 159 | Validation error | `amountNum <= 0` throws client-side error. | **Low** |

---

## 5. Deep UI/UX Improvement Findings

**1. Dashboard - Information Hierarchy**
* **Current State:** Dashboard shows total income, but the period (all time vs monthly) is poorly contextualized.
* **Why it matters:** Users cannot quickly tell how much they made *this month* vs *lifetime* without mental math.
* **Suggested change:** Add a toggle near the top to switch the dashboard context between "This Month" and "All Time".

**2. CRM - Cognitive Load on Mobile**
* **Current State:** The Kanban board has 9 columns. On mobile, this requires excessive horizontal scrolling.
* **Why it matters:** Mobile usability is severely degraded.
* **Suggested change:** On screens smaller than 768px, force the CRM into a collapsed accordion list view or the existing 'table' view by default, disabling Kanban.

**3. Income/Expense - Visual Polish (Tables)**
* **Current State:** Long strings in the "Description" or "Notes" field stretch the table, breaking the layout.
* **Why it matters:** Makes the app feel unpolished and hard to read.
* **Suggested change:** Apply `max-w-xs truncate` to note columns and show a tooltip on hover.

**4. Settings - Feedback Clarity**
* **Current State:** Changing target income updates instantly, but there is no prominent visual confirmation.
* **Why it matters:** Users might click away before the background save finishes.
* **Suggested change:** Add a small saving spinner inside the save button and a clear green checkmark once confirmed.

**5. Missing Conveniences - Bulk Actions**
* **Current State:** Deleting old tasks or leads must be done one by one.
* **Why it matters:** High friction for power users.
* **Suggested change:** Add checkboxes to the left of table rows with a sticky "Bulk Actions" bar that appears at the bottom.

### Top 5 UX Priorities
1. Fix Kanban drag-and-drop to actually save to the database.
2. Force list-view on mobile for CRM to fix horizontal scrolling.
3. Fix the "wiping" UI state on network errors to prevent user panic.
4. Add a "This Month" filter to the Dashboard.
5. Truncate long notes in tables to prevent layout breaking.

---

## 6. Prioritized Findings Table

| ID | Area | Finding | Evidence | Visible to user? | Severity | Recommended Action |
| -- | ---- | ------- | -------- | ------------------ | -------- | ------------------- |
| 1 | Data | Network drop wipes UI data | `App.jsx` L697 | Yes (upon error) | Critical | Return `null` on API catch blocks, check for `null` in UI. |
| 2 | Data | Kanban drag doesn't save to DB | `Crm.jsx` L132 | Yes (upon reload) | Critical | Await `updateCRMClientStatus` inside `handleDrop`. |
| 3 | Core | EMI month overflow bug | `App.jsx` L954 | Yes (rare dates) | High | Move EMI generation to a backend RPC. |
| 4 | Core | Multi-payment loop silent fail | `App.jsx` L627 | Yes (rare errors) | High | Catch and display specific row errors in multi-select actions. |
| 5 | UX | 9-column Kanban unusable on mobile | UI Inspection | Yes (always) | Medium | Disable Kanban on mobile sizes. |
| 6 | UX | Table layouts break on long text | UI Inspection | Yes (often) | Low | Add text truncation and tooltips. |

---

## 7. Audit Status
* **Files inspected this pass:** `src/components/Crm.jsx`, `src/App.jsx`, `src/lib/supabaseService.js`
* **Data integrity confirmation:** Absolutely NO data was written, inserted, updated, or deleted. All findings were traced safely from the source code.
* **Unverified items:** Production bundle size impacts (`npm run build` skipped for safety); Live DB records (Live DB read skipped for safety).
