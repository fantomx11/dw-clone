interface Identifiable {
  id: string;
  toJSON(): any;
}

/**
 * Creates a totally isolated, type-safe functional registry.
 * Zero objects to pass around, zero class instantiations required.
 */
export function createRegistry<T extends Identifiable>() {
  // This Map is trapped inside this function's scope—totally private!
  const storage = new Map<string, T>();

  return {
    get: (id: string): T | undefined => storage.get(id),
    register: (item: T): void => { storage.set(item.id, item); },
    getAll: (): T[] => Array.from(storage.values()),
    clear: (): void => storage.clear(),
  };
}