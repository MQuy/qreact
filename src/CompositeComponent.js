import instantiateComponent from './instantiateComponent';
import ReactInstanceMap from './ReactInstanceMap';

class CompositeComponent {
  constructor(element) {
    this._currentElement = element;
    this._instance = null;
    this._renderedComponent = null;
  }
  updateComponent(nextElement) {
    if (this._currentElement.type != nextElement.type) {
      this.mountComponent(nextElement);
    } else {
      this._currentElement = nextElement;
      this._instance.props = nextElement.props;

      const currentRenderedElement = this._renderedComponent.getInternalElement();
      const nextRenderedElement = this._instance.render();

      if (currentRenderedElement.type == nextRenderedElement.type) {
        this._renderedComponent.updateComponent(nextRenderedElement);
      } else {
        const nextRenderedComponent = instantiateComponent(nextRenderedElement);

        nextRenderedComponent.instantiate();
        nextRenderedComponent.updateComponent(nextRenderedElement);
        this._renderedComponent = nextRenderedComponent;
      }
    }

  }
  mountComponent(nextElement) {
    const { type, props } = nextElement;

    this._currentElement = nextElement;
    this._instance = new type(props);

    ReactInstanceMap.set(this._instance, this);

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
  getInternalElement() {
    return this._currentElement;
  }
}

export default CompositeComponent;