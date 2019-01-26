import { HostRoot } from "./TypeOfWork";
import { insertUpdateIntoFiber, createUpdate } from "./UpdateQueue";
import { scheduleWork, computeExpirationForFiber } from "./FiberScheduler";
import { FiberNode } from "./Fiber";
import { NoWork } from "./FiberExpirationTime";

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
  const expirationTime = computeExpirationForFiber(current);
  const update = createUpdate({ element }, expirationTime);

  root.expirationTime = expirationTime;
  insertUpdateIntoFiber(current, update);
  scheduleWork(current, expirationTime);
}

function createFiberRoot(containerInfo) {
  let uninitializedFiber = new FiberNode(HostRoot);
  var root = {
    current: uninitializedFiber,
    containerInfo: containerInfo,
    isScheduled: false,
    remainingExpirationTime: NoWork,
  };
  uninitializedFiber.stateNode = root;
  return root;
}
