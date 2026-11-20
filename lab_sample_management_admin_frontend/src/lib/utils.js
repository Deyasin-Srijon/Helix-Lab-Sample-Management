/**
 * Standard utility function for conditional class names (shadcn standard).
 *
 * @param  {...any} inputs Classes or conditions
 * @returns {string} Merged class string
 */
export function cn(...inputs) {
  return inputs.filter(Boolean).join(' ');
}
