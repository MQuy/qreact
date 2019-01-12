import ReactUpdates from "./ReactUpdates";

class Component {
  constructor(props) {
    this.props = props;
    this.state = {};
  }

  setState(partialState) {
    ReactUpdates.enqueueUpdate(this, partialState);
  }
}

export default Component;
