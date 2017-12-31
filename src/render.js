let rootInstance = null;

export default function render(element, parentDom) {
  const prevInstance = rootInstance;
  const nextInstance = reconcile(parentDom, prevInstance, element);
  rootInstance = nextInstance;
}

export function reconcile(parentDom, prevInstance, element) {
  if (!prevInstance) {
    const newInstance = instantiate(element);
    parentDom.appendChild(newInstance.dom);
    return newInstance;
  } else if (!element) {
    parentDom.removeChild(prevInstance.dom);
    return null;
  } else if (prevInstance.element.type != element.type) {
    const newInstance = instantiate(element);
    parentDom.replaceChild(newInstance.dom, prevInstance.dom);
    return newInstance;
  } else if (typeof element.type == 'string') {
    updateDomProperties(prevInstance.dom, prevInstance.element.props, element.props);
    prevInstance.childInstances = reconcileChildren(prevInstance, element);
    prevInstance.element = element;
    return prevInstance;
  } else {
    prevInstance.publicInstance.props = element.props;
    const childElement = prevInstance.publicInstance.render();
    const oldChildInstance = prevInstance.childInstance;
    const childInstance = reconcile(parentDom, oldChildInstance, childElement);

    prevInstance.dom = childInstance.dom;
    prevInstance.childInstance = childInstance;
    prevInstance.element = element;
    return prevInstance;
  }
}

function reconcileChildren(instance, element) {
  const dom = instance.dom;
  const childInstances = instance.childInstances;
  const nextChildElements = element.props.children || [];
  const newChildInstances = [];
  const count = Math.max(childInstances.length, nextChildElements.length);

  for (let i = 0; i < count; i++) {
    const childInstance = childInstances[i];
    const childElement = nextChildElements[i];
    const newChildInstance = reconcile(dom, childInstance, childElement);
    newChildInstances.push(newChildInstance);
  }
  return newChildInstances;
}

function createPublicInstance(element, internalInstance) {
  const { type, props } = element;
  const publicInstance = new type(props);
  publicInstance.__internalInstance = internalInstance;
  return publicInstance;
}

function instantiate(element) {
  const { type, props } = element;

  if (typeof type === 'string') {
    const dom =
      type == "TEXT_ELEMENT" ?
        document.createTextNode("") :
        document.createElement(type);

    updateDomProperties(dom, [], props);

    const childElements = props.children || [];
    const childInstances = childElements.map(instantiate);
    
    childInstances
      .map((childInstance) => childInstance.dom)
      .forEach((childDom) => dom.appendChild(childDom));

    const instance = { dom, element, childInstances };
    return instance;
  } else {
    const instance = {};
    const publicInstance = createPublicInstance(element, instance);
    const childElement = publicInstance.render();
    const childInstance = instantiate(childElement);
    const dom = childInstance.dom;

    Object.assign(instance, { dom, element, childInstance, publicInstance });
    return instance;
  }
}

function updateDomProperties(dom, prevProps, nextProps) {
  const isEvent = (name) => name.startsWith("on");
  const isAttribute = (name) => !isEvent(name) && name != "children";

  Object.keys(prevProps)
    .filter(isEvent).forEach(name => {
      const eventType = name.toLowerCase().substring(2);
      dom.removeEventListener(eventType, prevProps[name]);
    });

  Object.keys(prevProps)
    .filter(isAttribute).forEach(name => {
      dom[name] = null;
    });

  Object.keys(nextProps)
    .filter(isEvent).forEach(name => {
      const eventType = name.toLowerCase().substring(2);
      dom.addEventListener(eventType, nextProps[name]);
    });

  Object.keys(nextProps)
    .filter(isAttribute)
    .forEach((propName) => dom[propName] = nextProps[propName]);
}