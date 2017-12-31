export default function createElement(type, config, ...args) {
  const props = Object.assign({}, config);
  const children = args.length > 0 ? [].concat(...args) : [];

  props.children =
    children
      .filter((child) => child)
      .map((child) => child instanceof Object ? child : createElement('TEXT_ELEMENT', { nodeValue: child }));
      
  return { type, props };
}