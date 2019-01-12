import DomComponent from "./DomComponent";
import CompositeComponent from "./CompositeComponent";

function instantiateComponent(element) {
  const { type, props } = element;
  let wrapperInstance;

  if (typeof type == "string") {
    wrapperInstance = new DomComponent(element);
  } else if (typeof type == "function") {
    wrapperInstance = new CompositeComponent(element);
  }
  return wrapperInstance;
}

export default instantiateComponent;
