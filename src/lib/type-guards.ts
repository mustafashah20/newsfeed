/** Type-narrowing filter: `items.map(parse).filter(isPresent)`. */
export function isPresent<T>(value: T | null | undefined): value is T {
  return value != null;
}
