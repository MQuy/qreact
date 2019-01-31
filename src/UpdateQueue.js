import { NoWork } from "./FiberExpirationTime";
import { ClassComponent, HostRoot } from "./TypeOfWork";

export function insertUpdateIntoFiber(fiber, update) {
  let alternateFiber = fiber.alternate;

  let queue1 = fiber.updateQueue;
  if (queue1 == null) {
    queue1 = fiber.updateQueue = createUpdateQueue();
  }

  let queue2 = null;
  if (alternateFiber != null) {
    queue2 = alternateFiber.updateQueue;
    if (queue2 == null) {
      queue2 = alternateFiber.updateQueue = createUpdateQueue();
    }
  }

  // If there's only one queue, add the update to that queue and exit.
  if (queue2 == null) {
    insertUpdateIntoQueue(queue1, update);
    return;
  }

  // If either queue is empty, we need to add to both queues.
  if (queue1.last == null || queue2.last == null) {
    insertUpdateIntoQueue(queue1, update);
    insertUpdateIntoQueue(queue2, update);
    return;
  }

  // If both lists are not empty, the last update is the same for both lists
  // because of structural sharing. So, we should only append to one of
  // the lists.
  insertUpdateIntoQueue(queue1, update);
  // But we still need to update the `last` pointer of queue2.
  queue2.last = update;
}

function createUpdateQueue() {
  return {
    first: null,
    last: null,
  };
}

function insertUpdateIntoQueue(queue, update) {
  if (queue.last == null) {
    queue.first = queue.last = update;
  } else {
    queue.last.next = update;
    queue.last = update;
  }
}

export function createUpdate(partialState, expirationTime) {
  return {
    partialState,
    expirationTime,
    next: null,
    callback: null,
  };
}

export function processUpdateQueue(
  current,
  workInProgress,
  queue,
  instance,
  props,
  renderExpirationTime,
) {
  if (current != null && current.updateQueue === queue) {
    // We need to create a work-in-progress queue, by cloning the current queue.
    const currentQueue = queue;
    queue = workInProgress.updateQueue = {
      first: currentQueue.first,
      last: currentQueue.last,
    };
  }

  // Reset the remaining expiration time. If we skip over any updates, we'll
  // increase this accordingly.
  queue.expirationTime = NoWork;

  // TODO: We don't know what the base state will be until we begin work.
  // It depends on which fiber is the next current. Initialize with an empty
  // base state, then set to the memoizedState when rendering. Not super
  // happy with this approach.
  let state = workInProgress.memoizedState;
  let update = queue.first;
  let didSkip = false;
  let newExpirationTime = NoWork;
  while (update != null) {
    const updateExpirationTime = update.expirationTime;
    if (updateExpirationTime > renderExpirationTime) {
      // This update does not have sufficient priority. Skip it.
      if (!didSkip) {
        didSkip = true;
        queue.baseState = state;
      }
      // Since this update will remain in the list, update the remaining
      // expiration time.
      if (
        newExpirationTime === NoWork ||
        newExpirationTime > updateExpirationTime
      ) {
        newExpirationTime = updateExpirationTime;
      }
      // Continue to the next update.
      update = update.next;
      continue;
    }

    // This update does have sufficient priority.

    // If no previous updates were skipped, drop this update from the queue by
    // advancing the head of the list.
    if (!didSkip) {
      queue.first = update.next;
      if (queue.first == null) {
        queue.last = null;
      }
    }

    // Process the update
    let partialState = getStateFromUpdate(update, instance, state, props);
    if (partialState) {
      state = Object.assign({}, state, partialState);
    }
    update = update.next;
  }

  if (!didSkip) {
    didSkip = true;
    queue.baseState = state;
  }

  // Set the remaining expiration time to be whatever is remaining in the queue.
  // This should be fine because the only two other things that contribute to
  // expiration time are props and context. We're already in the middle of the
  // begin phase by the time we start processing the queue, so we've already
  // dealt with the props. Context in components that specify
  // shouldComponentUpdate is tricky; but we'll have to account for
  // that regardless.
  workInProgress.expirationTime = newExpirationTime;
  workInProgress.memoizedState = state;
}

function getStateFromUpdate(update, instance, prevState, props) {
  const partialState = update.partialState;
  if (typeof partialState === "function") {
    return partialState.call(instance, prevState, props);
  } else {
    return partialState;
  }
}
