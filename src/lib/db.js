const USERS_KEY = 'wsb_users_v2'
const SESSION_KEY = 'wsb_session_v2'
const TX_KEY = 'wsb_transactions_v2'
const TRANSFERS_KEY = 'wsb_transfers_v2'

const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

const write = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value))
}

const uid = () =>
  globalThis.crypto?.randomUUID?.() ||
  `id-${Date.now()}-${Math.random().toString(16).slice(2)}`

const accountNumber = () => {
  const first = Math.floor(1 + Math.random() * 9)
  const rest = Math.floor(Math.random() * 1_000_000_000)
    .toString()
    .padStart(9, '0')
  return `${first}${rest}`
}

const iso = (daysAgo = 0, hour = 12, minute = 0) => {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

const emit = () => {
  window.dispatchEvent(new Event('wsb:change'))
}

export const subscribe = (fn) => {
  window.addEventListener('wsb:change', fn)
  return () => window.removeEventListener('wsb:change', fn)
}

const makeAccounts = (checking = 0, savings = 0) => [
  {
    id: uid(),
    type: 'Checking',
    number: accountNumber(),
    balance: Number(checking) || 0,
    available: Number(checking) || 0,
  },
  {
    id: uid(),
    type: 'Savings',
    number: accountNumber(),
    balance: Number(savings) || 0,
    available: Number(savings) || 0,
  },
]

const makeCards = (holder) => [
  {
    id: uid(),
    brand: 'VISA',
    kind: 'Debit',
    last4: '4242',
    holder,
    expiry: '12/29',
    status: 'active',
    limit: null,
  },
  {
    id: uid(),
    brand: 'VISA',
    kind: 'Credit',
    last4: '8810',
    holder,
    expiry: '08/28',
    status: 'active',
    limit: 5000,
  },
]

const makeUser = (overrides) => ({
  uid: uid(),
  role: 'pending',
  status: 'pending',
  createdAt: new Date().toISOString(),
  transfersUsed: 0,
  twoFactor: false,
  personalInfo: {},
  contact: {},
  documents: {},
  accounts: [],
  cards: [],
  ...overrides,
})

const seedTransactions = (memberUid) => {
  const rows = [
    ['credit', 'Direct deposit — Northwind Studio', 3200, 1, 'Checking', 'income'],
    ['debit', 'Whole Foods Market', 86.42, 2, 'Checking', 'expense'],
    ['debit', 'Netflix subscription', 22.99, 3, 'Checking', 'expense'],
    ['debit', 'Shell fuel station', 54.1, 4, 'Checking', 'expense'],
    ['credit', 'Transfer from Savings', 500, 5, 'Checking', 'income'],
    ['debit', 'Blue Bottle Coffee', 6.75, 6, 'Checking', 'expense'],
    ['debit', 'City Power & Light', 118.33, 7, 'Checking', 'expense'],
    ['debit', 'Amazon.com purchase', 42.17, 9, 'Checking', 'expense'],
    ['credit', 'Interest payment', 18.44, 10, 'Savings', 'income'],
    ['debit', 'Delta Air Lines', 312.6, 12, 'Checking', 'expense'],
    ['debit', 'Trader Joe’s', 73.18, 14, 'Checking', 'expense'],
    ['credit', 'Venmo from Alex', 65, 16, 'Checking', 'income'],
    ['debit', 'Gym membership', 39.99, 18, 'Checking', 'expense'],
    ['debit', 'Internet service', 69.99, 21, 'Checking', 'expense'],
    ['credit', 'Tax refund', 840, 24, 'Checking', 'income'],
    ['debit', 'Target', 128.4, 27, 'Checking', 'expense'],
  ]
  return rows.map(([type, description, amount, days, accountType, category], i) => ({
    id: `seed-tx-${i + 1}`,
    userId: memberUid,
    accountType,
    type,
    amount,
    description,
    category,
    status: 'completed',
    date: iso(days, 9 + (i % 8), (i * 7) % 60),
  }))
}

export function ensureSeed() {
  const existing = read(USERS_KEY, null)
  if (existing && existing.length) return

  const admin = makeUser({
    email: 'admin@wsbdigital.com',
    password: 'Admin123!',
    name: 'Avery Stone',
    role: 'admin',
    status: 'active',
    createdAt: iso(400, 10),
    personalInfo: {
      firstName: 'Avery',
      lastName: 'Stone',
      dob: '1985-04-12',
      nationality: 'United States',
      maritalStatus: 'Married',
      address: {
        street: '10 Market Street',
        city: 'Boston',
        state: 'MA',
        country: 'United States',
        postalCode: '02108',
      },
    },
    contact: { phone: '(617) 555-0100', altEmail: '', emergency: {} },
    accounts: makeAccounts(24500, 60000),
    cards: makeCards('Avery Stone'),
    twoFactor: true,
    transfersUsed: 3,
  })

  const member = makeUser({
    email: 'member@wsbdigital.com',
    password: 'Member123!',
    name: 'Jordan Blake',
    role: 'user',
    status: 'active',
    createdAt: iso(220, 11),
    transfersUsed: 2,
    personalInfo: {
      firstName: 'Jordan',
      lastName: 'Blake',
      dob: '1992-09-03',
      nationality: 'United States',
      maritalStatus: 'Single',
      address: {
        street: '48 Harbor Lane',
        city: 'Portland',
        state: 'ME',
        country: 'United States',
        postalCode: '04101',
      },
    },
    contact: {
      phone: '(207) 555-0148',
      altEmail: 'jordan.blake.backup@gmail.com',
      emergency: { name: 'Sam Blake', relationship: 'Sibling', phone: '(207) 555-0199' },
    },
    documents: { idType: 'Driver’s License', idNumber: 'ME-448-291', fileName: 'license.jpg' },
    accounts: makeAccounts(12480.55, 38200),
    cards: makeCards('Jordan Blake'),
  })

  const pending = makeUser({
    email: 'pending@wsbdigital.com',
    password: 'Pending123!',
    name: 'Riley Chen',
    role: 'pending',
    status: 'pending',
    createdAt: iso(2, 15),
    personalInfo: {
      firstName: 'Riley',
      lastName: 'Chen',
      dob: '1997-01-22',
      nationality: 'United States',
      maritalStatus: 'Single',
      address: {
        street: '220 Pine Street',
        city: 'Seattle',
        state: 'WA',
        country: 'United States',
        postalCode: '98101',
      },
    },
    contact: {
      phone: '(206) 555-0177',
      altEmail: '',
      emergency: { name: 'Morgan Chen', relationship: 'Parent', phone: '(206) 555-0188' },
    },
    documents: { idType: 'Passport', idNumber: 'P-8823910', fileName: 'passport.jpg' },
    accounts: makeAccounts(0, 0),
    cards: makeCards('Riley Chen'),
  })

  write(USERS_KEY, [admin, member, pending])
  write(TX_KEY, seedTransactions(member.uid))
  write(TRANSFERS_KEY, [])
}

export const getUsers = () => read(USERS_KEY, [])

export const getUser = (id) => getUsers().find((u) => u.uid === id) || null

export const findByEmail = (email) =>
  getUsers().find((u) => u.email.toLowerCase() === String(email).toLowerCase()) || null

export const getTransactions = (userId) =>
  read(TX_KEY, [])
    .filter((t) => t.userId === userId)
    .sort((a, b) => new Date(b.date) - new Date(a.date))

export const getTransfers = (userId) =>
  read(TRANSFERS_KEY, [])
    .filter((t) => t.userId === userId)
    .sort((a, b) => new Date(b.date) - new Date(a.date))

export const getSessionUid = () => localStorage.getItem(SESSION_KEY)

export const setSession = (id) => localStorage.setItem(SESSION_KEY, id)

export const clearSession = () => localStorage.removeItem(SESSION_KEY)

export function login(email, password) {
  const user = findByEmail(email)
  if (!user || user.password !== password) {
    throw new Error('Incorrect email or password.')
  }
  if (user.status === 'rejected') {
    throw new Error('This application was declined. Contact support for details.')
  }
  setSession(user.uid)
  emit()
  return user
}

export function signup(data) {
  if (findByEmail(data.email)) {
    throw new Error('An account with this email already exists.')
  }
  const name = [data.personalInfo?.firstName, data.personalInfo?.lastName]
    .filter(Boolean)
    .join(' ')
    .trim()
  const user = makeUser({
    email: data.email,
    password: data.password,
    name: name || data.email.split('@')[0],
    role: 'pending',
    status: 'pending',
    personalInfo: data.personalInfo || {},
    contact: data.contact || {},
    documents: data.documents || {},
    accounts: makeAccounts(0, 0),
    cards: makeCards(name || 'Member'),
  })
  const users = getUsers()
  users.push(user)
  write(USERS_KEY, users)
  emit()
  return user
}

export function logout() {
  clearSession()
  emit()
}

export function updateUser(id, patch) {
  const users = getUsers()
  const index = users.findIndex((u) => u.uid === id)
  if (index === -1) throw new Error('User not found.')
  users[index] = { ...users[index], ...patch }
  write(USERS_KEY, users)
  emit()
  return users[index]
}

export function approveUser(id) {
  return updateUser(id, { role: 'user', status: 'active' })
}

export function rejectUser(id) {
  return updateUser(id, { role: 'pending', status: 'rejected' })
}

export function createUserByAdmin({ email, password, name, checking = 0, savings = 0 }) {
  if (findByEmail(email)) throw new Error('An account with this email already exists.')
  const user = makeUser({
    email,
    password,
    name,
    role: 'user',
    status: 'active',
    createdAt: new Date().toISOString(),
    personalInfo: { firstName: name.split(' ')[0] || name, lastName: name.split(' ').slice(1).join(' ') },
    accounts: makeAccounts(checking, savings),
    cards: makeCards(name),
    invitation: true,
  })
  const users = getUsers()
  users.push(user)
  write(USERS_KEY, users)
  emit()
  return user
}

function requireAccount(user, type) {
  const account = (user.accounts || []).find((a) => a.type === type)
  if (!account) throw new Error(`No ${type} account found.`)
  return account
}

function addTransactionRow({ userId, accountType, type, amount, description, category }) {
  const txs = read(TX_KEY, [])
  const tx = {
    id: uid(),
    userId,
    accountType,
    type,
    amount: Number(amount),
    description,
    category: category || (type === 'credit' ? 'income' : 'expense'),
    status: 'completed',
    date: new Date().toISOString(),
  }
  txs.push(tx)
  write(TX_KEY, txs)
  return tx
}

function addTransferRow(row) {
  const transfers = read(TRANSFERS_KEY, [])
  const transfer = {
    id: uid(),
    status: 'completed',
    date: new Date().toISOString(),
    ...row,
  }
  transfers.push(transfer)
  write(TRANSFERS_KEY, transfers)
  return transfer
}

export function processTransfer({
  userId,
  channel,
  fromType,
  toType,
  recipient,
  amount,
  memo,
}) {
  const users = getUsers()
  const index = users.findIndex((u) => u.uid === userId)
  if (index === -1) throw new Error('User not found.')
  const user = users[index]
  const value = Number(amount)
  if (!value || value <= 0) throw new Error('Enter an amount greater than zero.')
  if (value > 25000) throw new Error('Transfers are capped at $25,000 per transaction.')

  const from = requireAccount(user, fromType)
  if (value > from.available) {
    throw new Error(`Insufficient funds in your ${fromType} account.`)
  }

  let target = null
  if (channel === 'Internal transfer') {
    if (fromType === toType) throw new Error('Choose two different accounts.')
    target = requireAccount(user, toType)
  }

  from.balance = Number((from.balance - value).toFixed(2))
  from.available = Number((from.available - value).toFixed(2))
  if (target) {
    target.balance = Number((target.balance + value).toFixed(2))
    target.available = Number((target.available + value).toFixed(2))
  }

  user.transfersUsed = (user.transfersUsed || 0) + 1
  write(USERS_KEY, users)

  const label = recipient || toType || 'recipient'
  addTransactionRow({
    userId,
    accountType: fromType,
    type: 'debit',
    amount: value,
    description: `${channel}: ${label}`,
    category: 'transfer',
  })

  if (target) {
    addTransactionRow({
      userId,
      accountType: toType,
      type: 'credit',
      amount: value,
      description: `${channel}: from ${fromType}`,
      category: 'transfer',
    })
  }

  addTransferRow({
    userId,
    channel,
    fromType,
    toType: toType || null,
    recipient: label,
    amount: value,
    memo: memo || '',
  })

  emit()
  return user
}

export function deposit({ userId, accountType, amount, description }) {
  const users = getUsers()
  const index = users.findIndex((u) => u.uid === userId)
  if (index === -1) throw new Error('User not found.')
  const user = users[index]
  const value = Number(amount)
  if (!value || value <= 0) throw new Error('Enter an amount greater than zero.')
  const account = requireAccount(user, accountType)
  account.balance = Number((account.balance + value).toFixed(2))
  account.available = Number((account.available + value).toFixed(2))
  write(USERS_KEY, users)
  addTransactionRow({
    userId,
    accountType,
    type: 'credit',
    amount: value,
    description: description || 'Mobile deposit',
    category: 'income',
  })
  emit()
  return user
}

export function addAdminTransaction({ userId, accountType, type, amount, description }) {
  const users = getUsers()
  const index = users.findIndex((u) => u.uid === userId)
  if (index === -1) throw new Error('User not found.')
  const user = users[index]
  const value = Number(amount)
  if (!value || value <= 0) throw new Error('Enter an amount greater than zero.')
  const account = requireAccount(user, accountType)
  const signed = type === 'credit' ? value : -value
  account.balance = Number((account.balance + signed).toFixed(2))
  account.available = Number((account.available + signed).toFixed(2))
  write(USERS_KEY, users)
  addTransactionRow({ userId, accountType, type, amount: value, description })
  emit()
  return user
}

export function adjustBalance(userId, accountType, newAvailable) {
  const users = getUsers()
  const index = users.findIndex((u) => u.uid === userId)
  if (index === -1) throw new Error('User not found.')
  const user = users[index]
  const account = requireAccount(user, accountType)
  const delta = Number(newAvailable) - account.available
  account.available = Number(Number(newAvailable).toFixed(2))
  account.balance = Number((account.balance + delta).toFixed(2))
  write(USERS_KEY, users)
  addTransactionRow({
    userId,
    accountType,
    type: delta >= 0 ? 'credit' : 'debit',
    amount: Math.abs(delta),
    description: 'Admin balance adjustment',
    category: 'adjustment',
  })
  emit()
  return user
}

export function deleteUserTransactions(userId) {
  write(
    TX_KEY,
    read(TX_KEY, []).filter((t) => t.userId !== userId),
  )
  emit()
}

export function deleteTransaction(txId) {
  write(
    TX_KEY,
    read(TX_KEY, []).filter((t) => t.id !== txId),
  )
  emit()
}

export function resetTransferCount(userId) {
  return updateUser(userId, { transfersUsed: 0 })
}

export function changePassword(userId, current, next) {
  const user = getUser(userId)
  if (!user) throw new Error('User not found.')
  if (user.password !== current) throw new Error('Current password is incorrect.')
  if (!next || next.length < 8) throw new Error('New password must be at least 8 characters.')
  return updateUser(userId, { password: next })
}

export function setCardStatus(userId, cardId, status) {
  const user = getUser(userId)
  if (!user) throw new Error('User not found.')
  const cards = (user.cards || []).map((c) => (c.id === cardId ? { ...c, status } : c))
  return updateUser(userId, { cards })
}

export const totalBalance = (user) =>
  (user?.accounts || []).reduce((sum, a) => sum + Number(a.available || 0), 0)
