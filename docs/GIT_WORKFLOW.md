# Team Git Workflow & Engineering Standards

This document establishes the official Git workflow, branch naming strategy, commit conventions, code review criteria, and pull request procedures for the **LogiDesk** engineering team.

---

## 1. Branch Strategy

We use a feature-branch workflow modeled on **Trunk-Based Development** with short-lived feature branches targeting `main`.

### Main Branches
- **`main`**: Production-ready / deployment branch. Always stable, passing all tests and CI checks. Direct commits to `main` are restricted.

### Working Branches
All feature and maintenance work must take place on dedicated branches cut from `main`.

| Branch Type | Format | Example | Description |
|---|---|---|---|
| Feature | `feature/LD-<ID>-<short-description>` | `feature/LD-01-customer-registration` | New user-facing story or technical capability |
| Task | `task/LD-<ID>-<short-description>` | `task/LD-T01-project-structure` | Foundational or infrastructural tasks |
| Bugfix | `bugfix/LD-<ID>-<short-description>` | `bugfix/LD-22-fix-jwt-expiry` | Resolves a defect in development/QA |
| Hotfix | `hotfix/<short-description>` | `hotfix/cors-origin-fix` | Critical production patch |
| Refactor / Chore | `chore/<short-description>` | `chore/update-nuget-dependencies` | Tooling, dependency updates, cleanup |

---

## 2. Commit Message Conventions

We follow the **Conventional Commits** specification with associated Backlog Story IDs.

### Format
```text
<type>(<scope>): [<Story-ID>] <short summary in imperative mood>

[optional detailed description]

[optional issue reference / footer]
```

### Commit Types
- `feat`: A new feature for the application (e.g., `feat(auth): [LD-01] add customer registration endpoint`)
- `fix`: A bug fix (e.g., `fix(auth): [LD-02] return 401 on incorrect password`)
- `docs`: Documentation changes only (e.g., `docs(readme): update stack decision and setup instructions`)
- `style`: Changes that do not affect the meaning of code (formatting, white-space, semicolon)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to build process, tooling, or dependencies

### Examples
- `feat(auth): [LD-01] implement password hashing and customer registration`
- `feat(api): [LD-02] generate signed JWT token with role claims on login`
- `test(auth): [LD-01] add unit tests for duplicate email validation`
- `chore(repo): [LD-T01] configure gitignore and dotnet-angular folder structure`

---

## 3. Pull Request (PR) Process

1. **Keep PRs Small & Focused**: Each PR should map to a single story or task (e.g., LD-T01, LD-01, LD-02).
2. **Branch Synchronization**: Regularly rebase or merge `main` into your feature branch before submitting.
3. **Automated Verification**:
   - Backend builds cleanly (`dotnet build`)
   - Backend unit/integration tests pass (`dotnet test`)
   - Frontend compiles without type errors (`npm run build`)
4. **Pull Request Description**: Use the standard PR template (`.github/PULL_REQUEST_TEMPLATE.md`), linking the backlog Story ID and listing testing evidence.
5. **Code Review**:
   - Minimum 1 peer review approval required.
   - Reviewers check adherence to clean architecture, role authorization checks, input validation, and security guidelines.
6. **Merge Strategy**: Use **Squash and Merge** or **Rebase and Merge** to keep the commit history on `main` clean and linear.

---

## 4. Definition of Done (DoD)

A backlog item is considered **Done** only when:
- [ ] Code meets all Acceptance Criteria specified in the backlog.
- [ ] Automated tests cover new logic and pass reliably.
- [ ] Code adheres to clean architecture, typing, and naming conventions.
- [ ] No hardcoded secrets or environment-specific connection strings are committed.
- [ ] PR is reviewed, approved, and merged into `main`.
- [ ] Backlog item status is updated to `Done`.
