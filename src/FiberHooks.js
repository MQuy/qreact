import {
  computeExpirationForFiber,
  recalculateCurrentTime,
  scheduleWork,
} from "./FiberScheduler";
import { NoWork } from "./FiberExpirationTime";
import { markWorkInProgressReceivedUpdate } from "./FiberBeginWork";

let renderExpirationTime = NoWork;
// The work-in-progress fiber. I've named it differently to distinguish it from
// the work-in-progress hook.
let currentlyRenderingFiber = null;

// Hooks are stored as a linked list on the fiber's memoizedState field. The
// current hook list is the list that belongs to the current fiber. The
// work-in-progress hook list is a new list that will be added to the
// work-in-progress fiber.
let firstCurrentHook = null;
let currentHook = null;
let firstWorkInProgressHook = null;
let workInProgressHook = null;

let remainingExpirationTime = NoWork;
let componentUpdateQueue = null;

// Updates scheduled during render will trigger an immediate re-render at the
// end of the current pass. We can't store these updates on the normal queue,
// because if the work is aborted, they should be discarded. Because this is
// a relatively rare case, we also don't want to add an additional field to
// either the hook or queue object types. So we store them in a lazily create
// map of queue -> render-phase updates, which are discarded once the component
// completes without re-rendering.

// Whether the work-in-progress hook is a re-rendered hook
let isReRender = false;
// Whether an update was scheduled during the currently executing render pass.
let didScheduleRenderPhaseUpdate = false;
// Lazily created map of render-phase updates
let renderPhaseUpdates = null;

export function prepareToUseHooks(
  current,
  workInProgress,
  nextRenderExpirationTime,
) {
  renderExpirationTime = nextRenderExpirationTime;
  currentlyRenderingFiber = workInProgress;
  firstCurrentHook = current != null ? current.memoizedState : null;
}

export function finishHooks(Component, props, children) {
  // This must be called after every function component to prevent hooks from
  // being used in classes.

  while (didScheduleRenderPhaseUpdate) {
    // Updates were scheduled during the render phase. They are stored in
    // the `renderPhaseUpdates` map. Call the component again, reusing the
    // work-in-progress hooks and applying the additional updates on top. Keep
    // restarting until no more updates are scheduled.
    didScheduleRenderPhaseUpdate = false;

    // Start over from the beginning of the list
    currentHook = null;
    workInProgressHook = null;
    componentUpdateQueue = null;

    children = Component(props);
  }
  renderPhaseUpdates = null;

  const renderedWork = currentlyRenderingFiber;

  renderedWork.memoizedState = firstWorkInProgressHook;
  renderedWork.expirationTime = remainingExpirationTime;
  renderedWork.updateQueue = componentUpdateQueue;

  renderExpirationTime = NoWork;
  currentlyRenderingFiber = null;

  firstCurrentHook = null;
  currentHook = null;
  firstWorkInProgressHook = null;
  workInProgressHook = null;

  remainingExpirationTime = NoWork;
  componentUpdateQueue = null;
  return children;
}

function createHook() {
  return {
    memoizedState: null,

    baseState: null,
    queue: null,
    baseUpdate: null,

    next: null,
  };
}

function cloneHook(hook) {
  return {
    memoizedState: hook.memoizedState,

    baseState: hook.baseState,
    queue: hook.queue,
    baseUpdate: hook.baseUpdate,

    next: null,
  };
}

function createWorkInProgressHook() {
  if (workInProgressHook == null) {
    // This is the first hook in the list
    if (firstWorkInProgressHook == null) {
      isReRender = false;
      currentHook = firstCurrentHook;
      if (currentHook == null) {
        // This is a newly mounted hook
        workInProgressHook = createHook();
      } else {
        // Clone the current hook.
        workInProgressHook = cloneHook(currentHook);
      }
      firstWorkInProgressHook = workInProgressHook;
    } else {
      // There's already a work-in-progress. Reuse it.
      isReRender = true;
      currentHook = firstCurrentHook;
      workInProgressHook = firstWorkInProgressHook;
    }
  } else {
    if (workInProgressHook.next == null) {
      isReRender = false;
      let hook;
      if (currentHook == null) {
        // This is a newly mounted hook
        hook = createHook();
      } else {
        currentHook = currentHook.next;
        if (currentHook == null) {
          // This is a newly mounted hook
          hook = createHook();
        } else {
          // Clone the current hook.
          hook = cloneHook(currentHook);
        }
      }
      // Append to the end of the list
      workInProgressHook = workInProgressHook.next = hook;
    } else {
      // There's already a work-in-progress. Reuse it.
      isReRender = true;
      workInProgressHook = workInProgressHook.next;
      currentHook = currentHook != null ? currentHook.next : null;
    }
  }
  return workInProgressHook;
}

function basicStateReducer(state, action) {
  return typeof action === "function" ? action(state) : action;
}

export function useState(initialState) {
  return useReducer(basicStateReducer, initialState);
}

export function useReducer(reducer, initialState, initialAction) {
  workInProgressHook = createWorkInProgressHook();
  let queue = workInProgressHook.queue;
  if (queue != null) {
    // Already have a queue, so this is an update.
    if (isReRender) {
      // This is a re-render. Apply the new render phase updates to the previous
      // work-in-progress hook.
      const dispatch = queue.dispatch;
      if (renderPhaseUpdates != null) {
        // Render phase updates are stored in a map of queue -> linked list
        const firstRenderPhaseUpdate = renderPhaseUpdates.get(queue);
        if (firstRenderPhaseUpdate !== undefined) {
          renderPhaseUpdates.delete(queue);
          let newState = workInProgressHook.memoizedState;
          let update = firstRenderPhaseUpdate;
          do {
            // Process this render phase update. We don't have to check the
            // priority because it will always be the same as the current
            // render's.
            const action = update.action;
            newState = reducer(newState, action);
            update = update.next;
          } while (update != null);

          workInProgressHook.memoizedState = newState;

          // Don't persist the state accumlated from the render phase updates to
          // the base state unless the queue is empty.
          // TODO: Not sure if this is the desired semantics, but it's what we
          // do for gDSFP. I can't remember why.
          if (workInProgressHook.baseUpdate === queue.last) {
            workInProgressHook.baseState = newState;
          }

          return [newState, dispatch];
        }
      }
      return [workInProgressHook.memoizedState, dispatch];
    }

    // The last update in the entire queue
    const last = queue.last;
    // The last update that is part of the base state.
    const baseUpdate = workInProgressHook.baseUpdate;

    // Find the first unprocessed update.
    let first;
    if (baseUpdate != null) {
      if (last != null) {
        // For the first update, the queue is a circular linked list where
        // `queue.last.next = queue.first`. Once the first update commits, and
        // the `baseUpdate` is no longer empty, we can unravel the list.
        last.next = null;
      }
      first = baseUpdate.next;
    } else {
      first = last != null ? last.next : null;
    }
    if (first != null) {
      let newState = workInProgressHook.baseState;
      let newBaseState = null;
      let newBaseUpdate = null;
      let prevUpdate = baseUpdate;
      let update = first;
      let didSkip = false;
      do {
        const updateExpirationTime = update.expirationTime;
        if (updateExpirationTime < renderExpirationTime) {
          // Priority is insufficient. Skip this update. If this is the first
          // skipped update, the previous update/state is the new base
          // update/state.
          if (!didSkip) {
            didSkip = true;
            newBaseUpdate = prevUpdate;
            newBaseState = newState;
          }
          // Update the remaining priority in the queue.
          if (updateExpirationTime > remainingExpirationTime) {
            remainingExpirationTime = updateExpirationTime;
          }
        } else {
          // Process this update.
          const action = update.action;
          newState = reducer(newState, action);
        }
        prevUpdate = update;
        update = update.next;
      } while (update != null && update !== first);

      if (!didSkip) {
        newBaseUpdate = prevUpdate;
        newBaseState = newState;
      }

      workInProgressHook.memoizedState = newState;
      workInProgressHook.baseUpdate = newBaseUpdate;
      workInProgressHook.baseState = newBaseState;

      // Mark that the fiber performed work, but only if the new state is
      // different from the current state.
      if (newState !== currentHook.memoizedState) {
        markWorkInProgressReceivedUpdate();
      }
    }

    const dispatch = queue.dispatch;
    return [workInProgressHook.memoizedState, dispatch];
  }

  // There's no existing queue, so this is the initial render.
  if (reducer === basicStateReducer) {
    // Special case for `useState`.
    if (typeof initialState === "function") {
      initialState = initialState();
    }
  } else if (initialAction !== undefined && initialAction != null) {
    initialState = reducer(initialState, initialAction);
  }
  workInProgressHook.memoizedState = workInProgressHook.baseState = initialState;
  queue = workInProgressHook.queue = {
    last: null,
    dispatch: null,
  };
  const dispatch = (queue.dispatch = dispatchAction.bind(
    null,
    currentlyRenderingFiber,
    queue,
  ));
  return [workInProgressHook.memoizedState, dispatch];
}

function dispatchAction(fiber, queue, action) {
  const alternate = fiber.alternate;
  if (
    fiber === currentlyRenderingFiber ||
    (alternate != null && alternate === currentlyRenderingFiber)
  ) {
    // This is a render phase update. Stash it in a lazily-created map of
    // queue -> linked list of updates. After this render pass, we'll restart
    // and apply the stashed updates on top of the work-in-progress hook.
    didScheduleRenderPhaseUpdate = true;
    const update = {
      expirationTime: renderExpirationTime,
      action,
      next: null,
    };
    if (renderPhaseUpdates == null) {
      renderPhaseUpdates = new Map();
    }
    const firstRenderPhaseUpdate = renderPhaseUpdates.get(queue);
    if (firstRenderPhaseUpdate === undefined) {
      renderPhaseUpdates.set(queue, update);
    } else {
      // Append the update to the end of the list.
      let lastRenderPhaseUpdate = firstRenderPhaseUpdate;
      while (lastRenderPhaseUpdate.next != null) {
        lastRenderPhaseUpdate = lastRenderPhaseUpdate.next;
      }
      lastRenderPhaseUpdate.next = update;
    }
  } else {
    const currentTime = recalculateCurrentTime();
    const expirationTime = computeExpirationForFiber(currentTime, fiber);
    const update = {
      expirationTime,
      action,
      next: null,
    };
    // Append the update to the end of the list.
    const last = queue.last;
    if (last == null) {
      // This is the first update. Create a circular list.
      update.next = update;
    } else {
      const first = last.next;
      if (first != null) {
        // Still circular.
        update.next = first;
      }
      last.next = update;
    }
    queue.last = update;
    scheduleWork(fiber, expirationTime);
  }
}

export function bailoutHooks(current, workInProgress, expirationTime) {
  workInProgress.updateQueue = current.updateQueue;
  if (current.expirationTime <= expirationTime) {
    current.expirationTime = NoWork;
  }
}
