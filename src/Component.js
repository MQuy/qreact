import instantiateComponent from './instantiateComponent';

class Component {
  constructor(props) {
    this.props = props;
    this.state = {};
  }
  setState(partialState) {
    Object.assign(this.state, partialState);
    this.reconcile();
  }
  reconcile() {
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