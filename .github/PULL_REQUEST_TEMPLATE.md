## Description
<!-- Provide a clear summary of the changes made and the motivation behind them. -->

## Backlog Reference
- **Story / Task ID**: [e.g. LD-01, LD-02, LD-T01]
- **Epic**: [e.g. EPIC-01 Project foundation, EPIC-02 Authentication and user access]

## Type of Change
- [ ] `feat`: New feature (non-breaking change adding functionality)
- [ ] `fix`: Bug fix
- [ ] `docs`: Documentation updates
- [ ] `refactor`: Code restructure without functional changes
- [ ] `test`: Adding or updating automated tests
- [ ] `chore`: Tooling, build system, or dependencies update

## Acceptance Criteria Checklist
<!-- List the acceptance criteria from the story and verify them. -->
- [ ] Criteria 1 verified
- [ ] Criteria 2 verified
- [ ] Role-based authorization checked (if applicable)

## Verification & Testing
<!-- Describe the manual or automated tests conducted to verify the changes. -->
- [ ] Backend tests passing (`dotnet test`)
- [ ] Frontend builds cleanly (`npm run build`)
- [ ] Swagger / API tested manually
- [ ] UI tested on responsive viewport

## Reviewer Checklist
- [ ] Code follows project architecture and separation of concerns
- [ ] Passwords and secrets are properly protected
- [ ] Error messages are safe and descriptive without leaking internal stack traces
