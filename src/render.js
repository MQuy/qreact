import { HostRoot } from "./TypeOfWork";
import { insertUpdateIntoFiber, createUpdate } from "./UpdateQueue";
import { scheduleWork, computeExpirationForFiber } from "./FiberScheduler";
import { FiberNode } from "./Fiber";
import { NoWork } from "./FiberExpirationTime";
import { AsyncMode, NoContext, StrictMode } from "./TypeOfMode";

export function render(element, container) {
  let root = container._reactRootContainer;
  if (!root) {
    root = createFiberRoot(container, false);
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

function createFiberRoot(containerInfo, isAsync) {
  const mode = isAsync ? AsyncMode | StrictMode : NoContext;
  const uninitializedFiber = new FiberNode(HostRoot, null, null, mode);
  const root = {
    current: uninitializedFiber,
    containerInfo: containerInfo,
    isScheduled: false,
    remainingExpirationTime: NoWork,
  };
  uninitializedFiber.stateNode = root;
  return root;
}
