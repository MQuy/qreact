import { NoEffect } from "./TypeOfSideEffect";
import {
  HostRoot,
  HostComponent,
  HostText,
  ClassComponent,
  Mode,
  FunctionalComponent,
} from "./TypeOfWork";
import { REACT_ASYNC_MODE_TYPE, REACT_STRICT_MODE_TYPE } from "./createElement";
import { AsyncMode, StrictMode } from "./TypeOfMode";
import { NoWork } from "./FiberExpirationTime";

export class FiberNode {
  constructor(tag, pendingProps, key, mode) {
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

    this.pendingProps = pendingProps;
    this.memoizedProps = null;
    this.updateQueue = null;
    this.memoizedState = null;

    this.mode = mode;

    // Effects
    this.effectTag = NoEffect;
    this.nextEffect = null;
    this.firstEffect = null;
    this.lastEffect = null;

    this.expirationTime = NoWork;
    this.childExpirationTime = NoWork;

    this.alternate = null;
  }
}

export function createWorkInProgress(current, pendingProps, expirationTime) {
  let workInProgress = current.alternate;
  if (workInProgress == null) {
    // We use a double buffering pooling technique because we know that we'll
    // only ever need at most two versions of a tree. We pool the "other" unused
    // node that we're free to reuse. This is lazily created to avoid allocating
    // extra objects for things that are never updated. It also allow us to
    // reclaim the extra memory if needed.
    workInProgress = new FiberNode(
      current.tag,
      pendingProps,
      current.key,
      current.mode,
    );
    workInProgress.type = current.type;
    workInProgress.stateNode = current.stateNode;

    workInProgress.alternate = current;
    current.alternate = workInProgress;
  } else {
    workInProgress.pendingProps = pendingProps;

    // We already have an alternate.
    // Reset the effect tag.
    workInProgress.effectTag = NoEffect;

    // The effect list is no longer valid.
    workInProgress.nextEffect = null;
    workInProgress.firstEffect = null;
    workInProgress.lastEffect = null;
  }

  // Don't touching the subtree's expiration time, which has not changed.
  workInProgress.childExpirationTime = current.childExpirationTime;
  if (pendingProps !== current.pendingProps) {
    // This fiber has new props.
    workInProgress.expirationTime = expirationTime;
  } else {
    // This fiber's props have not changed.
    workInProgress.expirationTime = current.expirationTime;
  }

  workInProgress.child = current.child;
  workInProgress.memoizedProps = current.memoizedProps;
  workInProgress.memoizedState = current.memoizedState;
  workInProgress.updateQueue = current.updateQueue;

  // These will be overridden during the parent's reconciliation
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

export function createFiberFromElement(element, mode, expirationTime) {
  let fiber;
  const type = element.type;
  const key = element.key;
  let pendingProps = element.props;

  let fiberTag;
  if (typeof type === "function") {
    if (shouldConstruct(type)) {
      fiberTag = ClassComponent;
    } else {
      fiberTag = FunctionalComponent;
    }
  } else if (typeof type === "string") {
    fiberTag = HostComponent;
  } else {
    switch (type) {
      case REACT_ASYNC_MODE_TYPE:
        fiberTag = Mode;
        mode |= AsyncMode | StrictMode;
        break;
      case REACT_STRICT_MODE_TYPE:
        fiberTag = Mode;
        mode |= StrictMode;
        break;
      default: {
        if (typeof type === "object" && type != null) {
          if (typeof type.tag === "number") {
            // Currently assumed to be a continuation and therefore is a
            // fiber already.
            // TODO: The yield system is currently broken for updates in
            // some cases. The reified yield stores a fiber, but we don't
            // know which fiber that is; the current or a workInProgress?
            // When the continuation gets rendered here we don't know if we
            // can reuse that fiber or if we need to clone it. There is
            // probably a clever way to restructure this.
            fiber = type;
            fiber.pendingProps = pendingProps;
            fiber.expirationTime = expirationTime;
            return fiber;
          }
        }
      }
    }
  }

  fiber = new FiberNode(fiberTag, pendingProps, key, mode);
  fiber.type = type;
  fiber.expirationTime = expirationTime;

  return fiber;
}

export function createFiberFromText(content, mode, expirationTime) {
  const fiber = new FiberNode(HostText, content, null, mode);
  fiber.pendingProps = content;
  fiber.expirationTime = expirationTime;

  return fiber;
}

function shouldConstruct(Component) {
  const prototype = Component.prototype;
  return !!(prototype && prototype.isReactComponent);
}
