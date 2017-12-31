/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = render;
/* harmony export (immutable) */ __webpack_exports__["b"] = reconcile;
let rootInstance = null;

function render(element, parentDom) {
  const prevInstance = rootInstance;
  const nextInstance = reconcile(parentDom, prevInstance, element);
  rootInstance = nextInstance;
}

function reconcile(parentDom, prevInstance, element) {
  if (!prevInstance) {
    const newInstance = instantiate(element);
    parentDom.appendChild(newInstance.dom);
    return newInstance;
  } else if (!element) {
    parentDom.removeChild(prevInstance.dom);
    return null;
  } else if (prevInstance.element.type != element.type) {
    const newInstance = instantiate(element);
    parentDom.replaceChild(newInstance.dom, prevInstance.dom);
    return newInstance;
  } else if (typeof element.type == 'string') {
    updateDomProperties(prevInstance.dom, prevInstance.element.props, element.props);
    prevInstance.childInstances = reconcileChildren(prevInstance, element);
    prevInstance.element = element;
    return prevInstance;
  } else {
    prevInstance.publicInstance.props = element.props;
    const childElement = prevInstance.publicInstance.render();
    const oldChildInstance = prevInstance.childInstance;
    const childInstance = reconcile(parentDom, oldChildInstance, childElement);

    prevInstance.dom = childInstance.dom;
    prevInstance.childInstance = childInstance;
    prevInstance.element = element;
    return prevInstance;
  }
}

function reconcileChildren(instance, element) {
  const dom = instance.dom;
  const childInstances = instance.childInstances;
  const nextChildElements = element.props.children || [];
  const newChildInstances = [];
  const count = Math.max(childInstances.length, nextChildElements.length);

  for (let i = 0; i < count; i++) {
    const childInstance = childInstances[i];
    const childElement = nextChildElements[i];
    const newChildInstance = reconcile(dom, childInstance, childElement);
    newChildInstances.push(newChildInstance);
  }
  return newChildInstances;
}

function createPublicInstance(element, internalInstance) {
  const { type, props } = element;
  const publicInstance = new type(props);
  publicInstance.__internalInstance = internalInstance;
  return publicInstance;
}

function instantiate(element) {
  const { type, props } = element;

  if (typeof type === 'string') {
    const dom = type == "TEXT_ELEMENT" ? document.createTextNode("") : document.createElement(type);

    updateDomProperties(dom, [], props);

    const childElements = props.children || [];
    const childInstances = childElements.map(instantiate);

    childInstances.map(childInstance => childInstance.dom).forEach(childDom => dom.appendChild(childDom));

    const instance = { dom, element, childInstances };
    return instance;
  } else {
    const instance = {};
    const publicInstance = createPublicInstance(element, instance);
    const childElement = publicInstance.render();
    const childInstance = instantiate(childElement);
    const dom = childInstance.dom;

    Object.assign(instance, { dom, element, childInstance, publicInstance });
    return instance;
  }
}

function updateDomProperties(dom, prevProps, nextProps) {
  const isEvent = name => name.startsWith("on");
  const isAttribute = name => !isEvent(name) && name != "children";

  Object.keys(prevProps).filter(isEvent).forEach(name => {
    const eventType = name.toLowerCase().substring(2);
    dom.removeEventListener(eventType, prevProps[name]);
  });

  Object.keys(prevProps).filter(isAttribute).forEach(name => {
    dom[name] = null;
  });

  Object.keys(nextProps).filter(isEvent).forEach(name => {
    const eventType = name.toLowerCase().substring(2);
    dom.addEventListener(eventType, nextProps[name]);
  });

  Object.keys(nextProps).filter(isAttribute).forEach(propName => dom[propName] = nextProps[propName]);
}

/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__qreact__ = __webpack_require__(2);


const stories = [{ name: "[Webpack] — Smart Loading Assets For Production", url: "https://hackernoon.com/webpack-smart-loading-assets-for-production-3571e0a29c2e" }, { name: "V8 Engine Overview", url: "https://medium.com/@MQuy90/v8-engine-overview-7c965731ced4" }];

class App extends __WEBPACK_IMPORTED_MODULE_0__qreact__["a" /* Component */] {
  constructor(props) {
    super(props);
  }
  render() {
    const { stories } = this.props;

    return Object(__WEBPACK_IMPORTED_MODULE_0__qreact__["b" /* createElement */])(
      "div",
      null,
      Object(__WEBPACK_IMPORTED_MODULE_0__qreact__["b" /* createElement */])(
        "ul",
        null,
        stories.map(story => Object(__WEBPACK_IMPORTED_MODULE_0__qreact__["b" /* createElement */])(Story, { story: story }))
      )
    );
  }
}

class Story extends __WEBPACK_IMPORTED_MODULE_0__qreact__["a" /* Component */] {
  constructor(props) {
    super(props);

    this.handleClick = () => {
      this.setState({
        likes: this.state.likes + 1
      });
    };

    this.state = { likes: Math.ceil(Math.random() * 100) };
  }
  render() {
    const { story } = this.props;
    const { likes } = this.state;

    return Object(__WEBPACK_IMPORTED_MODULE_0__qreact__["b" /* createElement */])(
      "li",
      null,
      Object(__WEBPACK_IMPORTED_MODULE_0__qreact__["b" /* createElement */])(
        "button",
        { onClick: this.handleClick },
        likes,
        "\u2764\uFE0F"
      ),
      Object(__WEBPACK_IMPORTED_MODULE_0__qreact__["b" /* createElement */])(
        "a",
        { href: story.url },
        story.name
      )
    );
  }
}

Object(__WEBPACK_IMPORTED_MODULE_0__qreact__["c" /* render */])(Object(__WEBPACK_IMPORTED_MODULE_0__qreact__["b" /* createElement */])(App, { stories: stories }), document.getElementById("root"));

/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__src_render__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__src_createElement__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__src_Component__ = __webpack_require__(4);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return __WEBPACK_IMPORTED_MODULE_0__src_render__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return __WEBPACK_IMPORTED_MODULE_1__src_createElement__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return __WEBPACK_IMPORTED_MODULE_2__src_Component__["a"]; });






/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = createElement;
function createElement(type, config, ...args) {
  const props = Object.assign({}, config);
  const children = args.length > 0 ? [].concat(...args) : [];

  props.children = children.filter(child => child).map(child => child instanceof Object ? child : createElement('TEXT_ELEMENT', { nodeValue: child }));

  return { type, props };
}

/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__render__ = __webpack_require__(0);


class Component {
  constructor(props) {
    this.props = props;
    this.state = this.state || {};
  }

  setState(partialState) {
    this.state = Object.assign({}, this.state, partialState);
    updateInstance(this.__internalInstance);
  }
}

function updateInstance(internalInstance) {
  const parentDom = internalInstance.dom.parentDom;
  const element = internalInstance.element;

  Object(__WEBPACK_IMPORTED_MODULE_0__render__["b" /* reconcile */])(parentDom, internalInstance, element);
}
/* harmony default export */ __webpack_exports__["a"] = (Component);

/***/ })
/******/ ]);