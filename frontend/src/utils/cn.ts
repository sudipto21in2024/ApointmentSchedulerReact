import type { ClassValue } from 'clsx';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge and resolve Tailwind CSS classes
 * Combines clsx for conditional class logic with tailwind-merge for proper Tailwind class precedence
 *
 * @param inputs - Array of class values (strings, conditionals, objects, arrays)
 * @returns Merged and deduplicated class string
 *
 * @example
 * ```tsx
 * // Basic usage
 * cn("text-red-500", "bg-blue-500") // "bg-blue-500 text-red-500"
 *
 * // With conditionals
 * cn("text-sm", isActive && "font-bold", { "text-red": hasError }) // "text-sm font-bold text-red"
 *
 * // With conflicting classes (tailwind-merge handles precedence)
 * cn("px-2", "px-4") // "px-4"
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default cn;