import { timingSafeEqual } from 'node:crypto'

/**
 * Constant-time comparison of a presented secret against the configured value.
 * Returns false when either side is missing, so an unset secret can never
 * authorise a request. The length pre-check avoids `timingSafeEqual`'s throw on
 * mismatched buffer lengths; length is not itself a meaningful leak here.
 */
export const secretEqual = (
  presented: string | null | undefined,
  secret: string | null | undefined,
): boolean => {
  if (!secret || !presented) return false
  const a = Buffer.from(presented)
  const b = Buffer.from(secret)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}
