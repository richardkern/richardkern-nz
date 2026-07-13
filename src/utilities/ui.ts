/**
 * `cn` merges Tailwind class lists, resolving conflicts: clsx flattens
 * conditional/array inputs, tailwind-merge makes the last of any conflicting
 * utilities win.
 */

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
