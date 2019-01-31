import {
  cloneChildFibers,
  reconcileChildFibers,
  mountChildFibers,
} from "./ChildFiber";
import { ReactInstanceMap } from "./Component";
import { Placement, PerformedWork } from "./TypeOfSideEffect";
import { processUpdateQueue } from "./UpdateQueue";
import {
  FunctionalComponent,
  ClassComponent,
  HostRoot,
  HostComponent,
  HostText,
  Mode,
} from "./TypeOfWork";
import { prepareToUseHooks, finishHooks, bailoutHooks } from "./FiberHooks";
import { NoWork } from "./FiberExpirationTime";

let didReceiveUpdate = false;

export function beginWork(current, workInProgress, renderExpirationTime) {
  const updateExpirationTime = workInProgress.expirationTime;

  if (current != null) {
    if (current.memoizedProps !== workInProgress.pendingProps) {
      didReceiveUpdate = true;
    } else if (updateExpirationTime < renderExpirationTime) {
      didReceiveUpdate = false;
      return bailoutOnAlreadyFinishedWork(
        current,
        workInProgress,
        renderExpirationTime,
      );
    }
  } else {
    didReceiveUpdate = false;
  }

  // Before entering the begin phase, clear the expiration time.
  workInProgress.expirationTime = NoWork;

  switch (workInProgress.tag) {
    case FunctionalComponent:
      const Component = workInProgress.type;
      return updateFunctionComponent(
        current,
        workInProgress,
        Component,
        renderExpirationTime,
      );
    case ClassComponent:
      return updateClassComponent(
        current,
        workInProgress,
        renderExpirationTime,
      );
    case HostRoot:
      return updateHostRoot(current, workInProgress, renderExpirationTime);
    case HostComponent:
      return updateHostComponent(current, workInProgress, renderExpirationTime);
    case HostText:
      return updateHostText(current, workInProgress);
    case Mode:
      return updateMode(current, workInProgress, renderExpirationTime);
  }
}

function updateHostRoot(current, workInProgress, renderExpirationTime) {
  const updateQueue = workInProgress.updateQueue;
  const nextProps = workInProgress.pendingProps;
  const prevState = workInProgress.memoizedState;
  const prevChildren = prevState != null ? prevState.element : null;
  processUpdateQueue(
    current,
    workInProgress,
    updateQueue,
    nextProps,
    null,
    renderExpirationTime,
  );
  const nextState = workInProgress.memoizedState;
  const nextChildren = nextState.element;

  if (nextChildren === prevChildren) {
    return bailoutOnAlreadyFinishedWork(
      current,
      workInProgress,
      renderExpirationTime,
    );
  }
  reconcileChildren(
    current,
    workInProgress,
    nextChildren,
    renderExpirationTime,
  );
  return workInProgress.child;
}

function updateFunctionComponent(
  current,
  workInProgress,
  Component,
  renderExpirationTime,
) {
  let fn = workInProgress.type;
  let nextProps = workInProgress.pendingProps;

  prepareToUseHooks(current, workInProgress, renderExpirationTime);
  let nextChildren = fn(nextProps);
  nextChildren = finishHooks(Component, nextProps, nextChildren);

  if (current != null && !didReceiveUpdate) {
    bailoutHooks(current, workInProgress, renderExpirationTime);
    return bailoutOnAlreadyFinishedWork(
      current,
      workInProgress,
      renderExpirationTime,
    );
  }

  workInProgress.effectTag |= PerformedWork;
  reconcileChildren(
    current,
    workInProgress,
    nextChildren,
    renderExpirationTime,
  );
  return workInProgress.child;
}

function updateHostText(current, workInProgress) {
  if (current == null) {
    workInProgress.effectTag |= Placement;
  }
  workInProgress.memoizedProps =
    workInProgress.pendingProps || workInProgress.memoizedProps;
  return null;
}

function updateHostComponent(current, workInProgress, renderExpirationTime) {
  if (current == null) {
    workInProgress.effectTag |= Placement;
  }
  const memoizedProps = workInProgress.memoizedProps;
  let nextProps = workInProgress.pendingProps || memoizedProps;
  let nextChildren = nextProps.children;
  reconcileChildren(
    current,
    workInProgress,
    nextChildren,
    renderExpirationTime,
  );
  return workInProgress.child;
}

function updateClassComponent(current, workInProgress, renderExpirationTime) {
  let shouldUpdate;
  if (current == null) {
    if (!workInProgress.stateNode) {
      const ctor = workInProgress.type;
      const instance = new ctor(workInProgress.pendingProps);

      workInProgress.stateNode = instance;
      ReactInstanceMap.set(instance, workInProgress);
      instance.props = workInProgress.pendingProps;
      instance.state = instance.state || null;
      shouldUpdate = true;
    }
  } else {
    shouldUpdate = updateClassInstance(
      current,
      workInProgress,
      renderExpirationTime,
    );
  }
  return finishClassComponent(
    current,
    workInProgress,
    shouldUpdate,
    renderExpirationTime,
  );
}

function updateClassInstance(current, workInProgress, renderExpirationTime) {
  const instance = workInProgress.stateNode;

  instance.props = workInProgress.memoizedProps;
  instance.state = workInProgress.memoizedState;

  const oldProps = workInProgress.memoizedProps;
  const newProps = workInProgress.pendingProps || oldProps;
  const oldState = workInProgress.memoizedState;
  let newState;
  if (workInProgress.updateQueue != null) {
    newState = processUpdateQueue(
      current,
      workInProgress,
      workInProgress.updateQueue,
      instance,
      newProps,
      renderExpirationTime,
    );
  } else {
    newState = oldState;
  }

  if (
    oldProps === newProps &&
    oldState === newState &&
    workInProgress.updateQueue == null
  ) {
    return false;
  }
  instance.props = newProps;
  instance.state = newState;
  return true;
}

function finishClassComponent(
  current,
  workInProgress,
  shouldUpdate,
  renderExpirationTime,
) {
  if (!shouldUpdate) {
    return bailoutOnAlreadyFinishedWork(
      current,
      workInProgress,
      renderExpirationTime,
    );
  }

  const instance = workInProgress.stateNode;
  const nextChildren = instance.render();

  workInProgress.effectTag |= PerformedWork;
  reconcileChildren(
    current,
    workInProgress,
    nextChildren,
    renderExpirationTime,
  );
  workInProgress.memoizedState = instance.state;
  return workInProgress.child;
}

function bailoutOnAlreadyFinishedWork(
  current,
  workInProgress,
  renderExpirationTime,
) {
  // Check if the children have any pending work.
  const childExpirationTime = workInProgress.childExpirationTime;
  if (
    childExpirationTime === NoWork ||
    childExpirationTime > renderExpirationTime
  ) {
    // The children don't have any work either. We can skip them.
    // TODO: Once we add back resuming, we should check if the children are
    // a work-in-progress set. If so, we need to transfer their effects.
    return null;
  } else {
    // This fiber doesn't have work, but its subtree does. Clone the child
    // fibers and continue.
    cloneChildFibers(current, workInProgress);
    return workInProgress.child;
  }
}

function reconcileChildren(
  current,
  workInProgress,
  nextChildren,
  renderExpirationTime,
) {
  if (current == null) {
    // If this is a fresh new component that hasn't been rendered yet, we
    // won't update its child set by applying minimal side-effects. Instead,
    // we will add them all to the child before it gets rendered. That means
    // we can optimize this reconciliation pass by not tracking side-effects.
    workInProgress.child = mountChildFibers(
      workInProgress,
      null,
      nextChildren,
      renderExpirationTime,
    );
  } else {
    // If the current child is the same as the work in progress, it means that
    // we haven't yet started any work on these children. Therefore, we use
    // the clone algorithm to create a copy of all the current children.

    // If we had any progressed work already, that is invalid at this point so
    // let's throw it out.
    workInProgress.child = reconcileChildFibers(
      workInProgress,
      current.child,
      nextChildren,
      renderExpirationTime,
    );
  }
}

function updateMode(current, workInProgress, renderExpirationTime) {
  const nextChildren = workInProgress.pendingProps.children;
  reconcileChildren(
    current,
    workInProgress,
    nextChildren,
    renderExpirationTime,
  );
  return workInProgress.child;
}

export function markWorkInProgressReceivedUpdate() {
  didReceiveUpdate = true;
}
