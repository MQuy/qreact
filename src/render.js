import { HostRoot } from "./TypeOfWork";
import { enqueueUpdate, createUpdate } from "./UpdateQueue";
import { scheduleUpdate, performWork } from "./FiberScheduler";
import { FiberNode } from "./Fiber";

export function render(element, container) {
  let root = container._reactRootContainer;
  if (!root) {
    root = createFiberRoot(container);
    container._reactRootContainer = root;
  }
  updateContainer(element, root);
}

function updateContainer(element, root) {
  const current = root.current;
  const update = createUpdate({ element });

  enqueueUpdate(current, update);
  scheduleUpdate(current);
  requestIdleCallback(performWork);
}

function createFiberRoot(containerInfo) {
  let uninitializedFiber = new FiberNode(HostRoot);
  var root = {
    current: uninitializedFiber,
    containerInfo: containerInfo,
    isScheduled: false,
    nextScheduledRoot: null
  };
  uninitializedFiber.stateNode = root;
  return root;
}
