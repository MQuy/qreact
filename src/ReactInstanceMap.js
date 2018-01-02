const ReactInstanceMap = {
  remove(instance) {
    instance._reactInternalInstance = undefined; 
  },
  get(instance) {
    return instance._reactInternalInstance;
  },
  set(instance, component) {
    instance._reactInternalInstance = component;
  }
}

export default ReactInstanceMap;