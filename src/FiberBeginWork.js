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

export function beginWork(current, workInProgress, renderExpirationTime) {
  switch (workInProgress.tag) {
    case FunctionalComponent:
      return updateFunctionalComponent(current, workInProgress);
    case ClassComponent:
      return updateClassComponent(
        current,
        workInProgress,
        renderExpirationTime,
      );
    case HostRoot:
      return updateHostRoot(current, workInProgress, renderExpirationTime);
    case HostComponent:
      return updateHostComponent(current, workInProgress);
    case HostText:
      return updateHostText(current, workInProgress);
    case Mode:
      return updateMode(current, workInProgress);
  }
}

export function updateHostRoot(current, workInProgress, renderExpirationTime) {
  let updateQueue = workInProgress.updateQueue;
  if (updateQueue != null) {
    let state = processUpdateQueue(
      current,
      workInProgress,
      updateQueue,
      null,
      null,
      renderExpirationTime,
    );
    reconcileChildren(current, workInProgress, state.element);
    workInProgress.memoizedState = state;
    return workInProgress.child;
  }
  return bailoutOnAlreadyFinishedWork(current, workInProgress);
}

export function updateFunctionalComponent(current, workInProgress) {
  let fn = workInProgress.type;
  let nextProps = workInProgress.pendingProps;

  const memoizedProps = workInProgress.memoizedProps;

  if (nextProps == null || memoizedProps === nextProps) {
    return bailoutOnAlreadyFinishedWork(current, workInProgress);
  }

  nextChildren = fn(nextProps);

  workInProgress.effectTag |= PerformedWork;
  reconcileChildren(current, workInProgress, nextChildren);
  workInProgress.memoizedProps = nextProps;
  return workInProgress.child;
}

export function updateHostText(current, workInProgress) {
  if (current == null) {
    workInProgress.effectTag |= Placement;
  }
  workInProgress.memoizedProps =
    workInProgress.pendingProps || workInProgress.memoizedProps;
  return null;
}

export function updateHostComponent(current, workInProgress) {
  if (current == null) {
    workInProgress.effectTag |= Placement;
  }
  const memoizedProps = workInProgress.memoizedProps;
  let nextProps = workInProgress.pendingProps || memoizedProps;

  if (nextProps == null || memoizedProps === nextProps) {
    return bailoutOnAlreadyFinishedWork(current, workInProgress);
  }

  let nextChildren = nextProps.children;
  reconcileChildren(current, workInProgress, nextChildren);
  workInProgress.memoizedProps = nextProps;
  return workInProgress.child;
}

export function updateClassComponent(
  current,
  workInProgress,
  renderExpirationTime,
) {
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
  return finishClassComponent(current, workInProgress, shouldUpdate);
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

function finishClassComponent(current, workInProgress, shouldUpdate) {
  if (!shouldUpdate) {
    return bailoutOnAlreadyFinishedWork(current, workInProgress);
  }

  const instance = workInProgress.stateNode;
  const nextChildren = instance.render();

  workInProgress.effectTag |= PerformedWork;
  reconcileChildren(current, workInProgress, nextChildren);
  workInProgress.memoizedState = instance.state;
  workInProgress.memoizedProps = instance.props;
  return workInProgress.child;
}

function bailoutOnAlreadyFinishedWork(current, workInProgress) {
  cloneChildFibers(current, workInProgress);
  return workInProgress.child;
}

function reconcileChildren(current, workInProgress, nextChildren) {
  const renderExpirationTime = workInProgress.expirationTime;
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

function updateMode(current, workInProgress) {
  const nextChildren = workInProgress.pendingProps.children;
  if (nextChildren === null || workInProgress.memoizedProps === nextChildren) {
    return bailoutOnAlreadyFinishedWork(current, workInProgress);
  }
  reconcileChildren(current, workInProgress, nextChildren);
  workInProgress.memoizedProps = nextChildren;
  return workInProgress.child;
}
