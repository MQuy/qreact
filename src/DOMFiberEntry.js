import { precacheFiberNode, updateFiberProps } from "./DomComponent";

const TEXT_NODE = 3;

export function appendChild(dom, child) {
  dom.appendChild(child);
}

export function replaceNode(node, newNode) {
  node.parentNode.replaceNode(newNode);
}

export function removeChild(node, child) {
  node.removeChild(child);
}

export function setTextContent(node, text) {
  if (text) {
    let firstChild = node.firstChild;

    if (firstChild && firstChild === node.lastChild && firstChild.nodeType === TEXT_NODE) {
      firstChild.nodeValue = text;
      return;
    }
  }
  node.textContent = text;
}

export function createInstance(type, props, rootContainerInstance, internalInstanceHandle) {
  const domElement = rootContainerInstance.ownerDocument.createElement(type);
  precacheFiberNode(internalInstanceHandle, domElement);
  updateFiberProps(domElement, props);
  return domElement;
}
