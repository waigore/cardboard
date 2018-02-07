import EventEmitter from 'wolfy87-eventemitter';

var ee = new EventEmitter();

export function addEventListener(eventName, callback) {
  ee.addListener(eventName, callback);
}

export function removeEventListener(eventName, callback) {
  ee.removeListener(eventName, callback);
}

export function emitEvent(eventName, args) {
  ee.emitEvent(eventName, args);
}
