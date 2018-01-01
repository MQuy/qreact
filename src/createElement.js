function createElement(type, config, ...children) {
  const props = Object.assign({}, config);

  if (children.length > 0) {
    props.children = [].concat(...children);
  }

  return { type, props };
}

export default createElement;