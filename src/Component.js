import { reconcile } from './render';

class Component {
  constructor(props) {
    this.props = props;
    this.state = this.state || {};
  }

  setState(partialState) {
    this.state = Object.assign({}, this.state, partialState);
    updateInstance(this.__internalInstance);
  }
}

function updateInstance(internalInstance) {
  const parentDom = internalInstance.dom.parentDom;
  const element = internalInstance.element;

  reconcile(parentDom, internalInstance, element);
}
export default Component