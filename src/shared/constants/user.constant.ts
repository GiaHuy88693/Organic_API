export const ViolationType = {
  SPAM: 'SPAM',
  CHEAT: 'CHEAT',
  POLICY_VIOLATION: 'POLICY_VIOLATION'
} as const

export const ActionTaken = {
  WARNING: 'WARNING',
  LOCK: 'LOCK',
  BAN: 'BAN',
  UNLOCK: 'UNLOCK',
} as const