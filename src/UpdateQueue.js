export function enqueueUpdate(fiber, update) {
  let alternateFiber = fiber.alternate;

  let queue1 = fiber.updateQueue;
  if (queue1 == null) {
    queue1 = fiber.updateQueue = createUpdateQueue();
  }

  let queue2 = null;
  if (alternateFiber != null && alternateFiber.updateQueue == null) {
    queue2 = alternateFiber.updateQueue = createUpdateQueue();
  }

  queue2 = queue2 !== queue1 ? queue2 : null;

  insertUpdateIntoQueue(queue1, update);
  if (queue2 != null) {
    insertUpdateIntoQueue(queue2, update);
  }
}

function createUpdateQueue() {
  return {
    first: null,
    last: null
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

export function createUpdate(partialState) {
  return {
    partialState,
    next: null,
    callback: null
  };
}
