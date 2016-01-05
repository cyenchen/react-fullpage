import React from 'react';
import ReactDOM from 'react-dom';

const SectionsContainer = React.createClass({
  isScrolling: false,
  newSection: false,
  scrollings: [],
  prevMouseWheelTime: new Date().getTime(),

  propTypes: {
    delay:                  React.PropTypes.number,
    verticalAlign:          React.PropTypes.bool,
    scrollBar:              React.PropTypes.bool,
    navigation:             React.PropTypes.bool,
    className:              React.PropTypes.string,
    sectionClassName:       React.PropTypes.string,
    navigationClass:        React.PropTypes.string,
    navigationAnchorClass:  React.PropTypes.string,
    activeClass:            React.PropTypes.string,
    sectionPaddingTop:      React.PropTypes.string,
    sectionPaddingBottom:   React.PropTypes.string,
    arrowNavigation:        React.PropTypes.bool,
    anchors:                React.PropTypes.array,
    autoFooterHeight:       React.PropTypes.bool

  },

  getInitialState() {
    return {
      activeSection: 0,
      scrollingStarted: false,
      sectionScrolledPosition: 0,
      windowHeight: 500
    };
  },

  getDefaultProps() {
    return {
      delay:                1000,
      verticalAlign:        false,
      scrollBar:            false,
      navigation:           true,
      className:            'SectionContainer',
      sectionClassName:     'Section',
      anchors:              [],
      autoFooterHeight:     false,
      activeClass:          'active',
      sectionPaddingTop:    '0',
      sectionPaddingBottom: '0',
      arrowNavigation:      true
    };
  },

  componentWillUpdate(nextProps, nextState) {
    if (this.state.activeSection !== nextState.activeSection) {
      this.newSection = true;
    }
  },

  componentDidUpdate(prevProps, prevState) {},

  componentWillUnmount() {
    this._removeMouseWheelEventHandlers();
    window.removeEventListener('resize', this._handleResize);
    window.removeEventListener('hashchange', this._handleAnchor, false);
    window.removeEventListener('keydown', this._handleArrowKeys);
  },

  componentDidMount() {
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

  _addCSS3Scroll() {
    this._addOverflowToBody();
    this._addHeightToParents();
    this._addMouseWheelEventHandlers();
  },

  _addActiveClass() {
    this._removeActiveClass();

    let hash = window.location.hash.substring(1);
    let activeLinks = document.querySelectorAll(`a[href="#${hash}"]`);

    for( let i=0; i < activeLinks.length; i++) {
      activeLinks[i].className = activeLinks[i].className + (activeLinks[i].className.length > 0 ? ' ': '') + `${this.props.activeClass}`;
    }
  },

  _removeActiveClass() {
    let activeLinks = document.querySelectorAll(`a:not([href="#${this.props.anchors[this.state.activeSection]}"])`);

    for( let i=0; i < activeLinks.length; i++) {
      activeLinks[i].className = activeLinks[i].className.replace(/\b ?active/g, '');
    }
  },

  _addChildren() {
    return React.Children.map(this.props.children, (child, index) => {
      const ref = this.props.anchors[index] || ('section-' + index);
      const domId = this.props.anchors[index] || null;
      if (ref) {
        return React.cloneElement(child, {
          ref: ref,
          id: this.props.scrollBar ? domId : null,
          windowHeight:           this.state.windowHeight,
          verticalAlign:          this.props.verticalAlign,
          sectionClassName:       this.props.sectionClassName,
          sectionPaddingTop:      this.props.sectionPaddingTop,
          sectionPaddingBottom:   this.props.sectionPaddingBottom
        });
      } else {
        return child;
      }
    }.bind(this));
  },

  _addOverflowToBody() {
    document.querySelector('body').style.overflow = 'hidden';
  },

  _addHeightToParents() {
    let child = ReactDOM.findDOMNode(this);
    let previousParent = child.parentNode;

    while (previousParent) {
      if ('style' in previousParent) {
        previousParent.style.height = '100%';
        previousParent = previousParent.parentNode;
      } else {
        return false;
      }
    }
  },

  _addMouseWheelEventHandlers() {
    var prefix = '';
    var _addEventListener;

    if (window.addEventListener){
      _addEventListener = "addEventListener";
    }else{
      _addEventListener = "attachEvent";
      prefix = 'on';
    }

     // detect available wheel event
    var support = 'onwheel' in document.createElement('div') ? 'wheel' : // Modern browsers support "wheel"
      document.onmousewheel !== undefined ? 'mousewheel' : // Webkit and IE support at least "mousewheel"
      'DOMMouseScroll'; // let's assume that remaining browsers are older Firefox


    if(support == 'DOMMouseScroll'){
      document[ _addEventListener ](prefix + 'MozMousePixelScroll', this._mouseWheelHandler, false);
    }

    //handle MozMousePixelScroll in older Firefox
    else{
      document[ _addEventListener ](prefix + support, this._mouseWheelHandler, false);
    }
  },

  _removeMouseWheelEventHandlers() {
    if (document.addEventListener) {
      document.removeEventListener('mousewheel', this._mouseWheelHandler, false); //IE9, Chrome, Safari, Oper
      document.removeEventListener('wheel', this._mouseWheelHandler, false); //Firefox
      document.removeEventListener('MozMousePixelScroll', this._mouseWheelHandler, false); //old Firefox
    } else {
      document.detachEvent('onmousewheel', this._mouseWheelHandler); //IE 6/7/8
    }
  },

  _mouseWheelHandler(evt) {
    const curTime = new Date().getTime();
    const timeDiff = curTime - this.prevMouseWheelTime;
    this.prevMouseWheelTime = curTime;

    const e             = window.event || evt; // old IE support
    const value         = e.wheelDelta || -e.deltaY || -e.detail;
	  const delta         = Math.max(-1, Math.min(1, value));
    const horizontalDetection = typeof e.wheelDeltaX !== 'undefined' || typeof e.deltaX !== 'undefined';
    const isScrollingVertically = (Math.abs(e.wheelDeltaX) < Math.abs(e.wheelDelta)) || (Math.abs(e.deltaX ) < Math.abs(e.deltaY) || !horizontalDetection);

    if(this.scrollings.length > 149){
      this.scrollings.shift();
    }

    this.scrollings.push(Math.abs(value));

    if(timeDiff > 200){
      //emptying the array, we dont care about old scrollings for our averages
      this.scrollings = [];
    }

    let activeSection = this.state.activeSection;

    if (this.isScrolling || this.newSection) {
      return false;
    }

    var averageEnd = this._getAverage(this.scrollings, 10);
    var averageMiddle = this._getAverage(this.scrollings, 70);
    var isAccelerating = averageEnd >= averageMiddle;

    if(isAccelerating && isScrollingVertically) {
      if (delta < 0) {
        activeSection++;
      } else {
        activeSection--;
      }

      if (activeSection < 0 || activeSection >= this.props.children.length || activeSection === this.state.activeSection) {
        console.log('failed: ', activeSection);
        return false;
      }

      this._callOnLeave(activeSection);

      let index = this.props.anchors[activeSection];
      if (!this.props.anchors.length || index) {  // let the hash listener catch this
        window.location.hash = '#' + index;
      } else {
        console.log('GO TO SECTION: ', activeSection);
        this._goToSection(activeSection);
      }
    }

    return false;
  },

  _callOnLeave(goingToIndex) {
    if (typeof this.props.onLeave === 'function') {
      this.props.onLeave(this.state.activeSection, goingToIndex);
    }
  },

  _getAverage(elements, number) {
    var sum = 0;

    //taking `number` elements from the end to make the average, if there are not enought, 1
    var lastElements = elements.slice(Math.max(elements.length - number, 1));

    for(var i = 0; i < lastElements.length; i++){
      sum = sum + lastElements[i];
    }

    return Math.ceil(sum/number);
  },

  _handleResize(initialResize) {
    let position = 0;
    let index = this.state.activeSection;

    let state = {
      windowHeight: window.innerHeight,
    };

    if (initialResize) {
      index = this._getSectionIndexFromHash();
      if (index < 0) index = this.state.activeSection;
      state.activeSection = index;
    }

    state.sectionScrolledPosition = this._getPosition(index, state.windowHeight);
    this.setState(state);
  },

  _getPosition(index, windowHeight) {
    windowHeight = windowHeight || this.state.windowHeight;

    let position = 0 - (index * windowHeight);

    if (this.props.anchors[index] === 'footer' && this.props.autoFooterHeight && this.refs.footer) {
      const elm = ReactDOM.findDOMNode(this.refs.footer);

      elm.style.height = 'auto';
      const height = elm.offsetHeight;
      elm.style.height = windowHeight;

      position = 0 - ((index-1) * windowHeight + height);
    }

    return position;
  },

  _goToSection(index) {
    if (index === this.state.activeSection) return;

    const position = this._getPosition(index);

    this._callOnLeave(index);

    this.setState({
      activeSection: index,
      sectionScrolledPosition: position
    });
  },

  _handleSectionTransition(index) {
    if (!this.props.anchors.length || index === -1 || index >= this.props.anchors.length) {
      return false;
    }

    this._goToSection(index);
  },

  _handleArrowKeys(e) {
    const event     = window.event ? window.event : e;
    const code      = event.keyCode;
    if (code < 37 || code > 40) return;

    const direction = code === 38 || code === 37 ? this.state.activeSection - 1 : (code === 40 || code === 39 ? this.state.activeSection + 1 : -1);
    const hash      = this.props.anchors[direction];

    this._callOnLeave(direction);

    if (!this.props.anchors.length || hash) {
      window.location.hash = '#' + hash;
    } else {
      this._handleSectionTransition(direction);
    }
  },

  _getSectionIndexFromHash() {
    const hash  = window.location.hash.substring(1);
    return this.props.anchors.indexOf(hash);
  },

  _handleAnchor() {
    const index = this._getSectionIndexFromHash();
    if (index < 0) return false;

    this._handleSectionTransition(index);

    this._addActiveClass();
  },

  renderNavigation() {
    let navigationStyle = {
      position:   'fixed',
      zIndex:     '10',
      right:      '20px',
      top:        '50%',
      transform:  'translate(-50%, -50%)',
    };

    const anchors = this.props.anchors.map((link, index) => {
      let anchorStyle = {
        display:          'block',
        margin:           '10px',
        borderRadius:     '100%',
        backgroundColor:  '#556270',
        padding:          '5px',
        transition:       'all 0.2s',
        transform:        this.state.activeSection === index ? 'scale(1.3)' : 'none'
      };
      return <a href={`#${link}`} key={index} className={this.props.navigationAnchorClass || 'Navigation-Anchor'} style={this.props.navigationAnchorClass ? null : anchorStyle}></a>;
    });

    return (
      <div className={this.props.navigationClass || 'Navigation'} style={this.props.navigationClass ? null : navigationStyle}>
        {anchors}
      </div>
    );
  },

  onTransitionEnd() {
    this.isScrolling = false;
    if (this.newSection) {
      this.newSection = false;
      if (typeof this.props.afterLoad === 'function') {
        this.props.afterLoad(this.state.activeSection);
      }
    }
  },

  addTransitionEnd() {
    const elm = ReactDOM.findDOMNode(this.refs.sectionContainer);
    elm.addEventListener('transitionend', this.onTransitionEnd);
  },

  render() {
    var containerStyle = {
      height: '100%',
      width: '100%',
      position: 'relative',
      'WebkitTransform': 'translate3d(0px, ' + this.state.sectionScrolledPosition + 'px, 0px)',
      'MozTransform': 'translate3d(0px, ' + this.state.sectionScrolledPosition + 'px, 0px)',
      'msTransform':'translate3d(0px, ' + this.state.sectionScrolledPosition + 'px, 0px)',
      'transform': 'translate3d(0px, ' + this.state.sectionScrolledPosition + 'px, 0px)',
      transition: 'all ' + this.props.delay + 'ms ease'
    };

    this.isScrolling = this.newSection;
    return (
      <div>
        <div ref='sectionContainer' className={this.props.className} style={containerStyle}>
          {this._addChildren()}
        </div>
        {this.props.navigation && !this.props.scrollBar ? this.renderNavigation() : null}
      </div>
    );
  },

});

export default SectionsContainer;
