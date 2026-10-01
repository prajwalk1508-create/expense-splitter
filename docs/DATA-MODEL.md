# Expense Splitter — Data Model

## 1. Entities

For v1 (no login), the app has **2 entities**:

1. **Group** — a collection of people sharing expenses
2. **Expense** — a single payment made by one member for the group

**Why only 2?**
- No `User` entity because v1 has no login (see PRD "Out of Scope")
- No `Balance` entity — balances are computed from expenses, not stored
- No `Settlement` entity — settlements are also computed
- `Collection` is a MongoDB concept, not a data entity

## 2. Fields — Group

| Field | Type | Required | Notes |
|---|---|---|---|
| `_id` | ObjectId | auto | Primary key (MongoDB generates) |
| `name` | String | yes | e.g., "Goa Trip 2025" |
| `members` | Array of String | yes | e.g., `["You", "Raj", "Sara"]` |
| `createdAt` | Date | auto | When the group was created |
| `updatedAt` | Date | auto | Last modified (via Mongoose timestamps) |

**Why members are strings, not objects, in v1:**
- No login = no user IDs to reference
- Simplest representation for v1
- Trade-off: two members can't have the same name. Acceptable for v1.

## 3. Fields — Expense

| Field | Type | Required | Notes |
|---|---|---|---|
| `_id` | ObjectId | auto | Primary key |
| `groupId` | ObjectId | yes | Ref → Group |
| `paidBy` | String | yes | Member name who paid |
| `amount` | Number | yes | Stored in **paise** (integer), min: 0 |
| `description` | String | yes | e.g., "Dinner", "Hotel" |
| `splitAmong` | Array of String | yes | Member names who share this expense |
| `createdAt` | Date | auto | When the expense was added |
| `updatedAt` | Date | auto | Last modified |

**Why `groupId` is ObjectId, not String:**
- MongoDB's `_id` is an ObjectId
- Mongoose uses `ref` to enable `.populate()` later

**Why amount is in paise (integer):**
- Avoids floating-point precision bugs
- `₹2000.50` → stored as `200050`
- Display divides by 100

## 4. Relationships

- **Group → Expense:** One-to-Many
  - One group has many expenses
  - An expense belongs to exactly one group
  - Linked via `Expense.groupId`

- **Member (string) → Expense:** Logical, not enforced
  - A member's `paidBy` and `splitAmong` reference names within the group
  - Not enforced by MongoDB — validated in backend logic

**Deletion rules (to implement in backend):**
- Delete group → delete all its expenses (cascade delete)
- Cannot delete a member if they have expenses (or allow and keep history)

## 5. Design Decisions

### Decision A: Members stored as **Array of Strings** (names)
**Why:** No login in v1, so no user IDs exist. Simplest model.
**Trade-off:** Two members can't share a name. If they do, we prefix — but that's a future problem.

### Decision B: `splitAmong` stored explicitly
**Why:** Not every expense splits among everyone. "You paid ₹500 for only you and Raj" must be possible.
**Default behavior:** When the expense form is opened, pre-check all members. Backend accepts whatever array is sent.

### Decision C: Balances are **computed**, never stored
**Why:** Single source of truth. If we stored balances and later edited an expense, we'd have to sync two places. Compute on the fly from expenses.
**Where computed:** In the **frontend** (pure JS function) after fetching expenses. No backend endpoint needed.

### Decision D: Amounts stored as **integer paise**
**Why:** Floating-point arithmetic causes bugs:
- `2000 / 3 = 666.6666666...` in float
- Three shares can add up to `1999.9999...` instead of `2000`
**Solution:** Store as paise (`200000` instead of `2000`), integer math only.
**Rounding rule:** When splitting unevenly, the **payer** absorbs the extra paisa.
Example: ₹2000 split 3 ways = ₹666.67 + ₹666.67 + ₹666.66 (payer gets the .66).

## 6. Example Documents

### Group document (in `groups` collection)
```json
{
  "_id": "65a1b2c3d4e5f6a7b8c9d0e1",
  "name": "Goa Trip 2025",
  "members": ["You", "Raj", "Sara"],
  "createdAt": "2025-01-15T10:30:00.000Z",
  "updatedAt": "2025-01-15T10:30:00.000Z"
}