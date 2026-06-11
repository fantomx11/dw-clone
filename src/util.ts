export function snakeToCamelCase(str: string): string {
  return str.toLowerCase().replace(/_([a-z])/g, (_, match) => match.toUpperCase());
}