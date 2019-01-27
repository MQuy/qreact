export const REACT_ELEMENT_TYPE = Symbol.for("react.element");
export const REACT_ASYNC_MODE_TYPE = Symbol.for("react.async_mode");
export const REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode");

export function createElement(type, config, children) {
  let propName;
  const props = {};
  let key;

  if (config != null) {
    if (config.key) {
      key = config.key;
    }
    for (propName in config) {
      props[propName] = config[propName];
    }
  }

  const childrenLength = arguments.length - 2;
  if (childrenLength === 1) {
    props.children = children;
  } else if (childrenLength > 1) {
    const childArray = Array(childrenLength);
    for (let i = 0; i < childrenLength; i++) {
      childArray[i] = arguments[i + 2];
    }
    props.children = childArray;
  }

  return {
    $$typeof: REACT_ELEMENT_TYPE,
    type,
    key,
    props,
  };
}
