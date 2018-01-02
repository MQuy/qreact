import ReactInstanceMap from './ReactInstanceMap';

class Component {
  constructor(props) {
    this.props = props;
    this.state = {};
  }
  setState(partialState) {
    Object.assign(this.state, partialState);

    const component = ReactInstanceMap.get(this);
    
    component.updateComponent(component.getInternalElement());
  }
}

export default Component;