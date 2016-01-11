//
// requestAnimationFrame polyfill by Erik Möller.
//  With fixes from Paul Irish and Tino Zijdel
//
//  http://paulirish.com/2011/requestanimationframe-for-smart-animating/
//  http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
//
//  MIT license
//
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.requestAni = requestAni;
exports.animate = animate;

function requestAni() {
    (function () {
        var lastTime = 0;
        var vendors = ['webkit', 'moz'];
        for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
        }

        if (!window.requestAnimationFrame) window.requestAnimationFrame = function (callback) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function () {
                callback(currTime + timeToCall);
            }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

        if (!window.cancelAnimationFrame) window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };
    })();
}

/**
 * TinyAnimate
 *  version 0.2.0
 *
 * Source:  https://github.com/branneman/TinyAnimate
 * Author:  Bran van der Meer <branmovic@gmail.com> (http://bran.name/)
 * License: MIT
 */

function animate(from, to, duration, update, easing, done) {
    // Early bail out if called incorrectly
    if (typeof from !== 'number' || typeof to !== 'number' || typeof duration !== 'number' || typeof update !== 'function') return;

    // Determine easing
    if (typeof easing === 'string' && easings[easing]) {
        easing = easings[easing];
    }
    if (typeof easing !== 'function') {
        easing = easings.linear;
    }

    // Create mock done() function if necessary
    if (typeof done !== 'function') {
        done = function () {};
    }

    // Pick implementation (requestAnimationFrame | setTimeout)
    var rAF = window.requestAnimationFrame || function (callback) {
        window.setTimeout(callback, 1000 / 60);
    };

    // Animation loop
    var change = to - from;
    function loop() {
        var time = +new Date() - start;
        update(easing(time, from, change, duration));
        if (time >= duration) {
            update(to);
            done();
        } else {
            rAF(loop);
        }
    }
    update(from);

    // Start animation loop
    var start = +new Date();
    rAF(loop);
}

// https://github.com/branneman/TinyAnimate/blob/master/src/TinyAnimate.js
var easings = {};
easings.linear = function (t, b, c, d) {
    return c * t / d + b;
};
easings.easeInOutQuad = function (t, b, c, d) {
    if ((t /= d / 2) < 1) return c / 2 * t * t + b;
    return -c / 2 * (--t * (t - 2) - 1) + b;
};
easings.easeInOutCubic = function (t, b, c, d) {
    if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
    return c / 2 * ((t -= 2) * t * t + 2) + b;
};