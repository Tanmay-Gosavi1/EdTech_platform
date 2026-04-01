# White-Box Testing Report (Backend)

## Project
Educaso - Node/Express backend

## Date
2026-04-01

## Objective
Perform white-box testing by validating internal decision paths, branches, and error handling in backend modules.

## Scope
- `middlewares/authMiddleware.js`
- `controllers/loginController.js`

## Test Strategy (White-Box)
Tests were designed from code structure (if/else and try/catch paths), not only API behavior. Each important decision branch was mapped to at least one test.

## Tooling
- Framework: Jest
- Command: `npm run test:coverage`
- Environment: Node.js

## Test Cases Implemented

### authMiddleware / protectEducator
1. Missing Authorization header -> 401
2. Header without Bearer prefix -> 401
3. Empty Bearer token -> 401
4. Valid JWT -> sets `req.userId` and calls `next()`
5. Invalid JWT (verify throws) -> 401
6. Educator user not found -> 404
7. Non-educator role -> 403
8. Valid educator role -> calls `next()`
9. DB failure in role check -> 500

### loginController
1. Missing email/password -> 400
2. Invalid email format -> 400
3. User not found -> 400
4. Incorrect password -> 400
5. Valid credentials -> 200 with token and user payload
6. Unexpected login exception -> 500
7. Signup missing required fields -> 400
8. userInfo without `req.userId` -> 401

## Coverage Results
From latest run:

- Test Suites: 2 passed / 2 total
- Tests: 17 passed / 17 total

| File | Statements | Branches | Functions | Lines |
|---|---:|---:|---:|---:|
| middlewares/authMiddleware.js | 100% | 100% | 100% | 100% |
| controllers/loginController.js | 63.79% | 51.72% | 100% | 64.28% |
| Overall (selected files) | 74.69% | 64.10% | 100% | 75.30% |

## Evidence Files
- Tests: `tests/middlewares/authMiddleware.test.js`
- Tests: `tests/controllers/loginController.test.js`
- Config/scripts: `package.json`

## Interpretation
- Middleware logic reached full white-box coverage for statements and branches.
- Controller logic has strong path coverage for login validation and critical failures.
- Remaining uncovered lines are mostly in other branches of signup/userInfo not yet fully exercised.

## Conclusion
White-box testing was successfully applied with branch-focused unit tests and measurable coverage. The backend now includes reproducible tests and coverage metrics suitable for academic demonstration.
