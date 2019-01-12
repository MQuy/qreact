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

function removeChild(node, child) {
  node.removeChild(child);
}

export default {
  empty,
  appendChild,
  appendChildren,
  replaceNode,
  removeChild
};
