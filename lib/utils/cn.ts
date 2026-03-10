import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges class names using clsx (conditionals) and tailwind-merge (deduplication).
 * Use this for all className composition — never string concatenation.
 */
export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));
