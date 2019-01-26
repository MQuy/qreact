import { scheduleWork, computeExpirationForFiber } from "./FiberScheduler";
import { createUpdate, insertUpdateIntoFiber } from "./UpdateQueue";

export class Component {
  constructor(props) {
    this.props = props;
  }

  setState(partialState) {
    const fiber = ReactInstanceMap.get(this);
    const expirationTime = computeExpirationForFiber(fiber);
    const update = createUpdate(partialState, expirationTime);

    insertUpdateIntoFiber(fiber, update);
    scheduleWork(fiber, expirationTime);
  }
}

export const ReactInstanceMap = {
  remove: function(key) {
    key._reactInternalFiber = undefined;
  },

  get: function(key) {
    return key._reactInternalFiber;
  },

  has: function(key) {
    return key._reactInternalFiber !== undefined;
  },

  set: function(key, value) {
    key._reactInternalFiber = value;
  },
};
