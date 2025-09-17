"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/browserify-rsa";
exports.ids = ["vendor-chunks/browserify-rsa"];
exports.modules = {

/***/ "(ssr)/./node_modules/browserify-rsa/index.js":
/*!**********************************************!*\
  !*** ./node_modules/browserify-rsa/index.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("\n\nvar BN = __webpack_require__(/*! bn.js */ \"(ssr)/./node_modules/bn.js/lib/bn.js\");\nvar randomBytes = __webpack_require__(/*! randombytes */ \"(ssr)/./node_modules/randombytes/index.js\");\nvar Buffer = (__webpack_require__(/*! safe-buffer */ \"(ssr)/./node_modules/safe-buffer/index.js\").Buffer);\n\nfunction getr(priv) {\n\tvar len = priv.modulus.byteLength();\n\tvar r;\n\tdo {\n\t\tr = new BN(randomBytes(len));\n\t} while (r.cmp(priv.modulus) >= 0 || !r.umod(priv.prime1) || !r.umod(priv.prime2));\n\treturn r;\n}\n\nfunction blind(priv) {\n\tvar r = getr(priv);\n\tvar blinder = r.toRed(BN.mont(priv.modulus)).redPow(new BN(priv.publicExponent)).fromRed();\n\treturn { blinder: blinder, unblinder: r.invm(priv.modulus) };\n}\n\nfunction crt(msg, priv) {\n\tvar blinds = blind(priv);\n\tvar len = priv.modulus.byteLength();\n\tvar blinded = new BN(msg).mul(blinds.blinder).umod(priv.modulus);\n\tvar c1 = blinded.toRed(BN.mont(priv.prime1));\n\tvar c2 = blinded.toRed(BN.mont(priv.prime2));\n\tvar qinv = priv.coefficient;\n\tvar p = priv.prime1;\n\tvar q = priv.prime2;\n\tvar m1 = c1.redPow(priv.exponent1).fromRed();\n\tvar m2 = c2.redPow(priv.exponent2).fromRed();\n\tvar h = m1.isub(m2).imul(qinv).umod(p).imul(q);\n\treturn m2.iadd(h).imul(blinds.unblinder).umod(priv.modulus).toArrayLike(Buffer, 'be', len);\n}\ncrt.getr = getr;\n\nmodule.exports = crt;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1yc2EvaW5kZXguanMiLCJtYXBwaW5ncyI6IkFBQWE7O0FBRWIsU0FBUyxtQkFBTyxDQUFDLG1EQUFPO0FBQ3hCLGtCQUFrQixtQkFBTyxDQUFDLDhEQUFhO0FBQ3ZDLGFBQWEsNEZBQTZCOztBQUUxQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSIsInNvdXJjZXMiOlsid2VicGFjazovLzBnLWluZmVyZW5jZS1uZXh0anMvLi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1yc2EvaW5kZXguanM/MDYwYyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbnZhciBCTiA9IHJlcXVpcmUoJ2JuLmpzJyk7XG52YXIgcmFuZG9tQnl0ZXMgPSByZXF1aXJlKCdyYW5kb21ieXRlcycpO1xudmFyIEJ1ZmZlciA9IHJlcXVpcmUoJ3NhZmUtYnVmZmVyJykuQnVmZmVyO1xuXG5mdW5jdGlvbiBnZXRyKHByaXYpIHtcblx0dmFyIGxlbiA9IHByaXYubW9kdWx1cy5ieXRlTGVuZ3RoKCk7XG5cdHZhciByO1xuXHRkbyB7XG5cdFx0ciA9IG5ldyBCTihyYW5kb21CeXRlcyhsZW4pKTtcblx0fSB3aGlsZSAoci5jbXAocHJpdi5tb2R1bHVzKSA+PSAwIHx8ICFyLnVtb2QocHJpdi5wcmltZTEpIHx8ICFyLnVtb2QocHJpdi5wcmltZTIpKTtcblx0cmV0dXJuIHI7XG59XG5cbmZ1bmN0aW9uIGJsaW5kKHByaXYpIHtcblx0dmFyIHIgPSBnZXRyKHByaXYpO1xuXHR2YXIgYmxpbmRlciA9IHIudG9SZWQoQk4ubW9udChwcml2Lm1vZHVsdXMpKS5yZWRQb3cobmV3IEJOKHByaXYucHVibGljRXhwb25lbnQpKS5mcm9tUmVkKCk7XG5cdHJldHVybiB7IGJsaW5kZXI6IGJsaW5kZXIsIHVuYmxpbmRlcjogci5pbnZtKHByaXYubW9kdWx1cykgfTtcbn1cblxuZnVuY3Rpb24gY3J0KG1zZywgcHJpdikge1xuXHR2YXIgYmxpbmRzID0gYmxpbmQocHJpdik7XG5cdHZhciBsZW4gPSBwcml2Lm1vZHVsdXMuYnl0ZUxlbmd0aCgpO1xuXHR2YXIgYmxpbmRlZCA9IG5ldyBCTihtc2cpLm11bChibGluZHMuYmxpbmRlcikudW1vZChwcml2Lm1vZHVsdXMpO1xuXHR2YXIgYzEgPSBibGluZGVkLnRvUmVkKEJOLm1vbnQocHJpdi5wcmltZTEpKTtcblx0dmFyIGMyID0gYmxpbmRlZC50b1JlZChCTi5tb250KHByaXYucHJpbWUyKSk7XG5cdHZhciBxaW52ID0gcHJpdi5jb2VmZmljaWVudDtcblx0dmFyIHAgPSBwcml2LnByaW1lMTtcblx0dmFyIHEgPSBwcml2LnByaW1lMjtcblx0dmFyIG0xID0gYzEucmVkUG93KHByaXYuZXhwb25lbnQxKS5mcm9tUmVkKCk7XG5cdHZhciBtMiA9IGMyLnJlZFBvdyhwcml2LmV4cG9uZW50MikuZnJvbVJlZCgpO1xuXHR2YXIgaCA9IG0xLmlzdWIobTIpLmltdWwocWludikudW1vZChwKS5pbXVsKHEpO1xuXHRyZXR1cm4gbTIuaWFkZChoKS5pbXVsKGJsaW5kcy51bmJsaW5kZXIpLnVtb2QocHJpdi5tb2R1bHVzKS50b0FycmF5TGlrZShCdWZmZXIsICdiZScsIGxlbik7XG59XG5jcnQuZ2V0ciA9IGdldHI7XG5cbm1vZHVsZS5leHBvcnRzID0gY3J0O1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/browserify-rsa/index.js\n");

/***/ })

};
;