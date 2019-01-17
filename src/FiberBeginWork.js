import { cloneChildFibers, mountChildFibersInPlace, reconcileChildFibers, reconcileChildFibersInPlace } from "./ChildFiber";
import { ReactInstanceMap } from "./Component";
import { Placement, PerformedWork } from "./TypeOfSideEffect";

export function updateHostRoot(current, workInProgress) {
  let updateQueue = workInProgress.updateQueue;
  if (updateQueue != null) {
    let state = beginUpdateQueue(workInProgress, updateQueue, workInProgress.memoizedState);
    let element = state.element;
    if (current == null || current.child == null) {
      workInProgress.effectTag |= Placement;
      workInProgress.child = mountChildFibersInPlace(workInProgress, workInProgress.child, element);
    } else {
      reconcileChildren(current, workInProgress, element);
    }
    workInProgress.memoizedState = state;
    return workInProgress.child;
  }
  return bailoutOnAlreadyFinishedWork(workInProgress);
}

export function updateFunctionalComponent(current, workInProgress) {
  let fn = workInProgress.type;
  let nextProps = workInProgress.pendingProps;

  const memoizedProps = workInProgress.memoizedProps;

  if (nextProps == null || memoizedProps === nextProps) {
    return bailoutOnAlreadyFinishedWork(workInProgress);
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
  workInProgress.memoizedProps = workInProgress.pendingProps || workInProgress.memoizedProps;
  return null;
}

export function updateHostComponent(current, workInProgress) {
  if (current == null) {
    workInProgress.effectTag |= Placement;
  }
  const memoizedProps = workInProgress.memoizedProps;
  let nextProps = workInProgress.pendingProps || memoizedProps;

  if (nextProps == null || memoizedProps === nextProps) {
    return bailoutOnAlreadyFinishedWork(workInProgress);
  }

  let nextChildren = nextProps.children;
  reconcileChildren(current, workInProgress, nextChildren);
  workInProgress.memoizedProps = nextProps;
  return workInProgress.child;
}

export function updateClassComponent(current, workInProgress) {
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
    shouldUpdate = updateClassInstance(workInProgress);
  }
  return finishClassComponent(current, workInProgress, shouldUpdate);
}

function updateClassInstance(workInProgress) {
  const instance = workInProgress.stateNode;
  const oldProps = workInProgress.memoizedProps;
  const newProps = workInProgress.pendingProps || oldProps;
  const oldState = workInProgress.memoizedState;
  const newState = beginUpdateQueue(workInProgress, workInProgress.updateQueue, oldState);

  if (oldProps === newProps && oldState === newState && workInProgress.updateQueue == null) {
    return false;
  }
  instance.props = newProps;
  instance.state = newState;
  return true;
}

function beginUpdateQueue(workInProgress, queue, prevState) {
  let state = prevState;
  let update = queue ? queue.first : null;
  while (update != null) {
    queue.first = update.next;
    if (queue.first == null) {
      queue.last = null;
    }

    state = { ...state, ...update.partialState };
    update = update.next;
  }
  workInProgress.updateQueue = null;
  return state;
}

function finishClassComponent(current, workInProgress, shouldUpdate) {
  if (!shouldUpdate) {
    return bailoutOnAlreadyFinishedWork(workInProgress);
  }

  const instance = workInProgress.stateNode;
  const nextChildren = instance.render();

  workInProgress.effectTag |= PerformedWork;
  reconcileChildren(current, workInProgress, nextChildren);
  workInProgress.memoizedState = instance.state;
  workInProgress.memoizedProps = instance.props;
  return workInProgress.child;
}

function bailoutOnAlreadyFinishedWork(workInProgress) {
  cloneChildFibers(workInProgress);
  return workInProgress.child;
}

function reconcileChildren(current, workInProgress, nextChildren) {
  if (current == null) {
    workInProgress.child = mountChildFibersInPlace(workInProgress, workInProgress.child, nextChildren);
  } else if (current.child === workInProgress.child) {
    workInProgress.child = reconcileChildFibers(workInProgress, workInProgress.child, nextChildren);
  } else {
    workInProgress.child = reconcileChildFibersInPlace(workInProgress, workInProgress.child, nextChildren);
  }
}
