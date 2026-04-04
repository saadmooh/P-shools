import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility for combining Tailwind/standard CSS classes.
 * Although we are using CSS variables, tailwind-merge can still be useful 
 * if we use Tailwind utilities, or we can just use clsx.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
