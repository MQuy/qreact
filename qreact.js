import { render } from "./src/render";
import { createElement, REACT_ASYNC_MODE_TYPE } from "./src/createElement";
import { Component } from "./src/Component";
import { deferredUpdates } from "./src/FiberScheduler";

const unstable_AsyncMode = REACT_ASYNC_MODE_TYPE;

export {
  render,
  createElement,
  Component,
  deferredUpdates,
  unstable_AsyncMode,
};
