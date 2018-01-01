import instantiateComponent from './instantiateComponent';

class Component {
  constructor(props) {
    this.props = props;
    this.state = {};
  }
  setState(partialState) {
    Object.assign(this.state, partialState);
    this.reconcile(this._element);
  }
  reconcile(nextElement) {
    this._element = nextElement;
    this.props = nextElement.props;

    const currentRenderedElement = this._renderedComponent.getInternalElement();
    const nextRenderedElement = this.render();

    if (currentRenderedElement.type == nextRenderedElement.type) {
      this._renderedComponent.reconcile(nextRenderedElement);
    } else {
      const nextRenderedComponent = instantiateComponent(nextRenderedElement);

      nextRenderedComponent.instantiate();
      DOM.replaceNode(this._renderedComponent.getInternalDom(), nextRenderedComponent.getInternalDom());
      this._renderedComponent = nextRenderedComponent;
    }
  }
  instantiate() {
    const renderedElement = this.render();
    const renderedComponent = instantiateComponent(renderedElement);

    this._renderedComponent = renderedComponent;
    renderedComponent.instantiate();
  }
  getInternalDom() {
    return this._renderedComponent.getInternalDom();
  }
  getInternalElement() {
    return this._element;
  }
  setInternalElement(element) {
    this._element = element;
  }
}

export default Component;