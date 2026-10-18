/**
 * Calculate net balances for each member.
 * Positive = gets back money (creditor)
 * Negative = owes money (debtor)
 * All amounts in paise (integer).
 */
export function calculateBalances(expenses, members) {
  // Initialize all balances to 0
  const balances = {};
  members.forEach((m) => {
    balances[m] = 0;
  });

  for (const exp of expenses) {
    const splitCount = exp.splitAmong.length;
    if (splitCount === 0) continue;

    // Each person's share (integer paise)
    const share = Math.floor(exp.amount / splitCount);
    // Remainder to distribute (to avoid losing paise to rounding)
    const remainder = exp.amount % splitCount;

    // The payer gets credited the full amount
    balances[exp.paidBy] = (balances[exp.paidBy] || 0) + exp.amount;

    // Each person in splitAmong owes their share
    exp.splitAmong.forEach((person, index) => {
      // First `remainder` people pay 1 extra paisa
      const extra = index < remainder ? 1 : 0;
      balances[person] = (balances[person] || 0) - (share + extra);
    });
  }

  // Convert to array for easy use
  return members.map((name) => ({
    name,
    balance: balances[name],
  }));
}