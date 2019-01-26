import { NoEffect } from "./TypeOfSideEffect";
import {
  HostRoot,
  HostComponent,
  HostText,
  ClassComponent,
} from "./TypeOfWork";

export class FiberNode {
  constructor(tag, key) {
    // Instance
    this.tag = tag;
    this.key = key;
    this.type = null;
    this.stateNode = null;
    // Fiber
    this.return = null;
    this.child = null;
    this.sibling = null;
    this.index = 0;
    this.ref = null;
    this.pendingProps = null;
    this.memoizedProps = null;
    this.updateQueue = null;
    this.memoizedState = null;
    // Effects
    this.effectTag = NoEffect;
    this.nextEffect = null;
    this.firstEffect = null;
    this.lastEffect = null;
    this.alternate = null;
  }
}

export function createWorkInProgress(current, pendingProps, expirationTime) {
  let workInProgress = current.alternate;
  if (workInProgress == null) {
    workInProgress = new FiberNode(current.tag, current.key);
    workInProgress.type = current.type;
    workInProgress.stateNode = current.stateNode;

    workInProgress.alternate = current;
    current.alternate = workInProgress;
  } else {
    workInProgress.effectTag = NoEffect;

    workInProgress.nextEffect = null;
    workInProgress.firstEffect = null;
    workInProgress.lastEffect = null;
  }

  workInProgress.expirationTime = expirationTime;
  workInProgress.pendingProps = pendingProps;

  workInProgress.child = current.child;
  workInProgress.memoizedProps = current.memoizedProps;
  workInProgress.memoizedState = current.memoizedState;
  workInProgress.updateQueue = current.updateQueue;

  workInProgress.sibling = current.sibling;
  workInProgress.index = current.index;
  workInProgress.ref = current.ref;

  return workInProgress;
}

export function getRootFromFiber(fiber) {
  let node = fiber;
  while (node != null) {
    if (node.return == null && node.tag === HostRoot) {
      break;
    }
    node = node.return;
  }
  return node ? node.stateNode : null;
}

export function createFiberFromElement(element, expirationTime) {
  const fiber = createFiberFromElementType(element.type, element.key);
  fiber.pendingProps = element.props;
  fiber.expirationTime = expirationTime;

  return fiber;
}

export function createFiberFromText(content, expirationTime) {
  const fiber = new FiberNode(HostText);
  fiber.pendingProps = content;
  fiber.expirationTime = expirationTime;

  return fiber;
}

function createFiberFromElementType(type, key) {
  let fiber;
  if (typeof type === "function") {
    fiber = new FiberNode(ClassComponent, key);
    fiber.type = type;
  } else if (typeof type === "string") {
    fiber = new FiberNode(HostComponent, key);
    fiber.type = type;
  } else if (
    typeof type === "object" &&
    type != null &&
    typeof type.tag === "number"
  ) {
    fiber = type;
  }
  return fiber;
}
