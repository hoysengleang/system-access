# System-Access Project Tracker

## Project Identity
- Package: `system-access`
- Current repo package folder: `systemAccess/`
- Working mode: documentation-first project tracking

## Main Goal (Auth MVP)
Build authentication core for first release:
- register works
- login works
- bearer token works
- protected endpoint works
- tests pass
- package installs locally

## Backlog (EPIC-1)

### Story 1: Prepare package foundation
| ID | Task | Priority | Status |
|---|---|---|---|
| TASK-1 | Create package skeleton | Highest | Done |
| TASK-2 | Configure project packaging | Highest | In progress |

### Story 2: Build user authentication model
| ID | Task | Priority | Status |
|---|---|---|---|
| TASK-3 | Create user model | Highest | Todo |
| TASK-4 | Create auth schemas | High | Todo |

### Story 3: Password security
| ID | Task | Priority | Status |
|---|---|---|---|
| TASK-5 | Implement password hashing service | Highest | Todo |

### Story 4: JWT authentication
| ID | Task | Priority | Status |
|---|---|---|---|
| TASK-6 | Implement JWT token creation | Highest | Todo |
| TASK-7 | Implement JWT token verification | Highest | Todo |

### Story 5: Auth service layer
| ID | Task | Priority | Status |
|---|---|---|---|
| TASK-8 | Implement register service | Highest | Todo |
| TASK-9 | Implement login service | Highest | Todo |

### Story 6: FastAPI auth endpoints
| ID | Task | Priority | Status |
|---|---|---|---|
| TASK-10 | Create register endpoint | Highest | Todo |
| TASK-11 | Create login endpoint | Highest | Todo |

### Story 7: Current user dependency
| ID | Task | Priority | Status |
|---|---|---|---|
| TASK-12 | Implement current user dependency | Highest | Todo |
| TASK-13 | Create protected test endpoint | High | Todo |

### Story 8: Testing
| ID | Task | Priority | Status |
|---|---|---|---|
| TASK-14 | Add authentication unit tests | Highest | Todo |
| TASK-15 | Add authentication API tests | Highest | Todo |

### Story 9: Documentation
| ID | Task | Priority | Status |
|---|---|---|---|
| TASK-16 | Write quickstart for authentication | Medium | Todo |

## Recommended Ready Order
1. TASK-1
2. TASK-2
3. TASK-3
4. TASK-5
5. TASK-6
6. TASK-7
7. TASK-8
8. TASK-9
9. TASK-10
10. TASK-11
11. TASK-12
12. TASK-14
13. TASK-15
14. TASK-16

## Current Focus
- Complete TASK-2 fully for `system-access`:
  - confirm package metadata
  - confirm dependencies list
  - confirm local `pip install` path in one chosen venv

## Daily Update Template
- Date:
- Goal:
- Done:
- Blocker:
- Next:
