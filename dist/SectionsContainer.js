'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var SectionsContainer = _react2['default'].createClass({
  displayName: 'SectionsContainer',

  scrollId: null,
  isScrolling: false,
  newSection: false,
  scrollings: [],
  prevMouseWheelTime: new Date().getTime(),

  propTypes: {
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
    arrowNavigation: _react2['default'].PropTypes.bool
  },

  childContextTypes: {
    verticalAlign: _react2['default'].PropTypes.bool,
    sectionClassName: _react2['default'].PropTypes.string,
    sectionPaddingTop: _react2['default'].PropTypes.string,
    sectionPaddingBottom: _react2['default'].PropTypes.string,
    windowHeight: _react2['default'].PropTypes.number
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
      delay: 1000,
      verticalAlign: false,
      scrollBar: false,
      navigation: true,
      className: 'SectionContainer',
      sectionClassName: 'Section',
      anchors: [],
      activeClass: 'active',
      sectionPaddingTop: '0',
      sectionPaddingBottom: '0',
      arrowNavigation: true
    };
  },

  getChildContext: function getChildContext() {
    return {
      verticalAlign: this.props.verticalAlign,
      sectionClassName: this.props.sectionClassName,
      sectionPaddingTop: this.props.sectionPaddingTop,
      sectionPaddingBottom: this.props.sectionPaddingBottom,
      windowHeight: this.state.windowHeight
    };
  },

  shouldComponentUpdate: function shouldComponentUpdate(nextProps, nextState) {
    if (this.state.activeSection !== nextState.activeSection) {
      return true;
    }
    if (this.state.windowHeight !== nextState.windowHeight) {
      return true;
    }

    return false;
  },

  componentWillUnmount: function componentWillUnmount() {
    this._removeMouseWheelEventHandlers();
    window.removeEventListener('resize', this._handleResize);
    window.removeEventListener('hashchange', this._handleAnchor, false);
    window.removeEventListener('keydown', this._handleArrowKeys);
  },

  componentDidMount: function componentDidMount() {
    window.addEventListener('resize', this._handleResize);

    if (!this.props.scrollBar) {
      this._addCSS3Scroll();
      this._handleAnchor(); //Go to anchor in case we found it in the URL
      this.addTransitionEnd();

      window.addEventListener('hashchange', this._handleAnchor, false); //Add an event to watch the url hash changes

      if (this.props.arrowNavigation) {
        window.addEventListener('keydown', this._handleArrowKeys);
      }
    }

    // Get actual window height
    if (this.state.windowHeight !== window.innerHeight) this._handleResize(true);
  },

  _addCSS3Scroll: function _addCSS3Scroll() {
    this._addOverflowToBody();
    this._addHeightToParents();
    this._addMouseWheelEventHandlers();
  },

  _addActiveClass: function _addActiveClass() {
    this._removeActiveClass();

    var hash = window.location.hash.substring(1);
    var activeLinks = document.querySelectorAll('a[href="#' + hash + '"]');

    for (var i = 0; i < activeLinks.length; i++) {
      activeLinks[i].className = activeLinks[i].className + (activeLinks[i].className.length > 0 ? ' ' : '') + ('' + this.props.activeClass);
    }
  },

  _removeActiveClass: function _removeActiveClass() {
    var activeLinks = document.querySelectorAll('a:not([href="#' + this.props.anchors[this.state.activeSection] + '"])');

    for (var i = 0; i < activeLinks.length; i++) {
      activeLinks[i].className = activeLinks[i].className.replace(/\b ?active/g, '');
    }
  },

  _addChildrenWithAnchorId: function _addChildrenWithAnchorId() {
    var index = 0;
    return _react2['default'].Children.map(this.props.children, (function (child) {
      var id = this.props.anchors[index];
      index++;
      if (id) {
        return _react2['default'].cloneElement(child, {
          id: id
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

    if (this.isScrolling) {
      console.log('trapped');
      return false;
    }

    var averageEnd = this._getAverage(this.scrollings, 10);
    var averageMiddle = this._getAverage(this.scrollings, 70);
    var isAccelerating = averageEnd >= averageMiddle;
    console.log('Is Accelerating: ', averageEnd, averageMiddle);

    if (isAccelerating && isScrollingVertically) {
      if (delta < 0) {
        activeSection++;
      } else {
        activeSection--;
      }

      if (activeSection < 0 || activeSection >= this.props.children.length || activeSection === this.state.activeSection) {
        console.log('failed: ', activeSection);
        return false;
      }

      var index = this.props.anchors[activeSection];
      if (!this.props.anchors.length || index) {
        window.location.hash = '#' + index;
      } else {
        this._goToSlide(activeSection);
      }
    }

    return false;
  },

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

    if (initialResize) {
      var index = this._getSectionIndexFromHash();
      if (index < 0) index = this.state.activeSection;

      position = 0 - index * window.innerHeight;
      this.setState({
        activeSection: index,
        windowHeight: window.innerHeight,
        sectionScrolledPosition: position
      });
    } else {
      position = 0 - this.state.activeSection * window.innerHeight;
      this.setState({
        windowHeight: window.innerHeight,
        sectionScrolledPosition: position
      });
    }
  },

  _goToSlide: function _goToSlide(index) {
    var position = 0 - index * this.state.windowHeight;

    this.isScrolling = true;
    this.newSection = true;

    this.setState({
      activeSection: index,
      sectionScrolledPosition: position
    });
  },

  _handleSectionTransition: function _handleSectionTransition(index) {
    if (!this.props.anchors.length || index === -1 || index >= this.props.anchors.length) {
      return false;
    }

    this._goToSlide(index);
  },

  _handleArrowKeys: function _handleArrowKeys(e) {
    var event = window.event ? window.event : e;
    var direction = event.keyCode === 38 || event.keyCode === 37 ? this.state.activeSection - 1 : event.keyCode === 40 || event.keyCode === 39 ? this.state.activeSection + 1 : -1;
    var hash = this.props.anchors[direction];

    if (!this.props.anchors.length || hash) {
      window.location.hash = '#' + hash;
    }

    this._handleSectionTransition(direction);
  },

  _getSectionIndexFromHash: function _getSectionIndexFromHash() {
    var hash = window.location.hash.substring(1);
    return this.props.anchors.indexOf(hash);
  },

  _handleAnchor: function _handleAnchor() {
    var index = this._getSectionIndexFromHash();
    if (index < 0) return false;

    this._handleSectionTransition(index);

    this._addActiveClass();
  },

  renderNavigation: function renderNavigation() {
    var _this = this;

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
        transform: _this.state.activeSection === index ? 'scale(1.3)' : 'none'
      };
      return _react2['default'].createElement('a', { href: '#' + link, key: index, className: _this.props.navigationAnchorClass || 'Navigation-Anchor', style: _this.props.navigationAnchorClass ? null : anchorStyle });
    });

    return _react2['default'].createElement(
      'div',
      { className: this.props.navigationClass || 'Navigation', style: this.props.navigationClass ? null : navigationStyle },
      anchors
    );
  },
  onTransitionEnd: function onTransitionEnd() {
    if (this.newSection) {
      console.log('...ON transition end...');
      this.scrollId = null;
      this.newSection = false;
      this.isScrolling = false;
      /*
      clearTimeout(this.scrollId);
      this.scrollId = setTimeout(() => {
        console.log('...ON transition end...');
        this.scrollId = null;
        this.newSection = false;
        this.isScrolling = false;
        let index = this.props.anchors[this.state.activeSection];
        if (!this.props.anchors.length || index) {
          window.location.hash = '#' + index;
        }
      }, 100);
      */
    }
  },

  addTransitionEnd: function addTransitionEnd() {
    var elm = _reactDom2['default'].findDOMNode(this.refs.sectionContainer);
    elm.addEventListener('transitionend', this.onTransitionEnd);
  },

  render: function render() {
    var containerStyle = {
      height: '100%',
      width: '100%',
      position: 'relative',
      transform: 'translate3d(0px, ' + this.state.sectionScrolledPosition + 'px, 0px)',
      transition: 'all ' + this.props.delay + 'ms ease'
    };
    console.log('...render...');
    return _react2['default'].createElement(
      'div',
      null,
      _react2['default'].createElement(
        'div',
        { ref: 'sectionContainer', className: this.props.className, style: containerStyle },
        this.props.scrollBar ? this._addChildrenWithAnchorId() : this.props.children
      ),
      this.props.navigation && !this.props.scrollBar ? this.renderNavigation() : null
    );
  }

});

exports['default'] = SectionsContainer;
module.exports = exports['default'];