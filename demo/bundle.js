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
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__qreact__ = __webpack_require__(1);


const stories = [{ name: "[Webpack] — Smart Loading Assets For Production", url: "https://hackernoon.com/webpack-smart-loading-assets-for-production-3571e0a29c2e", likes: 339 }, { name: "V8 Engine Overview", url: "https://medium.com/@MQuy90/v8-engine-overview-7c965731ced4", likes: 372 }];

const appElement = Object(__WEBPACK_IMPORTED_MODULE_0__qreact__["a" /* createElement */])(
  "div",
  null,
  Object(__WEBPACK_IMPORTED_MODULE_0__qreact__["a" /* createElement */])(
    "ul",
    null,
    stories.map(storyElement)
  )
);

function storyElement({ name, url, likes }) {
  return Object(__WEBPACK_IMPORTED_MODULE_0__qreact__["a" /* createElement */])(
    "li",
    null,
    Object(__WEBPACK_IMPORTED_MODULE_0__qreact__["a" /* createElement */])(
      "span",
      null,
      likes,
      "\u2764\uFE0F"
    ),
    Object(__WEBPACK_IMPORTED_MODULE_0__qreact__["a" /* createElement */])(
      "a",
      { href: url },
      name
    )
  );
}

Object(__WEBPACK_IMPORTED_MODULE_0__qreact__["b" /* render */])(appElement, document.getElementById("root"));

/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__src_render__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__src_createElement__ = __webpack_require__(3);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return __WEBPACK_IMPORTED_MODULE_0__src_render__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return __WEBPACK_IMPORTED_MODULE_1__src_createElement__["a"]; });





/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = render;
function render(element, parentDom) {
  const { type, props } = element;
  const dom = type == "TEXT_ELEMENT" ? document.createTextNode("") : document.createElement(type);

  const isAttribute = name => name != "children";
  Object.keys(props).filter(isAttribute).forEach(propName => dom[propName] = props[propName]);

  const childElements = props.children || [];

  childElements.forEach(childElement => render(childElement, dom));

  parentDom.appendChild(dom);
}

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

/***/ })
/******/ ]);