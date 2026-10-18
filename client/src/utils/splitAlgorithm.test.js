import { describe, it, expect } from 'vitest';
import { calculateBalances } from './splitAlgorithm.js';

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
        amount: 300000, // ₹3000
        splitAmong: ['Alice', 'Bob', 'Charlie'],
      },
    ];

    const result = calculateBalances(expenses, members);

    // Alice paid 3000, her share is 1000 → +2000
    // Bob owes 1000 → -1000
    // Charlie owes 1000 → -1000
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

    // Verified earlier:
    // Alice: -83334
    // Bob: +216666
    // Charlie: -133332
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

    // 100 / 3 → share=33, remainder=1
    // Alice: +100 - 34 = +66
    // Bob: -33
    // Charlie: -33
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

    // Alice paid 500 for herself → net 0
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