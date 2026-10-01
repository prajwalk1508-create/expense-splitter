# Expense Splitter — PRD

## 1. Problem Statement

Groups of friends struggle to track shared expenses and settle debts fairly. Manual math causes errors and awkward conversations.

## 2. Target Users

- **Roommates** — share rent, groceries, utilities monthly. Need ongoing tracking.
- **Travel groups** — friends on trips who split hotels, food, transport for a few days.
- **Couples** — track shared household expenses and split them evenly.

Focus for v1: **Travel groups** (smallest scope, clearest start & end).

## 3. User Stories

1. As a user, I want to create a group so I can track expenses with specific people.
2. As a user, I want to add an expense so the group knows who paid.
3. As a user, I want to see each person's balance so I know who owes what.
4. As a user, I want to see the minimum transactions to settle up so we don't do 10 payments.
5. As a user, I want to delete an expense in case I made a mistake.
6. As a user, I want to see the list of all expenses in a group so I can verify the records.

## 4. Out of Scope (v1)

- ❌ User accounts / login (no authentication)
- ❌ Real payments (no Stripe/UPI integration)
- ❌ Multiple currencies (INR only)
- ❌ Recurring expenses
- ❌ Edit expense (only delete + re-add)
- ❌ Mobile app (web only)
- ❌ Email/notifications
- ❌ Receipt uploads
- ❌ Charts and analytics
- ❌ Sharing groups via link

## 5. Success Metrics

- A group of 3 can create a group, add 3 expenses, and see settlement in under 5 minutes.
- Balances always match manual calculation (no rounding errors).
- App loads in under 2 seconds.
- Works on mobile browser without breaking.

## 6. Constraints

- **Time:** 8-10 hours per week
- **Skill:** Beginner with MERN — learning as I build
- **Budget:** Free tier only (Vercel, Render, MongoDB Atlas)
- **Platform:** Web only, mobile-friendly
- **Team:** Solo developer
- **Deadline:** 4 weeks to a working deployed version