import DOM from './DOM';
import instantiateComponent from './instantiateComponent';

const DOM_KEY = 'QREACT';
const reactInstances = {};
let incrementId = 0;

function isRendered(node) {
  return node[DOM_KEY];
}

function render(element, node) {
  if (!isRendered(node)) {
    mount(element, node);
  } else {
    update(element, node);
  }
}

function mount(element, node) {
  node[DOM_KEY] = incrementId;

  const component = instantiateComponent(element);
  
  reactInstances[incrementId] = component;
  component.instantiate();

  DOM.empty(node);
  DOM.appendChild(node, component.getInternalDom());

  incrementId++;
}

export default render;