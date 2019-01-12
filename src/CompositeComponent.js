import instantiateComponent from "./instantiateComponent";

class CompositeComponent {
  constructor(element) {
    this._currentElement = element;
    this._instance = null;
    this._renderedComponent = null;
    this._pendingStateQueue = [];
  }

  updateComponent(nextElement) {
    if (this._currentElement.type != nextElement.type) {
      this.mountComponent(nextElement);
    } else {
      this._currentElement = nextElement;
      this._instance.props = nextElement.props;
      this._instance.state = this._pendingStateQueue.reduce(
        (acc, value) => Object.assign({}, acc, value),
        this._instance.state
      );
      this._pendingStateQueue = [];

      const currentRenderedElement = this._renderedComponent._currentElement;
      const nextRenderedElement = this._instance.render();

      if (currentRenderedElement.type == nextRenderedElement.type) {
        this._renderedComponent.updateComponent(nextRenderedElement);
      } else {
        const nextRenderedComponent = instantiateComponent(nextRenderedElement);

        nextRenderedComponent.mountComponent();
        nextRenderedComponent.updateComponent(nextRenderedElement);
        this._renderedComponent = nextRenderedComponent;
      }
    }
  }

  mountComponent(nextElement) {
    const { type, props } = nextElement;

    this._currentElement = nextElement;
    this._instance = new type(props);
    this._instance._reactInternalInstance = this;

    const renderedElement = this._instance.render();
    const renderedComponent = instantiateComponent(renderedElement);

    this._renderedComponent = renderedComponent;
    renderedComponent.mountComponent(renderedElement);
  }

  ummountComponent() {
    this._currentElement = null;
    this._instance = null;
    this._renderedComponent = null;
  }

  getInternalDom() {
    return this._renderedComponent.getInternalDom();
  }
}

export default CompositeComponent;
