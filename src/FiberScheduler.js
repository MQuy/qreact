import { createWorkInProgress } from "./Fiber";
import { HostRoot } from "./TypeOfWork";
import { completeWork } from "./FiberCompleteWork";
import {
  PerformedWork,
  Placement,
  Update,
  PlacementAndUpdate,
  Deletion,
} from "./TypeOfSideEffect";
import { commitPlacement, commitDeletion, commitWork } from "./FiberCommitWork";
import { beginWork } from "./FiberBeginWork";
import {
  Sync,
  NoWork,
  msToExpirationTime,
  Never,
  computeExpirationBucket,
} from "./FiberExpirationTime";
import { AsyncMode } from "./TypeOfMode";

const timeHeuristicForUnitOfWork = 1;
let nextFlushedExpirationTime = NoWork;
let nextFlushedRoot = null;
let firstScheduledRoot = null;
let lastScheduledRoot = null;
let nextUnitOfWork = null;
let nextEffect = null;
let isBatchingUpdates = false;
let isRendering = false;
let expirationContext = NoWork;
let isWorking = false;
let isCommitting = false;
let lowestPendingInteractiveExpirationTime = NoWork;
let isBatchingInteractiveUpdates = false;
let nextRenderExpirationTime = NoWork;
let mostRecentCurrentTime = msToExpirationTime(0);

export function scheduleWork(fiber, expirationTime) {
  const root = scheduleWorkToRoot(fiber, expirationTime);
  if (
    // If we're in the render phase, we don't need to schedule this root
    // for an update, because we'll do it before we exit...
    !isWorking ||
    isCommitting ||
    root
  ) {
    const rootExpirationTime = root.expirationTime;
    requestWork(root, rootExpirationTime);
  }
}

function scheduleWorkToRoot(fiber, expirationTime) {
  // Update the source fiber's expiration time
  if (
    fiber.expirationTime === NoWork ||
    fiber.expirationTime > expirationTime
  ) {
    fiber.expirationTime = expirationTime;
  }
  let alternate = fiber.alternate;
  if (
    alternate != null &&
    (alternate.expirationTime === NoWork ||
      alternate.expirationTime > expirationTime)
  ) {
    alternate.expirationTime = expirationTime;
  }
  // Walk the parent path to the root and update the child expiration time.
  let node = fiber.return;
  if (node == null && fiber.tag === HostRoot) {
    return fiber.stateNode;
  }
  while (node != null) {
    alternate = node.alternate;
    if (
      node.childExpirationTime === NoWork ||
      node.childExpirationTime > expirationTime
    ) {
      node.childExpirationTime = expirationTime;
      if (
        alternate != null &&
        (alternate.childExpirationTime === NoWork ||
          alternate.childExpirationTime > expirationTime)
      ) {
        alternate.childExpirationTime = expirationTime;
      }
    } else if (
      alternate != null &&
      (alternate.childExpirationTime === NoWork ||
        alternate.childExpirationTime > expirationTime)
    ) {
      alternate.childExpirationTime = expirationTime;
    }
    if (node.return == null && node.tag === HostRoot) {
      return node.stateNode;
    }
    node = node.return;
  }
  return null;
}

function requestWork(root, expirationTime) {
  addRootToSchedule(root, expirationTime);

  if (isBatchingUpdates || isRendering) {
    return;
  }
  if (expirationTime === Sync) {
    performWork(Sync, null);
  } else {
    requestIdleCallback(performAsyncWork);
  }
}

function addRootToSchedule(root, expirationTime) {
  // Add the root to the schedule.
  // Check if this root is already part of the schedule.
  if (root.nextScheduledRoot == null) {
    // This root is not already scheduled. Add it.
    root.remainingExpirationTime = expirationTime;
    if (lastScheduledRoot == null) {
      firstScheduledRoot = lastScheduledRoot = root;
      root.nextScheduledRoot = root;
    } else {
      lastScheduledRoot.nextScheduledRoot = root;
      lastScheduledRoot = root;
      lastScheduledRoot.nextScheduledRoot = firstScheduledRoot;
    }
  } else {
    // This root is already scheduled, but its priority may have increased.
    var remainingExpirationTime = root.remainingExpirationTime;
    if (
      remainingExpirationTime === NoWork ||
      expirationTime < remainingExpirationTime
    ) {
      // Update the priority.
      root.remainingExpirationTime = expirationTime;
    }
  }
}

function performAsyncWork(deadline) {
  performWork(NoWork, deadline);
}

function performSyncWork() {
  performWork(Sync, null);
}

function findHighestPriorityRoot() {
  var highestPriorityWork = NoWork;
  var highestPriorityRoot = null;
  if (lastScheduledRoot != null) {
    var previousScheduledRoot = lastScheduledRoot;
    var root = firstScheduledRoot;
    while (root != null) {
      var remainingExpirationTime = root.remainingExpirationTime;
      if (remainingExpirationTime === NoWork) {
        // This root no longer has work. Remove it from the scheduler.

        // TODO: This check is redudant, but Flow is confused by the branch
        // below where we set lastScheduledRoot to null, even though we break
        // from the loop right after.
        !(previousScheduledRoot != null && lastScheduledRoot != null)
          ? invariant(
              false,
              "Should have a previous and last root. This error is likely caused by a bug in React. Please file an issue.",
            )
          : void 0;
        if (root === root.nextScheduledRoot) {
          // This is the only root in the list.
          root.nextScheduledRoot = null;
          firstScheduledRoot = lastScheduledRoot = null;
          break;
        } else if (root === firstScheduledRoot) {
          // This is the first root in the list.
          var next = root.nextScheduledRoot;
          firstScheduledRoot = next;
          lastScheduledRoot.nextScheduledRoot = next;
          root.nextScheduledRoot = null;
        } else if (root === lastScheduledRoot) {
          // This is the last root in the list.
          lastScheduledRoot = previousScheduledRoot;
          lastScheduledRoot.nextScheduledRoot = firstScheduledRoot;
          root.nextScheduledRoot = null;
          break;
        } else {
          previousScheduledRoot.nextScheduledRoot = root.nextScheduledRoot;
          root.nextScheduledRoot = null;
        }
        root = previousScheduledRoot.nextScheduledRoot;
      } else {
        if (
          highestPriorityWork === NoWork ||
          remainingExpirationTime < highestPriorityWork
        ) {
          // Update the priority, if it's higher
          highestPriorityWork = remainingExpirationTime;
          highestPriorityRoot = root;
        }
        if (root === lastScheduledRoot) {
          break;
        }
        previousScheduledRoot = root;
        root = root.nextScheduledRoot;
      }
    }
  }

  // If the next root is the same as the previous root, this is a nested
  // update. To prevent an infinite loop, increment the nested update count.
  nextFlushedRoot = highestPriorityRoot;
  nextFlushedExpirationTime = highestPriorityWork;
}

function performWork(minExpirationTime, deadline) {
  // Keep working on roots until there's no more work, or until the we reach
  // the deadline.
  findHighestPriorityRoot();

  if (deadline) {
    while (
      nextFlushedRoot != null &&
      nextFlushedExpirationTime !== NoWork &&
      (minExpirationTime === NoWork ||
        minExpirationTime >= nextFlushedExpirationTime) &&
      (deadline.timeRemaining() > timeHeuristicForUnitOfWork ||
        recalculateCurrentTime() >= nextFlushedExpirationTime)
    ) {
      performWorkOnRoot(nextFlushedRoot, nextFlushedExpirationTime, deadline);
      findHighestPriorityRoot();
    }
  } else {
    while (
      nextFlushedRoot != null &&
      nextFlushedExpirationTime !== NoWork &&
      (minExpirationTime === NoWork ||
        minExpirationTime >= nextFlushedExpirationTime)
    ) {
      performWorkOnRoot(nextFlushedRoot, nextFlushedExpirationTime, false);
      findHighestPriorityRoot();
    }
  }

  if (nextFlushedExpirationTime === NoWork) {
    nextFlushedRoot = null;
  } else {
    requestIdleCallback(performAsyncWork);
  }
}

function performWorkOnRoot(root, expirationTime, deadline) {
  isRendering = true;
  if (expirationTime <= recalculateCurrentTime()) {
    // Flush sync work.
    let finishedWork = root.finishedWork;
    if (finishedWork != null) {
      // This root is already complete. We can commit it.
      root.finishedWork = null;
      root.remainingExpirationTime = commitRoot(finishedWork);
    } else {
      root.finishedWork = null;
      finishedWork = renderRoot(root, expirationTime);
      if (finishedWork != null) {
        // We've completed the root. Commit it.
        root.remainingExpirationTime = commitRoot(finishedWork);
      }
    }
  } else {
    // Flush async work.
    var finishedWork = root.finishedWork;
    if (finishedWork != null) {
      // This root is already complete. We can commit it.
      root.finishedWork = null;
      root.remainingExpirationTime = commitRoot(finishedWork);
    } else {
      root.finishedWork = null;
      finishedWork = renderRoot(root, expirationTime, deadline);
      if (finishedWork != null) {
        // We've completed the root. Check the deadline one more time
        // before committing.
        if (deadline.timeRemaining() > timeHeuristicForUnitOfWork) {
          // Still time left. Commit the root.
          root.remainingExpirationTime = commitRoot(finishedWork);
        } else {
          // There's no time left. Mark this root as complete. We'll come
          // back and commit it later.
          root.finishedWork = finishedWork;
        }
      }
    }
  }

  isRendering = false;
}

function renderRoot(root, expirationTime, deadline) {
  isWorking = true;

  root.isReadyForCommit = false;

  // Check if we're starting from a fresh stack, or if we're resuming from
  // previously yielded work.
  if (expirationTime !== nextRenderExpirationTime || nextUnitOfWork == null) {
    nextRenderExpirationTime = expirationTime;
    nextUnitOfWork = createWorkInProgress(
      root.current,
      null,
      nextRenderExpirationTime,
    );
  }

  workLoop(expirationTime, deadline);

  isWorking = false;

  return root.isReadyForCommit ? root.current.alternate : null;
}

function workLoop(expirationTime, deadline) {
  if (
    nextRenderExpirationTime === NoWork ||
    nextRenderExpirationTime > expirationTime
  ) {
    return;
  }

  if (nextRenderExpirationTime <= mostRecentCurrentTime) {
    // Flush all expired work.
    while (nextUnitOfWork != null) {
      nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    }
  } else {
    // Flush asynchronous work until the deadline runs out of time.
    while (
      nextUnitOfWork != null &&
      deadline.timeRemaining() > timeHeuristicForUnitOfWork
    ) {
      nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    }
  }
}

function performUnitOfWork(workInProgress) {
  const current = workInProgress.alternate;
  let next = beginWork(current, workInProgress, nextRenderExpirationTime);
  workInProgress.memoizedProps = workInProgress.pendingProps;
  if (next == null) {
    next = completeUnitOfWork(workInProgress);
  }
  return next;
}

function completeUnitOfWork(workInProgress) {
  while (true) {
    let current = workInProgress.alternate;
    let next = completeWork(current, workInProgress, nextRenderExpirationTime);

    let returnFiber = workInProgress.return;
    let siblingFiber = workInProgress.sibling;

    resetChildExpirationTime(workInProgress, nextRenderExpirationTime);

    if (next != null) {
      return next;
    }

    if (returnFiber != null) {
      if (returnFiber.firstEffect == null) {
        returnFiber.firstEffect = workInProgress.firstEffect;
      }
      if (workInProgress.lastEffect != null) {
        if (returnFiber.lastEffect != null) {
          returnFiber.lastEffect.nextEffect = workInProgress.firstEffect;
        }
        returnFiber.lastEffect = workInProgress.lastEffect;
      }

      let effectTag = workInProgress.effectTag;
      if (effectTag > PerformedWork) {
        if (returnFiber.lastEffect != null) {
          returnFiber.lastEffect.nextEffect = workInProgress;
        } else {
          returnFiber.firstEffect = workInProgress;
        }
        returnFiber.lastEffect = workInProgress;
      }
    }

    if (siblingFiber != null) {
      return siblingFiber;
    } else if (returnFiber != null) {
      workInProgress = returnFiber;
      continue;
    } else {
      const root = workInProgress.stateNode;
      root.isReadyForCommit = true;
      return null;
    }
  }
}

function commitRoot(finishedWork) {
  isWorking = true;
  isCommitting = true;

  let root = finishedWork.stateNode;
  root.isReadyForCommit = false;

  let firstEffect = null;
  if (finishedWork.effectTag > PerformedWork) {
    if (finishedWork.lastEffect != null) {
      finishedWork.lastEffect.nextEffect = finishedWork;
      firstEffect = finishedWork.firstEffect;
    } else {
      firstEffect = finishedWork;
    }
  } else {
    firstEffect = finishedWork.firstEffect;
  }

  nextEffect = firstEffect;
  while (nextEffect != null) {
    commitAllHostEffects();
  }

  root.current = finishedWork;

  isCommitting = false;
  isWorking = false;

  return root.current.expirationTime;
}

function commitAllHostEffects() {
  while (nextEffect != null) {
    let effectTag = nextEffect.effectTag;

    let primaryEffectTag = effectTag & ~PerformedWork;
    switch (primaryEffectTag) {
      case Placement: {
        commitPlacement(nextEffect);
        nextEffect.effectTag &= ~Placement;
        break;
      }
      case PlacementAndUpdate: {
        commitPlacement(nextEffect);
        nextEffect.effectTag &= ~Placement;

        commitWork(nextEffect);
        break;
      }
      case Update: {
        commitWork(nextEffect);
        break;
      }
      case Deletion: {
        commitDeletion(nextEffect);
        break;
      }
    }
    nextEffect = nextEffect.nextEffect;
  }
}

function computeAsyncExpiration(currentTime) {
  // Given the current clock time, returns an expiration time. We use rounding
  // to batch like updates together.
  // Should complete within ~1000ms. 1200ms max.
  const expirationMs = 5000;
  const bucketSizeMs = 250;
  return computeExpirationBucket(currentTime, expirationMs, bucketSizeMs);
}

function computeInteractiveExpiration(currentTime) {
  // Should complete within ~500ms. 600ms max.
  const expirationMs = 500;
  const bucketSizeMs = 100;
  return computeExpirationBucket(currentTime, expirationMs, bucketSizeMs);
}

export function recalculateCurrentTime() {
  mostRecentCurrentTime = msToExpirationTime(performance.now());
  return mostRecentCurrentTime;
}

export function computeExpirationForFiber(fiber) {
  let expirationTime;
  if (expirationContext !== NoWork) {
    // An explicit expiration context was set;
    expirationTime = expirationContext;
  } else if (isWorking) {
    if (isCommitting) {
      // Updates that occur during the commit phase should have sync priority
      // by default.
      expirationTime = Sync;
    } else {
      // Updates during the render phase should expire at the same time as
      // the work that is being rendered.
      expirationTime = nextRenderExpirationTime;
    }
  } else {
    // No explicit expiration context was set, and we're not currently
    // performing work. Calculate a new expiration time.
    if (fiber.mode & AsyncMode) {
      if (isBatchingInteractiveUpdates) {
        // This is an interactive update
        const currentTime = recalculateCurrentTime();
        expirationTime = computeInteractiveExpiration(currentTime);
      } else {
        // This is an async update
        const currentTime = recalculateCurrentTime();
        expirationTime = computeAsyncExpiration(currentTime);
      }
    } else {
      // This is a sync update
      expirationTime = Sync;
    }
  }
  if (isBatchingInteractiveUpdates) {
    // This is an interactive update. Keep track of the lowest pending
    // interactive expiration time. This allows us to synchronously flush
    // all interactive updates when needed.
    if (
      lowestPendingInteractiveExpirationTime === NoWork ||
      expirationTime > lowestPendingInteractiveExpirationTime
    ) {
      lowestPendingInteractiveExpirationTime = expirationTime;
    }
  }
  return expirationTime;
}

function resetChildExpirationTime(workInProgress, renderTime) {
  if (renderTime !== Never && workInProgress.expirationTime === Never) {
    // The children of this component are hidden. Don't bubble their
    // expiration times.
    return;
  }

  let newChildExpirationTime = NoWork;

  let child = workInProgress.child;
  while (child != null) {
    const childUpdateExpirationTime = child.expirationTime;
    const childChildExpirationTime = child.childExpirationTime;
    if (childUpdateExpirationTime > newChildExpirationTime) {
      newChildExpirationTime = childUpdateExpirationTime;
    }
    if (childChildExpirationTime > newChildExpirationTime) {
      newChildExpirationTime = childChildExpirationTime;
    }
    child = child.sibling;
  }
  workInProgress.childExpirationTime = newChildExpirationTime;
}

export function flushInteractiveUpdates() {
  if (!isRendering && lowestPendingInteractiveExpirationTime !== NoWork) {
    // Synchronously flush pending interactive updates.
    performWork(lowestPendingInteractiveExpirationTime, false, null);
    lowestPendingInteractiveExpirationTime = NoWork;
  }
}

export function batchedUpdates(fn, a) {
  const previousIsBatchingUpdates = isBatchingUpdates;
  isBatchingUpdates = true;
  try {
    return fn(a);
  } finally {
    isBatchingUpdates = previousIsBatchingUpdates;
    if (!isBatchingUpdates && !isRendering) {
      performSyncWork();
    }
  }
}

export function interactiveUpdates(fn, a, b) {
  if (isBatchingInteractiveUpdates) {
    return fn(a, b);
  }

  const previousIsBatchingInteractiveUpdates = isBatchingInteractiveUpdates;
  isBatchingInteractiveUpdates = true;
  try {
    return fn(a, b);
  } finally {
    isBatchingInteractiveUpdates = previousIsBatchingInteractiveUpdates;
  }
}

export function deferredUpdates(fn) {
  const previousExpirationContext = expirationContext;
  const currentTime = recalculateCurrentTime();
  expirationContext = computeAsyncExpiration(currentTime);
  try {
    return fn();
  } finally {
    expirationContext = previousExpirationContext;
  }
}
