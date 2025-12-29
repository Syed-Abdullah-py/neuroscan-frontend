import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges class names safely.
 * 
 * Combines Tailwind CSS classes using `clsx` and `tailwind-merge`.
 * This allows for conditional class application and properly handles
 * Tailwind class conflicts (e.g., `p-4` vs `p-8`).
 *
 * @param inputs - A list of class values (strings, objects, arrays, etc.).
 * @returns A merged string of class names.
 */

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number of bytes into a human-readable string.
 * 
 * Converts bytes to KB, MB, GB, etc., with a specified number of decimal places.
 *
 * @param bytes - The number of bytes to format.
 * @param decimals - The number of decimal places to include (default is 2).
 * @returns A formatted string representing the size (e.g., "1.5 MB").
 */

export function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}