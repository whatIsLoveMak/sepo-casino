export const CASINO_ABI = [
  {
    type: 'constructor',
    inputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'deposit',
    inputs: [],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'roll',
    inputs: [
      { name: 'prediction', type: 'uint256' },
      { name: 'betAmount', type: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'withdraw',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'playerBalance',
    inputs: [{ name: 'player', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'casinoBalance',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getOdds',
    inputs: [{ name: 'prediction', type: 'uint256' }],
    outputs: [
      { name: 'winChancePct', type: 'uint256' },
      { name: 'payoutX100', type: 'uint256' },
    ],
    stateMutability: 'pure',
  },
  {
    type: 'event',
    name: 'RollResult',
    inputs: [
      { name: 'player', type: 'address', indexed: true },
      { name: 'betAmount', type: 'uint256', indexed: false },
      { name: 'prediction', type: 'uint256', indexed: false },
      { name: 'result', type: 'uint256', indexed: false },
      { name: 'won', type: 'bool', indexed: false },
      { name: 'payout', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'Deposited',
    inputs: [
      { name: 'player', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'Withdrawn',
    inputs: [
      { name: 'player', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
    ],
  },
] as const

// Will be set after deployment
export const CASINO_ADDRESS = (import.meta.env.VITE_CASINO_ADDRESS ?? '0x0000000000000000000000000000000000000000') as `0x${string}`
