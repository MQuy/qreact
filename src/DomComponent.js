import DOM from './DOM';
import instantiateComponent from './instantiateComponent';

class DomComponent {
  constructor(element) {
    this._element = element;
    this._domNode = null;
  }
  instantiate() {
    const { type, props } = this._element;

    this._domNode = document.createElement(type);
    this._updateDOMProperties({}, props);
    this._createInitialDOMChildren(props);

    return this;
  }
  getInternalDom() {
    return this._domNode;
  }
  _createInitialDOMChildren(props) {
    const { children } = props;

    if (['string', 'number'].indexOf(typeof children) !== -1) {
      this._domNode.textContent = children;
    } else {
      this._renderedChildren = children.map((child) => instantiateComponent(child));
      this._renderedChildren.forEach((child) => child.instantiate());

      const domChildren = this._renderedChildren.map((child) => child.getInternalDom());

      DOM.appendChildren(this._domNode, domChildren);
    }
  }
  _updateDOMProperties(prevProps, nextProps) {
    const isEvent = name => name.startsWith("on");
    const isAttribute = name =>
      !isEvent(name) && name != "children" && name != "style";

    Object.keys(prevProps)
    .filter(isEvent)
    .forEach(name => {
      const eventType = name.toLowerCase().substring(2);
      this._domNode.removeEventListener(eventType, prevProps[name]);
    });

    Object.keys(prevProps)
      .filter(isAttribute)
      .forEach(name => {
        this._domNode[name] = null;
      });

    Object.keys(nextProps)
      .filter(isAttribute)
      .forEach(name => {
        this._domNode[name] = nextProps[name];
      });

    Object.keys(nextProps)
      .filter(isEvent)
      .forEach(name => {
        const eventType = name.toLowerCase().substring(2);
        this._domNode.addEventListener(eventType, nextProps[name]);
      });
  }
}

export default DomComponent;