class TinyEmitter {
  events = {};

  subscribe(eventName, listener) {
    if (!this.events[eventName]) {
      this.events[eventName] = [listener]; 
      return;
    }

    this.events[eventName].push(listener);
  }

  unsubscribe(eventName, listener) {
    if (!this.events[eventName]) {
      return;
    }

    this.events[eventName] = this.events[eventName].filter(func => func !== listener);

    if (this.events[eventName].length === 0) {
      delete this.events[eventName]
    }
  }

  emit(eventName, ...args) {
    if (!this.events[eventName]) {
      return;
    }

    const listeners = [...this.events[eventName]];
    listeners.forEach(listener => listener(...args));
  }
}

const bus = new TinyEmitter();

function a() {
  console.log('a');
  bus.unsubscribe('test', b);
}

function b() {
  console.log('b');
}

bus.subscribe('test', a);
bus.subscribe('test', b);
bus.emit('test');