import { Prisma } from '@prisma/client'
import { randomInt } from 'crypto'

// Type Predicates for Prisma Errors

export function isUniqueConstraintPrismaError(error: any): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'
}

export function isNotFoundPrismaError(error: any): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025'
}

export function isValidationPrismaError(error: any): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003'
}

export const generateOTP = (): string => {
  return String(randomInt(100000, 1000000)) // Generates a random 6-digit number
}

/** Parse "YYYY-MM-DD HH:mm" -> Date (according to server's local time) */
export function parseLocalYMDHM(s: string): Date | null {
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})(?:\s+(\d{2}):(\d{2}))?$/)
  if (!m) return null
  const [, Y, M, D, hh, mm] = m
  const H = hh ? Number(hh) : 23 // if no time → 23:59
  const Min = mm ? Number(mm) : 59
  // Use constructor Date(y, m, d, h, min) (server timezone)
  return new Date(Number(Y), Number(M) - 1, Number(D), H, Min, 0, 0)
}

/** Support short tokens right in `until`, for example "2h" | "30m" | "3d" */
export function parseRelativeToken(s: string): Date | null {
  const mt = s.match(/^(\d+)(m|h|d)$/i)
  if (!mt) return null
  const val = parseInt(mt[1], 10)
  const unit = mt[2].toLowerCase()
  const minutes = unit === 'm' ? val : unit === 'h' ? val * 60 : val * 24 * 60
  return new Date(Date.now() + minutes * 60_000)
}

/** Coerce all sorts of "friendly" Dates */
export function coerceUntil(v: unknown): unknown {
  if (v instanceof Date) return v
  if (typeof v === 'number') return new Date(v) // epoch ms
  if (typeof v === 'string') {
    const n = Number(v)
    if (Number.isFinite(n)) return new Date(n) // "1756720800000"
    const rel = parseRelativeToken(v) // "2h" | "30m" | "3d"
    if (rel) return rel
    const local = parseLocalYMDHM(v) // "YYYY-MM-DD HH:mm" / "YYYY-MM-DD"
    if (local) return local
    return new Date(v) // ISO fallback
  }
  return v
}

