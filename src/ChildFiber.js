import { createWorkInProgress, createFiberFromElement, createFiberFromText } from "./Fiber";
import { NoEffect, Deletion, Placement } from "./TypeOfSideEffect";
import { HostText } from "./TypeOfWork";
import { REACT_ELEMENT_TYPE } from "./createElement";

function ChildReconciler(shouldClone, shouldTrackSideEffects) {
  // For array child reconcilation
  function updateSlot(returnFiber, oldFiber, newChild) {
    const key = oldFiber != null ? oldFiber.key : null;

    if (typeof newChild === "string" || typeof newChild === "number") {
      if (key != null) {
        return null;
      }
      return updateTextNode(returnFiber, oldFiber, "" + newChild);
    }

    if (typeof newChild === "object" && newChild != null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE: {
          if (newChild.key === key) {
            return updateElement(returnFiber, oldFiber, newChild);
          } else {
            return null;
          }
        }
      }
    }
  }

  // For array child reconcilation
  function updateFromMap(existingChildren, returnFiber, newIdx, newChild) {
    if (typeof newChild === "string" || typeof newChild === "number") {
      const matchedFiber = existingChildren.get(newIdx) || null;
      return updateTextNode(returnFiber, matchedFiber, "" + newChild);
    }

    if (typeof newChild === "object" && newChild != null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE: {
          const matchedFiber = existingChildren.get(newChild.key == null ? newIdx : newChild.key) || null;
          return updateElement(returnFiber, matchedFiber, newChild);
        }
      }
    }

    return null;
  }

  // For array child reconcilation
  function updateTextNode(returnFiber, current, textContent) {
    if (current == null || current.tag !== HostText) {
      // Insert
      const created = createFiberFromText(textContent);
      created.return = returnFiber;
      return created;
    } else {
      // Update
      const existing = useFiber(current);
      existing.pendingProps = textContent;
      existing.return = returnFiber;
      return existing;
    }
  }

  // For array child reconcilation
  function updateElement(returnFiber, current, element) {
    if (current == null || current.type !== element.type) {
      // Insert
      const created = createFiberFromElement(element);
      created.ref = coerceRef(current, element);
      created.return = returnFiber;
      return created;
    } else {
      // Move based on index
      const existing = useFiber(current);
      existing.pendingProps = element.props;
      existing.return = returnFiber;
      return existing;
    }
  }

  // For array child reconcilation
  function mapRemainingChildren(returnFiber, currentFirstChild) {
    const existingChildren = new Map();

    let existingChild = currentFirstChild;
    while (existingChild != null) {
      if (existingChild.key != null) {
        existingChildren.set(existingChild.key, existingChild);
      } else {
        existingChildren.set(existingChild.index, existingChild);
      }
      existingChild = existingChild.sibling;
    }
    return existingChildren;
  }

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

  function placeChild(newFiber, lastPlacedIndex, newIndex) {
    newFiber.index = newIndex;
    if (!shouldTrackSideEffects) {
      return;
    }
    const current = newFiber.alternate;
    if (current !== null) {
      const oldIndex = current.index;
      if (oldIndex < lastPlacedIndex) {
        // This is a move.
        newFiber.effectTag = Placement;
        return lastPlacedIndex;
      } else {
        // This item can stay in place.
        return oldIndex;
      }
    } else {
      // This is an insertion.
      newFiber.effectTag = Placement;
      return lastPlacedIndex;
    }
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
    let resultingFirstChild = null;
    let previousNewFiber = null;

    let oldFiber = currentFirstChild;
    let lastPlacedIndex = 0;
    let newIdx = 0;
    let nextOldFiber = null;
    for (; oldFiber != null && newIdx < newChildren.length; newIdx++) {
      if (oldFiber.index > newIdx) {
        nextOldFiber = oldFiber;
        oldFiber = null;
      } else {
        nextOldFiber = oldFiber.sibling;
      }
      const newFiber = updateSlot(returnFiber, oldFiber, newChildren[newIdx]);
      if (newFiber == null) {
        if (oldFiber == null) {
          oldFiber = nextOldFiber;
        }
        break;
      }
      if (shouldTrackSideEffects) {
        if (oldFiber && newFiber.alternate == null) {
          deleteChild(returnFiber, oldFiber);
        }
      }
      lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
      if (previousNewFiber == null) {
        resultingFirstChild = newFiber;
      } else {
        previousNewFiber.sibling = newFiber;
      }
      previousNewFiber = newFiber;
      oldFiber = nextOldFiber;
    }

    if (newIdx === newChildren.length) {
      deleteRemainingChildren(returnFiber, oldFiber);
      return resultingFirstChild;
    }

    if (oldFiber == null) {
      for (; newIdx < newChildren.length; newIdx++) {
        const newFiber = createChild(returnFiber, newChildren[newIdx]);
        if (!newFiber) {
          continue;
        }
        lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
        if (previousNewFiber == null) {
          resultingFirstChild = newFiber;
        } else {
          previousNewFiber.sibling = newFiber;
        }
        previousNewFiber = newFiber;
      }
      return resultingFirstChild;
    }

    const existingChildren = mapRemainingChildren(returnFiber, oldFiber);

    for (; newIdx < newChildren.length; newIdx++) {
      const newFiber = updateFromMap(existingChildren, returnFiber, newIdx, newChildren[newIdx]);
      if (newFiber) {
        if (shouldTrackSideEffects) {
          if (newFiber.alternate != null) {
            existingChildren.delete(newFiber.key == null ? newIdx : newFiber.key);
          }
        }
        lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
        if (previousNewFiber == null) {
          resultingFirstChild = newFiber;
        } else {
          previousNewFiber.sibling = newFiber;
        }
        previousNewFiber = newFiber;
      }
    }

    if (shouldTrackSideEffects) {
      existingChildren.forEach(child => deleteChild(returnFiber, child));
    }

    return resultingFirstChild;
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
