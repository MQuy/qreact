function createElement(type, config, ...children) {
  const props = Object.assign({}, config);

  if (children.length > 0) {
    props.children = [].concat(...children);
  }

  if (Array.isArray(props.children)) {
    props.children = props.children.map((child) => mapElement(child));
  } else if (type != 'TEXT_ELEMENT') {
    props.children = mapElement(props.children);
  }

  return { type, props };
}

function mapElement(child) {
  return child instanceof Object ? child : createElement('TEXT_ELEMENT', { children: child });
}

export default createElement;