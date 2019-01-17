import { createWorkInProgress, createFiberFromElement, createFiberFromText } from "./Fiber";
import { NoEffect, Deletion, Placement } from "./TypeOfSideEffect";
import { HostText } from "./TypeOfWork";
import { REACT_ELEMENT_TYPE } from "./createElement";

function ChildReconciler(shouldClone, shouldTrackSideEffects) {
  function deleteChild(returnFiber, childToDelete) {
    if (!shouldTrackSideEffects) {
      return;
    }
    if (!shouldClone) {
      if (childToDelete.alternate == null) {
        return;
      }
      childToDelete = childToDelete.alternate;
    }
    const last = returnFiber.lastEffect;
    if (last != null) {
      last.nextEffect = childToDelete;
      returnFiber.lastEffect = childToDelete;
    } else {
      returnFiber.firstEffect = returnFiber.lastEffect = childToDelete;
    }
    childToDelete.nextEffect = null;
    childToDelete.effectTag = Deletion;
  }

  function placeChild(newFiber) {
    if (!shouldTrackSideEffects) {
      return;
    }
    newFiber.effectTag = Placement;
  }

  function deleteRemainingChildren(returnFiber, currentFirstChild) {
    if (!shouldTrackSideEffects) {
      return null;
    }

    let childToDelete = currentFirstChild;
    while (childToDelete != null) {
      deleteChild(returnFiber, childToDelete);
      childToDelete = childToDelete.sibling;
    }
    return null;
  }

  function useFiber(fiber) {
    if (shouldClone) {
      const clone = createWorkInProgress(fiber);
      clone.sibling = null;
      return clone;
    } else {
      fiber.effectTag = NoEffect;
      fiber.sibling = null;
      return fiber;
    }
  }

  function placeSingleChild(newFiber) {
    if (shouldTrackSideEffects && newFiber.alternate == null) {
      newFiber.effectTag = Placement;
    }
    return newFiber;
  }

  function createChild(returnFiber, newChild) {
    if (typeof newChild === "string" || typeof newChild === "number") {
      const created = createFiberFromText("" + newChild);
      created.return = returnFiber;
      return created;
    }

    if (typeof newChild === "object" && newChild != null) {
      const created = createFiberFromElement(newChild);
      created.return = returnFiber;
      return created;
    }

    return null;
  }

  function reconcileChildrenArray(returnFiber, currentFirstChild, newChildren) {
    let resultingFirstChild;
    let previousNewFiber;

    if (currentFirstChild == null) {
      for (let newIdx = 0; newIdx < newChildren.length; newIdx++) {
        const newFiber = createChild(returnFiber, newChildren[newIdx]);
        if (!newFiber) {
          continue;
        }
        placeChild(newFiber);
        if (previousNewFiber == null) {
          resultingFirstChild = newFiber;
        } else {
          previousNewFiber.sibling = newFiber;
        }
        previousNewFiber = newFiber;
      }
      return resultingFirstChild;
    } else {
      const keys = newChildren.map(child => child.key);
      let node = returnFiber.child;
      let previousNode;
      resultingFirstChild = returnFiber.child;
      while (node) {
        if (!keys.includes(node.key)) {
          if (node === returnFiber.child) {
            returnFiber.child = node.sibling;
          } else {
            previousNode.sibling = node.sibling;
          }
          deleteChild(returnFiber, node);
        }
        previousNode = node;
        node = node.sibling;
      }
    }
  }

  function reconcileSingleTextNode(returnFiber, currentFirstChild, textContent) {
    if (currentFirstChild != null && currentFirstChild.tag === HostText) {
      deleteRemainingChildren(returnFiber, currentFirstChild.sibling);
      const existing = useFiber(currentFirstChild);
      existing.pendingProps = textContent;
      existing.return = returnFiber;
      return existing;
    }
    deleteRemainingChildren(returnFiber, currentFirstChild);
    const created = createFiberFromText(textContent);
    created.return = returnFiber;
    return created;
  }

  function reconcileSingleElement(returnFiber, currentFirstChild, element) {
    const key = element.key;
    let child = currentFirstChild;
    while (child != null) {
      if (child.key === key) {
        if (child.type === element.type) {
          deleteRemainingChildren(returnFiber, child.sibling);
          const existing = useFiber(child);
          existing.pendingProps = element.props;
          existing.return = returnFiber;
          return existing;
        } else {
          deleteRemainingChildren(returnFiber, child);
          break;
        }
      } else {
        deleteChild(returnFiber, child);
      }
      child = child.sibling;
    }

    const created = createFiberFromElement(element);
    created.return = returnFiber;
    return created;
  }

  function reconcileChildFibers(returnFiber, currentFirstChild, newChild) {
    const isObject = typeof newChild === "object" && newChild != null;
    if (isObject && newChild.$$typeof === REACT_ELEMENT_TYPE) {
      return placeSingleChild(reconcileSingleElement(returnFiber, currentFirstChild, newChild));
    }

    if (typeof newChild === "string" || typeof newChild === "number") {
      return placeSingleChild(reconcileSingleTextNode(returnFiber, currentFirstChild, "" + newChild));
    }

    if (Array.isArray(newChild)) {
      return reconcileChildrenArray(returnFiber, currentFirstChild, newChild);
    }

    return deleteRemainingChildren(returnFiber, currentFirstChild);
  }

  return reconcileChildFibers;
}
export const reconcileChildFibers = ChildReconciler(true, true);

export const reconcileChildFibersInPlace = ChildReconciler(false, true);

export const mountChildFibersInPlace = ChildReconciler(false, false);

export function cloneChildFibers(workInProgress) {
  if (workInProgress.child == null) {
    return;
  }

  let currentChild = workInProgress.child;
  let newChild = createWorkInProgress(currentChild);
  newChild.pendingProps = currentChild.pendingProps;
  workInProgress.child = newChild;

  newChild.return = workInProgress;
  while (currentChild.sibling != null) {
    currentChild = currentChild.sibling;
    newChild = newChild.sibling = createWorkInProgress(currentChild);
    newChild.pendingProps = currentChild.pendingProps;
    newChild.return = workInProgress;
  }
  newChild.sibling = null;
}
