import {
  batchedUpdates,
  flushInteractiveUpdates,
  interactiveUpdates,
} from "./FiberScheduler";
import {
  getClosestInstanceFromNode,
  getFiberCurrentPropsFromNode,
} from "./DomComponent";

const alreadyListeningTo = {};
export const registrationNameDependencies = {
  onChange: [
    "blur",
    "change",
    "click",
    "focus",
    "input",
    "keydown",
    "keyup",
    "selectionchange",
  ],
  onClick: ["click"],
};
const topLevelEventsToDispatchConfig = {
  click: {
    dependencies: ["click"],
    isInteractive: true,
    phasedRegistrationNames: { bubbled: "onClick", captured: "onClickCapture" },
  },
};

export function listenTo(registrationName) {
  const dependencies = registrationNameDependencies[registrationName];

  for (let i = 0; i < dependencies.length; i++) {
    const dependency = dependencies[i];
    if (!alreadyListeningTo[dependency]) {
      alreadyListeningTo[dependency] = true;
      document.addEventListener(
        dependency,
        dispatchEvent.bind(this, dependency),
      );
    }
  }
}

function dispatchEvent(name, event) {
  const targetInst = getClosestInstanceFromNode(event.target);
  if (targetInst) {
    const dispatchConfig = topLevelEventsToDispatchConfig[name];
    const listener = getListener(
      targetInst,
      dispatchConfig.phasedRegistrationNames.bubbled,
    );

    if (typeof listener === "function") {
      if (isInteractiveTopLevelEventType(name)) {
        flushInteractiveUpdates();
        interactiveUpdates(listener, event);
      } else {
        batchedUpdates(listener, event);
      }
    }
  }
}

function getListener(inst, registrationName) {
  const props = getFiberCurrentPropsFromNode(inst.stateNode);

  return props[registrationName];
}

function isInteractiveTopLevelEventType(name) {
  return name === "click";
}
