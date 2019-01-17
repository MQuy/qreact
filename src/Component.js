import { scheduleUpdate } from "./FiberScheduler";
import { createUpdate, enqueueUpdate } from "./UpdateQueue";

export class Component {
  constructor(props) {
    this.props = props;
  }

  setState(partialState) {
    const fiber = ReactInstanceMap.get(this);
    const update = createUpdate(partialState);

    enqueueUpdate(fiber, update);
    scheduleUpdate(fiber);
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
  }
};
