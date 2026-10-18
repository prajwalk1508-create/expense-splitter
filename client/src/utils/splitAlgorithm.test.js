import { describe, it, expect } from 'vitest';
import { calculateBalances, simplifyDebts } from './splitAlgorithm.js';

describe('calculateBalances', () => {
  it('returns zero balances for no expenses', () => {
    const members = ['Alice', 'Bob'];
    const result = calculateBalances([], members);

    expect(result).toHaveLength(2);
    expect(result.find((b) => b.name === 'Alice').balance).toBe(0);
    expect(result.find((b) => b.name === 'Bob').balance).toBe(0);
  });

  it('handles one expense split equally (3 people)', () => {
    const members = ['Alice', 'Bob', 'Charlie'];
    const expenses = [
      {
        paidBy: 'Alice',
        amount: 300000,
        splitAmong: ['Alice', 'Bob', 'Charlie'],
      },
    ];

    const result = calculateBalances(expenses, members);

    expect(result.find((b) => b.name === 'Alice').balance).toBe(200000);
    expect(result.find((b) => b.name === 'Bob').balance).toBe(-100000);
    expect(result.find((b) => b.name === 'Charlie').balance).toBe(-100000);
  });

  it('handles multiple expenses', () => {
    const members = ['Alice', 'Bob', 'Charlie'];
    const expenses = [
      {
        paidBy: 'Alice',
        amount: 200000,
        splitAmong: ['Alice', 'Bob', 'Charlie'],
      },
      {
        paidBy: 'Bob',
        amount: 500000,
        splitAmong: ['Alice', 'Bob', 'Charlie'],
      },
      {
        paidBy: 'Charlie',
        amount: 150000,
        splitAmong: ['Alice', 'Bob', 'Charlie'],
      },
    ];

    const result = calculateBalances(expenses, members);

    expect(result.find((b) => b.name === 'Alice').balance).toBe(-83334);
    expect(result.find((b) => b.name === 'Bob').balance).toBe(216666);
    expect(result.find((b) => b.name === 'Charlie').balance).toBe(-133332);
  });

  it('handles uneven split with remainder distribution', () => {
    const members = ['Alice', 'Bob', 'Charlie'];
    const expenses = [
      {
        paidBy: 'Alice',
        amount: 100,
        splitAmong: ['Alice', 'Bob', 'Charlie'],
      },
    ];

    const result = calculateBalances(expenses, members);

    expect(result.find((b) => b.name === 'Alice').balance).toBe(66);
    expect(result.find((b) => b.name === 'Bob').balance).toBe(-33);
    expect(result.find((b) => b.name === 'Charlie').balance).toBe(-33);
  });

  it('handles single-member split', () => {
    const members = ['Alice', 'Bob'];
    const expenses = [
      {
        paidBy: 'Alice',
        amount: 50000,
        splitAmong: ['Alice'],
      },
    ];

    const result = calculateBalances(expenses, members);

    expect(result.find((b) => b.name === 'Alice').balance).toBe(0);
    expect(result.find((b) => b.name === 'Bob').balance).toBe(0);
  });

  it('balances always sum to zero', () => {
    const members = ['Alice', 'Bob', 'Charlie'];
    const expenses = [
      { paidBy: 'Alice', amount: 12345, splitAmong: ['Alice', 'Bob', 'Charlie'] },
      { paidBy: 'Bob', amount: 67890, splitAmong: ['Alice', 'Bob'] },
      { paidBy: 'Charlie', amount: 11111, splitAmong: ['Bob', 'Charlie'] },
    ];

    const result = calculateBalances(expenses, members);
    const sum = result.reduce((acc, b) => acc + b.balance, 0);

    expect(sum).toBe(0);
  });
});

describe('simplifyDebts', () => {
  it('returns empty array when no one owes anything', () => {
    const balances = [
      { name: 'Alice', balance: 0 },
      { name: 'Bob', balance: 0 },
    ];
    const result = simplifyDebts(balances);
    expect(result).toHaveLength(0);
  });

  it('handles one debtor and one creditor', () => {
    const balances = [
      { name: 'Alice', balance: -50000 },
      { name: 'Bob', balance: 50000 },
    ];
    const result = simplifyDebts(balances);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      from: 'Alice',
      to: 'Bob',
      amount: 50000,
    });
  });

  it('handles multiple debtors, one creditor', () => {
    const balances = [
      { name: 'Alice', balance: -30000 },
      { name: 'Charlie', balance: -20000 },
      { name: 'Bob', balance: 50000 },
    ];
    const result = simplifyDebts(balances);

    expect(result).toHaveLength(2);
    const toBob = result.filter((t) => t.to === 'Bob');
    expect(toBob).toHaveLength(2);
    const total = toBob.reduce((sum, t) => sum + t.amount, 0);
    expect(total).toBe(50000);
  });

  it('handles multiple debtors, multiple creditors', () => {
    const balances = [
      { name: 'Alice', balance: -80000 },
      { name: 'Charlie', balance: -120000 },
      { name: 'Bob', balance: 150000 },
      { name: 'Diana', balance: 50000 },
    ];
    const result = simplifyDebts(balances);

    result.forEach((t) => {
      expect(t.amount).toBeGreaterThan(0);
      expect(t.from).not.toBe(t.to);
    });

    const total = result.reduce((sum, t) => sum + t.amount, 0);
    expect(total).toBe(200000);
  });

  it('produces minimum transactions for the full example', () => {
    const balances = [
      { name: 'Alice', balance: -83334 },
      { name: 'Bob', balance: 216666 },
      { name: 'Charlie', balance: -133332 },
    ];
    const result = simplifyDebts(balances);

    expect(result).toHaveLength(2);
    expect(result[0].from).toBe('Charlie');
    expect(result[0].to).toBe('Bob');
    expect(result[0].amount).toBe(133332);

    expect(result[1].from).toBe('Alice');
    expect(result[1].to).toBe('Bob');
    expect(result[1].amount).toBe(83334);
  });

  it('settles exactly when debtor and creditor match', () => {
    const balances = [
      { name: 'Alice', balance: -100 },
      { name: 'Bob', balance: 100 },
    ];
    const result = simplifyDebts(balances);

    expect(result).toHaveLength(1);
    expect(result[0].amount).toBe(100);
    expect(result[0].from).toBe('Alice');
    expect(result[0].to).toBe('Bob');
  });
});