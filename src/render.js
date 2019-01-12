import DOM from "./DOM";
import instantiateComponent from "./instantiateComponent";

const internalInstanceKey = "_qreact_";

function isRendered(node) {
  return node[internalInstanceKey];
}

function render(element, node) {
  if (!isRendered(node)) {
    mount(element, node);
  } else {
    update(element, node);
  }
}

function mount(element, node) {
  const component = instantiateComponent(element);

  node[internalInstanceKey] = component;
  component.mountComponent(element);

  DOM.empty(node);
  DOM.appendChild(node, component.getInternalDom());
}

function update(element, node) {
  const component = node[internalInstanceKey];

  component.updateComponent(element);
}

export default render;
