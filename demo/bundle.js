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
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
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
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./app.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "../qreact.js":
/*!********************!*\
  !*** ../qreact.js ***!
  \********************/
/*! exports provided: render, createElement, Component */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _src_render__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./src/render */ "../src/render.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "render", function() { return _src_render__WEBPACK_IMPORTED_MODULE_0__["default"]; });

/* harmony import */ var _src_createElement__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./src/createElement */ "../src/createElement.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "createElement", function() { return _src_createElement__WEBPACK_IMPORTED_MODULE_1__["default"]; });

/* harmony import */ var _src_Component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./src/Component */ "../src/Component.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Component", function() { return _src_Component__WEBPACK_IMPORTED_MODULE_2__["default"]; });






/***/ }),

/***/ "../src/Component.js":
/*!***************************!*\
  !*** ../src/Component.js ***!
  \***************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _ReactUpdates__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ReactUpdates */ "../src/ReactUpdates.js");


class Component {
  constructor(props) {
    this.props = props;
    this.state = {};
  }

  setState(partialState) {
    _ReactUpdates__WEBPACK_IMPORTED_MODULE_0__["default"].enqueueUpdate(this, partialState);
  }

}

/* harmony default export */ __webpack_exports__["default"] = (Component);

/***/ }),

/***/ "../src/CompositeComponent.js":
/*!************************************!*\
  !*** ../src/CompositeComponent.js ***!
  \************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _instantiateComponent__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./instantiateComponent */ "../src/instantiateComponent.js");


class CompositeComponent {
  constructor(element) {
    this._currentElement = element;
    this._instance = null;
    this._renderedComponent = null;
    this._pendingStateQueue = [];
  }

  updateComponent(nextElement) {
    if (this._currentElement.type != nextElement.type) {
      this.mountComponent(nextElement);
    } else {
      this._currentElement = nextElement;
      this._instance.props = nextElement.props;
      this._instance.state = this._pendingStateQueue.reduce((acc, value) => Object.assign({}, acc, value), this._instance.state);
      this._pendingStateQueue = [];
      const currentRenderedElement = this._renderedComponent._currentElement;

      const nextRenderedElement = this._instance.render();

      if (currentRenderedElement.type == nextRenderedElement.type) {
        this._renderedComponent.updateComponent(nextRenderedElement);
      } else {
        const nextRenderedComponent = Object(_instantiateComponent__WEBPACK_IMPORTED_MODULE_0__["default"])(nextRenderedElement);
        nextRenderedComponent.instantiate();
        nextRenderedComponent.updateComponent(nextRenderedElement);
        this._renderedComponent = nextRenderedComponent;
      }
    }
  }

  mountComponent(nextElement) {
    const {
      type,
      props
    } = nextElement;
    this._currentElement = nextElement;
    this._instance = new type(props);
    this._instance._reactInternalInstance = this;

    const renderedElement = this._instance.render();

    const renderedComponent = Object(_instantiateComponent__WEBPACK_IMPORTED_MODULE_0__["default"])(renderedElement);
    this._renderedComponent = renderedComponent;
    renderedComponent.mountComponent(renderedElement);
  }

  ummountComponent() {
    this._currentElement = null;
    this._instance = null;
    this._renderedComponent = null;
  }

  getInternalDom() {
    return this._renderedComponent.getInternalDom();
  }

}

/* harmony default export */ __webpack_exports__["default"] = (CompositeComponent);

/***/ }),

/***/ "../src/DOM.js":
/*!*********************!*\
  !*** ../src/DOM.js ***!
  \*********************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
function empty(node) {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

function appendChild(dom, child) {
  dom.appendChild(child);
}

function appendChildren(node, children) {
  if (Array.isArray(children)) {
    children.forEach(child => appendChild(node, child));
  } else {
    appendChild(node, children);
  }
}

function replaceNode(node, newNode) {
  node.parentNode.replaceNode(newNode);
}

function removeChild(node, child) {
  node.removeChild(child);
}

/* harmony default export */ __webpack_exports__["default"] = ({
  empty,
  appendChild,
  appendChildren,
  replaceNode,
  removeChild
});

/***/ }),

/***/ "../src/DomComponent.js":
/*!******************************!*\
  !*** ../src/DomComponent.js ***!
  \******************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _DOM__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./DOM */ "../src/DOM.js");
/* harmony import */ var _instantiateComponent__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./instantiateComponent */ "../src/instantiateComponent.js");
/* harmony import */ var _ReactEventEmitter__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./ReactEventEmitter */ "../src/ReactEventEmitter.js");



let globalIdCounter = 0;

class DomComponent {
  constructor(element) {
    this._currentElement = element;
    this._domNode = null;
    this._rootNodeID = 0;
  }

  mountComponent() {
    const {
      type,
      props
    } = this._currentElement;

    if (type == "TEXT_ELEMENT") {
      this._domNode = document.createTextNode("");
    } else {
      this._domNode = document.createElement(type);
    }

    this._rootNodeID = globalIdCounter++;
    this._domNode.__reactInternalInstance = this;

    this._updateDOMProperties({}, props);

    this._createInitialDOMChildren(props);
  }

  updateComponent(nextElement) {
    if (this._currentElement.type == nextElement.type) {
      this._updateDOMProperties(this._currentElement.props, nextElement.props);

      this._currentElement = nextElement;

      this._updateDOMChildren();
    } else {
      this._currentElement = nextElement;
      this.instantiate();
    }
  }

  ummountComponent() {
    this._currentElement = null;
    this._domNode = null;
  }

  _updateDOMChildren() {
    const {
      children
    } = this._currentElement.props;

    if (["string", "number"].indexOf(typeof children) !== -1) {
      this._domNode.textContent = children;
    } else {
      const count = Math.max(children.length, this._renderedChildren.length);

      for (let i = 0; i < count; ++i) {
        const childElement = children[i];
        const renderedComponent = this._renderedChildren[i];

        if (!renderedComponent) {
          const component = Object(_instantiateComponent__WEBPACK_IMPORTED_MODULE_1__["default"])(childElement);
          component.mountComponent(childElement);

          this._renderedChildren.push(component);

          _DOM__WEBPACK_IMPORTED_MODULE_0__["default"].appendChild(this._domNode, component.getInternalDom());
        } else if (!childElement) {
          this._renderedChildren[i] = null;
          _DOM__WEBPACK_IMPORTED_MODULE_0__["default"].removeChild(this._domNode, renderedComponent.getInternalDom());
          renderedComponent.ummountComponent();
        } else {
          renderedComponent.updateComponent(childElement);
        }
      }

      this._renderedChildren = this._renderedChildren.filter(child => child);
    }
  }

  _createInitialDOMChildren(props) {
    const {
      children
    } = props;

    if (["string", "number"].indexOf(typeof children) !== -1) {
      this._domNode.textContent = children;
    } else {
      this._renderedChildren = children.map(childElement => {
        const component = Object(_instantiateComponent__WEBPACK_IMPORTED_MODULE_1__["default"])(childElement);
        component.mountComponent(childElement);
        return component;
      });

      const domChildren = this._renderedChildren.map(child => child.getInternalDom());

      _DOM__WEBPACK_IMPORTED_MODULE_0__["default"].appendChildren(this._domNode, domChildren);
    }
  }

  _updateDOMProperties(prevProps, nextProps) {
    const isEvent = name => name.startsWith("on");

    const isAttribute = name => !isEvent(name) && name != "children" && name != "style";

    Object.keys(prevProps).filter(isEvent).forEach(name => {
      _ReactEventEmitter__WEBPACK_IMPORTED_MODULE_2__["default"].removeQueue(this._rootNodeID, name);
    });
    Object.keys(prevProps).filter(isAttribute).forEach(name => {
      this._domNode.removeAttribute(name);
    });
    Object.keys(nextProps).filter(isAttribute).forEach(name => {
      this._domNode.setAttribute(name, nextProps[name]);
    });
    Object.keys(nextProps).filter(isEvent).forEach(name => {
      _ReactEventEmitter__WEBPACK_IMPORTED_MODULE_2__["default"].addQueue(this._rootNodeID, name, nextProps[name]);
      _ReactEventEmitter__WEBPACK_IMPORTED_MODULE_2__["default"].listenTo(name);
    });
  }

  getInternalDom() {
    return this._domNode;
  }

}

/* harmony default export */ __webpack_exports__["default"] = (DomComponent);

/***/ }),

/***/ "../src/ReactEventEmitter.js":
/*!***********************************!*\
  !*** ../src/ReactEventEmitter.js ***!
  \***********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _ReactUpdates__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ReactUpdates */ "../src/ReactUpdates.js");

const alreadyListened = {};
const queueListeners = {};

function addQueue(nodeId, name, value) {
  if (!queueListeners[nodeId]) {
    queueListeners[nodeId] = {};
  }

  queueListeners[nodeId][name] = value;
}

function removeQueue(nodeId, name, value) {
  delete queueListeners[nodeId][name];
}

function getQueue(nodeId, name) {
  return queueListeners[nodeId][name];
}

function listenTo(name) {
  const eventName = name.substr(2).toLocaleLowerCase();

  if (alreadyListened[eventName]) {
    return;
  }

  alreadyListened[eventName] = true;
  document.addEventListener(name.substr(2).toLocaleLowerCase(), dispatchEvent.bind(this, name));
}

function dispatchEvent(name, e) {
  const domNode = e.target;
  const reactInstance = domNode.__reactInternalInstance;
  getQueue(reactInstance._rootNodeID, name)(e);
  _ReactUpdates__WEBPACK_IMPORTED_MODULE_0__["default"].flushUpdates();
}

/* harmony default export */ __webpack_exports__["default"] = ({
  addQueue,
  removeQueue,
  getQueue,
  listenTo,
  dispatchEvent
});

/***/ }),

/***/ "../src/ReactUpdates.js":
/*!******************************!*\
  !*** ../src/ReactUpdates.js ***!
  \******************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
const dirtyComponents = [];

function enqueueUpdate(instance, partialState) {
  const component = instance._reactInternalInstance;

  component._pendingStateQueue.push(partialState);

  dirtyComponents.push(component);
}

function flushUpdates() {
  dirtyComponents.forEach(component => {
    component.updateComponent(component._currentElement);
  });
}

/* harmony default export */ __webpack_exports__["default"] = ({
  enqueueUpdate,
  flushUpdates
});

/***/ }),

/***/ "../src/createElement.js":
/*!*******************************!*\
  !*** ../src/createElement.js ***!
  \*******************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
function createElement(type, config, ...children) {
  const props = Object.assign({}, config);

  if (children.length > 0) {
    props.children = [].concat(...children);
  }

  if (Array.isArray(props.children)) {
    props.children = props.children.map(child => mapElement(child));
  } else if (type != "TEXT_ELEMENT" && props.children) {
    props.children = mapElement(props.children);
  }

  return {
    type,
    props
  };
}

function mapElement(child) {
  return child instanceof Object ? child : createElement("TEXT_ELEMENT", {
    children: child
  });
}

/* harmony default export */ __webpack_exports__["default"] = (createElement);

/***/ }),

/***/ "../src/instantiateComponent.js":
/*!**************************************!*\
  !*** ../src/instantiateComponent.js ***!
  \**************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _DomComponent__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./DomComponent */ "../src/DomComponent.js");
/* harmony import */ var _CompositeComponent__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./CompositeComponent */ "../src/CompositeComponent.js");



function instantiateComponent(element) {
  const {
    type,
    props
  } = element;
  let wrapperInstance;

  if (typeof type == "string") {
    wrapperInstance = new _DomComponent__WEBPACK_IMPORTED_MODULE_0__["default"](element);
  } else if (typeof type == "function") {
    wrapperInstance = new _CompositeComponent__WEBPACK_IMPORTED_MODULE_1__["default"](element);
  }

  return wrapperInstance;
}

/* harmony default export */ __webpack_exports__["default"] = (instantiateComponent);

/***/ }),

/***/ "../src/render.js":
/*!************************!*\
  !*** ../src/render.js ***!
  \************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _DOM__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./DOM */ "../src/DOM.js");
/* harmony import */ var _instantiateComponent__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./instantiateComponent */ "../src/instantiateComponent.js");


const internalInstanceKey = "_qreact_";

function isRendered(node) {
  return node[internalInstanceKey];
}

function render(element, node) {
  if (!isRendered(node)) {
    mount(element, node);
  } else {
    update(element, node);
  }
}

function mount(element, node) {
  const component = Object(_instantiateComponent__WEBPACK_IMPORTED_MODULE_1__["default"])(element);
  node[internalInstanceKey] = component;
  component.mountComponent(element);
  _DOM__WEBPACK_IMPORTED_MODULE_0__["default"].empty(node);
  _DOM__WEBPACK_IMPORTED_MODULE_0__["default"].appendChild(node, component.getInternalDom());
}

function update(element, node) {
  const component = node[internalInstanceKey];
  component.updateComponent(element);
}

/* harmony default export */ __webpack_exports__["default"] = (render);

/***/ }),

/***/ "./app.js":
/*!****************!*\
  !*** ./app.js ***!
  \****************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _qreact__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../qreact */ "../qreact.js");
function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }



class App extends _qreact__WEBPACK_IMPORTED_MODULE_0__["Component"] {
  constructor(props) {
    super(props);

    _defineProperty(this, "removeStory", story => () => {
      const {
        stories
      } = this.state;
      const index = stories.findIndex(s => s.id == story.id);
      stories.splice(index, 1);
      this.setState(stories);
    });

    this.state = {
      stories: [{
        id: 1,
        name: "[Webpack] — Smart Loading Assets For Production",
        url: "https://hackernoon.com/webpack-smart-loading-assets-for-production-3571e0a29c2e"
      }, {
        id: 2,
        name: "V8 Engine Overview",
        url: "https://medium.com/@MQuy90/v8-engine-overview-7c965731ced4"
      }]
    };
  }

  render() {
    const {
      stories
    } = this.state;
    return Object(_qreact__WEBPACK_IMPORTED_MODULE_0__["createElement"])("div", null, Object(_qreact__WEBPACK_IMPORTED_MODULE_0__["createElement"])("ul", null, stories.map(story => Object(_qreact__WEBPACK_IMPORTED_MODULE_0__["createElement"])(Story, {
      story: story,
      onRemove: this.removeStory
    }))));
  }

}

class Story extends _qreact__WEBPACK_IMPORTED_MODULE_0__["Component"] {
  constructor(props) {
    super(props);

    _defineProperty(this, "handleClick", () => {
      this.setState({
        likes: this.state.likes + 1
      });
    });

    this.state = {
      likes: Math.ceil(Math.random() * 100)
    };
  }

  render() {
    const {
      story,
      onRemove
    } = this.props;
    const {
      likes
    } = this.state;
    return Object(_qreact__WEBPACK_IMPORTED_MODULE_0__["createElement"])("li", null, Object(_qreact__WEBPACK_IMPORTED_MODULE_0__["createElement"])("button", {
      onClick: this.handleClick
    }, likes, "\u2764\uFE0F"), Object(_qreact__WEBPACK_IMPORTED_MODULE_0__["createElement"])("a", {
      href: story.url
    }, story.name), Object(_qreact__WEBPACK_IMPORTED_MODULE_0__["createElement"])("button", {
      onClick: onRemove(story)
    }, "Remove"));
  }

}

Object(_qreact__WEBPACK_IMPORTED_MODULE_0__["render"])(Object(_qreact__WEBPACK_IMPORTED_MODULE_0__["createElement"])(App, null), document.getElementById("root"));

/***/ })

/******/ });
//# sourceMappingURL=bundle.js.map