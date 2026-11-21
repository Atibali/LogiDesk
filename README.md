# LogiDesk – Logistics Operations HelpDesk System

LogiDesk is a modern web-based HelpDesk application designed for logistics operations. It centralizes shipment-related support requests so customers can report and track issues, support agents can investigate and resolve them, operations managers can dispatch and monitor workloads, and administrators can oversee system access.

---

## Technology Stack

- **Backend**: ASP.NET Core Web API (.NET 10 / .NET 11)
  - **Data Access & ORM**: Entity Framework Core with SQLite
  - **Authentication**: JWT (JSON Web Tokens) with ASP.NET Core Authentication/Authorization
  - **Password Security**: Cryptographically salted password hashing (PBKDF2)
  - **API Documentation**: Swagger / OpenAPI
  - **Testing**: xUnit Automated Test Suite
- **Frontend**: Angular SPA (Standalone components, reactive signals, TypeScript)
  - **Routing & Security**: Functional Route Guards (`authGuard`, `adminGuard`)
  - **HTTP**: HttpClient with JWT Bearer Interceptor
  - **Design**: Modern, responsive, clean CSS layout with accessibility in mind

---

## Project Structure

```text
LogiDesk/
├── .github/
│   └── PULL_REQUEST_TEMPLATE.md         # Team Pull Request standard template
├── docs/
│   ├── ARCHITECTURE.md                  # High-level architecture and component diagrams
│   ├── GIT_WORKFLOW.md                  # Branch naming, commit conventions & PR guidelines
│   └── API_SPECIFICATION.md             # REST API endpoints, schemas and contracts
├── src/
│   ├── backend/
│   │   ├── LogiDesk.sln                 # .NET Visual Studio Solution
│   │   ├── LogiDesk.Domain/             # Entities, Enums, Domain Interfaces
│   │   ├── LogiDesk.Application/        # DTOs, Service Interfaces, Business Logic
│   │   ├── LogiDesk.Infrastructure/     # EF Core DbContext, Repositories, JWT, Hashing
│   │   ├── LogiDesk.Api/                # Web API Controllers, Middlewares, Configuration
│   │   └── LogiDesk.Tests/              # Automated Unit & Integration Tests (xUnit)
│   └── frontend/
│       ├── package.json                 # Angular dependencies and npm scripts
│       └── src/app/                     # Standalone components, services, guards, pages
├── LogiDesk_Initial_Project_Documentation_v0.1.docx
├── LogiDesk_Initial_Product_Backlog.xlsx
├── .gitignore                           # Excludes build artifacts, secrets & locks
└── README.md
```

---

## Getting Started

### Prerequisites
- [.NET SDK](https://dotnet.microsoft.com/download) (v10.0 or v11.0)
- [Node.js](https://nodejs.org/) (v20+ or v24+) & npm
- Git

### 1. Backend Setup & Run (.NET API)

```bash
cd src/backend/LogiDesk.Api
dotnet run
```
- API Base URL: `http://localhost:5000`
- OpenAPI document: `http://localhost:5000/openapi/v1.json`

### 2. Run Backend Automated Tests

```bash
cd src/backend
dotnet test
```

### 3. Frontend Setup & Run (Angular)

```bash
cd src/frontend
npm install
npm start
```
- Web Application URL: `http://localhost:4200` (the frontend calls the API at `http://localhost:5000`)

---

## Pre-seeded Demo Accounts

For testing authentication, permissions and role-based workflows, the database is pre-seeded with demo accounts:

| Role | Email | Password |
|---|---|---|
| **Administrator** | `admin@logidesk.com` | `Admin@123` |
| **Operations Manager** | `manager@logidesk.com` | `Manager@123` |
| **Support Agent** | `agent@logidesk.com` | `Agent@123` |
| **Customer** | `customer@logidesk.com` | `Customer@123` |

---

## Git Workflow & Engineering Guidelines
For branching conventions (`feature/LD-XX-...`), commit message formats (`feat(scope): [LD-XX] message`), and PR review checklists, consult [docs/GIT_WORKFLOW.md](docs/GIT_WORKFLOW.md).
