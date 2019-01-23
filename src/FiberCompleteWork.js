import { setInitialProperties, diffProperties } from "./DomComponent";
import { Placement, Update } from "./TypeOfSideEffect";
import { getRootFromFiber } from "./Fiber";
import { createTextInstance } from "./FiberCommitWork";
import { createInstance, appendChild } from "./DOMFiberEntry";
import { FunctionalComponent, ClassComponent, HostRoot, HostComponent, HostText } from "./TypeOfWork";
import { Never } from "./FiberExpirationTime";

export function completeWork(current, workInProgress, renderExpirationTime) {
  let newProps = workInProgress.pendingProps;
  if (newProps == null) {
    newProps = workInProgress.memoizedProps;
  } else if (workInProgress.expirationTime !== Never || renderExpirationTime === Never) {
    // Reset the pending props, unless this was a down-prioritization.
    workInProgress.pendingProps = null;
  }

  switch (workInProgress.tag) {
    case FunctionalComponent:
      return null;
    case ClassComponent: {
      return null;
    }
    case HostRoot: {
      if (current == null || current.child == null) {
        workInProgress.effectTag &= ~Placement;
      }
      return null;
    }
    case HostComponent: {
      let root = getRootFromFiber(workInProgress);
      let rootContainerInstance = root.containerInfo;
      let type = workInProgress.type;
      if (current != null && workInProgress.stateNode != null) {
        let oldProps = current.memoizedProps;
        let updatePayload = diffProperties(oldProps, newProps);

        workInProgress.updateQueue = updatePayload;
        if (updatePayload) {
          workInProgress.effectTag |= Update;
        }
      } else {
        if (!newProps) {
          return null;
        }
        let instance = createInstance(type, newProps, rootContainerInstance, workInProgress);

        appendAllChildren(instance, workInProgress);
        setInitialProperties(instance, type, newProps, rootContainerInstance);
        workInProgress.stateNode = instance;
      }
      return null;
    }
    case HostText: {
      let newText = newProps;
      if (current && workInProgress.stateNode != null) {
        let oldText = current.memoizedProps;
        if (oldText !== newText) {
          workInProgress.effectTag |= Update;
        }
      } else {
        if (typeof newText !== "string") {
          return null;
        }
        workInProgress.stateNode = createTextInstance(newText, workInProgress);
      }
      return null;
    }
  }
}

function appendAllChildren(parent, workInProgress) {
  let node = workInProgress.child;
  while (node != null) {
    if (node.tag === HostComponent || node.tag === HostText) {
      appendChild(parent, node.stateNode);
    } else if (node.child != null) {
      node = node.child;
      continue;
    }
    if (node === workInProgress) {
      return;
    }
    while (node.sibling == null) {
      if (node.return == null || node.return === workInProgress) {
        return;
      }
      node = node.return;
    }
    node = node.sibling;
  }
}
