const dirtyComponents = [];

function enqueueUpdate(instance, partialState) {
  const component = instance._reactInternalInstance;
  
  component._pendingStateQueue.push(partialState);
  dirtyComponents.push(component);
}

function flushUpdates() {
  dirtyComponents.forEach((component) => {
    component.updateComponent(component._currentElement);
  })
}

export default {
  enqueueUpdate,
  flushUpdates,
}