import instantiateComponent from './instantiateComponent';

class Component {
  constructor(props) {
    this.props = props;
    this.state = {};
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
  setInternalElement(element) {
    this._element = element;
  }
}

export default Component;