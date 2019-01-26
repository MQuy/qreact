import { removeChild, appendChild } from "./DOMFiberEntry";
import {
  precacheFiberNode,
  updateFiberProps,
  updateDOMProperties,
} from "./DomComponent";
import { HostComponent, HostText, HostRoot } from "./TypeOfWork";

export function createTextInstance(text, internalInstanceHandle) {
  var textNode = document.createTextNode(text);
  precacheFiberNode(internalInstanceHandle, textNode);
  return textNode;
}

export function commitDeletion(current) {
  unmountHostComponents(current);

  current.return = null;
  current.child = null;
  if (current.alternate) {
    current.alternate.child = null;
    current.alternate.return = null;
  }
}

function unmountHostComponents(current) {
  let node = current;
  let currentParent;

  while (true) {
    currentParent = getHostParent(node);
    if (node.tag === HostComponent || node.tag === HostText) {
      removeChild(currentParent, node.stateNode);
    } else {
      if (node.child != null) {
        node.child.return = node;
        node = node.child;
        continue;
      }
    }
    if (node === current) {
      return;
    }
    while (node.sibling == null) {
      if (node.return == null || node.return === current) {
        return;
      }
      node = node.return;
    }
    node.sibling.return = node.return;
    node = node.sibling;
  }
}

export function commitPlacement(finishedWork) {
  const parent = getHostParent(finishedWork);
  let node = finishedWork;
  while (true) {
    if (node.tag === HostComponent || node.tag === HostText) {
      appendChild(parent, node.stateNode);
    } else if (node.child != null) {
      node.child.return = node;
      node = node.child;
      continue;
    }
    while (true) {
      if (node.return == null || node.return === finishedWork) {
        return;
      }
      node = node.return;
    }
  }
}

export function commitWork(finishedWork) {
  switch (finishedWork.tag) {
    case HostComponent: {
      const instance = finishedWork.stateNode;
      if (instance != null) {
        const newProps = finishedWork.memoizedProps;
        const updatePayload = finishedWork.updateQueue;
        finishedWork.updateQueue = null;
        if (updatePayload != null) {
          commitUpdate(instance, updatePayload, newProps);
        }
      }
      return;
    }
    case HostText: {
      const textInstance = finishedWork.stateNode;
      const newText = finishedWork.memoizedProps;
      textInstance.nodeValue = newText;
      return;
    }
  }
}

function commitUpdate(domElement, updatePayload, newProps) {
  updateFiberProps(domElement, newProps);
  updateDOMProperties(domElement, updatePayload);
}

function getHostParent(fiber) {
  let parent = fiber.return;

  while (true) {
    switch (parent.tag) {
      case HostComponent:
        return parent.stateNode;
      case HostRoot:
        return parent.stateNode.containerInfo;
    }
    parent = parent.return;
  }
}
