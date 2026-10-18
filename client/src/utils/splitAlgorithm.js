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

/**
 * Simplify debts into the minimum number of transactions.
 * Takes an array of { name, balance }.
 * Returns an array of { from, to, amount } in paise.
 */
export function simplifyDebts(balances) {
  // Separate into creditors (positive) and debtors (negative)
  const creditors = [];
  const debtors = [];

  for (const { name, balance } of balances) {
    if (balance > 0) {
      creditors.push({ name, amount: balance });
    } else if (balance < 0) {
      debtors.push({ name, amount: -balance }); // store as positive
    }
  }

  // Sort descending by amount
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const transactions = [];
  let i = 0; // debtor index
  let j = 0; // creditor index

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const amount = Math.min(debtor.amount, creditor.amount);

    if (amount > 0) {
      transactions.push({
        from: debtor.name,
        to: creditor.name,
        amount,
      });
    }

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount === 0) i++;
    if (creditor.amount === 0) j++;
  }

  return transactions;
}