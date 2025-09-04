"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/browserify-sign";
exports.ids = ["vendor-chunks/browserify-sign"];
exports.modules = {

/***/ "(ssr)/./node_modules/browserify-sign/algos.js":
/*!***********************************************!*\
  !*** ./node_modules/browserify-sign/algos.js ***!
  \***********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("\n\nmodule.exports = __webpack_require__(/*! ./browser/algorithms.json */ \"(ssr)/./node_modules/browserify-sign/browser/algorithms.json\");\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1zaWduL2FsZ29zLmpzIiwibWFwcGluZ3MiOiJBQUFhOztBQUViLHFJQUFxRCIsInNvdXJjZXMiOlsid2VicGFjazovLzBnLWluZmVyZW5jZS1uZXh0anMvLi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1zaWduL2FsZ29zLmpzPzhiZmIiXSwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vYnJvd3Nlci9hbGdvcml0aG1zLmpzb24nKTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/browserify-sign/algos.js\n");

/***/ }),

/***/ "(ssr)/./node_modules/browserify-sign/index.js":
/*!***********************************************!*\
  !*** ./node_modules/browserify-sign/index.js ***!
  \***********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\n\nvar crypto = __webpack_require__(/*! crypto */ \"crypto\");\n\nexports.createSign = crypto.createSign;\nexports.Sign = crypto.Sign;\n\nexports.createVerify = crypto.createVerify;\nexports.Verify = crypto.Verify;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1zaWduL2luZGV4LmpzIiwibWFwcGluZ3MiOiJBQUFhOztBQUViLGFBQWEsbUJBQU8sQ0FBQyxzQkFBUTs7QUFFN0Isa0JBQWtCO0FBQ2xCLFlBQVk7O0FBRVosb0JBQW9CO0FBQ3BCLGNBQWMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8wZy1pbmZlcmVuY2UtbmV4dGpzLy4vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktc2lnbi9pbmRleC5qcz9mZDlkIl0sInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxudmFyIGNyeXB0byA9IHJlcXVpcmUoJ2NyeXB0bycpO1xuXG5leHBvcnRzLmNyZWF0ZVNpZ24gPSBjcnlwdG8uY3JlYXRlU2lnbjtcbmV4cG9ydHMuU2lnbiA9IGNyeXB0by5TaWduO1xuXG5leHBvcnRzLmNyZWF0ZVZlcmlmeSA9IGNyeXB0by5jcmVhdGVWZXJpZnk7XG5leHBvcnRzLlZlcmlmeSA9IGNyeXB0by5WZXJpZnk7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/browserify-sign/index.js\n");

/***/ }),

/***/ "(ssr)/./node_modules/browserify-sign/browser/algorithms.json":
/*!**************************************************************!*\
  !*** ./node_modules/browserify-sign/browser/algorithms.json ***!
  \**************************************************************/
/***/ ((module) => {

module.exports = JSON.parse('{"sha224WithRSAEncryption":{"sign":"rsa","hash":"sha224","id":"302d300d06096086480165030402040500041c"},"RSA-SHA224":{"sign":"ecdsa/rsa","hash":"sha224","id":"302d300d06096086480165030402040500041c"},"sha256WithRSAEncryption":{"sign":"rsa","hash":"sha256","id":"3031300d060960864801650304020105000420"},"RSA-SHA256":{"sign":"ecdsa/rsa","hash":"sha256","id":"3031300d060960864801650304020105000420"},"sha384WithRSAEncryption":{"sign":"rsa","hash":"sha384","id":"3041300d060960864801650304020205000430"},"RSA-SHA384":{"sign":"ecdsa/rsa","hash":"sha384","id":"3041300d060960864801650304020205000430"},"sha512WithRSAEncryption":{"sign":"rsa","hash":"sha512","id":"3051300d060960864801650304020305000440"},"RSA-SHA512":{"sign":"ecdsa/rsa","hash":"sha512","id":"3051300d060960864801650304020305000440"},"RSA-SHA1":{"sign":"rsa","hash":"sha1","id":"3021300906052b0e03021a05000414"},"ecdsa-with-SHA1":{"sign":"ecdsa","hash":"sha1","id":""},"sha256":{"sign":"ecdsa","hash":"sha256","id":""},"sha224":{"sign":"ecdsa","hash":"sha224","id":""},"sha384":{"sign":"ecdsa","hash":"sha384","id":""},"sha512":{"sign":"ecdsa","hash":"sha512","id":""},"DSA-SHA":{"sign":"dsa","hash":"sha1","id":""},"DSA-SHA1":{"sign":"dsa","hash":"sha1","id":""},"DSA":{"sign":"dsa","hash":"sha1","id":""},"DSA-WITH-SHA224":{"sign":"dsa","hash":"sha224","id":""},"DSA-SHA224":{"sign":"dsa","hash":"sha224","id":""},"DSA-WITH-SHA256":{"sign":"dsa","hash":"sha256","id":""},"DSA-SHA256":{"sign":"dsa","hash":"sha256","id":""},"DSA-WITH-SHA384":{"sign":"dsa","hash":"sha384","id":""},"DSA-SHA384":{"sign":"dsa","hash":"sha384","id":""},"DSA-WITH-SHA512":{"sign":"dsa","hash":"sha512","id":""},"DSA-SHA512":{"sign":"dsa","hash":"sha512","id":""},"DSA-RIPEMD160":{"sign":"dsa","hash":"rmd160","id":""},"ripemd160WithRSA":{"sign":"rsa","hash":"rmd160","id":"3021300906052b2403020105000414"},"RSA-RIPEMD160":{"sign":"rsa","hash":"rmd160","id":"3021300906052b2403020105000414"},"md5WithRSAEncryption":{"sign":"rsa","hash":"md5","id":"3020300c06082a864886f70d020505000410"},"RSA-MD5":{"sign":"rsa","hash":"md5","id":"3020300c06082a864886f70d020505000410"}}');

/***/ })

};
;