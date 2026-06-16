// 1. Define the semantic names of events running through your system
export enum EventType {
  LocationChanged = "LocationChanged",
  DialogueUpdated = "DialogueUpdated"
}

// 2. Map each event explicitly to the exact data contract it transmits
export interface EventPayloads {
  [EventType.LocationChanged]: { locationId: string | null };
  [EventType.DialogueUpdated]: { npcId: string | null, nodeId: string | null };
}

type EventCallback<K extends EventType> = (payload: EventPayloads[K]) => void;

export class EventBus {
  // Safe, private registry of active listener arrays mapped by event type
  static #listeners: { [K in EventType]?: EventCallback<K>[] } = {};

  /**
   * Subscribes a callback function to an event.
   * @returns A semantic closure function that automatically unsubscribes the listener.
   */
  static subscribe<K extends EventType>(type: K, callback: EventCallback<K>): () => void {
    if (!this.#listeners[type]) {
      this.#listeners[type] = [];
    }

    this.#listeners[type]!.push(callback);

    // Return an easy cleanup function for UI components to invoke when they unmount
    return () => this.unsubscribe(type, callback);
  }

  /**
   * Removes a specific callback function from an event array.
   */
  static unsubscribe<K extends EventType>(type: K, callback: EventCallback<K>): void {
    const list = this.#listeners[type];
    if (!list) return;

    this.#listeners[type] = list.filter(cb => cb !== callback) as any;
  }

  /**
   * Distributes a data payload to all registered event subscribers.
   */
  static fireEvent<K extends EventType>(type: K, payload: EventPayloads[K]): void {
    const list = this.#listeners[type];
    if (!list) return;

    // Enclose calls in a try-catch matrix so a rogue UI bug doesn't break the main core loop
    for (const callback of list) {
      try {
        callback(payload);
      } catch (error) {
        console.error(`[EventBus Error] Exception thrown in subscriber for ${type}:`, error);
      }
    }
  }

  /**
   * Resets the entire message hub. 
   * Essential when transitioning between save profiles or bouncing to the Main Menu.
   */
  static clear(): void {
    this.#listeners = {};
  }
}