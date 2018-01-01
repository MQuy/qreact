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
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__DomComponent__ = __webpack_require__(5);


function instantiateComponent(element) {
  const { type, props } = element;
  let wrapperInstance;

  if (typeof type == 'string') {
    wrapperInstance = new __WEBPACK_IMPORTED_MODULE_0__DomComponent__["a" /* default */](element);
  } else if (typeof type == 'function') {
    wrapperInstance = new type(props);
    wrapperInstance.setInternalElement(element);
  }
  return wrapperInstance;
}

/* harmony default export */ __webpack_exports__["a"] = (instantiateComponent);

/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
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

/* harmony default export */ __webpack_exports__["a"] = ({
  empty,
  appendChild,
  appendChildren,
  replaceNode,
  removeChild
});

/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__qreact__ = __webpack_require__(3);


class App extends __WEBPACK_IMPORTED_MODULE_0__qreact__["a" /* Component */] {
  constructor(props) {
    super(props);

    this.removeStory = story => () => {
      const { stories } = this.state;

      const index = stories.findIndex(s => s.id == story.id);
      stories.splice(index, 1);

      this.setState(stories);
    };

    this.state = {
      stories: [{ id: 1, name: "[Webpack] — Smart Loading Assets For Production", url: "https://hackernoon.com/webpack-smart-loading-assets-for-production-3571e0a29c2e" }, { id: 2, name: "V8 Engine Overview", url: "https://medium.com/@MQuy90/v8-engine-overview-7c965731ced4" }]
    };
  }
  render() {
    const { stories } = this.state;

    return Object(__WEBPACK_IMPORTED_MODULE_0__qreact__["b" /* createElement */])(
      "div",
      null,
      Object(__WEBPACK_IMPORTED_MODULE_0__qreact__["b" /* createElement */])(
        "ul",
        null,
        stories.map(story => Object(__WEBPACK_IMPORTED_MODULE_0__qreact__["b" /* createElement */])(Story, { story: story, onRemove: this.removeStory }))
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
    const { story, onRemove } = this.props;
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
      ),
      Object(__WEBPACK_IMPORTED_MODULE_0__qreact__["b" /* createElement */])(
        "button",
        { onClick: onRemove(story) },
        "Remove"
      )
    );
  }
}

Object(__WEBPACK_IMPORTED_MODULE_0__qreact__["c" /* render */])(Object(__WEBPACK_IMPORTED_MODULE_0__qreact__["b" /* createElement */])(App, null), document.getElementById("root"));

/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__src_render__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__src_createElement__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__src_Component__ = __webpack_require__(7);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return __WEBPACK_IMPORTED_MODULE_0__src_render__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return __WEBPACK_IMPORTED_MODULE_1__src_createElement__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return __WEBPACK_IMPORTED_MODULE_2__src_Component__["a"]; });






/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__DOM__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__instantiateComponent__ = __webpack_require__(0);



const DOM_KEY = '_qreact_';
const reactInstances = {};
let incrementId = 0;

function isRendered(node) {
  return node[DOM_KEY];
}

function render(element, node) {
  if (!isRendered(node)) {
    mount(element, node);
  } else {
    update(element, node);
  }
}

function mount(element, node) {
  node[DOM_KEY] = incrementId;

  const component = Object(__WEBPACK_IMPORTED_MODULE_1__instantiateComponent__["a" /* default */])(element);

  reactInstances[incrementId] = component;
  component.instantiate();

  __WEBPACK_IMPORTED_MODULE_0__DOM__["a" /* default */].empty(node);
  __WEBPACK_IMPORTED_MODULE_0__DOM__["a" /* default */].appendChild(node, component.getInternalDom());

  incrementId++;
}

function update(element, node) {
  const componentId = node[DOM_KEY];

  reactInstances[componentId].reconcile();
}

/* harmony default export */ __webpack_exports__["a"] = (render);

/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__DOM__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__instantiateComponent__ = __webpack_require__(0);



class DomComponent {
  constructor(element) {
    this._element = element;
    this._domNode = null;
  }
  instantiate() {
    const { type, props } = this._element;

    if (type == 'TEXT_ELEMENT') {
      this._domNode = document.createTextNode("");
    } else {
      this._domNode = document.createElement(type);
    }
    this._updateDOMProperties({}, props);
    this._createInitialDOMChildren(props);
  }
  reconcile(nextElement) {
    if (this._element.type == nextElement.type) {
      this._updateDOMProperties(this._element.props, nextElement.props);
      this._element = nextElement;
      this._updateDOMChildren();
    } else {
      this._element = nextElement;
      this.instantiate();
    }
  }
  _updateDOMChildren() {
    const { children } = this._element.props;

    if (['string', 'number'].indexOf(typeof children) !== -1) {
      this._domNode.textContent = children;
    } else {
      const count = Math.max(children.length, this._renderedChildren.length);

      for (let i = 0; i < count; ++i) {
        const childElement = children[i];
        const renderedComponent = this._renderedChildren[i];

        if (!renderedComponent) {
          const component = Object(__WEBPACK_IMPORTED_MODULE_1__instantiateComponent__["a" /* default */])(childElement);

          component.instantiate();
          this._renderedChildren.push(component);
          __WEBPACK_IMPORTED_MODULE_0__DOM__["a" /* default */].appendChild(this._domNode, component.getInternalDom());
        } else if (!childElement) {
          this._renderedChildren[i] = null;
          __WEBPACK_IMPORTED_MODULE_0__DOM__["a" /* default */].removeChild(this._domNode, renderedComponent.getInternalDom());
        } else {
          renderedComponent.reconcile(childElement);
        }
      }

      this._renderedChildren = this._renderedChildren.filter(child => child);
    }
  }
  _createInitialDOMChildren(props) {
    const { children } = props;

    if (['string', 'number'].indexOf(typeof children) !== -1) {
      this._domNode.textContent = children;
    } else {
      this._renderedChildren = children.map(child => Object(__WEBPACK_IMPORTED_MODULE_1__instantiateComponent__["a" /* default */])(child));
      this._renderedChildren.forEach(child => child.instantiate());

      const domChildren = this._renderedChildren.map(child => child.getInternalDom());

      __WEBPACK_IMPORTED_MODULE_0__DOM__["a" /* default */].appendChildren(this._domNode, domChildren);
    }
  }
  _updateDOMProperties(prevProps, nextProps) {
    const isEvent = name => name.startsWith("on");
    const isAttribute = name => !isEvent(name) && name != "children" && name != "style";

    Object.keys(prevProps).filter(isEvent).forEach(name => {
      const eventType = name.toLowerCase().substring(2);
      this._domNode.removeEventListener(eventType, prevProps[name]);
    });

    Object.keys(prevProps).filter(isAttribute).forEach(name => {
      this._domNode[name] = null;
    });

    Object.keys(nextProps).filter(isAttribute).forEach(name => {
      this._domNode[name] = nextProps[name];
    });

    Object.keys(nextProps).filter(isEvent).forEach(name => {
      const eventType = name.toLowerCase().substring(2);
      this._domNode.addEventListener(eventType, nextProps[name]);
    });
  }
  getInternalElement() {
    return this._element;
  }
  getInternalDom() {
    return this._domNode;
  }
}

/* harmony default export */ __webpack_exports__["a"] = (DomComponent);

/***/ }),
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
function createElement(type, config, ...children) {
  const props = Object.assign({}, config);

  if (children.length > 0) {
    props.children = [].concat(...children);
  }

  if (Array.isArray(props.children)) {
    props.children = props.children.map(child => mapElement(child));
  } else if (type != 'TEXT_ELEMENT' && props.children) {
    props.children = mapElement(props.children);
  }

  return { type, props };
}

function mapElement(child) {
  return child instanceof Object ? child : createElement('TEXT_ELEMENT', { children: child });
}

/* harmony default export */ __webpack_exports__["a"] = (createElement);

/***/ }),
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__instantiateComponent__ = __webpack_require__(0);


class Component {
  constructor(props) {
    this.props = props;
    this.state = {};
    console.log(this);
  }
  setState(partialState) {
    Object.assign(this.state, partialState);
    this.reconcile(this._element);
  }
  reconcile(nextElement) {
    this._element = nextElement;
    this.props = nextElement.props;

    const currentRenderedElement = this._renderedComponent.getInternalElement();
    const nextRenderedElement = this.render();

    if (currentRenderedElement.type == nextRenderedElement.type) {
      this._renderedComponent.reconcile(nextRenderedElement);
    } else {
      const nextRenderedComponent = Object(__WEBPACK_IMPORTED_MODULE_0__instantiateComponent__["a" /* default */])(nextRenderedElement);

      nextRenderedComponent.instantiate();
      DOM.replaceNode(this._renderedComponent.getInternalDom(), nextRenderedComponent.getInternalDom());
      this._renderedComponent = nextRenderedComponent;
    }
  }
  instantiate() {
    const renderedElement = this.render();
    const renderedComponent = Object(__WEBPACK_IMPORTED_MODULE_0__instantiateComponent__["a" /* default */])(renderedElement);

    this._renderedComponent = renderedComponent;
    renderedComponent.instantiate();
  }
  getInternalDom() {
    return this._renderedComponent.getInternalDom();
  }
  getInternalElement() {
    return this._element;
  }
  setInternalElement(element) {
    this._element = element;
  }
}

/* harmony default export */ __webpack_exports__["a"] = (Component);

/***/ })
/******/ ]);
//# sourceMappingURL=bundle.js.map