(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["VueThemeSwitcher"] = factory();
	else
		root["VueThemeSwitcher"] = factory();
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
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
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);

// CONCATENATED MODULE: ./src/store.js
var key = '__current_style__';
var store = {
  value: 'default',
  get: function get() {
    return this.value;
  },
  set: function set(val) {
    try {
      this.value = val;
      window.localStorage.setItem(key, val);
    } catch (e) {
      /* 静默处理 */
    }
  }
};

try {
  var localValue = window.localStorage.getItem(key);
  if (localValue) store.value = localValue;
} catch (e) {
  /* 静默处理 */
}

/* harmony default export */ var src_store = (store);
// CONCATENATED MODULE: ./src/util.js
var head = document.getElementsByTagName('head')[0];
function createLinkElement(attrs) {
  var el = document.createElement('link');
  el.rel = 'stylesheet';
  el.type = 'text/css';
  el.href = attrs.href;
  Object.keys(attrs).forEach(function (key) {
    if (key === 'href') return;
    el.setAttribute(key, attrs[key]);
  });
  head.appendChild(el);
  return el;
}
function createThemeLink(theme) {
  if (!theme) return;

  if (theme.$el) {
    theme.$el.setAttribute('href', theme.href);
  } else {
    // eslint-disable-next-line no-param-reassign
    theme.$el = createLinkElement({
      href: theme.href
    });
  }
}
function removeThemeLink(theme) {
  if (!theme) return;

  if (theme.$el) {
    // eslint-disable-next-line no-param-reassign
    theme.$el = !theme.$el.parentNode.removeChild(theme.$el);
  }
}
// CONCATENATED MODULE: ./src/theme.js


var theme = {};
var resource = window.$themeResource;
Object.defineProperties(theme, {
  style: {
    configurable: true,
    enumerable: true,
    get: function get() {
      return src_store.get();
    },
    set: function set(val) {
      var oldVal = src_store.get();
      var newVal = String(val || 'default');
      if (oldVal === newVal) return;
      src_store.set(newVal);
      window.dispatchEvent(new CustomEvent('theme-change', {
        bubbles: true,
        detail: {
          newVal: newVal,
          oldVal: oldVal
        }
      }));
    }
  },
  __loadChunkCss: {
    enumerable: false,
    value: function loadChunkCss(chunkId) {
      var id = "".concat(chunkId, "#").concat(theme.style);

      if (resource && resource.chunks) {
        createThemeLink(resource.chunks[id]);
      }
    }
  }
}); // NODE_ENV = production

if (resource) {
  // 加载entry
  var currentTheme = theme.style;

  if (resource.entry && currentTheme && currentTheme !== 'default') {
    Object.keys(resource.entry).forEach(function (id) {
      var item = resource.entry[id];

      if (item.theme === currentTheme) {
        createThemeLink(item);
      }
    });
  } // 更新theme


  window.addEventListener('theme-change', function (e) {
    var newTheme = e.detail.newVal || 'default';
    var oldTheme = e.detail.oldVal || 'default';

    var updateThemeLink = function updateThemeLink(obj) {
      if (obj.theme === newTheme && newTheme !== 'default') {
        createThemeLink(obj);
      } else if (obj.theme === oldTheme && oldTheme !== 'default') {
        removeThemeLink(obj);
      }
    };

    if (resource.entry) {
      Object.keys(resource.entry).forEach(function (id) {
        updateThemeLink(resource.entry[id]);
      });
    }

    if (resource.chunks) {
      Object.keys(resource.chunks).forEach(function (id) {
        updateThemeLink(resource.chunks[id]);
      });
    }
  });
}

window.$theme = theme;
/* harmony default export */ var src_theme = (theme);
// CONCATENATED MODULE: ./src/index.js
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "install", function() { return install; });
 // eslint-disable-next-line import/prefer-default-export

function install(Vue) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  Vue.util.defineReactive(src_theme, 'style');
  var name = options.name || '$theme';
  Vue.mixin({
    beforeCreate: function beforeCreate() {
      Object.defineProperty(this, name, {
        get: function get() {
          return src_theme.style;
        },
        set: function set(style) {
          src_theme.style = style;
        }
      });
    }
  });
}

/***/ })
/******/ ]);
});