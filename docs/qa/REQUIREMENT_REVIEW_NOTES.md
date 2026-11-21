# QA Requirement Review Notes: Questions, Gaps & Testability Assessment

**Project**: LogiDesk – Logistics Operations HelpDesk System  
**Document Reviewed**: `LogiDesk_Initial_Project_Documentation_v0.1.docx` & `LogiDesk_Initial_Product_Backlog.xlsx`  
**Execution Context**: Solo Engineer / Single Developer & QA (Atibali)  
**Review Version**: 1.1  
**Date**: November 2026  
**Audience**: Solo Developer, Product Owner / Trainer  

---

## 1. Executive Summary & Review Objective

As a **single engineer** responsible for implementing and validating both the frontend and backend of LogiDesk, conducting an upfront QA requirement review prevents costly rework and architectural flaws. 

This review analyzes the initial user stories (LD-01 through LD-10), functional requirements (FR-01 to FR-15), non-functional requirements (NFR-01 to NFR-08), and technical backlog tasks to uncover:
1. **Ambiguities and missing definitions** in the stated user stories.
2. **Functional gaps** regarding edge cases, negative paths, boundary limits, and security vulnerabilities.
3. **Testability issues** that prevent authoring clear pass/fail assertions or writing deterministic automated tests.

---

## 2. Story-by-Story QA Review

### LD-01: Customer Registration
> **Story**: As a customer, I want to register so that I can use LogiDesk.  
> **Stated Acceptance Criteria**: Valid details create an account; duplicate email is rejected; password is not stored in plain text.

* **Questions for Product Owner / Trainer**:
  1. What is the explicit **password complexity policy**? (Minimum length, numeric digits, uppercase/lowercase, special characters)?
  2. Is **email verification / confirmation** required before the account becomes active, or can newly registered users authenticate immediately?
  3. Does registration require additional logistics-specific customer fields (e.g. Phone Number, Company Name, Billing Address), or only Name, Email, and Password?
  4. Should registration automatically log the user in and return a JWT token, or require a separate explicit login step?
* **Gaps & Omissions**:
  1. **Case-sensitivity & Email normalization**: How are emails handled? (e.g., `User@Domain.COM` vs `user@domain.com`).
  2. **Rate Limiting / Abuse Prevention**: No protection against automated script registration attacks (lack of rate limiting).
  3. **Role Escalation Vulnerability**: The registration payload schema must strictly prevent clients from injecting an administrative or agent role (e.g. passing `{"role": "Administrator"}`).
* **Testability Assessment**:
  * *Current Issue*: "Password is not stored in plain text" cannot be validated from UI black-box testing alone.
  * *Testability Fix*: Requires an integration/API test asserting that the database record contains a salted hash (e.g., PBKDF2), or an architectural security test. Acceptance criteria must explicitly define the expected HTTP status codes (`201 Created` vs `400 Bad Request` vs `409 Conflict`).

---

### LD-02: User Login & Session Management
> **Story**: As a user, I want to log in so that I can access permitted features.  
> **Stated Acceptance Criteria**: Valid credentials authenticate; invalid credentials are rejected; role permissions apply.

* **Questions for Product Owner / Trainer**:
  1. What is the **token lifespan and expiration policy**? (e.g., access token expires in 15 minutes with a refresh token, or standalone 24-hour JWT)?
  2. Is there an **account lockout policy** after $N$ consecutive failed login attempts (e.g., 5 attempts locks the account for 15 minutes)?
  3. What happens if an authenticated user's account is deactivated by an administrator mid-session? Does their token remain valid until expiration, or is token revocation / claims checking enforced on each request?
* **Gaps & Omissions**:
  1. **Generic Error Messaging**: The acceptance criteria must mandate generic messages (`"Invalid email or password"`) to prevent email enumeration attacks (e.g. telling an attacker "Email not found" vs "Incorrect password").
  2. **Session Termination (Logout)**: No acceptance criteria define token invalidation, local storage clearance, or back-button cache prevention on logout.
* **Testability Assessment**:
  * *Current Issue*: "Role permissions apply" is too broad and cannot be verified by a single test.
  * *Testability Fix*: Decompose into role-based test matrices: Customer landing on `/dashboard` with customer controls, Agent redirected to triage workspace, Manager to assignment console, Admin to user management. Specify exact HTTP 401 (Unauthorized) vs 403 (Forbidden) response contracts.

---

### LD-03: Create Shipment Support Ticket
> **Story**: As a customer, I want to create a shipment support ticket so that I can report an issue.  
> **Stated Acceptance Criteria**: Required fields are validated; shipment belongs to customer if selected; unique ticket number is generated; initial status is OPEN.

* **Questions for Product Owner / Trainer**:
  1. What is the exact **Ticket Number format**? (e.g., sequential integer `#1001`, or formatted string `TICK-202611-00042`)?
  2. Is referencing a shipment mandatory or optional? (The doc states "optional shipment reference" in FR-05, but what categories require a shipment, e.g., "Delayed Shipment" vs "General Enquiry")?
  3. Can a customer attach supporting files/images (e.g. photo of damaged packaging)? If so, what are the allowed MIME types, max file sizes, and virus scanning policies?
  4. What are the character length limits for `Subject` (e.g., 5–150 chars) and `Description` (e.g., 10–2000 chars)?
* **Gaps & Omissions**:
  1. **Broken Object Level Authorization (BOLA/IDOR)**: The system must strictly validate that the provided `ShipmentId` belongs to the authenticated customer. Attempting to attach another customer's `ShipmentId` must return a `403 Forbidden` or `400 Bad Request`.
  2. **Duplicate Ticket Prevention**: What happens if a customer clicks "Submit" twice rapidly, or creates multiple identical tickets for the same shipment within 5 minutes?
* **Testability Assessment**:
  * *Current Issue*: "Required fields are validated" lacks boundary values and field lists.
  * *Testability Fix*: Define exact field constraints: `Subject` (required, 5-150 chars, trimmed), `CategoryId` (required, valid active category FK), `Description` (required, min 10 chars), `ShipmentId` (optional, validated customer ownership).

---

### LD-04: View Own Tickets (Data Isolation)
> **Story**: As a customer, I want to view my tickets so that I can track progress.  
> **Stated Acceptance Criteria**: Only tickets belonging to the authenticated customer are returned.

* **Questions for Product Owner / Trainer**:
  1. What pagination, sorting, and search capabilities are required? (e.g., page size, default sort by `CreatedAt DESC`)?
  2. Can a customer filter their tickets by status (e.g., Open vs Closed) or date range?
* **Gaps & Omissions**:
  1. **Direct Object Reference via Route**: If Customer A navigates directly to `/api/tickets/{ticketId}` or `/tickets/45` belonging to Customer B, does the system return `403 Forbidden` or `404 Not Found` (to prevent ID enumeration)?
  2. **Empty State Experience**: What is displayed when a new customer has zero tickets?
* **Testability Assessment**:
  * *Testability Requirement*: Solo engineer must execute cross-tenant negative testing: Seed Customer A with Tickets 1 & 2, Seed Customer B with Ticket 3. Assert Customer A's list contains exactly `[1, 2]` and accessing `/api/tickets/3` returns `403/404`.

---

### LD-05: Assign Ticket (Workflow & Dispatch)
> **Story**: As a manager, I want to assign a ticket to an agent so that it has an owner.  
> **Stated Acceptance Criteria**: Authorized manager can select an active agent; assignment is saved and recorded in history.

* **Questions for Product Owner / Trainer**:
  1. Can an Operations Manager assign a ticket to **themselves**?
  2. Can an Agent self-assign an unassigned ticket, or is assignment exclusively restricted to Operations Managers?
  3. When an unassigned ticket (`OPEN`) is assigned to an agent, does its status automatically change to `ASSIGNED`, or does status remain `OPEN` until the agent begins work?
  4. Can a ticket be **re-assigned** from Agent 1 to Agent 2? If so, is an assignment reason required?
* **Gaps & Omissions**:
  1. **Deactivated Agent Handling**: If an agent is assigned to 10 open tickets and is subsequently deactivated by an administrator, what happens to their tickets? Are they returned to the unassigned queue?
  2. **Concurrent Assignment Collision**: If Manager A and Manager B assign the same ticket simultaneously to different agents, how is the race condition resolved? (Optimistic concurrency / `RowVersion`).
* **Testability Assessment**:
  * *Testability Fix*: Test criteria must verify:
    1. AssignedAgentId in `Tickets` table matches selected agent.
    2. A new entry in `TicketHistory` is generated (`ChangeType = "ASSIGNMENT"`, `OldValue`, `NewValue`, `ChangedByUserId`, `ChangedAt`).
    3. Customers and Support Agents attempting `PUT /api/tickets/{id}/assign` receive `403 Forbidden`.

---

### LD-06: Update Ticket Status (State Machine Lifecycle)
> **Story**: As an agent, I want to update ticket status so that progress is visible.  
> **Stated Acceptance Criteria**: Only permitted transitions are accepted; actor and timestamp are recorded.

* **Questions for Product Owner / Trainer**:
  1. What is the **exact, exhaustive state transition matrix**?
     * Can a ticket go directly from `OPEN` to `RESOLVED`?
     * Can a `CLOSED` ticket ever be reopened, or must a new ticket be created?
     * Who is allowed to transition to `CLOSED` – the customer, the agent, the manager, or an automatic timer (e.g. 7 days after `RESOLVED`)?
  2. Is a **Resolution Note / Summary** mandatory when changing status to `RESOLVED`?
* **Gaps & Omissions**:
  1. Missing state validation rules for `ON_HOLD` (is a reason required, e.g., "Waiting on Customer", "Waiting on Carrier")?
  2. Backward transitions (e.g., from `IN_PROGRESS` back to `ASSIGNED` if an agent is reassigned).
* **Testability Assessment**:
  * *Current Issue*: "Only permitted transitions are accepted" cannot be tested without an explicit transition table.
  * *Testability Matrix Required*:

| From \ To | OPEN | ASSIGNED | IN_PROGRESS | ON_HOLD | RESOLVED | CLOSED |
|---|---|---|---|---|---|---|
| **OPEN** | — | Allowed (Mgr) | Disallowed | Disallowed | Disallowed | Disallowed |
| **ASSIGNED**| Disallowed | — | Allowed (Agent)| Disallowed | Disallowed | Disallowed |
| **IN_PROGRESS**| Disallowed | Allowed (Reassign)| — | Allowed | Allowed | Disallowed |
| **ON_HOLD** | Disallowed | Disallowed | Allowed | — | Allowed | Disallowed |
| **RESOLVED**| Disallowed | Disallowed | Allowed (Reopen)| Disallowed | — | Allowed |
| **CLOSED** | Disallowed | Disallowed | Disallowed | Disallowed | Disallowed | — |

---

### LD-07: Ticket Comments & Internal Notes
> **Story**: As a customer or agent, I want to comment on a ticket so that we can communicate.  
> **Stated Acceptance Criteria**: Authorized participant can add a message; messages display in chronological order; internal notes are hidden from customers.

* **Questions for Product Owner / Trainer**:
  1. Can a customer comment on a ticket once it has reached `CLOSED` status?
  2. Can a customer edit or delete their comment after posting? (Audit compliance recommends comments are immutable).
  3. Can an Operations Manager or Administrator post comments and internal notes?
* **Gaps & Omissions**:
  1. **Data Leakage in API Payloads**: When a customer calls `GET /api/tickets/{id}/comments`, does the backend SQL query filter out `IsInternal == true`, or is filtering done on the frontend? (*Critical security requirement*: must be filtered in the backend SQL/service layer).
  2. **Cross-site Scripting (XSS)**: Rich text or markdown in comments must be sanitized to prevent malicious script injection.
* **Testability Assessment**:
  * *Testability Fix*: Test scenario must execute an API request as a Customer and assert that no comment object in the JSON response contains `isInternal: true`. Verify that adding an empty string or whitespace-only comment returns `400 Bad Request`.

---

### LD-08: Administrator User Management
> **Story**: As an administrator, I want to manage users so that access remains controlled.  
> **Stated Acceptance Criteria**: Only administrators can manage roles and account activation.

* **Questions for Product Owner / Trainer**:
  1. Can an administrator deactivate **themselves**? (Self-lockout prevention rule needed).
  2. Can an administrator change their own role to Customer?
  3. Can an administrator reset a user's password or trigger a password reset email?
* **Gaps & Omissions**:
  1. Audit trail for administrative actions: Changing a user's role from Customer to Administrator or deactivating an account should record who made the change, prior role, and timestamp.
  2. Cascading consequences: What happens to pending assigned tickets when an agent's role is changed to Customer?
* **Testability Assessment**:
  * *Testability Fix*: Test case must verify that non-admin tokens (Customer, Agent, Manager) attempting `GET /api/admin/users`, `PUT /api/admin/users/{id}/status`, or `PUT /api/admin/users/{id}/role` receive an immediate `403 Forbidden`.

---

### LD-09: Dashboard & Operational Summaries
> **Story**: As a manager, I want to see ticket summaries so that I can monitor operations.  
> **Stated Acceptance Criteria**: Counts reflect the tickets visible to the manager and match underlying records.

* **Questions for Product Owner / Trainer**:
  1. What specific breakdown metrics are required? (e.g. Count by Status: Open, Assigned, In Progress, Resolved; Count by Priority: High, Critical; Overdue/SLA breaches)?
  2. Is the dashboard data real-time or cached?
* **Gaps & Omissions**:
  1. What does the dashboard display for Customers vs Agents vs Managers vs Admins? (Each role has distinct operational contexts).
* **Testability Assessment**:
  * *Testability Fix*: Tests must seed known quantities of tickets (e.g., 3 OPEN, 2 IN_PROGRESS, 1 RESOLVED) and assert that `GET /api/dashboard/summary` returns exact matching integers (`{"open": 3, "inProgress": 2, "resolved": 1}`).

---

### LD-10: Notifications
> **Story**: As a customer, I want to receive relevant ticket updates so that I know when progress occurs.  
> **Stated Acceptance Criteria**: Relevant assignment, reply or status events create a notification for the intended recipient.

* **Questions for Product Owner / Trainer**:
  1. What delivery channel is used? (In-app notification bell with unread badge, email notifications, or WebSockets/SignalR)?
  2. What exact events trigger notifications?
     * Ticket assigned -> Agent notified?
     * Status changed to Resolved -> Customer notified?
     * Customer comments -> Assigned Agent notified?
     * Agent comments -> Customer notified?
     * Agent adds *internal note* -> Customer must **NOT** be notified!
* **Gaps & Omissions**:
  1. Notification lifecycle: Marking notifications as read (`PUT /api/notifications/{id}/read`), marking all as read, and badge counters.
* **Testability Assessment**:
  * *Current Issue*: "Relevant events" is subjective.
  * *Testability Fix*: Requires a deterministic matrix of Trigger Event $\rightarrow$ Target Recipient $\rightarrow$ Expected Notification Message.

---

## 3. Summary of Key Decisions Required Before Implementation

| # | Topic | Current Ambiguity | Solo Developer Recommendation |
|---|---|---|---|
| **D-01** | Password Policy | "Not plain text" | Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 symbol. |
| **D-02** | Ticket Numbering | "Unique ticket number" | Format: `LD-YYYYMMDD-XXXX` (e.g., `LD-20261120-0001`). |
| **D-03** | Status Machine | "Permitted transitions" | Strict transition matrix enforced by Domain state machine. |
| **D-04** | Internal Notes | "Hidden from customer" | Filtered in backend SQL repository, never returned in API response. |
| **D-05** | Self-Lockout | Unspecified | Prevent admin from deactivating or revoking their own admin role. |
| **D-06** | Ticket Closure | Customer confirmation vs auto-close | Auto-close tickets 5 business days after `RESOLVED` status. |
| **D-07** | Performance Target | "Agreed response-time" | REST endpoints p95 < 300ms; UI load time < 1.5s under 50 CCU. |
