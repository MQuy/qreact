import DomComponent from './DomComponent';

function instantiateComponent(element) {
  const { type, props } = element;
  let wrapperInstance;

  if (typeof type == 'string') {
    wrapperInstance = new DomComponent(element);
  } else if (typeof type == 'function') {
    wrapperInstance = new type(props);
    wrapperInstance.setInternalElement = element;
  } else {
    wrapperInstance = new DomComponent({
      type: 'span',
      props: { children: element }
    })
  }
  return wrapperInstance;
}

export default instantiateComponent;