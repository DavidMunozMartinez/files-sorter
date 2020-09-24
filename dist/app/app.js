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
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!./src/render/styles.scss":
/*!*************************************************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!./src/render/styles.scss ***!
  \*************************************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0__);
// Imports

var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0___default()(true);
___CSS_LOADER_EXPORT___.push([module.i, "@import url(https://fonts.googleapis.com/css2?family=Ubuntu:wght@300&display=swap);"]);
// Module
___CSS_LOADER_EXPORT___.push([module.i, "div#electron-titlebar {\n  height: 29px;\n  background-color: #3f3f3f;\n  transition: all 0.2s;\n}\ndiv#electron-titlebar div {\n  height: 29px;\n}\n\n#electron-titlebar > .button-close.hover {\n  background-color: #ff5858 !important;\n  border-radius: 4px;\n}\n\nbody {\n  font-family: \"Ubuntu\", sans-serif;\n  background: #252525;\n  color: #d6d6d6;\n  margin: 0;\n}\n\n.main-content {\n  width: 100%;\n  height: 100%;\n  top: 0;\n  position: absolute;\n  padding: 15px;\n  box-sizing: border-box;\n  display: flex;\n  flex-direction: row;\n}\n.main-content div.left-column {\n  flex: 2;\n}\n.main-content div.right-column {\n  flex: 1;\n}\n.main-content .column .column-title {\n  width: 100%;\n  text-align: center;\n}\n\ndiv#electron-titlebar + .main-content {\n  height: calc(100% - 29px);\n  top: 29px;\n}\n\n.left-column {\n  box-sizing: border-box;\n}\n.left-column .folder-selector {\n  width: 100%;\n  height: 30px;\n  display: inline-block;\n  position: relative;\n}\n.left-column .folder-selector .add-folder,\n.left-column .folder-selector .folder-path {\n  height: 30px;\n  display: inline-block;\n  border: 1px solid #3f3f3f;\n  border-radius: 5px;\n  position: absolute;\n  top: 0;\n  box-sizing: border-box;\n}\n.left-column .folder-selector .add-folder {\n  width: 30px;\n  left: 0;\n  transition: all 0.2s;\n  cursor: pointer;\n}\n.left-column .folder-selector .add-folder:hover {\n  background: #44a580;\n  border-radius: 10px;\n}\n.left-column .folder-selector .folder-path {\n  width: calc(100% - 50px);\n  right: 15px;\n  outline-color: unset;\n  padding: 5px;\n  outline: unset;\n}\n.left-column .folder-selector .folder-path:focus {\n  border: 1px solid #707070;\n}\n\n.right-column {\n  border-radius: 5px;\n  border: 1px solid #3f3f3f;\n}\n\n.footer {\n  color: #535353;\n  position: fixed;\n  bottom: 5px;\n  left: 5px;\n  font-size: 11px;\n}", "",{"version":3,"sources":["webpack://src/render/styles.scss"],"names":[],"mappings":"AAOA;EACI,YAAA;EAIA,yBAXmB;EAYnB,oBAAA;AARJ;AAII;EACI,YAAA;AAFR;;AAQA;EACI,oCAAA;EACA,kBAAA;AALJ;;AAQA;EACI,iCAAA;EACA,mBAvBiB;EAwBjB,cArBG;EAsBH,SAAA;AALJ;;AAQA;EACI,WAAA;EACA,YAAA;EACA,MAAA;EACA,kBAAA;EACA,aAAA;EACA,sBAAA;EACA,aAAA;EACA,mBAAA;AALJ;AAMI;EACI,OAAA;AAJR;AAMI;EACI,OAAA;AAJR;AAOI;EACI,WAAA;EACA,kBAAA;AALR;;AASA;EACI,yBAAA;EACA,SAAA;AANJ;;AASA;EACI,sBAAA;AANJ;AAOI;EACI,WAAA;EACA,YAAA;EACA,qBAAA;EACA,kBAAA;AALR;AAMQ;;EAEI,YAAA;EACA,qBAAA;EACA,yBAAA;EACA,kBAAA;EACA,kBAAA;EACA,MAAA;EACA,sBAAA;AAJZ;AAMQ;EACI,WAAA;EACA,OAAA;EACA,oBAAA;EACA,eAAA;AAJZ;AAMQ;EACI,mBA3EF;EA4EE,mBAAA;AAJZ;AAOQ;EACI,wBAAA;EACA,WAAA;EACA,oBAAA;EACA,YAAA;EACA,cAAA;AALZ;AAOQ;EACI,yBAAA;AALZ;;AAUA;EACI,kBAAA;EACA,yBAAA;AAPJ;;AAUA;EACI,cAAA;EACA,eAAA;EACA,WAAA;EACA,SAAA;EACA,eAAA;AAPJ","sourcesContent":["$primary-background: rgb(37, 37, 37);\n$secondary-background: rgb(63, 63, 63);\n$secondary-background-highlight: rgb(112, 112, 112);\n$text: rgb(214, 214, 214);\n$primary: rgb(68, 165, 128);\n@import url('https://fonts.googleapis.com/css2?family=Ubuntu:wght@300&display=swap');\n\ndiv#electron-titlebar {\n    height: 29px;\n    div {\n        height: 29px;\n    }\n    background-color: $secondary-background;\n    transition: all 0.2s;\n}\n\n#electron-titlebar > .button-close.hover {\n    background-color:  rgb(255, 88, 88) !important;\n    border-radius: 4px;\n}\n\nbody {\n    font-family: 'Ubuntu', sans-serif;\n    background: $primary-background;\n    color: $text;\n    margin: 0;\n}\n\n.main-content {\n    width: 100%;\n    height: 100%;\n    top: 0;\n    position: absolute;\n    padding: 15px;\n    box-sizing: border-box;\n    display: flex;\n    flex-direction: row;\n    div.left-column {\n        flex: 2;\n    }\n    div.right-column {\n        flex: 1\n    }\n\n    .column .column-title {\n        width: 100%;\n        text-align: center;\n    }\n}\n\ndiv#electron-titlebar + .main-content {\n    height: calc(100% - 29px);\n    top: 29px;\n}\n\n.left-column {\n    box-sizing: border-box;\n    .folder-selector {\n        width: 100%;\n        height: 30px;\n        display: inline-block;\n        position: relative;\n        .add-folder,\n        .folder-path {\n            height: 30px;\n            display: inline-block;\n            border: 1px solid $secondary-background;\n            border-radius: 5px;\n            position: absolute;\n            top: 0;\n            box-sizing: border-box;\n        }\n        .add-folder {\n            width: 30px;\n            left: 0;\n            transition: all 0.2s;\n            cursor: pointer;\n        }\n        .add-folder:hover {\n            background: $primary;\n            border-radius: 10px;\n        }\n\n        .folder-path {\n            width: calc(100% - 50px);\n            right: 15px;\n            outline-color: unset;\n            padding: 5px;\n            outline: unset\n        }\n        .folder-path:focus {\n            border: 1px solid $secondary-background-highlight;\n        }\n    }\n}\n\n.right-column {\n    border-radius: 5px;\n    border: 1px solid $secondary-background;\n}\n\n.footer {\n    color: rgb(83, 83, 83);\n    position: fixed;\n    bottom: 5px;\n    left: 5px;\n    font-size: 11px;\n}"],"sourceRoot":""}]);
// Exports
/* harmony default export */ __webpack_exports__["default"] = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/api.js":
/*!*****************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/api.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
// eslint-disable-next-line func-names
module.exports = function (useSourceMap) {
  var list = []; // return the list of modules as css string

  list.toString = function toString() {
    return this.map(function (item) {
      var content = cssWithMappingToString(item, useSourceMap);

      if (item[2]) {
        return "@media ".concat(item[2], " {").concat(content, "}");
      }

      return content;
    }).join('');
  }; // import a list of modules into the list
  // eslint-disable-next-line func-names


  list.i = function (modules, mediaQuery, dedupe) {
    if (typeof modules === 'string') {
      // eslint-disable-next-line no-param-reassign
      modules = [[null, modules, '']];
    }

    var alreadyImportedModules = {};

    if (dedupe) {
      for (var i = 0; i < this.length; i++) {
        // eslint-disable-next-line prefer-destructuring
        var id = this[i][0];

        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }

    for (var _i = 0; _i < modules.length; _i++) {
      var item = [].concat(modules[_i]);

      if (dedupe && alreadyImportedModules[item[0]]) {
        // eslint-disable-next-line no-continue
        continue;
      }

      if (mediaQuery) {
        if (!item[2]) {
          item[2] = mediaQuery;
        } else {
          item[2] = "".concat(mediaQuery, " and ").concat(item[2]);
        }
      }

      list.push(item);
    }
  };

  return list;
};

function cssWithMappingToString(item, useSourceMap) {
  var content = item[1] || ''; // eslint-disable-next-line prefer-destructuring

  var cssMapping = item[3];

  if (!cssMapping) {
    return content;
  }

  if (useSourceMap && typeof btoa === 'function') {
    var sourceMapping = toComment(cssMapping);
    var sourceURLs = cssMapping.sources.map(function (source) {
      return "/*# sourceURL=".concat(cssMapping.sourceRoot || '').concat(source, " */");
    });
    return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
  }

  return [content].join('\n');
} // Adapted from convert-source-map (MIT)


function toComment(sourceMap) {
  // eslint-disable-next-line no-undef
  var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
  var data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(base64);
  return "/*# ".concat(data, " */");
}

/***/ }),

/***/ "./node_modules/electron-platform/index.js":
/*!*************************************************!*\
  !*** ./node_modules/electron-platform/index.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


(function (window, factory) {
  if (true) {
    module.exports = factory();
  } else {}
})(this, function () {

  let platform = {};

  /**
   * @property isNode
   * @type boolean
   *
   * Indicates whether executes in node.js application.
   */
  platform.isNode = !!(typeof process !== 'undefined' && process.versions && process.versions.node);

  if (platform.isNode) {
    /**
     * @property isDarwin
     * @type boolean
     *
     * Indicates whether executes in OSX.
     */
    platform.isDarwin = process.platform === 'darwin';

    /**
     * @property isWin32
     * @type boolean
     *
     * Indicates whether executes in Windows.
     */
    platform.isWin32 = process.platform === 'win32';

    /**
     * @property isElectron
     * @type boolean
     *
     * Indicates whether executes in electron.
     */
    platform.isElectron = !!('electron' in process.versions);

  } else {
    // http://stackoverflow.com/questions/19877924/what-is-the-list-of-possible-values-for-navigator-platform-as-of-today
    let platform_ = window.navigator.platform;
    platform.isDarwin = platform_.substring(0, 3) === 'Mac';
    platform.isWin32 = platform_.substring(0, 3) === 'Win';

    platform.isElectron = window.navigator.userAgent.indexOf('Electron') !== -1;
  }

  /**
   * @property isNative
   * @type boolean
   *
   * Indicates whether executes in native environment (compare to web-browser).
   */
  platform.isNative = platform.isElectron;

  /**
   * @property isPureWeb
   * @type boolean
   *
   * Indicates whether executes in common web browser.
   */
  platform.isPureWeb = !platform.isNode && !platform.isNative;

  /**
   * @property isRendererProcess
   * @type boolean
   *
   * Indicates whether executes in common web browser, or editor's renderer process(web-page).
   */
  platform.isRendererProcess = typeof process === 'undefined' || process.type === 'renderer';

  /**
   * @property isMainProcess
   * @type boolean
   *
   * Indicates whether executes in editor's main process.
   */
  platform.isMainProcess = typeof process !== 'undefined' && process.type === 'browser';

  /**
   * @property isDev
   * @type boolean
   *
   * Check if Electron is running in development.
   * If we are in renderer process and `nodeIntegration` is false, isDev will be undefined.
   */
  // NOTE: Reference from https://github.com/sindresorhus/electron-is-dev
  if ( typeof process !== 'undefined' ) {
    platform.isDev = process.defaultApp || /[\\/]electron-prebuilt[\\/]/.test(process.execPath) || /[\\/]electron[\\/]/.test(process.execPath);
  }

  /**
   * @property isRetina
   * @type boolean
   *
   * Check if running in retina display.
   */
  Object.defineProperty(platform, 'isRetina', {
    enumerable: true,
    get () {
      return platform.isRendererProcess && window.devicePixelRatio && window.devicePixelRatio > 1;
    }
  });

  return platform;
});


/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js":
/*!****************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js ***!
  \****************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var isOldIE = function isOldIE() {
  var memo;
  return function memorize() {
    if (typeof memo === 'undefined') {
      // Test for IE <= 9 as proposed by Browserhacks
      // @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
      // Tests for existence of standard globals is to allow style-loader
      // to operate correctly into non-standard environments
      // @see https://github.com/webpack-contrib/style-loader/issues/177
      memo = Boolean(window && document && document.all && !window.atob);
    }

    return memo;
  };
}();

var getTarget = function getTarget() {
  var memo = {};
  return function memorize(target) {
    if (typeof memo[target] === 'undefined') {
      var styleTarget = document.querySelector(target); // Special case to return head of iframe instead of iframe itself

      if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
        try {
          // This will throw an exception if access to iframe is blocked
          // due to cross-origin restrictions
          styleTarget = styleTarget.contentDocument.head;
        } catch (e) {
          // istanbul ignore next
          styleTarget = null;
        }
      }

      memo[target] = styleTarget;
    }

    return memo[target];
  };
}();

var stylesInDom = [];

function getIndexByIdentifier(identifier) {
  var result = -1;

  for (var i = 0; i < stylesInDom.length; i++) {
    if (stylesInDom[i].identifier === identifier) {
      result = i;
      break;
    }
  }

  return result;
}

function modulesToDom(list, options) {
  var idCountMap = {};
  var identifiers = [];

  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var count = idCountMap[id] || 0;
    var identifier = "".concat(id, " ").concat(count);
    idCountMap[id] = count + 1;
    var index = getIndexByIdentifier(identifier);
    var obj = {
      css: item[1],
      media: item[2],
      sourceMap: item[3]
    };

    if (index !== -1) {
      stylesInDom[index].references++;
      stylesInDom[index].updater(obj);
    } else {
      stylesInDom.push({
        identifier: identifier,
        updater: addStyle(obj, options),
        references: 1
      });
    }

    identifiers.push(identifier);
  }

  return identifiers;
}

function insertStyleElement(options) {
  var style = document.createElement('style');
  var attributes = options.attributes || {};

  if (typeof attributes.nonce === 'undefined') {
    var nonce =  true ? __webpack_require__.nc : undefined;

    if (nonce) {
      attributes.nonce = nonce;
    }
  }

  Object.keys(attributes).forEach(function (key) {
    style.setAttribute(key, attributes[key]);
  });

  if (typeof options.insert === 'function') {
    options.insert(style);
  } else {
    var target = getTarget(options.insert || 'head');

    if (!target) {
      throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
    }

    target.appendChild(style);
  }

  return style;
}

function removeStyleElement(style) {
  // istanbul ignore if
  if (style.parentNode === null) {
    return false;
  }

  style.parentNode.removeChild(style);
}
/* istanbul ignore next  */


var replaceText = function replaceText() {
  var textStore = [];
  return function replace(index, replacement) {
    textStore[index] = replacement;
    return textStore.filter(Boolean).join('\n');
  };
}();

function applyToSingletonTag(style, index, remove, obj) {
  var css = remove ? '' : obj.media ? "@media ".concat(obj.media, " {").concat(obj.css, "}") : obj.css; // For old IE

  /* istanbul ignore if  */

  if (style.styleSheet) {
    style.styleSheet.cssText = replaceText(index, css);
  } else {
    var cssNode = document.createTextNode(css);
    var childNodes = style.childNodes;

    if (childNodes[index]) {
      style.removeChild(childNodes[index]);
    }

    if (childNodes.length) {
      style.insertBefore(cssNode, childNodes[index]);
    } else {
      style.appendChild(cssNode);
    }
  }
}

function applyToTag(style, options, obj) {
  var css = obj.css;
  var media = obj.media;
  var sourceMap = obj.sourceMap;

  if (media) {
    style.setAttribute('media', media);
  } else {
    style.removeAttribute('media');
  }

  if (sourceMap && btoa) {
    css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
  } // For old IE

  /* istanbul ignore if  */


  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    while (style.firstChild) {
      style.removeChild(style.firstChild);
    }

    style.appendChild(document.createTextNode(css));
  }
}

var singleton = null;
var singletonCounter = 0;

function addStyle(obj, options) {
  var style;
  var update;
  var remove;

  if (options.singleton) {
    var styleIndex = singletonCounter++;
    style = singleton || (singleton = insertStyleElement(options));
    update = applyToSingletonTag.bind(null, style, styleIndex, false);
    remove = applyToSingletonTag.bind(null, style, styleIndex, true);
  } else {
    style = insertStyleElement(options);
    update = applyToTag.bind(null, style, options);

    remove = function remove() {
      removeStyleElement(style);
    };
  }

  update(obj);
  return function updateStyle(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap) {
        return;
      }

      update(obj = newObj);
    } else {
      remove();
    }
  };
}

module.exports = function (list, options) {
  options = options || {}; // Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
  // tags it will allow on a page

  if (!options.singleton && typeof options.singleton !== 'boolean') {
    options.singleton = isOldIE();
  }

  list = list || [];
  var lastIdentifiers = modulesToDom(list, options);
  return function update(newList) {
    newList = newList || [];

    if (Object.prototype.toString.call(newList) !== '[object Array]') {
      return;
    }

    for (var i = 0; i < lastIdentifiers.length; i++) {
      var identifier = lastIdentifiers[i];
      var index = getIndexByIdentifier(identifier);
      stylesInDom[index].references--;
    }

    var newLastIdentifiers = modulesToDom(newList, options);

    for (var _i = 0; _i < lastIdentifiers.length; _i++) {
      var _identifier = lastIdentifiers[_i];

      var _index = getIndexByIdentifier(_identifier);

      if (stylesInDom[_index].references === 0) {
        stylesInDom[_index].updater();

        stylesInDom.splice(_index, 1);
      }
    }

    lastIdentifiers = newLastIdentifiers;
  };
};

/***/ }),

/***/ "./src/render/app.ts":
/*!***************************!*\
  !*** ./src/render/app.ts ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var platform = __webpack_require__(/*! electron-platform */ "./node_modules/electron-platform/index.js");
var dialog = __webpack_require__(/*! electron */ "electron").remote.dialog;
// import { dialog } from 'electron'
// let dialog = remote.require('electron').dialog;
if (!platform.isDarwin) {
    var titlebar = document.createElement('div');
    titlebar.id = 'electron-titlebar';
    titlebar.classList.add('drag');
    document.body.prepend(titlebar);
    __webpack_require__(/*! electron-titlebar */ "electron-titlebar");
}
var folderInput = document.getElementsByClassName('folder-path')[0];
var folderButton = document.getElementsByClassName('add-folder')[0];
var folderSelector = document.getElementById('folder-selector');
folderButton.addEventListener('click', function () { return __awaiter(void 0, void 0, void 0, function () {
    var path;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, dialog.showOpenDialog({
                    properties: ['openDirectory']
                })];
            case 1:
                path = _a.sent();
                folderInput.innerHTML = path.filePaths[0];
                return [2 /*return*/];
        }
    });
}); });


/***/ }),

/***/ "./src/render/styles.scss":
/*!********************************!*\
  !*** ./src/render/styles.scss ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var api = __webpack_require__(/*! ../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
            var content = __webpack_require__(/*! !../../node_modules/css-loader/dist/cjs.js!../../node_modules/sass-loader/dist/cjs.js!./styles.scss */ "./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!./src/render/styles.scss");

            content = content.__esModule ? content.default : content;

            if (typeof content === 'string') {
              content = [[module.i, content, '']];
            }

var options = {};

options.insert = "head";
options.singleton = false;

var update = api(content, options);



module.exports = content.locals || {};

/***/ }),

/***/ 0:
/*!**********************************************************!*\
  !*** multi ./src/render/app.ts ./src/render/styles.scss ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(/*! ./src/render/app.ts */"./src/render/app.ts");
module.exports = __webpack_require__(/*! ./src/render/styles.scss */"./src/render/styles.scss");


/***/ }),

/***/ "electron":
/*!***************************!*\
  !*** external "electron" ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("electron");

/***/ }),

/***/ "electron-titlebar":
/*!*************************************************!*\
  !*** external "require(\"electron-titlebar\")" ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("electron-titlebar");

/***/ })

/******/ });
//# sourceMappingURL=app.js.map