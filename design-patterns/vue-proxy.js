let currentWatcher = null;  // "who is currently running?"
const subscribers = {};      // prop → [list of functions to re-run]

const state = new Proxy({ count: 0, name: 'Abulkosim' }, {
  get(target, prop) {
    // if someone is "watching", record the dependency
    if (currentWatcher) {
      if (!subscribers[prop]) subscribers[prop] = [];
      subscribers[prop].push(currentWatcher);
    }
    return target[prop];
  },
  set(target, prop, value) {
    target[prop] = value;
    // re-run everyone who depends on this prop
    if (subscribers[prop]) {
      subscribers[prop].forEach(fn => fn());
    }
    return true;
  }
});