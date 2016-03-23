'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _Utils = require('./Utils');

var SectionsContainer = _react2['default'].createClass({
	displayName: 'SectionsContainer',

	isScrolling: false,
	newSection: false,
	scrollings: [],
	prevMouseWheelTime: new Date().getTime(),

	propTypes: {
		containerSelector: _react2['default'].PropTypes.string,
		updateBackground: _react2['default'].PropTypes.bool,
		delay: _react2['default'].PropTypes.number,
		verticalAlign: _react2['default'].PropTypes.bool,
		scrollBar: _react2['default'].PropTypes.bool,
		navigation: _react2['default'].PropTypes.bool,
		className: _react2['default'].PropTypes.string,
		sectionClassName: _react2['default'].PropTypes.string,
		navigationClass: _react2['default'].PropTypes.string,
		navigationAnchorClass: _react2['default'].PropTypes.string,
		activeClass: _react2['default'].PropTypes.string,
		sectionPaddingTop: _react2['default'].PropTypes.string,
		sectionPaddingBottom: _react2['default'].PropTypes.string,
		arrowNavigation: _react2['default'].PropTypes.bool,
		anchors: _react2['default'].PropTypes.array,
		autoFooterHeight: _react2['default'].PropTypes.bool,
		css3: _react2['default'].PropTypes.bool,
		touchSensitivity: _react2['default'].PropTypes.number
	},

	getInitialState: function getInitialState() {
		return {
			activeSection: 0,
			scrollingStarted: false,
			sectionScrolledPosition: 0,
			windowHeight: 500
		};
	},

	getDefaultProps: function getDefaultProps() {
		return {
			containerSelector: '#container',
			updateBackground: true,
			delay: 1000,
			verticalAlign: false,
			scrollBar: false,
			navigation: true,
			className: 'SectionContainer',
			sectionClassName: 'Section',
			anchors: [],
			autoFooterHeight: false,
			activeClass: 'active',
			sectionPaddingTop: '0',
			sectionPaddingBottom: '0',
			arrowNavigation: true,
			css3: true,
			touchSensitivity: 5
		};
	},

	componentWillUpdate: function componentWillUpdate(nextProps, nextState) {
		if (this.state.activeSection !== nextState.activeSection) {
			this.newSection = true;
			if (this.props.updateBackground) this._changeBackground(nextState.activeSection);
		}
	},

	componentDidUpdate: function componentDidUpdate(prevProps, prevState) {},

	componentWillMount: function componentWillMount() {
		this.touchStartY = 0;
		this.touchStartX = 0;
		this.touchEndY = 0;
		this.touchEndX = 0;
		this.isTouchDevice = false;
		this.isTouch = false;

		if (typeof navigator !== 'undefined' && typeof window !== 'undefined') {
			this.isTouchDevice = navigator.userAgent.match(/(iPhone|iPod|iPad|Android|playbook|silk|BlackBerry|BB10|Windows Phone|Tizen|Bada|webOS|IEMobile|Opera Mini)/);
			this.isTouch = 'ontouchstart' in window || navigator.msMaxTouchPoints > 0 || navigator.maxTouchPoints;
		}
	},

	componentDidMount: function componentDidMount() {
		var css3 = this.props.css3;

		this.useCSS3 = css3 ? this.support3d() : false;
		if (!this.useCSS3) (0, _Utils.requestAni)();

		window.addEventListener('resize', this._handleResize);

		if (!this.props.scrollBar) {
			this._addCSS3Scroll();
			// this._handleAnchor(); //Go to anchor in case we found it in the URL
			this.addTransitionEnd();

			// window.addEventListener('hashchange', this._handleAnchor, false); //Add an event to watch the url hash changes

			if (this.props.arrowNavigation) {
				window.addEventListener('keydown', this._handleArrowKeys);
			}
		}

		// Get actual window height
		if (this.state.windowHeight !== this._getHeight()) this._handleResize(true);

		if (this.props.updateBackground) this._changeBackground(this.state.activeSection);
	},

	componentWillUnmount: function componentWillUnmount() {
		if (this.props.updateBackground) this._resetBackground();
		this._removeMouseWheelEventHandlers();
		this._removeTouchHandler();
		this.removeTransitionEnd();
		window.removeEventListener('resize', this._handleResize);
		// window.removeEventListener('hashchange', this._handleAnchor, false);
		window.removeEventListener('keydown', this._handleArrowKeys);
	},

	_getHeight: function _getHeight() {
		var el = document.querySelector('#container');
		if (!el) return window.innerHeight;
		var style = window.getComputedStyle(el);
		return parseFloat(style.getPropertyValue('height')) - parseFloat(style.getPropertyValue('border-top-width'));
	},

	_changeBackground: function _changeBackground(index) {
		var container = document.querySelector(this.props.containerSelector);
		if (!container) return;
		var section = container.querySelectorAll("div.section")[index];
		if (!section) return;
		container.style.background = window.getComputedStyle(section).getPropertyValue('background');
	},

	_resetBackground: function _resetBackground() {
		var container = document.querySelector(this.props.containerSelector);
		container.style.background = "rgba(0,0,0,0)";
	},

	_addCSS3Scroll: function _addCSS3Scroll() {
		this._addOverflowToBody();
		this._addHeightToParents();
		this._addMouseWheelEventHandlers();
		this._addTouchHandler();
	},

	// _addActiveClass() {
	//   this._removeActiveClass();
	//
	//   let hash = window.location.hash.substring(1);
	//   let activeLinks = document.querySelectorAll(`a[href="#${hash}"]`);
	//
	//   for( let i=0; i < activeLinks.length; i++) {
	//     activeLinks[i].className = activeLinks[i].className + (activeLinks[i].className.length > 0 ? ' ': '') + `${this.props.activeClass}`;
	//   }
	// },
	//
	// _removeActiveClass() {
	//   let activeLinks = document.querySelectorAll(`a:not([href="#${this.props.anchors[this.state.activeSection]}"])`);
	//
	//   for( let i=0; i < activeLinks.length; i++) {
	//     activeLinks[i].className = activeLinks[i].className.replace(/\b ?active/g, '');
	//   }
	// },

	_addChildren: function _addChildren() {
		var _this = this;

		return _react2['default'].Children.map(this.props.children, (function (child, index) {
			var ref = _this.props.anchors[index] || 'section-' + index;
			var domId = _this.props.anchors[index] || null;
			var height = _this.state.windowHeight;
			if (_this.props.anchors[index] === 'footer' && _this.props.autoFooterHeight && _this.props.scrollBar) {
				height = 'auto';
			}
			if (ref) {
				return _react2['default'].cloneElement(child, {
					ref: ref,
					id: _this.props.scrollBar ? domId : null,
					windowHeight: height,
					verticalAlign: _this.props.verticalAlign,
					sectionClassName: _this.props.sectionClassName,
					sectionPaddingTop: _this.props.sectionPaddingTop,
					sectionPaddingBottom: _this.props.sectionPaddingBottom
				});
			} else {
				return child;
			}
		}).bind(this));
	},

	_addOverflowToBody: function _addOverflowToBody() {
		document.querySelector('body').style.overflow = 'hidden';
	},

	_addHeightToParents: function _addHeightToParents() {
		var child = _reactDom2['default'].findDOMNode(this);
		var previousParent = child.parentNode;

		while (previousParent) {
			if ('style' in previousParent) {
				previousParent.style.height = '100%';
				previousParent = previousParent.parentNode;
			} else {
				return false;
			}
		}
	},

	_addTouchHandler: function _addTouchHandler() {
		if (this.isTouchDevice || this.isTouch) {
			// Microsoft pointers
			var MSPointer = this._getMSPointer();

			this._removeTouchHandler();
			document.addEventListener('touchstart', this._touchStartHandler);
			document.addEventListener('touchmove', this._touchMoveHandler);
			document.addEventListener(MSPointer.down, this._touchStartHandler);
			document.addEventListener(MSPointer.move, this._touchMoveHandler);
		}
	},

	_removeTouchHandler: function _removeTouchHandler() {
		if (this.isTouchDevice || this.isTouch) {
			// Microsoft pointers
			var MSPointer = this._getMSPointer();

			document.removeEventListener('touchstart');
			document.removeEventListener('touchmove');
			document.removeEventListener(MSPointer.down);
			document.removeEventListener(MSPointer.move);
		}
	},

	_getMSPointer: function _getMSPointer() {
		var pointer = undefined;

		// IE >= 11 & rest of browsers
		if (window.PointerEvent) {
			pointer = { down: 'pointerdown', move: 'pointermove' };
		}

		// IE < 11
		else {
				pointer = { down: 'MSPointerDown', move: 'MSPointerMove' };
			}

		return pointer;
	},

	_getEventsPage: function _getEventsPage(e) {
		var events = [];

		events.y = typeof e.pageY !== 'undefined' && (e.pageY || e.pageX) ? e.pageY : e.touches[0].pageY;
		events.x = typeof e.pageX !== 'undefined' && (e.pageY || e.pageX) ? e.pageX : e.touches[0].pageX;

		// in touch devices with scrollBar:true, e.pageY is detected, but we have to deal with touch events. #1008
		if (this.isTouch && this._isReallyTouch(e) && !this.props.scrollBar) {
			events.y = e.touches[0].pageY;
			events.x = e.touches[0].pageX;
		}

		return events;
	},

	_isReallyTouch: function _isReallyTouch(e) {
		// if is not IE   ||  IE is detecting `touch` or `pen`
		return typeof e.pointerType === 'undefined' || e.pointerType != 'mouse';
	},

	_touchStartHandler: function _touchStartHandler(event) {
		//stopping the auto scroll to adjust to a section
		if (this.props.fitToSection) {
			// $htmlBody.stop();
		}

		if (this._isReallyTouch(event)) {
			var touchEvents = this._getEventsPage(event);
			this.touchStartY = touchEvents.y;
			this.touchStartX = touchEvents.x;
		}
	},

	_touchMoveHandler: function _touchMoveHandler() {
		if (this._isReallyTouch(event)) {
			event.preventDefault();

			var activeSection = this.state.activeSection;
			var slideMoving = this.isScrolling || this.newSection || this.animating;
			var windowHeight = this._getHeight();
			var touchSensitivity = this.props.touchSensitivity;

			if (!slideMoving) {
				if (!this.props.scrollbar) {
					var touchEvents = this._getEventsPage(event);

					this.touchEndY = touchEvents.y;
					this.touchEndX = touchEvents.x;
					// is the movement greater than the minimum resistance to scroll?
					if (Math.abs(this.touchStartY - this.touchEndY) > windowHeight / 100 * touchSensitivity) {
						if (this.touchStartY > this.touchEndY) {
							activeSection++;
						} else if (this.touchEndY > this.touchStartY) {
							activeSection--;
						}

						this._shouldScroll(activeSection);
					}
				}
			}
		}
	},

	_addMouseWheelEventHandlers: function _addMouseWheelEventHandlers() {
		var prefix = '';
		var _addEventListener;

		if (window.addEventListener) {
			_addEventListener = "addEventListener";
		} else {
			_addEventListener = "attachEvent";
			prefix = 'on';
		}

		// detect available wheel event
		var support = 'onwheel' in document.createElement('div') ? 'wheel' : // Modern browsers support "wheel"
		document.onmousewheel !== undefined ? 'mousewheel' : // Webkit and IE support at least "mousewheel"
		'DOMMouseScroll'; // let's assume that remaining browsers are older Firefox

		if (support == 'DOMMouseScroll') {
			document[_addEventListener](prefix + 'MozMousePixelScroll', this._mouseWheelHandler, false);
		}

		//handle MozMousePixelScroll in older Firefox
		else {
				document[_addEventListener](prefix + support, this._mouseWheelHandler, false);
			}
	},

	_removeMouseWheelEventHandlers: function _removeMouseWheelEventHandlers() {
		if (document.addEventListener) {
			document.removeEventListener('mousewheel', this._mouseWheelHandler, false); //IE9, Chrome, Safari, Oper
			document.removeEventListener('wheel', this._mouseWheelHandler, false); //Firefox
			document.removeEventListener('MozMousePixelScroll', this._mouseWheelHandler, false); //old Firefox
		} else {
				document.detachEvent('onmousewheel', this._mouseWheelHandler); //IE 6/7/8
			}
	},

	_mouseWheelHandler: function _mouseWheelHandler(evt) {
		var curTime = new Date().getTime();
		var timeDiff = curTime - this.prevMouseWheelTime;
		this.prevMouseWheelTime = curTime;

		var e = window.event || evt; // old IE support
		var value = e.wheelDelta || -e.deltaY || -e.detail;
		var delta = Math.max(-1, Math.min(1, value));
		var horizontalDetection = typeof e.wheelDeltaX !== 'undefined' || typeof e.deltaX !== 'undefined';
		var isScrollingVertically = Math.abs(e.wheelDeltaX) < Math.abs(e.wheelDelta) || Math.abs(e.deltaX) < Math.abs(e.deltaY) || !horizontalDetection;

		if (this.scrollings.length > 149) {
			this.scrollings.shift();
		}

		this.scrollings.push(Math.abs(value));

		if (timeDiff > 200) {
			//emptying the array, we dont care about old scrollings for our averages
			this.scrollings = [];
		}

		var activeSection = this.state.activeSection;

		if (this.isScrolling || this.newSection || this.animating) {
			return false;
		}

		var averageEnd = this._getAverage(this.scrollings, 10);
		var averageMiddle = this._getAverage(this.scrollings, 70);
		var isAccelerating = averageEnd >= averageMiddle;

		if (isAccelerating && isScrollingVertically) {
			if (delta < 0) {
				activeSection++;
			} else {
				activeSection--;
			}

			this._shouldScroll(activeSection);
		}

		return false;
	},

	_shouldScroll: function _shouldScroll(activeSection) {
		if (activeSection < 0 || !this.props.children.length || activeSection >= this.props.children.length || activeSection === this.state.activeSection) {
			// console.log('failed: ', activeSection);
			return false;
		}

		// this._callOnLeave(activeSection);

		this._goToSection(activeSection);
	},

	// _callOnLeave(goingToIndex) {
	//   if (typeof this.props.onLeave === 'function') {
	//     this.props.onLeave(this.state.activeSection, goingToIndex);
	//   }
	// },

	_getAverage: function _getAverage(elements, number) {
		var sum = 0;

		//taking `number` elements from the end to make the average, if there are not enought, 1
		var lastElements = elements.slice(Math.max(elements.length - number, 1));

		for (var i = 0; i < lastElements.length; i++) {
			sum = sum + lastElements[i];
		}

		return Math.ceil(sum / number);
	},

	_handleResize: function _handleResize(initialResize) {
		var position = 0;
		var index = this.state.activeSection;

		var state = {
			windowHeight: this._getHeight()
		};

		if (initialResize) {
			// index = this._getSectionIndexFromHash();
			// if (index < 0) index = this.state.activeSection;
			state.activeSection = this.state.activeSection;
		}

		state.sectionScrolledPosition = this._getPosition(index, state.windowHeight);
		this.setState(state);
	},

	_getPosition: function _getPosition(index, windowHeight) {
		windowHeight = windowHeight || this.state.windowHeight;

		var position = 0 - index * windowHeight;

		if (this.props.anchors[index] === 'footer' && this.props.autoFooterHeight && this.refs.footer) {
			var elm = _reactDom2['default'].findDOMNode(this.refs.footer);

			elm.style.height = 'auto';
			var height = elm.offsetHeight;
			elm.style.height = windowHeight;

			position = 0 - ((index - 1) * windowHeight + height);
		}

		return position;
	},

	_goToSection: function _goToSection(index) {
		if (index === this.state.activeSection) return;

		var position = this._getPosition(index);

		// this._callOnLeave(index);

		this.setState({
			activeSection: index,
			sectionScrolledPosition: position
		});
	},

	// _handleSectionTransition(index) {
	//   if (!this.props.anchors.length || index === -1 || index >= this.props.anchors.length) {
	//     return false;
	//   }
	//
	//   this._goToSection(index);
	// },

	_handleArrowKeys: function _handleArrowKeys(e) {
		var event = window.event ? window.event : e;
		var code = event.keyCode;
		if (code < 37 || code > 40) return;

		var direction = code === 38 || code === 37 ? this.state.activeSection - 1 : code === 40 || code === 39 ? this.state.activeSection + 1 : -1;
		// const hash      = this.props.anchors[direction];

		// this._callOnLeave(direction);
		this._goToSection(direction);
		// if (!this.props.anchors.length || hash) {
		//   // window.location.hash = '#' + hash;
		// } else {
		//   this._handleSectionTransition(direction);
		// }
	},

	// _getSectionIndexFromHash() {
	//   const hash  = window.location.hash.substring(1);
	//   return this.props.anchors.indexOf(hash);
	// },

	// _handleAnchor() {
	//   const index = this._getSectionIndexFromHash();
	//   if (index < 0) return false;
	//
	//   this._handleSectionTransition(index);
	//
	//   this._addActiveClass();
	// },

	renderNavigation: function renderNavigation() {
		var _this2 = this;

		var navigationStyle = {
			position: 'fixed',
			zIndex: '10',
			right: '20px',
			top: '50%',
			transform: 'translate(-50%, -50%)'
		};

		var anchors = this.props.anchors.map(function (link, index) {
			var anchorStyle = {
				display: 'block',
				margin: '10px',
				borderRadius: '100%',
				backgroundColor: '#556270',
				padding: '5px',
				transition: 'all 0.2s',
				transform: _this2.state.activeSection === index ? 'scale(1.3)' : 'none'
			};
			return _react2['default'].createElement('a', { href: '#' + link, key: index, className: _this2.props.navigationAnchorClass || 'Navigation-Anchor', style: _this2.props.navigationAnchorClass ? null : anchorStyle });
		});

		return _react2['default'].createElement(
			'div',
			{ className: this.props.navigationClass || 'Navigation', style: this.props.navigationClass ? null : navigationStyle },
			anchors
		);
	},

	onTransitionEnd: function onTransitionEnd() {
		this.isScrolling = false;
		if (this.newSection) {
			this.newSection = false;
			if (typeof this.props.afterLoad === 'function') {
				this.props.afterLoad(this.state.activeSection);
			}
		}
	},

	removeTransitionEnd: function removeTransitionEnd() {
		var elm = _reactDom2['default'].findDOMNode(this.refs.sectionContainer);
		if (elm) elm.removeEventListener('transitionend', this.onTransitionEnd);
	},

	addTransitionEnd: function addTransitionEnd() {
		var elm = _reactDom2['default'].findDOMNode(this.refs.sectionContainer);
		elm.addEventListener('transitionend', this.onTransitionEnd);
	},

	setTransforms: function setTransforms(styles) {
		var _this3 = this;

		if (this.props.scrollBar) return;
		if (!this.refs.sectionContainer) return;

		if (this.useCSS3) {
			var movement = 'translate3d(0px, ' + this.state.sectionScrolledPosition + 'px, 0px)';
			styles.WebkitTransform = styles.MozTransform = styles.msTransform = styles.transform = movement;
			styles.transition = 'all ' + this.props.delay + 'ms ease';
		} else if (!this.animating) {
			var from = this.refs.sectionContainer.offsetTop;
			var to = this.state.sectionScrolledPosition;

			if (from == to) return;

			this.animating = true;
			(0, _Utils.animate)(from, this.state.sectionScrolledPosition, this.props.delay, function (d) {
				_this3.refs.sectionContainer.style.top = d + 'px';
			}, 'easeInOutCubic', function () {
				_this3.animating = false;
				_this3.onTransitionEnd();
			});
		}
	},

	support3d: function support3d() {
		var has3d = undefined;
		var el = document.createElement('p');
		var transforms = {
			'webkitTransform': '-webkit-transform',
			'OTransform': '-o-transform',
			'msTransform': '-ms-transform',
			'MozTransform': '-moz-transform',
			'transform': 'transform'
		};

		// Add it to the body to get the computed style.
		document.body.insertBefore(el, null);

		for (var t in transforms) {
			if (el.style[t] !== undefined) {
				el.style[t] = 'translate3d(1px,1px,1px)';
				has3d = window.getComputedStyle(el).getPropertyValue(transforms[t]);
			}
		}

		document.body.removeChild(el);

		return has3d !== undefined && has3d.length > 0 && has3d !== 'none';
	},

	render: function render() {
		var containerStyle = {
			height: '100%',
			width: '100%',
			position: 'relative',
			'msTouchAction': 'none',
			'touchAction': 'none'
		};

		this.setTransforms(containerStyle);

		if (this.props.scrollBar) {
			containerStyle.msTouchAction = containerStyle.touchAction = '';
		}

		this.isScrolling = this.newSection;
		return _react2['default'].createElement(
			'div',
			null,
			_react2['default'].createElement(
				'div',
				{ ref: 'sectionContainer', className: this.props.className, style: containerStyle },
				this._addChildren()
			),
			this.props.navigation && !this.props.scrollBar ? this.renderNavigation() : null
		);
	}

});

exports['default'] = SectionsContainer;
module.exports = exports['default'];