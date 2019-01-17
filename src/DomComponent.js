import { listenTo, registrationNameDependencies } from "./EventEmitter";
import { setTextContent } from "./DOMFiberEntry";

const internalInstanceKey = "__reactInternalInstance";
const internalEventHandlersKey = "__reactEventHandlers";

export function setInitialProperties(domElement, tag, props) {
  switch (tag) {
    case "input":
    case "option":
    case "select":
    case "textarea":
      listenTo("onChange");
  }
  setInitialDOMProperties(domElement, props);
}

function setInitialDOMProperties(domElement, nextProps) {
  for (let propKey in nextProps) {
    const nextProp = nextProps[propKey];
    if (propKey === "children") {
      if (["string", "number"].includes(typeof nextProp)) {
        setTextContent(domElement, nextProp);
      }
    } else if (registrationNameDependencies.hasOwnProperty(propKey) && nextProp != null) {
      listenTo(propKey);
    } else {
      domElement.setAttribute(propKey, nextProp);
    }
  }
}

export function updateDOMProperties(domElement, updatePayload) {
  for (let i = 0; i < updatePayload.length; i += 2) {
    let propKey = updatePayload[i];
    let propValue = updatePayload[i + 1];
    if (propKey === "children") {
      setTextContent(domElement, propValue);
    } else if (propValue != null) {
      domElement.setAttribute(propKey, propValue);
    } else {
      domElement.removeAttribute(propKey);
    }
  }
}
export function diffProperties(lastRawProps, nextRawProps) {
  let updatePayload = null;
  let lastProps = lastRawProps;
  let nextProps = nextRawProps;
  for (let propKey in lastProps) {
    if (nextProps.hasOwnProperty(propKey) || !lastProps.hasOwnProperty(propKey) || lastProps[propKey] == null) {
      continue;
    }
    if (!registrationNameDependencies.hasOwnProperty(propKey)) {
      (updatePayload = updatePayload || []).push(propKey, null);
    }
  }
  for (let propKey in nextProps) {
    let nextProp = nextProps[propKey];
    let lastProp = lastProps != null ? lastProps[propKey] : undefined;
    if (!nextProps.hasOwnProperty(propKey) || nextProp === lastProp || (nextProp == null && lastProp == null)) {
      continue;
    }
    if (propKey === "children") {
      if (lastProp !== nextProp && (typeof nextProp === "string" || typeof nextProp === "number")) {
        (updatePayload = updatePayload || []).push(propKey, "" + nextProp);
      }
    } else if (registrationNameDependencies.hasOwnProperty(propKey)) {
      if (nextProp != null) {
        listenTo(propKey);
      }
    } else {
      (updatePayload = updatePayload || []).push(propKey, nextProp);
    }
  }
  return updatePayload;
}

export function getClosestInstanceFromNode(node) {
  return node[internalInstanceKey];
}

export function getFiberCurrentPropsFromNode(node) {
  return node[internalEventHandlersKey];
}

export function updateFiberProps(node, props) {
  node[internalEventHandlersKey] = props;
}

export function precacheFiberNode(inst, node) {
  node[internalInstanceKey] = inst;
}
