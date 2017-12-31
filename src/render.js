export default function render(element, parentDom) {
  const { type, props } = element;
  const dom =
    type == "TEXT_ELEMENT" ?
      document.createTextNode("") :
      document.createElement(type);

  const isAttribute = (name) => name != "children";
  Object.keys(props)
    .filter(isAttribute)
    .forEach((propName) => dom[propName] = props[propName]);

  const childElements = props.children || [];

  childElements.forEach((childElement) => render(childElement, dom));

  parentDom.appendChild(dom);
}