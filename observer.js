class TinyEmitter {
  constructor() {
    this.events = Object.create(null);
  }

  subscribe(eventName, listener) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }

    this.events[eventName].push(listener);

    return () => this.unsubscribe(eventName, listener);
  }

  unsubscribe(eventName, listener) {
    const listeners = this.events[eventName];
    if (!listeners) return;

    this.events[eventName] = listeners.filter(fn => fn !== listener);

    if (this.events[eventName].length === 0) {
      delete this.events[eventName];
    }
  }

  emit(eventName, ...args) {
    const listeners = this.events[eventName];
    if (!listeners) return;

    const snapshot = [...listeners];
    for (const listener of snapshot) {
      listener(...args);
    }
  }
}