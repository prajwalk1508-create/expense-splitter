import { simplifyDebts } from './splitAlgorithm.js';

const balances = [
  { name: 'Alice', balance: -83334 },
  { name: 'Bob', balance: 216666 },
  { name: 'Charlie', balance: -133332 },
];

console.log(simplifyDebts(balances));