import { createWorkInProgress, getRootFromFiber } from "./Fiber";
import { FunctionalComponent, ClassComponent, HostRoot, HostComponent, HostText } from "./TypeOfWork";
import { completeWork } from "./FiberCompleteWork";
import { PerformedWork, Placement, Update, PlacementAndUpdate, Deletion } from "./TypeOfSideEffect";
import { commitPlacement, commitDeletion, commitWork } from "./FiberCommitWork";
import {
  updateClassComponent,
  updateFunctionalComponent,
  updateHostComponent,
  updateHostRoot,
  updateHostText
} from "./FiberBeginWork";

const timeHeuristicForUnitOfWork = 1;
let nextScheduledRoot = null;
let nextUnitOfWork = null;
let nextEffect = null;
let pendingCommit = null;

export function scheduleUpdate(fiber) {
  let root = getRootFromFiber(fiber);
  if (!root.isScheduled) {
    root.isScheduled = true;
    nextScheduledRoot = root;
  }
}

export function performWork(deadline) {
  workLoop(deadline);

  if (nextUnitOfWork) {
    requestIdleCallback(performWork);
  }
}

export function workLoop(deadline) {
  if (pendingCommit != null) {
    commitAllWork(pendingCommit);
  } else if (nextUnitOfWork == null) {
    resetNextUnitOfWork();
  }
  while (nextUnitOfWork != null && deadline.timeRemaining() > timeHeuristicForUnitOfWork) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    if (nextUnitOfWork == null) {
      if (deadline.timeRemaining() > timeHeuristicForUnitOfWork) {
        commitAllWork(pendingCommit);
      } else {
        requestIdleCallback(performWork);
      }
    }
  }
}

function resetNextUnitOfWork() {
  if (nextScheduledRoot != null && nextScheduledRoot.isScheduled === false) {
    nextScheduledRoot = null;
    return;
  }

  nextUnitOfWork = createWorkInProgress(nextScheduledRoot.current);
}

function performUnitOfWork(workInProgress) {
  const current = workInProgress.alternate;
  let next = beginWork(current, workInProgress);
  if (next == null) {
    next = completeUnitOfWork(workInProgress);
  }
  return next;
}

function completeUnitOfWork(workInProgress) {
  while (true) {
    let current = workInProgress.alternate;
    let next = completeWork(current, workInProgress);

    let returnFiber = workInProgress.return;
    let siblingFiber = workInProgress.sibling;

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
      pendingCommit = workInProgress;
      return null;
    }
  }
}

function beginWork(current, workInProgress) {
  switch (workInProgress.tag) {
    case FunctionalComponent:
      return updateFunctionalComponent(current, workInProgress);
    case ClassComponent:
      return updateClassComponent(current, workInProgress);
    case HostRoot:
      return updateHostRoot(current, workInProgress);
    case HostComponent:
      return updateHostComponent(current, workInProgress);
    case HostText:
      return updateHostText(current, workInProgress);
  }
}

function commitAllWork(finishedWork) {
  pendingCommit = null;
  let root = finishedWork.stateNode;

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
  root.isScheduled = false;
  resetNextUnitOfWork();
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
