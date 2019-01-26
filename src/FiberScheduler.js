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
import { getUpdateExpirationTime } from "./UpdateQueue";

const timeHeuristicForUnitOfWork = 1;
let nextFlushedRoot = null;
let lastScheduledRoot = null;
let nextUnitOfWork = null;
let nextEffect = null;
let isBatchingUpdates = false;
let isRendering = false;
let expirationContext = NoWork;
let isWorking = false;
let isCommitting = false;
let nextRenderExpirationTime = NoWork;
let mostRecentCurrentTime = msToExpirationTime(0);

export function scheduleWork(fiber, expirationTime) {
  let node = fiber;
  while (node != null) {
    if (
      node.expirationTime === NoWork ||
      node.expirationTime > expirationTime
    ) {
      node.expirationTime = expirationTime;
    }
    if (node.alternate != null) {
      if (
        node.alternate.expirationTime === NoWork ||
        node.alternate.expirationTime > expirationTime
      ) {
        node.alternate.expirationTime = expirationTime;
      }
    }
    if (node["return"] == null) {
      if (node.tag === HostRoot) {
        var root = node.stateNode;

        requestWork(root, expirationTime);
      } else {
        return;
      }
    }
    node = node["return"];
  }
}

function requestWork(root, expirationTime) {
  if (!nextFlushedRoot) {
    lastScheduledRoot = nextFlushedRoot = root;
    root.remainingExpirationTime = expirationTime;
  } else {
    const remainingExpirationTime = root.remainingExpirationTime;
    if (
      remainingExpirationTime === NoWork ||
      expirationTime < remainingExpirationTime
    ) {
      root.remainingExpirationTime = expirationTime;
    }
  }

  if (isBatchingUpdates || isRendering) {
    return;
  }
  if (expirationTime === Sync) {
    performWork(Sync, null);
  } else {
    requestIdleCallback(performAsyncWork);
  }
}

function performAsyncWork(deadline) {
  performWork(NoWork, deadline);
}

function performSyncWork() {
  performWork(Sync, null);
}

export function performWork(minExpirationTime, deadline) {
  if (lastScheduledRoot != null) {
    nextFlushedRoot = lastScheduledRoot;
  }
  if (
    minExpirationTime === NoWork ||
    nextFlushedRoot.remainingExpirationTime <= minExpirationTime
  ) {
    performWorkOnRoot(
      nextFlushedRoot,
      nextFlushedRoot.remainingExpirationTime,
      deadline,
    );
  }

  if (nextFlushedRoot.remainingExpirationTime == NoWork) {
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
    nextUnitOfWork = createWorkInProgress(root.current, null, expirationTime);
  }

  workLoop(expirationTime, deadline);

  isWorking = false;

  return root.isReadyForCommit ? root.current.alternate : null;
}

export function workLoop(expirationTime, deadline) {
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

    resetExpirationTime(workInProgress, nextRenderExpirationTime);

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

export function deferredUpdates(fn) {
  const previousExpirationContext = expirationContext;
  expirationContext = computeAsyncExpiration();
  try {
    return fn();
  } finally {
    expirationContext = previousExpirationContext;
  }
}

function computeAsyncExpiration() {
  const currentTime = recalculateCurrentTime();
  const expirationMs = 1000;
  const bucketSizeMs = 200;
  return computeExpirationBucket(currentTime, expirationMs, bucketSizeMs);
}

function recalculateCurrentTime() {
  mostRecentCurrentTime = msToExpirationTime(performance.now());
  return mostRecentCurrentTime;
}

export function computeExpirationForFiber(fiber) {
  let expirationTime;
  if (expirationContext !== NoWork) {
    expirationTime = expirationContext;
  } else if (isWorking) {
    if (isCommitting) {
      expirationTime = Sync;
    } else {
      expirationTime = nextRenderExpirationTime;
    }
  } else {
    expirationTime = Sync;
  }
  return expirationTime;
}

function resetExpirationTime(workInProgress, renderTime) {
  if (renderTime !== Never && workInProgress.expirationTime === Never) {
    // The children of this component are hidden. Don't bubble their
    // expiration times.
    return;
  }

  // Check for pending updates.
  let newExpirationTime = getUpdateExpirationTime(workInProgress);

  // TODO: Calls need to visit stateNode

  // Bubble up the earliest expiration time.
  let child = workInProgress.child;
  while (child != null) {
    if (
      child.expirationTime !== NoWork &&
      (newExpirationTime === NoWork || newExpirationTime > child.expirationTime)
    ) {
      newExpirationTime = child.expirationTime;
    }
    child = child.sibling;
  }
  workInProgress.expirationTime = newExpirationTime;
}
