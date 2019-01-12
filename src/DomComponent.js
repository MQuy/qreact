import DOM from "./DOM";
import instantiateComponent from "./instantiateComponent";
import ReactEventEmitter from "./ReactEventEmitter";

let globalIdCounter = 0;

class DomComponent {
  constructor(element) {
    this._currentElement = element;
    this._domNode = null;
    this._rootNodeID = 0;
  }

  mountComponent() {
    const { type, props } = this._currentElement;

    if (type == "TEXT_ELEMENT") {
      this._domNode = document.createTextNode("");
    } else {
      this._domNode = document.createElement(type);
    }
    this._rootNodeID = globalIdCounter++;
    this._domNode.__reactInternalInstance = this;
    this._updateDOMProperties({}, props);
    this._createInitialDOMChildren(props);
  }

  updateComponent(nextElement) {
    if (this._currentElement.type == nextElement.type) {
      this._updateDOMProperties(this._currentElement.props, nextElement.props);
      this._currentElement = nextElement;
      this._updateDOMChildren();
    } else {
      this._currentElement = nextElement;
      this.instantiate();
    }
  }

  ummountComponent() {
    this._currentElement = null;
    this._domNode = null;
  }

  _updateDOMChildren() {
    const { children } = this._currentElement.props;

    if (["string", "number"].indexOf(typeof children) !== -1) {
      this._domNode.textContent = children;
    } else {
      const count = Math.max(children.length, this._renderedChildren.length);

      for (let i = 0; i < count; ++i) {
        const childElement = children[i];
        const renderedComponent = this._renderedChildren[i];

        if (!renderedComponent) {
          const component = instantiateComponent(childElement);

          component.mountComponent(childElement);
          this._renderedChildren.push(component);
          DOM.appendChild(this._domNode, component.getInternalDom());
        } else if (!childElement) {
          this._renderedChildren[i] = null;
          DOM.removeChild(this._domNode, renderedComponent.getInternalDom());
          renderedComponent.ummountComponent();
        } else {
          renderedComponent.updateComponent(childElement);
        }
      }

      this._renderedChildren = this._renderedChildren.filter(child => child);
    }
  }

  _createInitialDOMChildren(props) {
    const { children } = props;

    if (["string", "number"].indexOf(typeof children) !== -1) {
      this._domNode.textContent = children;
    } else {
      this._renderedChildren = children.map(childElement => {
        const component = instantiateComponent(childElement);

        component.mountComponent(childElement);
        return component;
      });

      const domChildren = this._renderedChildren.map(child => child.getInternalDom());

      DOM.appendChildren(this._domNode, domChildren);
    }
  }

  _updateDOMProperties(prevProps, nextProps) {
    const isEvent = name => name.startsWith("on");
    const isAttribute = name => !isEvent(name) && name != "children" && name != "style";

    Object.keys(prevProps)
      .filter(isEvent)
      .forEach(name => {
        ReactEventEmitter.removeQueue(this._rootNodeID, name);
      });

    Object.keys(prevProps)
      .filter(isAttribute)
      .forEach(name => {
        this._domNode.removeAttribute(name);
      });

    Object.keys(nextProps)
      .filter(isAttribute)
      .forEach(name => {
        this._domNode.setAttribute(name, nextProps[name]);
      });

    Object.keys(nextProps)
      .filter(isEvent)
      .forEach(name => {
        ReactEventEmitter.addQueue(this._rootNodeID, name, nextProps[name]);
        ReactEventEmitter.listenTo(name);
      });
  }

  getInternalDom() {
    return this._domNode;
  }
}

export default DomComponent;
