# Expense Splitter — API Contract

**Base URL (dev):** `http://localhost:5000/api`
**Base URL (prod):** `https://your-render-app.onrender.com/api`

**All requests and responses are JSON.**
**Content-Type header:** `application/json`

---

## Overview

| # | Method | Path | Purpose |
|---|---|---|---|
| 1 | POST | `/groups` | Create a group |
| 2 | GET | `/groups` | List all groups |
| 3 | GET | `/groups/:id` | Get one group |
| 4 | DELETE | `/groups/:id` | Delete a group (cascade) |
| 5 | POST | `/expenses` | Add an expense |
| 6 | GET | `/groups/:id/expenses` | List expenses of a group |
| 7 | DELETE | `/expenses/:id` | Delete an expense |

**Balances and settlements are computed on the frontend — no endpoints needed.**

---

## Common Response Shapes

### Error response (all errors follow this shape)
```json
{
  "error": "Human-readable error message"
}
```

### Status codes used
| Code | Meaning |
|---|---|
| 200 | OK — successful GET / DELETE |
| 201 | Created — successful POST |
| 400 | Bad Request — validation failed |
| 404 | Not Found — resource doesn't exist |
| 500 | Server Error — unexpected crash |

---

## 1. Create a Group

- **Method:** `POST`
- **Path:** `/groups`
- **Description:** Creates a new group with a name and list of members.

### Request body
```json
{
  "name": "Goa Trip 2025",
  "members": ["You", "Raj", "Sara"]
}
```

### Validation rules
- `name` — required, non-empty string, max 100 chars
- `members` — required array, min 2 items, each a non-empty string, max 50 items
- Member names must be unique within the group
- `name` must be trimmed of whitespace

### Response — 201 Created
```json
{
  "_id": "65a1b2c3d4e5f6a7b8c9d0e1",
  "name": "Goa Trip 2025",
  "members": ["You", "Raj", "Sara"],
  "createdAt": "2025-01-15T10:30:00.000Z",
  "updatedAt": "2025-01-15T10:30:00.000Z"
}
```

### Errors
| Code | When | Body |
|---|---|---|
| 400 | Missing name | `{ "error": "Group name is required" }` |
| 400 | Missing members | `{ "error": "At least 2 members are required" }` |
| 400 | Duplicate members | `{ "error": "Member names must be unique" }` |
| 500 | Server error | `{ "error": "Internal server error" }` |

---

## 2. List All Groups

- **Method:** `GET`
- **Path:** `/groups`
- **Description:** Returns all groups.

### Request body
None.

### Response — 200 OK
```json
[
  {
    "_id": "65a1b2c3d4e5f6a7b8c9d0e1",
    "name": "Goa Trip 2025",
    "members": ["You", "Raj", "Sara"],
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  }
]
```

### Notes
- Returns an empty array `[]` if no groups exist
- Sorted by `createdAt` descending (newest first)

---

## 3. Get One Group

- **Method:** `GET`
- **Path:** `/groups/:id`
- **Description:** Returns a single group by its ID.

### URL params
- `id` — the group's ObjectId

### Response — 200 OK
```json
{
  "_id": "65a1b2c3d4e5f6a7b8c9d0e1",
  "name": "Goa Trip 2025",
  "members": ["You", "Raj", "Sara"],
  "createdAt": "2025-01-15T10:30:00.000Z",
  "updatedAt": "2025-01-15T10:30:00.000Z"
}
```

### Errors
| Code | When | Body |
|---|---|---|
| 400 | Invalid ObjectId format | `{ "error": "Invalid group ID" }` |
| 404 | Group not found | `{ "error": "Group not found" }` |

---

## 4. Delete a Group

- **Method:** `DELETE`
- **Path:** `/groups/:id`
- **Description:** Deletes the group AND all its expenses (cascade delete).

### URL params
- `id` — the group's ObjectId

### Response — 200 OK
```json
{
  "message": "Group and its expenses deleted",
  "deletedExpenses": 3
}
```

### Errors
| Code | When | Body |
|---|---|---|
| 400 | Invalid ObjectId | `{ "error": "Invalid group ID" }` |
| 404 | Group not found | `{ "error": "Group not found" }` |

### Implementation note
Two operations:
1. `Expense.deleteMany({ groupId: id })`
2. `Group.findByIdAndDelete(id)`

---

## 5. Add an Expense

- **Method:** `POST`
- **Path:** `/expenses`
- **Description:** Adds an expense to a group.

### Request body
```json
{
  "groupId": "65a1b2c3d4e5f6a7b8c9d0e1",
  "paidBy": "You",
  "amount": 200000,
  "description": "Dinner",
  "splitAmong": ["You", "Raj", "Sara"]
}
```

### Validation rules
- `groupId` — required, valid ObjectId, must exist in DB
- `paidBy` — required string, must be in the group's members
- `amount` — required integer, > 0, in paise (₹1 = 100 paise)
- `description` — required, non-empty, max 200 chars
- `splitAmong` — required array, min 1 item, each must be a group member
- `splitAmong` must not contain duplicates

### Response — 201 Created
```json
{
  "_id": "85c3d4e5f6a7b8c9d0e1f2a3",
  "groupId": "65a1b2c3d4e5f6a7b8c9d0e1",
  "paidBy": "You",
  "amount": 200000,
  "description": "Dinner",
  "splitAmong": ["You", "Raj", "Sara"],
  "createdAt": "2025-01-15T11:00:00.000Z",
  "updatedAt": "2025-01-15T11:00:00.000Z"
}
```

### Errors
| Code | When | Body |
|---|---|---|
| 400 | Missing fields | `{ "error": "All fields are required" }` |
| 400 | amount <= 0 | `{ "error": "Amount must be greater than 0" }` |
| 400 | paidBy not a member | `{ "error": "Paid-by must be a group member" }` |
| 400 | splitAmong has non-member | `{ "error": "All split members must be in the group" }` |
| 404 | Group not found | `{ "error": "Group not found" }` |

---

## 6. List Expenses for a Group

- **Method:** `GET`
- **Path:** `/groups/:id/expenses`
- **Description:** Returns all expenses belonging to a group.

### URL params
- `id` — the group's ObjectId

### Response — 200 OK
```json
[
  {
    "_id": "85c3d4e5f6a7b8c9d0e1f2a3",
    "groupId": "65a1b2c3d4e5f6a7b8c9d0e1",
    "paidBy": "You",
    "amount": 200000,
    "description": "Dinner",
    "splitAmong": ["You", "Raj", "Sara"],
    "createdAt": "2025-01-15T11:00:00.000Z",
    "updatedAt": "2025-01-15T11:00:00.000Z"
  }
]
```

### Errors
| Code | When | Body |
|---|---|---|
| 400 | Invalid group ID | `{ "error": "Invalid group ID" }` |
| 404 | Group not found | `{ "error": "Group not found" }` |

### Notes
- Returns `[]` if group exists but has no expenses
- Sorted by `createdAt` ascending (oldest first)

---

## 7. Delete an Expense

- **Method:** `DELETE`
- **Path:** `/expenses/:id`
- **Description:** Deletes an expense by its ID.

### URL params
- `id` — the expense's ObjectId

### Response — 200 OK
```json
{
  "message": "Expense deleted"
}
```

### Errors
| Code | When | Body |
|---|---|---|
| 400 | Invalid ObjectId | `{ "error": "Invalid expense ID" }` |
| 404 | Expense not found | `{ "error": "Expense not found" }` |

---

## Computed Views (Frontend Only)

These are **NOT API endpoints.** They run in the browser after fetching expenses.

### Balances

**Input:** list of expenses + group members

**Output:**
```json
[
  { "name": "You",  "balance": -83334 },
  { "name": "Raj",  "balance":  216666 },
  { "name": "Sara", "balance": -133334 }
]
```

**All amounts in paise.** Positive = gets back, negative = owes.

### Settlements

**Input:** array of balances

**Output:**
```json
[
  { "from": "You",  "to": "Raj", "amount": 83334 },
  { "from": "Sara", "to": "Raj", "amount": 133334 }
]
```

**Algorithm:** Greedy — match the biggest debtor with the biggest creditor, transfer min of the two, repeat until all settled.

---

## Endpoints Deliberately Skipped (Out of Scope)

- ❌ `POST /auth/signup`
- ❌ `POST /auth/login`
- ❌ `PATCH /expenses/:id` (editing expenses)
- ❌ `POST /payments` (real payments)
- ❌ `GET /users/me`
- ❌ `POST /groups/:id/share`

**Reason:** PRD says out of scope for v1.

---

## Full Backend File Structure

```
server/
├── index.js                 ← entry, connects DB, mounts routes
├── models/
│   ├── Group.js
│   └── Expense.js
├── routes/
│   ├── groups.js            ← endpoints 1, 2, 3, 4
│   └── expenses.js          ← endpoints 5, 6, 7
├── controllers/
│   ├── groupController.js
│   └── expenseController.js
├── middleware/
│   └── errorHandler.js
└── .env
```

**Total endpoints: 7. Total files: ~9.**