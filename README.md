# LogiDesk – Logistics Operations HelpDesk System

LogiDesk is a proposed web-based HelpDesk application for a logistics business. It centralizes shipment-related support requests so customers can raise issues, agents can investigate and resolve them, managers can assign work, and administrators can manage access.

## Problem
Support requests about delayed shipments, lost packages, damaged goods, incorrect addresses and tracking issues can be difficult to coordinate when handled across calls, email and spreadsheets. LogiDesk provides a central ticket workflow and communication history.

## Scope
**Initial scope**
- Authentication and role-based access
- Customer, support-agent, manager and administrator roles
- Basic shipment reference records
- Ticket creation, assignment, status updates and comments
- Ticket history and basic dashboard summaries

**Not in the initial scope**
- Real-time GPS/carrier integrations
- Route optimization, fleet management or warehouse inventory
- Payment processing
- Native mobile application
- AI ticket classification

## Proposed roles
- Customer
- Support Agent
- Operations Manager
- Administrator

## Proposed ticket statuses
`OPEN` → `ASSIGNED` → `IN_PROGRESS` → `RESOLVED` → `CLOSED`

`ON_HOLD` and reopening a resolved ticket may be added after workflow rules are confirmed.

## Proposed core entities
- Users
- Shipments
- Tickets
- Categories
- Comments
- TicketHistory
- Notifications

## Technology
**To be decided.** Frontend framework, backend framework, database, ORM, testing tools and deployment approach will be updated after the training track is confirmed.

## Project documents
- `LogiDesk_Initial_Project_Documentation_v0.1.docx` – project overview, scope, requirements, user stories, acceptance criteria, conceptual data model, API capability list, QA scenarios and pending decisions.
- `LogiDesk_Initial_Product_Backlog.xlsx` – proposed epics, stories, tasks, acceptance criteria, priorities and planning columns.

## Important
This is an initial training-project proposal, not an approved business specification. Confirm the official HelpDesk requirements and permission to use the logistics context with the trainer before implementation. Use synthetic/demo data only.
