import ReactUpdates from './ReactUpdates';

const alreadyListened = {};
const queueListeners = {};

function addQueue(nodeId, name, value) {
  if (!queueListeners[nodeId]) {
    queueListeners[nodeId] = {}
  }
  queueListeners[nodeId][name] = value;
}

function removeQueue(nodeId, name, value) {
  delete queueListeners[nodeId][name];
}

function getQueue(nodeId, name) {
  return queueListeners[nodeId][name];
}

function listenTo(name) {
  const eventName = name.substr(2).toLocaleLowerCase();
  
  if (alreadyListened[eventName]) {
    return;
  }
  alreadyListened[eventName] = true;

  document.addEventListener(name.substr(2).toLocaleLowerCase(), dispatchEvent.bind(this, name));
}

function dispatchEvent(name, e) {
  const domNode = e.target;
  const reactInstance = domNode.__reactInternalInstance;
  
  getQueue(reactInstance._rootNodeID, name)(e);
  ReactUpdates.flushUpdates();
}

export default {
  addQueue,
  removeQueue,
  getQueue,
  listenTo,
  dispatchEvent,
}