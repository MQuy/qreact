function empty(node) {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

function appendChild(dom, child) {
  dom.appendChild(child);
}

function appendChildren(node, children) {
  if (Array.isArray(children)) {
    children.forEach(child => appendChild(node, child));
  } else {
    appendChild(node, children);
  }
}

function replaceNode(node, newNode) {
  node.parentNode.replaceNode(newNode);
}

export default {
  empty,
  appendChild,
  appendChildren,
  replaceNode,
}